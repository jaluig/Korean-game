/**
 * Minigame 14 — 높임말 · Honorifics: showing respect for the person you talk
 * *about*: -(으)시- (가요 → 가세요, 갔어요 → 가셨어요), the verbs and nouns with
 * an honorific word of their own (주무세요, 드세요, 계세요, 연세, 성함), and the
 * humble words for what you do for them (드려요, 여쭤봐요). The very first round
 * opens with the card. Each item is the same idea said about someone you
 * respect and about someone else (yourself, a younger brother, a friend…):
 * which plain word is this the respectful form of → fill the blank about
 * someone you respect → fill it about someone else, next to the slips
 * learners really make (자세요, 있으세요 for 계세요, 저는 가세요), every option explained.
 *
 * Each item has its own spaced-repetition record ('honor:<id>') and opens once
 * its key words are known. The items and the card live in content/honorifics.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.honorifics;
  const points = () => M.config.points;

  const items = () => M.content.honorifics();
  const isUnlocked = (it) => it.needs.every(M.srs.isIntroduced);
  const missingWords = (it) => it.needs.filter((id) => !M.srs.isIntroduced(id));
  const rich = (text) => ui.richText(text || '');
  /** Who the plain sentence is about, for the pair shown after each answer. */
  const WHO = {
    honor: { emoji: '👵', ko: '높임', en: 'About someone you respect' },
    self: { emoji: '🙋', ko: '나', en: 'About yourself' },
    younger: { emoji: '🧒', ko: '동생', en: 'About a younger brother or sister' },
    friend: { emoji: '👫', ko: '친구', en: 'About a friend your age' },
    child: { emoji: '👶', ko: '아이', en: 'About a child' },
    thing: { emoji: '🔹', ko: '물건 · 동물', en: 'About a thing or an animal' },
  };

  /** Due items first, then a few new ones (easiest first), then the least grown. */
  function pickRound(now = U.now()) {
    const open = items().filter(isUnlocked);
    const due = open.filter((it) => M.srs.isDue(it.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open
      .filter((it) => M.srs.stageOf(it.id) === 0)
      .sort((a, b) => a.level - b.level || a.index - b.index)
      .slice(0, cfg().newPerRound);
    const rest = U.shuffle(open.filter((it) => !due.includes(it) && M.srs.stageOf(it.id) > 0)).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    return [...due, ...fresh, ...rest].slice(0, cfg().size);
  }

  /** The item closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = items().filter((it) => !isUnlocked(it));
    locked.sort((a, b) => missingWords(a).length - missingWords(b).length || a.level - b.level || a.index - b.index);
    return locked[0] || null;
  }

  /** Easier questions while an item is new, harder as it grows; `again`: its second question this round. */
  function kindFor(item, stage = M.srs.stageOf(item.id), { again = false } = {}) {
    if (again || stage === 1) return 'honor';
    if (stage === 0) return 'meaning';
    return U.random() < 0.5 ? 'honor' : 'plain';
  }

  /** A round: one question per item; while few are open, the new ones come back once more, a step harder. */
  function planRound(now = U.now()) {
    const list = pickRound(now);
    const steps = U.shuffle(list).map((item) => ({ item, kind: kindFor(item) }));
    for (const item of list.filter((it) => M.srs.stageOf(it.id) === 0)) {
      if (steps.length >= cfg().size) break;
      steps.push({ item, kind: kindFor(item, 0, { again: true }) });
    }
    return steps;
  }

  /** A syllable's final consonant (0 = none, 20 = ㅆ). */
  const finalOf = (ch) => {
    const c = ch.charCodeAt(0) - 0xac00;
    return c >= 0 && c < 11172 ? c % 28 : -1;
  };
  /**
   * What kind of word a sentence's answer is ("which plain word?" offers the same kind):
   * 'noun' (집에: its dictionary form isn't a verb, or the answer starts with it), or a verb's
   * 'future', 'past', 'present' or 'linking' form (데리고).
   */
  function formOf(side) {
    const word = side.answer;
    if (!/다$/.test(side.dict) || word.startsWith(side.dict)) return 'noun';
    if (/(거예요|게요)$/.test(word)) return 'future';
    if ([...word].some((ch) => ch !== '있' && finalOf(ch) === 20)) return 'past'; // 갔, 했, 셨… (있 is just the stem of 있어요)
    if (/(요|다|까)$/.test(word)) return 'present';
    return 'linking';
  }

  /** Other items whose plain word can't also be right for this one (another verb, another honorific). */
  const otherPlain = (item) =>
    U.uniqueBy(
      items().filter((x) => x !== item && x.plain.dict !== item.plain.dict && x.honor.dict !== item.honor.dict && x.plain.answer !== item.plain.answer),
      (x) => x.plain.answer
    );

  /**
   * One question about an item. Options: { text, correct, why }; exactly one is right.
   *   meaning: its honorific sentence → which plain word is the answer the respectful form of?
   *   honor:   the blank in the sentence about someone you respect
   *   plain:   the blank in the sentence about someone else
   */
  function question(item, kind, { trap } = {}) {
    const card = M.content.honorCard() || {};
    const wrong = card.wrong || {};
    if (kind === 'meaning') {
      // Words of the same kind first (a past verb for a past verb), so the odd one out isn't the answer.
      const pool = otherPlain(item);
      const picked = U.sample(pool.filter((x) => formOf(x.plain) === formOf(item.plain)), 2);
      if (picked.length < 2) picked.push(...U.sample(pool.filter((x) => !picked.includes(x)), 2 - picked.length));
      const others = picked.map((x) => ({ text: x.plain.answer, correct: false, why: `${x.plain.answer} is the plain form of ${x.honor.answer} (${x.plain.dict} → ${x.honor.dict}).` }));
      const options = U.shuffle([{ text: item.plain.answer, correct: true, why: '' }, ...others]);
      return { kind, item, side: item.honor, options };
    }
    const slip = trap || U.pick(item.traps);
    const right = kind === 'honor' ? item.honor : item.plain;
    const other = kind === 'honor' ? item.plain : item.honor;
    const options = U.shuffle([
      { text: right.answer, correct: true, why: '' },
      { text: other.answer, correct: false, why: kind === 'honor' ? wrong.respect : wrong[item.plain.who] },
      { text: slip.text, correct: false, why: slip.why },
    ]);
    return { kind, item, side: right, options };
  }

  /** The sentence around the blank (or the answer), as words that wrap nicely; punctuation sticks to its word. */
  function sentenceLine(side, slot) {
    const at = side.ko.indexOf(side.answer);
    const before = side.ko.slice(0, at);
    const after = side.ko.slice(at + side.answer.length);
    const words = (text) => text.trim().split(/\s+/).filter(Boolean);
    // A particle or punctuation right after the blank (연세가, 주무세요.) stays with it.
    const glued = after && !/^\s/.test(after) ? words(after)[0] : null;
    const rest = words(after).slice(glued ? 1 : 0);
    const lead = before && !/\s$/.test(before) ? words(before).pop() : null; // (a word glued before it)
    const head = words(before).slice(0, lead ? -1 : undefined);
    return h(
      'div.grammar-sentence',
      { lang: 'ko' },
      head.map((w) => h('span.grammar-word', w)),
      h('span.grammar-word.target', lead ? h('span', lead) : null, slot, glued ? h('span', glued) : null),
      rest.map((w) => h('span.grammar-word', w))
    );
  }

  /* ---------- The card (the first round, and the 📖 button) ---------- */

  function honorCard() {
    const card = M.content.honorCard();
    if (!card) return null;
    return h(
      'div.speech-card.honor-card',
      h(
        'div.grammar-card-head',
        h('span.grammar-card-emoji', { 'aria-hidden': 'true' }, '👵'),
        h('div', h('h2.speech-card-title', { lang: 'ko' }, card.title.ko), h('div.grammar-card-en', card.title.en))
      ),
      h('p.speech-card-text', rich(card.text)),
      card.sections.map((sec) =>
        h('section.honor-section', h('h3', ui.bi(sec.title.ko, sec.title.en)), h('p', rich(sec.text)), h('div.grammar-examples', sec.examples.map((e) => ui.example(e))))
      ),
      h(
        'div.speech-table-wrap',
        h(
          'table.speech-table.honor-table',
          h('thead', h('tr', h('th', h('span.sr-only', 'Meaning')), h('th', { scope: 'col' }, ui.bi('보통', 'Plain')), h('th', { scope: 'col' }, ui.bi('높임', 'Honorific')))),
          h('tbody', card.table.map((row) => h('tr', h('th', { scope: 'row' }, row.en), h('td', { lang: 'ko' }, row.plain), h('td.honor-cell', { lang: 'ko' }, row.honor))))
        )
      ),
      card.note ? h('p.grammar-note', h('span', { 'aria-hidden': 'true' }, '💡 '), rich(card.note)) : null
    );
  }

  function showHonorCard() {
    const body = honorCard();
    if (!body) return;
    const dialog = ui.modal({
      cls: 'modal-wide modal-grammar modal-speech',
      body: [body],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }
  if (ui) ui.showHonorCard = showHonorCard; // (the unit tests load the games without the UI)

  /** Both sentences of an item, the one asked about highlighted (in the feedback). */
  function pairBox(item, lit) {
    const row = (key, side) =>
      h(
        `div.speech-form.honor-form${side === lit ? '.lit' : ''}`,
        h('span.speech-form-level', h('span', { 'aria-hidden': 'true' }, `${WHO[key].emoji} `), ui.bi(WHO[key].ko, WHO[key].en)),
        h('span.honor-form-text', h('span.speech-form-text', { lang: 'ko' }, side.ko), h('span.honor-form-en', side.en)),
        ui.audioButton(side.ko, { size: 'small' })
      );
    return h('div.speech-forms', row('honor', item.honor), row(item.plain.who, item.plain));
  }

  M.games.register({
    id: 'honorifics',
    order: 14,
    emoji: '👵',
    color: 'pink',
    title: { ko: '높임말', en: 'Honorifics' },
    blurb: { ko: '할머니께서 주무세요', en: 'Showing respect: 주무세요, 드세요…' },

    status() {
      const all = items();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isUnlocked);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      const due = open.filter((it) => M.srs.isDue(it.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${U.plural(due, 'sentence')} to review` };
      const fresh = open.filter((it) => M.srs.stageOf(it.id) === 0).length;
      if (fresh) return { ready: true, ko: `새 문장 ${fresh}개`, en: U.plural(fresh, 'new sentence') };
      return { ready: true, ko: `문장 ${open.length}개`, en: `${U.plural(open.length, 'sentence')} to practise` };
    },

    start(host) {
      const steps = planRound();
      if (!steps.length) {
        const locked = nextLocked();
        const words = locked ? missingWords(locked).map((id) => M.content.word(id)).filter(Boolean) : [];
        host.empty({
          emoji: '🔒',
          ko: '높임말 연습이 아직 잠겨 있어요',
          en: 'Honorifics is still locked',
          text: words.length
            ? `Each sentence opens once you know its key words. The next one needs: ${words.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'Each sentence opens once you know its key words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }
      // The very first round starts with the card.
      if (!items().some((it) => M.srs.isIntroduced(it.id)) && M.content.honorCard()) steps.unshift({ kind: 'card' });

      const total = steps.filter((s) => s.item).length;
      const lastStep = new Map(steps.map((s, i) => [s.item && s.item.id, i]));
      const tally = new Map(); // item id → { right, wrong } this round
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
        if (step.kind === 'card') intro();
        else ask(step);
      }

      function advance() {
        index++;
        next();
      }

      function intro() {
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-speech-intro', ui.exTag('높임말', 'Showing respect', '✨'), honorCard(), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        host.mascot.say('높임말을 배워요!', 'Let’s show some respect!', { duration: 2500 });
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

      function ask(step) {
        const q = question(step.item, step.kind);
        const { item, side } = q;
        let locked = false;
        // (The same tag for both blanks: who the sentence is about is for the learner to notice.)
        const tag = q.kind === 'meaning' ? ui.exTag('보통 말로 하면?', 'Which plain word?', '🔍') : ui.exTag('빈칸을 채워요', 'Fill in the blank', '👵');
        const slot = h(
          'span.grammar-slot',
          h('span.grammar-slot-q', { 'aria-hidden': 'true' }, '?'),
          h('span.grammar-slot-dict', { lang: 'ko' }, item.plain.dict),
          h('span.sr-only', `(the right form of ${item.plain.dict})`)
        );
        const prompt =
          q.kind === 'meaning'
            ? [
                sentenceLine(side, h('span.fb-hl.honor-hl', side.answer)),
                h('div.grammar-en', `“${side.en}”`),
                h('p.honor-ask', ui.bi(`${side.answer}: 보통 말로 하면?`, `${side.answer} is the respectful form of…`)),
              ]
            : [sentenceLine(side, slot), h('div.grammar-en', `“${side.en}”`)];
        const buttons = q.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option option-ko', lang: 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text)
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-grammar.ex-honor',
            tag,
            h('div.grammar-q-card.honor-q-card', prompt),
            h('div.options', { role: 'group', 'aria-label': 'Answers' }, buttons),
            h('div.speech-card-link', h('button.btn.btn-ghost.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: showHonorCard } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('높임말 카드', 'The card')))
          )
        );
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= buttons.length) {
            event.preventDefault();
            choose(n - 1);
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
          if (q.kind !== 'meaning') {
            U.clear(slot).append(h('span.grammar-slot-text', picked.text));
            slot.classList.add(picked.correct ? 'good' : 'bad');
          }
          onAnswer(step, q, picked);
        }
      }

      function onAnswer(step, q, picked) {
        const { item, side } = q;
        const correct = picked.correct;
        const t = tally.get(item.id) || { right: 0, wrong: 0 };
        t[correct ? 'right' : 'wrong']++;
        tally.set(item.id, t);
        if (lastStep.get(item.id) === index) M.srs.review(item.id, t.wrong ? 'again' : 'good');
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().honor;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('honorCorrect');
          M.sfx.play('bubble');
        } else round.combo = 0;
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(side.ko, 300, { quiet: true });

        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', rich(text))) : null);
        const right = q.options.find((o) => o.correct);
        // The sentence with a word in the blank.
        const at = side.ko.indexOf(side.answer);
        const withWord = (text, cls) => [side.ko.slice(0, at), h(cls, text), side.ko.slice(at + side.answer.length)];
        const content = [
          q.kind === 'meaning'
            ? h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, `${item.honor.answer} → ${item.plain.answer}`), h('span.fb-en', ` (${item.plain.dict} → ${item.honor.dict})`))
            : h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, withWord(right.text, 'span.fb-hl')), ui.audioButton(side.ko, { size: 'small' }), ui.sayButton ? ui.sayButton(side.ko) : null),
          q.kind === 'meaning' ? null : h('div.fb-en-line', `“${side.en}”`),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, q.kind === 'meaning' ? picked.text : withWord(picked.text, 'mark'))),
          correct ? null : tip(picked.why),
          tip(item.note),
          pairBox(item, side),
          h(
            'div.grammar-fb-card',
            h('button.btn.btn-soft.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: showHonorCard } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('높임말 카드', 'The card'))
          ),
        ];
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: side.ko, onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'honorifics',
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

  M.honorifics = { pickRound, planRound, question, kindFor, nextLocked, isUnlocked, otherPlain, formOf };
})(window.Mallang);
