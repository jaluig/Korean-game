/**
 * Minigame — 표지판 읽기 · Reading Signs: the signs and labels you see in Korea
 * (출구, 금연, 영업중, 1+1, 품절), drawn in the colours real ones have. A new sign
 * starts with its card; then a sign (what does it say?) or a moment (which sign
 * is it?), the wrong answers being signs that say something else. The pictogram
 * real signs have is only on the card: in a question you read the Korean.
 *
 * Every sign has its own spaced-repetition record ('sign:<id>'). They live in
 * content/signs.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.signs;
  const points = () => M.config.points;
  const rich = (text) => (ui.richText ? ui.richText(text) : text);
  const plural = (n, what = 'sign') => `${n} ${what}${n === 1 ? '' : 's'}`;

  const all = () => M.content.signs().filter((x) => x.ko && x.en); // (the checker reports one without)
  const byLocal = (localId) => all().find((x) => x.localId === localId) || null;
  const met = (x) => M.srs.isIntroduced(x.id);
  const spoken = (x) => x.say || x.ko;

  /** A sign as it looks in the street (the pictogram only where it can't give the answer away). */
  function signEl(x, { icon = false, small = false } = {}) {
    return h(
      `span.sign.sign-${x.look}${small ? '.sign-small' : ''}`,
      { lang: 'ko' },
      icon && x.icon ? h('span.sign-icon', { 'aria-hidden': 'true' }, x.icon) : null,
      h('span.sign-text', x.ko)
    );
  }

  /** Signs that mean nearly the same, never each other's wrong answer. */
  const close = (a, b) => a.avoid.includes(b.localId) || b.avoid.includes(a.localId) || a.en.toLowerCase() === b.en.toLowerCase();

  /**
   * What does it say? The sign and four meanings. The wrong ones come from signs of the same look first (so the
   * colour gives nothing away), then from its near misses (its `wrong` list), then any other; the ones you've met first.
   */
  function readQuestion(x) {
    const others = all().filter((y) => y !== x && !close(x, y));
    const near = (y) => x.wrong.includes(y.localId);
    const group = (keep) => [...U.shuffle(others.filter((y) => keep(y) && met(y))), ...U.shuffle(others.filter((y) => keep(y) && !met(y)))];
    const ordered = [...group((y) => y.look === x.look), ...group((y) => y.look !== x.look && near(y)), ...group((y) => y.look !== x.look && !near(y))];
    const wrong = U.uniqueBy(ordered, (y) => y.en.toLowerCase()).slice(0, 3);
    const options = U.shuffle([
      { text: x.en, correct: true, why: x.where },
      ...wrong.map((y) => ({ text: y.en, correct: false, why: `“${y.en}” is ${y.ko}. ${y.where}` })),
    ]);
    return { kind: 'read', sign: x, options };
  }

  /** Which sign is it? A moment, the sign for it and three that say something else (the ones you've met first). */
  function findQuestion(x) {
    const wrongs = x.wrong.map(byLocal).filter((w) => w && !close(x, w));
    const picked = [...U.shuffle(wrongs.filter(met)), ...U.shuffle(wrongs.filter((w) => !met(w)))].slice(0, 3);
    const options = U.shuffle([
      { sign: x, text: x.ko, correct: true, why: x.where },
      ...picked.map((y) => ({ sign: y, text: y.ko, correct: false, why: `${y.ko} = ${y.en}. ${y.where}` })),
    ]);
    return { kind: 'find', sign: x, options };
  }

  /** How a sign went in a round: all right → good, one slip next to a right answer → hard, otherwise again. */
  const gradeFor = (slips, right) => (slips === 0 ? 'good' : slips === 1 && right > 0 ? 'hard' : 'again');

  /** New signs have their own daily allowance. */
  function newLeftToday(now = U.now()) {
    const today = U.dayKey(now);
    const fresh = all().filter((x) => {
      const r = M.srs.peek(x.id);
      return r && r.introduced && U.dayKey(r.introduced) === today;
    }).length;
    return Math.max(0, cfg().newPerDay - fresh);
  }

  /** Two signs taught as a pair: neighbours in the list, each a wrong answer for the other's moment (입구 / 출구, 미세요 / 당기세요). */
  const partners = (a, b) => Math.abs(a.index - b.index) === 1 && a.wrong.includes(b.localId) && b.wrong.includes(a.localId);

  /** Spread the questions so the same sign never comes twice in a row when it can be helped (the one with most left first). */
  function spread(list) {
    const out = [];
    const rest = list.slice();
    const left = (x) => rest.filter((s) => s.sign === x).length;
    while (rest.length) {
      const last = out[out.length - 1];
      const choices = rest.filter((s) => !last || s.sign !== last.sign);
      const pick = choices.length ? choices.reduce((best, s) => (left(s.sign) > left(best.sign) ? s : best)) : rest[0];
      out.push(rest.splice(rest.indexOf(pick), 1)[0]);
    }
    return out;
  }

  /**
   * A round: due signs first, then new ones (their cards come first; a pair is
   * never split), then the signs met so far, the least known first: one question
   * each, and a second one for the new signs while the round is short.
   * Steps: { card } or { kind: 'read' | 'find', sign }.
   */
  function planRound(now = U.now()) {
    const c = cfg();
    const list = all();
    const due = list.filter((x) => met(x) && M.srs.isDue(x.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const allowed = due.length >= c.maxDueForNew ? 0 : newLeftToday(now);
    const queue = list.filter((x) => !met(x)).sort((a, b) => a.level - b.level || a.index - b.index);
    const fresh = queue.slice(0, Math.min(allowed, list.some(met) ? c.newPerRound : c.firstRound));
    const [lastNew, after] = [fresh[fresh.length - 1], queue[fresh.length]];
    if (lastNew && after && fresh.length < allowed && partners(lastNew, after)) fresh.push(after);
    const rest = U.shuffle(list.filter((x) => met(x) && !due.includes(x))).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    const kindFor = (x) => (M.srs.stageOf(x.id) >= 2 && U.random() < 0.5 ? 'find' : 'read');
    const questions = [];
    for (const x of due) if (questions.length < c.size) questions.push({ kind: kindFor(x), sign: x });
    for (const x of fresh) if (questions.length < c.size) questions.push({ kind: 'read', sign: x });
    for (const x of rest) if (questions.length < c.size) questions.push({ kind: kindFor(x), sign: x });
    for (const x of fresh) if (questions.length < c.size) questions.push({ kind: 'find', sign: x });
    // Open with a review when there is one (a due sign, if any), then the new signs' cards, then the rest.
    const cards = fresh.filter((x) => questions.some((q) => q.sign === x)).map((x) => ({ card: x }));
    const reviews = spread(U.shuffle(questions.filter((q) => !fresh.includes(q.sign))));
    const opening = cards.length && reviews.length ? reviews.splice(Math.max(0, reviews.findIndex((q) => due.includes(q.sign))), 1) : [];
    const steps = [...opening, ...cards, ...spread(U.shuffle([...reviews, ...questions.filter((q) => fresh.includes(q.sign))]))];
    // A new sign: "what does it say?" first, then "which sign is it?".
    for (const x of fresh) {
      const find = steps.findIndex((s) => s.sign === x && s.kind === 'find');
      const read = steps.findIndex((s) => s.sign === x && s.kind === 'read');
      if (find >= 0 && read > find) [steps[find], steps[read]] = [steps[read], steps[find]];
    }
    return steps;
  }

  /** A sign's card: the sign (with its pictogram), what it means, where you see it, the tip. */
  function signCard(x) {
    return h(
      'div.sign-card',
      h('div.sign-card-head', signEl(x, { icon: true }), ui.audioButton(spoken(x))),
      h('div.sign-card-en', x.en),
      h('div.sign-card-where', h('span.sign-card-label', ui.bi('어디서', 'Where', 'inline')), h('span', rich(x.where))),
      x.note ? h('p.sign-card-note', h('span', { 'aria-hidden': 'true' }, '💡 '), rich(x.note)) : null
    );
  }

  function showSignCard(x) {
    const dialog = ui.modal({
      title: { ko: '표지판', en: 'The sign' },
      cls: 'modal-wide',
      body: [signCard(x)],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }

  M.games.register({
    id: 'signs',
    order: 11.5,
    emoji: '🪧',
    color: 'sky',
    title: { ko: '표지판 읽기', en: 'Reading Signs' },
    blurb: { ko: '출구, 금연, 영업중, 1+1', en: 'The signs and labels you see in Korea' },

    status() {
      const list = all();
      if (!list.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const due = list.filter((x) => met(x) && M.srs.isDue(x.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${plural(due)} to review` };
      const fresh = list.filter((x) => !met(x)).length;
      if (fresh && newLeftToday() > 0) return { ready: true, ko: `새 표지판 ${fresh}개`, en: plural(fresh, 'new sign') };
      const known = list.length - fresh;
      return { ready: true, ko: `표지판 ${known}/${list.length}개`, en: `${known} of ${list.length} signs learned` };
    },

    start(host) {
      const steps = planRound();
      if (!steps.length) {
        host.empty({ emoji: '🪧', ko: '준비 중', en: 'Coming soon', text: 'The signs are on their way.' });
        return;
      }
      const total = steps.filter((s) => !s.card).length;
      const last = new Map(steps.map((s, i) => [(s.card || s.sign).id, i]));
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

      /** A new sign: its card, before the questions. */
      function intro(x) {
        M.srs.introduce(x.id);
        M.store.save();
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-sign-intro', ui.exTag('새 표지판', 'A new sign', '🪧'), signCard(x), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(spoken(x), 300, { quiet: true });
        const stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            done();
          } else if (M.keys.isReplay(event) && !event.repeat) {
            event.preventDefault();
            M.speech.speak(spoken(x));
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
        const x = step.sign;
        const q = step.kind === 'find' ? findQuestion(x) : readQuestion(x);
        const reading = q.kind === 'read';
        let locked = false;
        const tag = reading ? ui.exTag('무슨 뜻이에요?', 'What does the sign say?', '🪧') : ui.exTag('어느 표지판이에요?', 'Which sign is it?', '🔎');
        const prompt = reading
          ? h('div.sign-scene', signEl(x))
          : h('div.sign-scene', h('p.sign-need', x.need));
        const buttons = q.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: reading ? 'option' : 'option option-ko', lang: reading ? 'en' : 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text)
          )
        );
        host.stage.append(h('div.ex.ex-sign', tag, prompt, h('div.options', { role: 'group', 'aria-label': 'Answers' }, buttons)));
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
          onAnswer(q, picked);
        }
      }

      function onAnswer(q, picked) {
        const x = q.sign;
        const correct = picked.correct;
        const tally = correct ? rights : slips;
        tally.set(x.id, (tally.get(x.id) || 0) + 1);
        if (last.get(x.id) === index) M.srs.review(x.id, gradeFor(slips.get(x.id) || 0, rights.get(x.id) || 0));
        for (const id of x.needs) M.srs.practice(id, correct); // (the game word the sign is, once learned)
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().sign;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('signsRight');
        } else round.combo = 0;
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();

        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(spoken(x), 300, { quiet: true });
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', rich(text))) : null);
        const right = q.options.find((o) => o.correct);
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), signEl(x, { icon: true, small: true }), ui.audioButton(spoken(x), { size: 'small' }), h('span.fb-en', `= ${x.en}`)),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), picked.sign ? signEl(picked.sign, { small: true }) : h('span', picked.text)),
          tip(right.why),
          correct ? null : tip(picked.why),
          h('div.grammar-fb-card', h('button.btn.btn-soft.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: () => showSignCard(x) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('표지판 카드', 'The sign card'))),
        ];
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: spoken(x), onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'signs',
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

  M.signs = { planRound, readQuestion, findQuestion, gradeFor, newLeftToday, signEl };
})(window.Mallang);
