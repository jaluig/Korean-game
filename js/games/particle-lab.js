/**
 * Minigame 5 — 조사 실험실 · Particle Lab: a sentence from your topics with
 * one particle missing. Pour in the right potion: 을 or 를? 에 or 에서? 이 or 을?
 * Every wrong potion comes with the reason, and the right one with its rule.
 *
 * Questions come from sentences whose words you know (see js/core/particles.js).
 * A mistake sends that sentence back to the Sentence Builder soon.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const P = M.particles;
  const cfg = () => M.config.session.particleLab;
  const points = () => M.config.points;

  /** Unlocked sentences that have at least one particle question. */
  function questionPool(topicId) {
    return M.content
      .sentences(topicId)
      .filter(M.srs.isUnlocked)
      .map((sentence) => ({ sentence, drills: P.drills(sentence) }))
      .filter((x) => x.drills.length);
  }

  /** Tricky and due sentences first; within a sentence, weaker particles more often. */
  function buildRound(topicId) {
    const pool = questionPool(topicId);
    const urgent = pool.filter(({ sentence }) => M.srs.isTricky(sentence.id) || M.srs.isDue(sentence.id));
    const ordered = [...U.shuffle(urgent), ...U.shuffle(pool.filter((x) => !urgent.includes(x)))];
    const questions = [];
    const size = cfg().size;
    for (let pass = 0; pass < 3 && questions.length < size; pass++) {
      for (const { sentence, drills } of ordered) {
        if (questions.length >= size) break;
        const unused = drills.filter((d) => !questions.some((q) => q.sentence === sentence && q.drill.index === d.index));
        if (!unused.length || (pass === 0 && questions.some((q) => q.sentence === sentence))) continue;
        questions.push({ sentence, drill: U.weightedPick(unused, (d) => M.progress.skillWeight(`particle:${d.answer}`)) });
      }
    }
    return U.shuffle(questions);
  }

  M.games.register({
    id: 'particle-lab',
    order: 5,
    emoji: '🧪',
    color: 'lilac',
    title: { ko: '조사 실험실', en: 'Particle Lab' },
    blurb: { ko: '을/를? 에/에서? 알맞은 조사를 골라요', en: 'Pick the right particle' },

    status(topicId) {
      const n = questionPool(topicId).length;
      if (n < cfg().minQuestions) {
        return { ready: false, ko: '단어를 더 배우면 문장이 열려요', en: 'Learn a few more words to open sentences' };
      }
      return { ready: true, ko: `문장 ${n}개`, en: `${n} sentences to practise` };
    },

    start(host) {
      const questions = buildRound(host.topicId);
      if (questions.length < cfg().minQuestions) {
        host.empty({
          emoji: '🔒',
          ko: '아직 문장이 부족해요',
          en: 'Not enough sentences yet',
          text: 'Particle Lab uses sentences whose words you already know. Learn a few more words in Word Cards and they’ll open up.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, mistakes: [] };
      let index = 0;
      let stopKeys = null;
      host.onCleanup(() => stopKeys && stopKeys());
      next();

      function next() {
        if (stopKeys) stopKeys();
        stopKeys = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(index, questions.length);
        if (index >= questions.length) return finish();
        ask(questions[index]);
      }

      function ask({ sentence, drill }) {
        const options = U.shuffle(drill.options);
        const slot = h('span.lab-slot', { 'aria-label': 'missing particle' }, h('span.lab-slot-q', '?'));
        const line = h(
          'div.lab-sentence',
          { lang: 'ko' },
          sentence.tiles.map((tile, i) =>
            i === drill.index ? h('span.lab-word.target', h('span', drill.stem), slot, drill.punct ? h('span', drill.punct) : null) : h('span.lab-word', tile)
          )
        );
        let locked = false;
        const buttons = options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: `flask tone-${['pink', 'mint', 'sky', 'butter'][i % 4]}`, lang: 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.flask-neck', { 'aria-hidden': 'true' }),
            h('span.flask-body', h('span.flask-text', o.text))
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-particle',
            ui.exTag('알맞은 조사를 넣어요', 'Pour in the right particle', '🧪'),
            h('div.lab-card', line, h('div.lab-en', `“${sentence.en}”`)),
            h('div.flasks', { role: 'group', 'aria-label': 'Particles' }, buttons)
          )
        );

        stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= options.length) {
            event.preventDefault();
            choose(n - 1);
          }
        });

        function choose(i) {
          if (locked) return;
          locked = true;
          stopKeys();
          const picked = options[i];
          const right = options.find((o) => o.correct);
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong', 'poured');
          if (!picked.correct) buttons[options.indexOf(right)].classList.add('correct');
          U.clear(slot).append(h('span.lab-slot-text', picked.text));
          slot.classList.add(picked.correct ? 'good' : 'bad');
          if (picked.correct) M.sfx.play('bubble');
          onAnswer(sentence, drill, picked, right);
        }
      }

      function onAnswer(sentence, drill, picked, right) {
        const correct = picked.correct;
        M.srs.practice(sentence.id, correct);
        M.progress.recordAnswer(correct);
        M.progress.skill(`particle:${drill.answer}`, correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().particle;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('particlesCorrect');
        } else {
          round.combo = 0;
          if (!round.mistakes.includes(sentence.id)) round.mistakes.push(sentence.id);
        }
        host.award(earned);
        host.react({ correct }, round.combo);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(sentence.ko, 300, { quiet: true });

        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);
        const rule = P.formRule(drill.stem, drill.particle);
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, sentence.ko), ui.audioButton(sentence.ko, { size: 'small' })),
          h('div.fb-en-line', `“${sentence.en}”`),
          M.ui.feedback.gloss(sentence),
        ];
        if (!correct) content.push(h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, `${drill.stem}${picked.text}`)), tip(picked.why));
        content.push(tip(`${drill.stem}${right.text}: ${right.why}`));
        if (rule && (correct || picked.text !== right.text)) content.push(tip(rule));
        host.showFeedback({
          tone: correct ? 'good' : 'bad',
          points: earned,
          content: U.uniqueBy(content.filter(Boolean), (el) => el.textContent),
          speak: sentence.ko,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        host.finish({
          gameId: 'particle-lab',
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

  M.particleLab = { questionPool, buildRound };
})(window.Mallang);
