/**
 * Minigame 9 — 문법 카드 · Grammar Cards: the endings that join two ideas
 * (-고, -지만, -아서/어서, -(으)면…) and the helpers for "can", "must" and
 * "may". A new pattern starts with its card: what it means, how to make it
 * (with a table of forms), a note and examples. Then fill the blank in real
 * sentences: the right form of the word, next to the same word with another
 * ending (a different meaning) and the slips learners really make (먹아서,
 * 듣으면, 가을 때) — every option explained.
 *
 * Each pattern has its own spaced-repetition record ('grammar:<id>'), so the
 * patterns you miss come back sooner. The patterns and sentences live in
 * content/grammar.js; the forms and slips come from js/core/grammar.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const G = M.grammar;
  const cfg = () => M.config.session.grammarCards;
  const points = () => M.config.points;

  const patterns = () => M.content.grammar();
  /** Endings like -고 or -(으)면 shouldn't break across lines at their hyphen. */
  const nb = (text) => String(text).replace(/(^|[\s(“‘/])-(?=[가-힣(])/g, '$1\u2011');
  const rich = (text) => ui.richText(nb(text));
  let recent = new Set(); // question ids from the last round, so the next one picks others first

  /** Patterns have their own daily allowance, separate from new words. */
  function newToday(now) {
    const today = U.dayKey(now);
    return patterns().filter((g) => {
      const r = M.srs.peek(g.id);
      return r && r.introduced && U.dayKey(r.introduced) === today;
    }).length;
  }
  const newLeftToday = (now = U.now()) => Math.max(0, cfg().newPerDay - newToday(now));

  /** Enough words learned to read the sentences (a later starting level counts). */
  const wordsKnown = () => M.content.words().filter((w) => M.srs.isIntroduced(w.id)).length;

  /** Questions whose words you know first, then the focus topic's, then ones not seen last round. */
  function pickQuestions(pattern, n, topicId, used) {
    const known = (q) => q.needs.every(M.srs.isIntroduced);
    const inTopic = (q) => topicId && topicId !== 'all' && q.needs.some((id) => id.startsWith(`${topicId}:`));
    const score = (q) => (known(q) ? 0 : 4) + (inTopic(q) ? 0 : 1) + (recent.has(q.id) ? 2 : 0) + U.random();
    return pattern.questions
      .filter((q) => !used.has(q.id) && G.question(q))
      .map((q) => ({ q, s: score(q) }))
      .sort((a, b) => a.s - b.s)
      .slice(0, n)
      .map((x) => x.q);
  }

  /** Weak, tricky and young patterns come up more often as extra practice. */
  const weakness = (g) => M.progress.skillWeight(g.id) * (M.srs.isTricky(g.id) ? 2 : 1) * (1 + (5 - M.srs.stageOf(g.id)) / 5);

  /** Spread the questions so the same pattern rarely comes twice in a row. */
  function spread(list) {
    const out = [];
    const rest = list.slice();
    while (rest.length) {
      const last = out[out.length - 1];
      const i = rest.findIndex((s) => !last || s.pattern !== last.pattern);
      out.push(rest.splice(Math.max(0, i), 1)[0]);
    }
    return out;
  }

  /**
   * A round: due patterns first, a new pattern (two on the very first round)
   * with its card and a few questions right after it, then extra practice on
   * the weaker patterns. Steps: { kind: 'intro' | 'question', pattern, q }.
   */
  function planRound({ topicId = 'all', now = U.now() } = {}) {
    const c = cfg();
    const all = patterns();
    const known = all.filter((g) => M.srs.isIntroduced(g.id));
    const due = known.filter((g) => M.srs.isDue(g.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const unseen = all.filter((g) => M.srs.stageOf(g.id) === 0);
    const newCount = due.length >= c.maxDueForNew ? 0 : Math.min(unseen.length, newLeftToday(now), known.length ? 1 : 2);
    const fresh = unseen.slice(0, newCount);
    const used = new Set();
    const take = (pattern, n, extra = {}) =>
      pickQuestions(pattern, n, topicId, used).map((q) => {
        used.add(q.id);
        return { kind: 'question', pattern, q, ...extra };
      });

    const freshSteps = fresh.map((g) => take(g, c.questionsNew, { fresh: true }));
    const room = c.size - freshSteps.flat().length;
    const reviews = [];
    const perDue = due.length > 3 ? 1 : c.questionsDue;
    for (const g of due) reviews.push(...take(g, Math.min(perDue, room - reviews.length)));
    const pool = [...known.filter((g) => !due.includes(g)), ...fresh];
    for (let guard = 0; reviews.length < room && pool.length && guard < 60; guard++) {
      const g = U.weightedPick(pool, weakness);
      const [step] = take(g, 1, { extra: true });
      if (step) reviews.push(step);
      else pool.splice(pool.indexOf(g), 1);
    }

    // Open with a review when there is one, then each new pattern: its card and its questions.
    const mixed = spread(U.shuffle(reviews.filter((s) => !fresh.includes(s.pattern))));
    const later = reviews.filter((s) => fresh.includes(s.pattern));
    const steps = mixed.length && fresh.length ? [mixed.shift()] : [];
    fresh.forEach((g, i) => steps.push({ kind: 'intro', pattern: g }, ...freshSteps[i]));
    steps.push(...spread(U.shuffle([...mixed, ...later])));
    return steps;
  }

  /* ---------- The pattern card (intro, and the 📖 button in feedback and the garden) ---------- */

  function patternCard(pattern) {
    const rows = G.table(pattern.form);
    return h(
      'div.grammar-card',
      h(
        'div.grammar-card-head',
        h('span.grammar-card-emoji', { 'aria-hidden': 'true' }, pattern.emoji || '🔗'),
        h('div', h('h2.grammar-card-title', { lang: 'ko' }, nb(pattern.title.ko)), h('div.grammar-card-en', pattern.title.en))
      ),
      h('p.grammar-meaning', rich(pattern.meaning)),
      h('section.grammar-how', h('h3', ui.bi('만드는 법', 'How to make it')), h('p', rich(pattern.how))),
      rows.length
        ? h(
            'table.grammar-table',
            h(
              'tbody',
              rows.map((r) =>
                h(
                  'tr',
                  h('td.grammar-table-dict', { lang: 'ko' }, r.dict),
                  h('td.grammar-table-arrow', { 'aria-hidden': 'true' }, '→'),
                  h('td.grammar-table-form', h('span', { lang: 'ko' }, r.text), ui.audioButton(r.text, { size: 'small' })),
                  h('td.grammar-table-rule', r.rule)
                )
              )
            )
          )
        : null,
      pattern.note ? h('p.grammar-note', h('span', { 'aria-hidden': 'true' }, '💡 '), rich(pattern.note)) : null,
      pattern.examples.length ? h('div.grammar-examples', pattern.examples.map((ex) => ui.example(ex))) : null
    );
  }

  /** The pattern's card in a dialog, with how well you know it (also used by the garden and the summary). */
  function showGrammar(pattern) {
    const r = M.srs.peek(pattern.id);
    const stage = r ? r.stage : 0;
    const info = ui.STAGES[stage];
    let status = ui.bi('아직 안 배웠어요', 'Not learned yet — it will come up in Grammar Cards.');
    if (r && stage >= 1) {
      const now = U.now();
      const when = U.relativeTime(r.due, now);
      status = r.due <= now ? ui.bi('지금 복습할 수 있어요', 'Ready for review now 💧') : ui.bi(`다음 복습: ${when.ko}`, `Next review ${when.en}`);
    }
    const dialog = ui.modal({
      cls: 'modal-wide modal-grammar',
      body: [
        patternCard(pattern),
        h('div.word-detail-status', h('div', h('b', `${info.emoji} `), ui.bi(info.ko, `${info.en} — ${info.desc}`, 'inline')), h('div', status)),
      ],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }
  if (ui) ui.showGrammar = showGrammar; // (the unit tests load the games without the UI)

  M.games.register({
    id: 'grammar-cards',
    order: 9,
    emoji: '🔗',
    color: 'sky',
    title: { ko: '문법 카드', en: 'Grammar Cards' },
    blurb: { ko: '-고, -지만, -아서… 문장 잇기', en: 'Join ideas: and, but, so, if…' },

    status() {
      const all = patterns();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const left = cfg().minWords - wordsKnown();
      if (left > 0) return { ready: false, ko: `단어 ${left}개 더 배워요`, en: `Learn ${left} more word${left === 1 ? '' : 's'} to unlock` };
      const due = all.filter((g) => M.srs.isDue(g.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${U.plural(due, 'pattern')} to review` };
      const unseen = all.filter((g) => M.srs.stageOf(g.id) === 0).length;
      if (unseen && newLeftToday() > 0) return { ready: true, ko: '새 문법이 있어요', en: 'A new pattern to learn' };
      const known = all.length - unseen;
      return { ready: true, ko: `문법 ${known}/${all.length}개`, en: `${known} of ${all.length} patterns learned` };
    },

    start(host) {
      const steps = wordsKnown() >= cfg().minWords ? planRound({ topicId: host.topicId }) : [];
      if (!steps.some((s) => s.kind === 'question')) {
        host.empty({
          emoji: '🔒',
          ko: '단어가 더 필요해요',
          en: 'A few more words needed',
          text: `Grammar Cards uses sentences built from words you know. Learn at least ${cfg().minWords} words in Word Cards to open it.`,
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }
      recent = new Set(steps.filter((s) => s.q).map((s) => s.q.id));

      const total = steps.filter((s) => s.kind === 'question').length;
      const lastStep = new Map(steps.map((s, i) => [s.pattern.id, i]));
      const tally = new Map(); // pattern id → { right, wrong } this round
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, learned: [], mistakes: [] };
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
        if (step.kind === 'intro') intro(step.pattern);
        else ask(step);
      }

      function advance() {
        index++;
        next();
      }

      function intro(pattern) {
        M.srs.introduce(pattern.id);
        round.learned.push(pattern.id);
        M.store.save();
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-grammar-intro', ui.exTag('새 문법', 'New pattern', '✨'), patternCard(pattern), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        host.mascot.say('새 문법이에요!', 'A new pattern!', { duration: 2500 });
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

      /** The sentence around the blank, as words that wrap nicely; punctuation sticks to the blank. */
      function sentenceLine(built, slot) {
        const words = (text) => text.trim().split(/\s+/).filter(Boolean);
        const before = words(built.before);
        const after = words(built.after);
        const glued = built.after && !/^\s/.test(built.after) ? after.shift() : null; // “?” or “.” right after the blank
        return h(
          'div.grammar-sentence',
          { lang: 'ko' },
          before.map((w) => h('span.grammar-word', w)),
          h('span.grammar-word.target', slot, glued ? h('span', glued) : null),
          after.map((w) => h('span.grammar-word', w))
        );
      }

      function ask(step) {
        const { q } = step;
        const built = G.question(q);
        let locked = false;
        const slot = h(
          'span.grammar-slot',
          h('span.grammar-slot-q', { 'aria-hidden': 'true' }, '?'),
          h('span.grammar-slot-dict', { lang: 'ko' }, q.dict),
          h('span.sr-only', `(the right form of ${q.dict})`)
        );
        const buttons = built.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option option-ko', lang: 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text)
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-grammar',
            ui.exTag('빈칸을 채워요', 'Fill in the blank', '🔗'),
            h('div.grammar-q-card', sentenceLine(built, slot), h('div.grammar-en', `“${q.en}”`)),
            h('div.options', { role: 'group', 'aria-label': 'Forms' }, buttons)
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
          const picked = built.options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[built.options.findIndex((o) => o.correct)].classList.add('correct');
          U.clear(slot).append(h('span.grammar-slot-text', picked.text));
          slot.classList.add(picked.correct ? 'good' : 'bad');
          onAnswer(step, built, picked);
        }
      }

      /** One review per pattern and round, at its last question: all right → good, one slip → hard. */
      function grade(pattern) {
        const t = tally.get(pattern.id) || { right: 0, wrong: 0 };
        const result = t.wrong === 0 ? 'good' : t.wrong === 1 && t.right >= 2 ? 'hard' : 'again';
        M.srs.review(pattern.id, result);
      }

      function onAnswer(step, built, picked) {
        const { pattern, q } = step;
        const correct = picked.correct;
        const t = tally.get(pattern.id) || { right: 0, wrong: 0 };
        t[correct ? 'right' : 'wrong']++;
        tally.set(pattern.id, t);
        if (lastStep.get(pattern.id) === index) grade(pattern);
        M.progress.recordAnswer(correct);
        M.progress.skill(pattern.id, correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().grammar;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('grammarCorrect');
          M.sfx.play('bubble');
        } else {
          round.combo = 0;
          if (!round.mistakes.includes(pattern.id)) round.mistakes.push(pattern.id);
        }
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(q.ko, 300, { quiet: true });

        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', nb(text))) : null);
        const withForm = (text, cls) => [built.before, h(cls, text), built.after];
        const right = built.options.find((o) => o.correct);
        const content = [
          h(
            'div.fb-row.fb-answer',
            h('span.fb-label', ui.bi('정답', 'Answer')),
            h('span.fb-ko', { lang: 'ko' }, withForm(built.answer, 'span.fb-hl')),
            ui.audioButton(q.ko, { size: 'small' }),
            ui.sayButton ? ui.sayButton(q.ko) : null
          ),
          h('div.fb-en-line', `“${q.en}”`),
        ];
        if (!correct) content.push(h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, withForm(picked.text, 'mark'))), tip(picked.why));
        content.push(tip(right.why));
        // How the form is made (a spelling slip's explanation already says it).
        if (picked.kind !== 'slip') content.push(h('ol.verb-steps', built.steps.map((s) => h('li', nb(s)))));
        content.push(
          h(
            'div.grammar-fb-card',
            h('button.btn.btn-soft.btn-small', { type: 'button', on: { click: () => showGrammar(pattern) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi(`${nb(pattern.title.ko)} 카드`, `${pattern.title.en}: the card`))
          )
        );
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: q.ko, onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'grammar-cards',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
          grammarLearned: round.learned,
          grammarMistakes: round.mistakes,
        });
      }
    },
  });

  M.grammarCards = { planRound, pickQuestions, newLeftToday, patternCard };
})(window.Mallang);
