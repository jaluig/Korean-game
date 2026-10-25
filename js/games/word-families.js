/**
 * Minigame — 낱말 가족 · Word Families: many Korean words are built from
 * Sino-Korean syllables with a meaning of their own (학 學, “study”: 학교,
 * 학생, 방학), so the words you know help you guess new ones (학원?). A family
 * opens once you know two of its words. Its card comes first; then three kinds
 * of question: what does the syllable mean, guess a new word from it, and
 * which word belongs (실수’s 실 isn’t the 실 of 교실).
 *
 * Every family has its own spaced-repetition record ('family:<id>'). They
 * live in content/word-families.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.wordFamilies;
  const points = () => M.config.points;
  const rich = (text) => (ui.richText ? ui.richText(text) : text);
  const plain = (t) => String(t).replace(/\s+/g, '');

  const wordsOf = (f) => f.needs.map((id) => M.content.word(id)).filter(Boolean);
  const known = (f) => wordsOf(f).filter((w) => M.srs.isIntroduced(w.id));
  const isOpen = (f) => known(f).length >= 2;
  const list = (words) => words.map((w) => w.ko).join(', ');
  const plural = (n) => `${n} ${n === 1 ? 'family' : 'families'}`;
  // The particle after a syllable: 학은 / 차는, 학이 / 차가.
  const final = (syllable) => !!M.hangul.decompose(syllable).final;
  const topicOf = (syllable) => `‘${syllable}’${final(syllable) ? '은' : '는'}`;
  const subjectOf = (syllable) => `‘${syllable}’${final(syllable) ? '이' : '가'}`;

  /** Due families first, then a new one (easiest first), then the least grown; another new one only to fill the round. */
  function pickRound(now = U.now()) {
    const open = M.content.wordFamilies().filter(isOpen);
    const due = open.filter((f) => M.srs.isIntroduced(f.id) && M.srs.isDue(f.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open.filter((f) => !M.srs.isIntroduced(f.id)).sort((a, b) => a.level - b.level || a.index - b.index);
    const rest = U.shuffle(open.filter((f) => M.srs.isIntroduced(f.id) && !due.includes(f))).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    const picked = due.slice(0, cfg().perRound);
    for (const f of fresh.slice(0, cfg().newPerRound)) if (picked.length < cfg().perRound) picked.push(f);
    for (const f of [...rest, ...fresh]) if (picked.length < cfg().perRound && !picked.includes(f)) picked.push(f);
    return picked;
  }

  /** The family closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = M.content.wordFamilies().filter((f) => !isOpen(f));
    locked.sort((a, b) => known(b).length - known(a).length || a.level - b.level || a.index - b.index);
    return locked[0] || null;
  }

  /** Meanings too close to be the wrong answer for each other: listed in `avoid`, or sharing a word (place / a place to…, old / old, former). */
  const FILLER = new Set(['a', 'an', 'the', 'to', 'of', 'for', 'on', 'at', 'by', 'or', 'and', 'with', 'as', 'is', 'be']);
  const words = (meaning) => new Set((String(meaning).toLowerCase().match(/[a-z]+/g) || []).filter((t) => !FILLER.has(t)));
  const tooClose = (f, g) => (f.avoid || []).includes(g.localId) || (g.avoid || []).includes(f.localId) || [...words(f.meaning)].some((t) => words(g.meaning).has(t));

  /** What does the syllable mean in the words you know? The meaning, and three other families' meanings (null without two). */
  function meaningQuestion(f) {
    // (A family of the same syllable with another meaning makes a fair wrong answer: 병원’s 원 isn’t 회사원’s.)
    const others = [];
    for (const g of U.shuffle(M.content.wordFamilies().filter((g) => g !== f && !tooClose(f, g)))) if (others.length < 3 && !others.some((o) => tooClose(o, g))) others.push(g);
    if (others.length < 2) return null;
    const wrong = others.map((g) => ({ text: g.meaning, correct: false, why: `“${g.meaning}” is ${g.syllable} (${g.hanja}), as in ${list(wordsOf(g).slice(0, 2))}.` }));
    const right = { text: f.meaning, correct: true, why: `${f.syllable} (${f.hanja}) = ${f.meaning}.` };
    return { kind: 'meaning', family: f, words: U.shuffle(known(f)).slice(0, 4), options: U.shuffle([right, ...wrong]) };
  }

  /** Guess a new word from the family: its meaning and two wrong ones. */
  function guessQuestion(f, guess = U.pick(f.guess)) {
    const why = guess.why || `${guess.ko} = ${guess.en}.`;
    const options = U.shuffle([{ text: guess.en, correct: true, why }, ...guess.wrong.map((w) => ({ text: w, correct: false, why }))]);
    return { kind: 'guess', family: f, guess, words: U.shuffle(known(f)).slice(0, 3), options };
  }

  /** Which word has the family's syllable (and not a look-alike)? Not the word just guessed, if there's another; null when there aren't two look-alikes. */
  function belongsQuestion(f, { after } = {}) {
    const members = new Set([...wordsOf(f).map((w) => w.ko), ...f.guess.map((g) => g.ko)].map(plain));
    const same = M.content.wordFamilies().filter((g) => g !== f && g.syllable === f.syllable);
    const pool = U.uniqueBy(
      [
        ...f.lookalikes.map((x) => ({ text: x.ko, en: x.en, why: x.why })),
        ...same.flatMap((g) => wordsOf(g).map((w) => ({ text: w.ko, en: w.en, why: `${w.ko}’s ${g.syllable} is ${g.hanja}, “${g.meaning}”, not ${f.hanja}, “${f.meaning}”.` }))),
      ].filter((x) => !members.has(plain(x.text))),
      (x) => plain(x.text)
    );
    const clue = U.shuffle(known(f)).slice(0, 2);
    const candidates = [...wordsOf(f).filter((w) => !clue.includes(w)).map((w) => ({ text: w.ko, en: w.en })), ...f.guess.map((g) => ({ text: g.ko, en: g.en }))];
    if (pool.length < 2 || !candidates.length) return null;
    const unseen = candidates.filter((c) => !after || plain(c.text) !== plain(after.ko));
    const pick = U.pick(unseen.length ? unseen : candidates);
    const right = { ...pick, correct: true, why: `${pick.text}’s ${f.syllable} is ${f.hanja}, “${f.meaning}”, as in ${list(clue)}.` };
    return { kind: 'belongs', family: f, clue, options: U.shuffle([right, ...U.sample(pool, 2).map((x) => ({ ...x, correct: false }))]) };
  }

  /** A family's questions for a round: (its meaning,) a word to guess, and which word belongs, or a second guess. */
  function questionsFor(f, { fresh = false } = {}) {
    const out = [];
    const meaning = fresh || U.random() < 0.5 ? meaningQuestion(f) : null;
    if (meaning) out.push(meaning);
    const first = guessQuestion(f);
    out.push(first);
    const belongs = belongsQuestion(f, { after: first.guess });
    if (belongs) out.push(belongs);
    else if (f.guess.length > 1) out.push(guessQuestion(f, U.pick(f.guess.filter((g) => g !== first.guess))));
    return out;
  }

  /** How a family went in a round: no slips → good, one → hard, more → again. */
  const gradeFor = (slips) => (slips === 0 ? 'good' : slips === 1 ? 'hard' : 'again');

  /** The family's syllable marked in a word: 학교 → [학]교. */
  function mark(ko, syllable) {
    const at = ko.indexOf(syllable);
    return at < 0 ? ko : [ko.slice(0, at), h('b.family-mark', syllable), ko.slice(at + syllable.length)];
  }

  /** The words as a clue: 학교 (school) · 학생 (student), the syllable marked. */
  const clueLine = (f, words) => h('div.family-clue', words.map((w) => h('span.family-clue-word', h('span', { lang: 'ko' }, mark(w.ko, f.syllable)), h('span.family-en', w.en))));

  /** A family's card: the syllable, its hanja and meaning, its words (the ones you know first) and the note. */
  function familyCard(f) {
    const all = wordsOf(f);
    const words = [...all.filter((w) => M.srs.isIntroduced(w.id)), ...all.filter((w) => !M.srs.isIntroduced(w.id))];
    return h(
      'div.family-card',
      h(
        'div.family-head',
        h('span.family-syllable', { lang: 'ko' }, f.syllable),
        h('span.family-hanja', { lang: 'ko', title: 'The Chinese character (hanja) behind it' }, f.hanja),
        h('span.family-meaning', `= ${f.meaning}`)
      ),
      f.note ? h('p.family-note', rich(f.note)) : null,
      h(
        'ul.family-words',
        words.map((w) =>
          h(
            'li',
            { class: M.srs.isIntroduced(w.id) ? 'known' : 'new' },
            h('span.family-word', { lang: 'ko' }, mark(w.ko, f.syllable)),
            ui.audioButton(w.ko, { size: 'small' }),
            h('span.family-en', w.en),
            M.srs.isIntroduced(w.id) ? null : h('span.family-new', ui.bi('새 단어', 'new'))
          )
        )
      )
    );
  }

  function showFamilyCard(f) {
    const dialog = ui.modal({
      title: { ko: `${f.syllable} 가족`, en: `The ${f.syllable} family` },
      cls: 'modal-wide',
      body: [familyCard(f)],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }

  M.games.register({
    id: 'word-families',
    order: 3.5,
    emoji: '🌳',
    color: 'mint',
    title: { ko: '낱말 가족', en: 'Word Families' },
    blurb: { ko: '아는 단어로 새 단어 맞히기', en: 'Guess new words from the ones you know' },

    status() {
      const all = M.content.wordFamilies();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isOpen);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      const due = open.filter((f) => M.srs.isIntroduced(f.id) && M.srs.isDue(f.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${plural(due)} to review` };
      const fresh = open.filter((f) => !M.srs.isIntroduced(f.id)).length;
      if (fresh) return { ready: true, ko: `새 가족 ${fresh}개`, en: `${fresh} new ${fresh === 1 ? 'family' : 'families'}` };
      return { ready: true, ko: `가족 ${open.length}개`, en: `${plural(open.length)} to practise` };
    },

    start(host) {
      const families = pickRound();
      if (!families.length) {
        const locked = nextLocked();
        const missing = locked ? wordsOf(locked).filter((w) => !M.srs.isIntroduced(w.id)).slice(0, 3) : [];
        const need = locked ? 2 - known(locked).length : 0;
        host.empty({
          emoji: '🔒',
          ko: '아직 잠겨 있어요',
          en: 'The word families are still locked',
          text: missing.length
            ? `A family opens once you know two of its words. The next one (${locked.syllable}, “${locked.meaning}”) needs ${need === 1 ? 'one more' : 'two'} of: ${missing.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'A family opens once you know two of its words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }
      const steps = [];
      for (const f of families) {
        const fresh = !M.srs.isIntroduced(f.id);
        if (fresh) steps.push({ card: f });
        for (const q of questionsFor(f, { fresh })) steps.push({ q });
      }
      const total = steps.filter((s) => s.q).length;
      const last = new Map(steps.map((s, i) => [s.q ? s.q.family.id : s.card.id, i]));
      const slips = new Map();
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0 };
      let index = 0;
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());
      next();

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(round.answers, total);
        if (index >= steps.length) return finish();
        const step = steps[index];
        if (step.card) intro(step.card);
        else ask(step.q);
      }

      function advance() {
        index++;
        next();
      }

      /** A new family: its card, before its questions. */
      function intro(f) {
        M.srs.introduce(f.id);
        M.store.save();
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-family-intro', ui.exTag('새 낱말 가족', 'A new word family', '🌳'), familyCard(f), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        host.mascot.say(`${f.syllable} = ${f.meaning}!`, `A new family: ${f.syllable} (${f.meaning})`, { duration: 2500 });
        const stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            done();
          }
        });
        cleanup = stopKeys;
        let finished = false;
        function done() {
          if (finished) return;
          finished = true;
          stopKeys();
          cleanup = null;
          advance();
        }
      }

      function ask(q) {
        const f = q.family;
        let locked = false;
        let prompt;
        let tag;
        if (q.kind === 'meaning') {
          tag = ui.exTag('무슨 뜻일까요?', 'What does it mean?', '🌳');
          prompt = h('div.family-q-card', clueLine(f, q.words), h('p.family-q', ui.bi(`여기에서 ${topicOf(f.syllable)} 무슨 뜻이에요?`, `What does ${f.syllable} mean in these words?`)));
        } else if (q.kind === 'guess') {
          tag = ui.exTag('새 단어 맞히기', 'Guess the new word', '🔍');
          prompt = h(
            'div.family-q-card',
            h('div.family-q-word', h('span', { lang: 'ko' }, mark(q.guess.ko, f.syllable)), ui.audioButton(q.guess.ko, { size: 'small' })),
            h('p.family-hint', h('span', { 'aria-hidden': 'true' }, '💡 '), q.guess.hint),
            h('p.family-q', ui.bi(`이 단어들에도 같은 ${subjectOf(f.syllable)} 있어요:`, `The same ${f.syllable} as in:`)),
            clueLine(f, q.words)
          );
        } else {
          tag = ui.exTag('같은 가족은?', 'Which one is in the family?', '🧩');
          prompt = h('div.family-q-card', h('p.family-q', ui.bi(`어느 단어에 ${q.clue.map((w) => w.ko).join('·')}의 ${subjectOf(f.syllable)} 있어요?`, `Which word has the ${f.syllable} of these?`)), clueLine(f, q.clue));
        }
        const korean = q.kind === 'belongs';
        const buttons = q.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: korean ? 'option option-ko' : 'option', lang: korean ? 'ko' : 'en', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text, korean && o.en ? h('span.family-option-en', o.en) : null)
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-family',
            tag,
            prompt,
            h('div.options', { role: 'group', 'aria-label': 'Answers' }, buttons),
            h('div.speech-card-link', h('button.btn.btn-ghost.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: () => showFamilyCard(f) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('가족 카드', 'The family card')))
          )
        );
        if (q.kind === 'guess' && M.store.state.settings.autoPlayAudio) M.speech.speakLater(q.guess.ko, 300, { quiet: true });
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= buttons.length) {
            event.preventDefault();
            choose(n - 1);
          } else if (q.kind === 'guess' && M.keys.isReplay(event)) {
            event.preventDefault();
            M.speech.speak(q.guess.ko);
          }
        });
        cleanup = stopKeys;

        function choose(i) {
          if (locked) return;
          locked = true;
          stopKeys();
          const picked = q.options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[q.options.findIndex((o) => o.correct)].classList.add('correct');
          onAnswer(q, picked);
        }
      }

      function onAnswer(q, picked) {
        const f = q.family;
        const correct = picked.correct;
        if (!correct) slips.set(f.id, (slips.get(f.id) || 0) + 1);
        if (last.get(f.id) === index) M.srs.review(f.id, gradeFor(slips.get(f.id) || 0));
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().family;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('familiesRight');
        } else round.combo = 0;
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();

        const right = q.options.find((o) => o.correct);
        const say = q.kind === 'guess' ? q.guess.ko : q.kind === 'belongs' ? right.text : null;
        if (say && M.store.state.settings.autoPlayAudio) M.speech.speakLater(say, 300, { quiet: true });
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', rich(text))) : null);
        let answer;
        if (q.kind === 'guess') answer = [h('span.fb-ko', { lang: 'ko' }, q.guess.ko), ui.audioButton(q.guess.ko, { size: 'small' }), h('span.fb-en', `= ${q.guess.en}`)];
        else if (q.kind === 'belongs') answer = [h('span.fb-ko', { lang: 'ko' }, right.text), ui.audioButton(right.text, { size: 'small' }), h('span.fb-en', `= ${right.en}`)];
        else answer = [h('span.fb-ko', { lang: 'ko' }, `${f.syllable} ${f.hanja}`), h('span.fb-en', `= ${f.meaning}`)];
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), ...answer),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span', { lang: q.kind === 'belongs' ? 'ko' : 'en' }, picked.text)),
          q.kind === 'guess' ? tip(q.guess.why) : tip(right.why),
          correct || q.kind === 'guess' ? null : tip(picked.why),
          h(
            'div.grammar-fb-card',
            h('span.family-chip', h('b', { lang: 'ko' }, `${f.syllable} ${f.hanja}`), ` = ${f.meaning}: `, h('span', { lang: 'ko' }, list(wordsOf(f).slice(0, 4)))),
            h('button.btn.btn-soft.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: () => showFamilyCard(f) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('가족 카드', 'The family card'))
          ),
        ];
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: say || undefined, onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'word-families',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
        });
      }
    },
  });

  M.wordFamilies = { pickRound, nextLocked, isOpen, meaningQuestion, guessQuestion, belongsQuestion, questionsFor, gradeFor, tooClose };
})(window.Mallang);
