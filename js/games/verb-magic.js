/**
 * Minigame 6 — 동사 변신 · Verb Magic: a verb you've learned and a spell —
 * past, negative, future, "want to"… Cast it by choosing the right form.
 * The wrong options are the mistakes learners really make (듣어요, 먹아요,
 * 안 공부해요), and every answer shows how the form is built, step by step.
 * Well-known verbs are typed on the Korean keyboard instead.
 *
 * New spells unlock as you go: present, past and negative first, then the
 * future and "want to", then "shall we?" and "please do it".
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const C = M.conjugate;
  const cfg = () => M.config.session.verbMagic;
  const points = () => M.config.points;

  const ICONS = { present: '✨', past: '🕰️', future: '🔮', negative: '🙅', want: '💭', suggest: '🤝', please: '🙏' };
  const formInfo = (id) => C.FORMS.find((f) => f.id === id);
  const squash = (text) => U.noSpaces(U.normalize(text));

  /** Learned verbs and adjectives whose card shows the present tense (so the meaning fits the verb). */
  function verbPool(topicId) {
    return M.content.words(topicId).filter((w) => {
      if (!w.dict || !['verb', 'adjective'].includes(w.pos) || (w.form && w.form !== 'present')) return false;
      if (!M.srs.isIntroduced(w.id)) return false;
      const present = C.conjugate(w.dict, 'present', { pos: w.pos });
      return !!present && squash(present.text) === squash(w.ko);
    });
  }

  /** The topic's verbs, or every topic's if the topic has too few. */
  function poolFor(topicId) {
    const own = verbPool(topicId);
    return own.length >= cfg().minVerbs ? own : verbPool('all');
  }

  /** Spells unlock with practice. */
  function formsUnlocked() {
    const done = M.store.state.totals.verbsCorrect || 0;
    const step = cfg().harderFormsAfter;
    const forms = ['present', 'past', 'negative'];
    if (done >= step) forms.push('future', 'want');
    if (done >= step * 2.5) forms.push('suggest', 'please');
    return forms;
  }

  function buildRound(pool) {
    const urgent = pool.filter((w) => M.srs.isTricky(w.id) || M.srs.isDue(w.id));
    const ordered = [...U.shuffle(urgent), ...U.shuffle(pool.filter((w) => !urgent.includes(w)))];
    const forms = formsUnlocked();
    const used = new Set();
    const out = [];
    for (let i = 0; out.length < cfg().size && i < ordered.length * 4; i++) {
      const word = ordered[i % ordered.length];
      const possible = forms.filter((f) => C.applies(word.dict, f, { pos: word.pos }));
      const fresh = possible.filter((f) => !used.has(`${word.id}|${f}`));
      if (!fresh.length) continue;
      const form = U.weightedPick(fresh, (f) => M.progress.skillWeight(`verb:${f}`));
      used.add(`${word.id}|${form}`);
      out.push({ word, form });
    }
    return out;
  }

  /** Three wrong options: real slips first (they teach the most), then other forms of the verb. */
  function wrongOptions(word, form) {
    const all = C.mistakes(word.dict, form, { pos: word.pos });
    const slips = U.shuffle(all.filter((m) => m.kind !== 'other-form'));
    const others = U.shuffle(all.filter((m) => m.kind === 'other-form'));
    const picked = [...slips.slice(0, 2), ...others].slice(0, 3);
    return picked.length === 3 ? picked : [...picked, ...slips.slice(2)].slice(0, 3);
  }

  M.games.register({
    id: 'verb-magic',
    order: 6,
    emoji: '🪄',
    color: 'mint',
    title: { ko: '동사 변신', en: 'Verb Magic' },
    blurb: { ko: '과거, 미래, 부정… 동사를 바꿔요', en: 'Past, future, negative…' },

    status(topicId) {
      const min = cfg().minVerbs;
      const n = poolFor(topicId).length;
      if (n < min) {
        const left = min - n;
        return { ready: false, ko: `동사 ${left}개 더 배워요`, en: `Learn ${left} more verb${left === 1 ? '' : 's'} to unlock` };
      }
      const forms = formsUnlocked().length;
      return { ready: true, ko: `동사 ${n}개 · 주문 ${forms}개`, en: `${n} verbs · ${forms} spells` };
    },

    start(host) {
      const pool = poolFor(host.topicId);
      if (pool.length < cfg().minVerbs) {
        host.empty({
          emoji: '🔒',
          ko: '동사가 더 필요해요',
          en: 'A few more verbs needed',
          text: `Verb Magic uses verbs and adjectives you have learned (like 먹어요 or 추워요). Learn at least ${cfg().minVerbs} in Word Cards to unlock it.`,
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const spells = buildRound(pool);
      const unlockedBefore = formsUnlocked().length;
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, mistakes: [] };
      let index = 0;
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());
      next();

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(index, spells.length);
        if (index >= spells.length) return finish();
        cast(spells[index]);
      }

      function spellCard(word, form) {
        const info = formInfo(form);
        return h(
          'div.verb-stage',
          h(
            'div.verb-card',
            h('div.verb-emoji', { 'aria-hidden': 'true' }, word.emoji),
            h('div.verb-dict', h('span', { lang: 'ko' }, word.dict), ui.audioButton(word.dict, { size: 'small' })),
            h('div.verb-meaning', word.en)
          ),
          h('div.verb-wand', { 'aria-hidden': 'true' }, '🪄'),
          h('div.verb-spell', h('span.verb-spell-icon', { 'aria-hidden': 'true' }, ICONS[form]), ui.bi(info.ko, info.en), h('span.verb-spell-hint', { lang: 'ko' }, info.hint))
        );
      }

      function cast({ word, form }) {
        const right = C.conjugate(word.dict, form, { pos: word.pos });
        const stage = M.srs.stageOf(word.id);
        const typing = stage >= cfg().typeFromStage && M.store.state.settings.typing && U.random() < 0.4;
        if (typing) {
          // Type the form with the Korean keyboard (the typing exercise does the checking).
          const info = formInfo(form);
          const item = { id: word.id, ko: right.text, en: `${word.dict} → ${info.en}`, emoji: `${word.emoji} ${ICONS[form]}`, accept: right.variants };
          cleanup = M.exercises.get('typing').render({
            el: host.stage,
            item,
            mode: 'en',
            answer: (result) => onAnswer(word, form, right, { ...result, typed: true }),
          });
          return;
        }

        const options = U.shuffle([{ text: right.text, correct: true }, ...wrongOptions(word, form)]);
        let locked = false;
        const buttons = options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option option-ko', lang: 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text)
          )
        );
        host.stage.append(h('div.ex.ex-verb', ui.exTag('동사를 바꿔요!', 'Cast the spell: change the verb', '🪄'), spellCard(word, form), h('div.options', { role: 'group' }, buttons)));
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= options.length) {
            event.preventDefault();
            choose(n - 1);
          }
        });
        cleanup = stopKeys;

        function choose(i) {
          if (locked) return;
          locked = true;
          stopKeys();
          const picked = options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[options.findIndex((o) => o.correct)].classList.add('correct');
          if (picked.correct) M.sfx.play('magic');
          onAnswer(word, form, right, { correct: picked.correct, grade: picked.correct ? 'good' : 'again', given: picked.text, why: picked.why });
        }
      }

      function onAnswer(word, form, right, result) {
        const correct = !!result.correct;
        M.srs.practice(word.id, correct);
        M.progress.recordAnswer(correct);
        M.progress.skill(`verb:${form}`, correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = result.almost ? points().almost : result.typed ? points().verbTyped : points().verb;
          if (!result.almost && round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('verbsCorrect');
          if (result.typed && result.grade === 'good') M.progress.bump('typedCorrect');
        } else {
          round.combo = 0;
          if (!round.mistakes.includes(word.id)) round.mistakes.push(word.id);
        }
        host.award(earned);
        host.react(result, round.combo);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(right.text, 300, { quiet: true });

        const info = formInfo(form);
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);
        const content = [
          h(
            'div.fb-row.fb-answer',
            h('span.fb-label', ui.bi('정답', 'Answer')),
            h('span.fb-ko', { lang: 'ko' }, right.text),
            ui.audioButton(right.text, { size: 'small' }),
            h('span.fb-en', `= ${word.dict} · ${info.en}`)
          ),
        ];
        if (!correct || result.almost) {
          if (result.given) content.push(h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, result.given)));
          if (result.why && result.why !== right.steps[0]) content.push(tip(result.why));
          if (result.tip) content.push(tip(result.tip));
        }
        content.push(h('ol.verb-steps', right.steps.map((step) => h('li', step))));
        if (result.note) content.push(tip(result.note));
        host.showFeedback({
          tone: result.almost ? 'almost' : correct ? 'good' : 'bad',
          points: earned,
          content,
          speak: right.text,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        const unlockedNow = formsUnlocked();
        if (unlockedNow.length > unlockedBefore) {
          const names = unlockedNow.slice(unlockedBefore).map((f) => `${ICONS[f]} ${formInfo(f).en}`).join(', ');
          ui.toast({ icon: '🪄', ko: '새 주문을 배웠어요!', en: `New spells unlocked: ${names}`, tone: 'good', duration: 6000 });
        }
        host.finish({
          gameId: 'verb-magic',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: round.mistakes,
          perfect: false,
        });
      }
    },
  });

  M.verbMagic = { verbPool, poolFor, formsUnlocked, buildRound, wrongOptions };
})(window.Mallang);
