/**
 * Minigame — 상황 표현 · What to Say When: the set phrases Koreans say at
 * everyday moments, and when: 잘 먹겠습니다 before a meal, 수고하셨습니다 at the
 * end of the working day, 안녕히 계세요 when you're the one leaving. A new phrase
 * starts with its card; then a situation (what do you say?) or a phrase (when do
 * you say it?), the wrong options being what a Korean wouldn't say there.
 *
 * Every phrase has its own spaced-repetition record ('phrase:<id>'). They live
 * in content/phrases.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.phrases;
  const points = () => M.config.points;
  const rich = (text) => (ui.richText ? ui.richText(text) : text);
  const plural = (n, what = 'phrase') => `${n} ${what}${n === 1 ? '' : 's'}`;

  const all = () => M.content.phrases().filter((p) => p.situations.length); // (the checker reports one without)
  const byLocal = (localId) => all().find((p) => p.localId === localId) || null;
  const met = (p) => M.srs.isIntroduced(p.id);

  /** The situations of other phrases that list this one as wrong: the wrong answers to "when do you say it?". */
  const notItsMoment = (p) => all().flatMap((owner) => owner.situations.filter((s) => s.wrong.includes(p.localId)).map((s) => ({ owner, s })));

  /** What do you say? A situation, its phrase and three that are wrong there (the ones you've met first). */
  function whatQuestion(p, situation = U.pick(p.situations)) {
    const wrongs = situation.wrong.map(byLocal).filter(Boolean);
    const picked = [...U.shuffle(wrongs.filter(met)), ...U.shuffle(wrongs.filter((w) => !met(w)))].slice(0, 3);
    const options = U.shuffle([
      { text: p.ko, correct: true, why: `${p.ko}: ${p.when}` },
      ...picked.map((w) => ({ text: w.ko, en: w.en, correct: false, why: `${w.ko} = ${w.en}. ${w.when}` })),
    ]);
    return { kind: 'what', phrase: p, situation, options };
  }

  /** When do you say it? One of its situations and two moments it isn't for (other phrases' first); null without two. */
  function whenQuestion(p, own = U.pick(p.situations)) {
    const pool = U.shuffle(notItsMoment(p));
    const distinct = U.uniqueBy(pool, (x) => x.owner.id);
    const away = [...distinct, ...pool.filter((x) => !distinct.includes(x))].slice(0, 2);
    if (away.length < 2 || !own) return null;
    const options = U.shuffle([
      { text: own.en, emoji: own.emoji, correct: true, why: `${p.ko}: ${p.when}` },
      ...away.map(({ owner, s }) => ({ text: s.en, emoji: s.emoji, correct: false, why: `There, you’d say ${owner.ko} = ${owner.en}.` })),
    ]);
    return { kind: 'when', phrase: p, options };
  }

  /** How a phrase went in a round: all right → good, one slip next to a right answer → hard, otherwise again. */
  const gradeFor = (slips, right) => (slips === 0 ? 'good' : slips === 1 && right > 0 ? 'hard' : 'again');

  /** New phrases have their own daily allowance. */
  function newLeftToday(now = U.now()) {
    const today = U.dayKey(now);
    const fresh = all().filter((p) => {
      const r = M.srs.peek(p.id);
      return r && r.introduced && U.dayKey(r.introduced) === today;
    }).length;
    return Math.max(0, cfg().newPerDay - fresh);
  }

  /** Two phrases taught as a pair: each is a wrong answer in the other's situations (잘 먹겠습니다 / 잘 먹었습니다). */
  const partners = (a, b) => a.situations.some((s) => s.wrong.includes(b.localId)) && b.situations.some((s) => s.wrong.includes(a.localId));

  /** Spread the questions so the same phrase never comes twice in a row when it can be helped (the one with most left first). */
  function spread(list) {
    const out = [];
    const rest = list.slice();
    const left = (p) => rest.filter((s) => s.phrase === p).length;
    while (rest.length) {
      const last = out[out.length - 1];
      const choices = rest.filter((s) => !last || s.phrase !== last.phrase);
      const pick = choices.length ? choices.reduce((best, s) => (left(s.phrase) > left(best.phrase) ? s : best)) : rest[0];
      out.push(rest.splice(rest.indexOf(pick), 1)[0]);
    }
    return out;
  }

  /**
   * A round: due phrases first, then new ones (their cards come first; a pair is
   * never split), then the phrases met so far, the least known first: one question
   * each, and a second one for the new phrases while the round is short.
   * Steps: { card } or { kind, phrase, situation }.
   */
  function planRound(now = U.now()) {
    const c = cfg();
    const list = all();
    const due = list.filter((p) => met(p) && M.srs.isDue(p.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const allowed = due.length >= c.maxDueForNew ? 0 : newLeftToday(now);
    const queue = list.filter((p) => !met(p)).sort((a, b) => a.level - b.level || a.index - b.index);
    const fresh = queue.slice(0, Math.min(allowed, list.some(met) ? c.newPerRound : c.firstRound));
    const [lastNew, after] = [fresh[fresh.length - 1], queue[fresh.length]];
    if (lastNew && after && fresh.length < allowed && partners(lastNew, after)) fresh.push(after);
    const rest = U.shuffle(list.filter((p) => met(p) && !due.includes(p))).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    const asked = new Map(); // phrase id → its situations used this round
    const step = (p, kind) => {
      const used = asked.get(p.id) || [];
      const left = p.situations.filter((s) => !used.includes(s));
      const situation = U.pick(left.length ? left : p.situations);
      asked.set(p.id, [...used, situation]);
      return { kind, phrase: p, situation };
    };
    const kindFor = (p) => (M.srs.stageOf(p.id) >= 2 && U.random() < 0.5 && whenQuestion(p) ? 'when' : 'what');
    const questions = [];
    for (const p of due) if (questions.length < c.size) questions.push(step(p, kindFor(p)));
    for (const p of fresh) if (questions.length < c.size) questions.push(step(p, 'what'));
    for (const p of rest) if (questions.length < c.size) questions.push(step(p, kindFor(p)));
    for (const p of fresh) {
      if (questions.length >= c.size) break;
      const when = !!whenQuestion(p);
      if (when || p.situations.length > 1) questions.push(step(p, when ? 'when' : 'what')); // (never the same question twice)
    }
    // Open with a review when there is one (a due phrase, if any), then the new phrases' cards, then the rest.
    const cards = fresh.filter((p) => questions.some((q) => q.phrase === p)).map((p) => ({ card: p }));
    const reviews = spread(U.shuffle(questions.filter((q) => !fresh.includes(q.phrase))));
    const opening = cards.length && reviews.length ? reviews.splice(Math.max(0, reviews.findIndex((q) => due.includes(q.phrase))), 1) : [];
    const steps = [...opening, ...cards, ...spread(U.shuffle([...reviews, ...questions.filter((q) => fresh.includes(q.phrase))]))];
    // A new phrase: "what do you say?" first, then "when do you say it?".
    for (const p of fresh) {
      const when = steps.findIndex((x) => x.phrase === p && x.kind === 'when');
      const what = steps.findIndex((x) => x.phrase === p && x.kind === 'what');
      if (when >= 0 && what > when) [steps[when], steps[what]] = [steps[what], steps[when]];
    }
    return steps;
  }

  /** A phrase's card: the phrase (hear it, say it), its meaning and word for word, when it's said, what you hear back, the tip. */
  function phraseCard(p) {
    return h(
      'div.phrase-card',
      h('div.phrase-head', h('span.phrase-ko', { lang: 'ko' }, p.ko), ui.audioButton(p.ko), ui.sayButton ? ui.sayButton(p.ko) : null),
      h('div.phrase-en', p.en),
      p.literal ? h('div.phrase-literal', h('span.phrase-label', ui.bi('직역', 'Word for word', 'inline')), `“${p.literal}”`) : null,
      h('div.phrase-when', h('span.phrase-label', ui.bi('언제', 'When', 'inline')), h('span', rich(p.when))),
      p.reply
        ? h(
            'div.phrase-reply',
            h('span.phrase-label', ui.bi('대답', 'You’ll hear', 'inline')),
            h('span.phrase-reply-ko', { lang: 'ko' }, p.reply.ko),
            ui.audioButton(p.reply.ko, { size: 'small' }),
            h('span.phrase-reply-en', `= ${p.reply.en}`)
          )
        : null,
      p.note ? h('p.phrase-note', h('span', { 'aria-hidden': 'true' }, '💡 '), rich(p.note)) : null
    );
  }

  function showPhraseCard(p) {
    const dialog = ui.modal({
      title: { ko: '상황 표현', en: 'What to say when' },
      cls: 'modal-wide',
      body: [phraseCard(p)],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }

  M.games.register({
    id: 'phrases',
    order: 10.7,
    emoji: '🙏',
    color: 'pink',
    title: { ko: '상황 표현', en: 'What to Say When' },
    blurb: { ko: '이럴 때 뭐라고 해요?', en: 'The right phrase for the moment' },

    status() {
      const list = all();
      if (!list.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const due = list.filter((p) => met(p) && M.srs.isDue(p.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${plural(due)} to review` };
      const fresh = list.filter((p) => !met(p)).length;
      if (fresh && newLeftToday() > 0) return { ready: true, ko: `새 표현 ${fresh}개`, en: plural(fresh, 'new phrase') };
      const known = list.length - fresh;
      return { ready: true, ko: `표현 ${known}/${list.length}개`, en: `${known} of ${list.length} phrases learned` };
    },

    start(host) {
      const steps = planRound();
      if (!steps.length) {
        host.empty({ emoji: '🙏', ko: '준비 중', en: 'Coming soon', text: 'The phrases are on their way.' });
        return;
      }
      const total = steps.filter((s) => !s.card).length;
      const last = new Map(steps.map((s, i) => [(s.card || s.phrase).id, i]));
      const slips = new Map();
      const rights = new Map();
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
        else ask(step);
      }

      function advance() {
        index++;
        next();
      }

      /** A new phrase: its card, before the questions. */
      function intro(p) {
        M.srs.introduce(p.id);
        M.store.save();
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-phrase-intro', ui.exTag('새 표현', 'A new phrase', '🙏'), phraseCard(p), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(p.ko, 300, { quiet: true });
        const stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            done();
          } else if (M.keys.isReplay(event) && !event.repeat) {
            event.preventDefault();
            M.speech.speak(p.ko);
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
        const p = step.phrase;
        const q = (step.kind === 'when' && whenQuestion(p, step.situation)) || whatQuestion(p, step.situation);
        const korean = q.kind === 'what';
        let locked = false;
        const tag = korean ? ui.exTag('뭐라고 해요?', 'What do you say?', '🙏') : ui.exTag('언제 말해요?', 'When do you say it?', '🕰️');
        const prompt = korean
          ? h('div.phrase-scene', h('span.phrase-scene-emoji', { 'aria-hidden': 'true' }, q.situation.emoji), h('p.phrase-scene-text', q.situation.en))
          : h('div.phrase-scene', h('div.phrase-q-ko', h('span', { lang: 'ko' }, p.ko), ui.audioButton(p.ko)), h('p.phrase-q', ui.bi('언제 이렇게 말해요?', 'When do you say this?')));
        const buttons = q.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: korean ? 'option option-ko' : 'option phrase-option-scene', lang: korean ? 'ko' : 'en', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            korean ? h('span.option-text', o.text) : h('span.option-text', h('span.phrase-option-emoji', { 'aria-hidden': 'true' }, o.emoji), o.text)
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-phrase',
            tag,
            prompt,
            h(korean ? 'div.options' : 'div.options.phrase-scene-options', { role: 'group', 'aria-label': 'Answers' }, buttons)
          )
        );
        if (!korean && M.store.state.settings.autoPlayAudio) M.speech.speakLater(p.ko, 300, { quiet: true });
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= buttons.length) {
            event.preventDefault();
            choose(n - 1);
          } else if (!korean && M.keys.isReplay(event)) {
            event.preventDefault();
            M.speech.speak(p.ko);
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
        const p = q.phrase;
        const correct = picked.correct;
        const tally = correct ? rights : slips;
        tally.set(p.id, (tally.get(p.id) || 0) + 1);
        if (last.get(p.id) === index) M.srs.review(p.id, gradeFor(slips.get(p.id) || 0, rights.get(p.id) || 0));
        for (const id of p.needs) M.srs.practice(id, correct); // (the game words the phrase is, once learned)
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().phrase;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('phrasesRight');
        } else round.combo = 0;
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();

        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(p.ko, 300, { quiet: true });
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', rich(text))) : null);
        const right = q.options.find((o) => o.correct);
        const scene = (o) => [h('span', { 'aria-hidden': 'true' }, `${o.emoji} `), o.text];
        const phraseRow = (cls, ...lead) => h(cls, ...lead, h('span.fb-ko', { lang: 'ko' }, p.ko), ui.audioButton(p.ko, { size: 'small' }), ui.sayButton ? ui.sayButton(p.ko) : null, h('span.fb-en', `= ${p.en}`));
        const content = [
          q.kind === 'what' ? phraseRow('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer'))) : h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span', scene(right))),
          q.kind === 'when' ? phraseRow('div.fb-row') : null,
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), q.kind === 'what' ? h('span', { lang: 'ko' }, picked.text) : h('span', scene(picked))),
          tip(right.why),
          correct ? null : tip(picked.why),
          p.reply ? h('div.fb-row.phrase-fb-reply', h('span.fb-label', ui.bi('대답', 'You’ll hear')), h('span.fb-ko', { lang: 'ko' }, p.reply.ko), ui.audioButton(p.reply.ko, { size: 'small' }), h('span.fb-en', `= ${p.reply.en}`)) : null,
          h('div.grammar-fb-card', h('button.btn.btn-soft.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: () => showPhraseCard(p) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('표현 카드', 'The phrase card'))),
        ];
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: p.ko, onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'phrases',
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

  M.phrases = { planRound, whatQuestion, whenQuestion, notItsMoment, gradeFor, newLeftToday };
})(window.Mallang);
