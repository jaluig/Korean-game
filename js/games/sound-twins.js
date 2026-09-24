/**
 * Minigame 8 — 소리 쌍둥이 · Sound Twins: hear a word, then find it among its
 * look-alike twins: 달 / 탈 / 딸, 거울 / 겨울, 반 / 방 / 밤. It trains your ear
 * for the sounds English doesn't separate, and explains every mix-up.
 * Without a Korean voice it becomes a reading game: romanization → Hangul.
 *
 * Every set has its own spaced-repetition record ('sound:<id>'), so the
 * pairs you confuse come back sooner. The sets live in content/sounds.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const H = M.hangul;
  const cfg = () => M.config.session.soundTwins;
  const points = () => M.config.points;

  const KINDS = { initial: 'first consonant', vowel: 'vowel', final: 'final consonant (받침)' };

  /** Due sets first, then new ones (in order), then the least grown. */
  function buildRound(now = U.now()) {
    const sets = M.content.soundSets();
    const due = sets.filter((s) => M.srs.isDue(s.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = sets.filter((s) => M.srs.stageOf(s.id) === 0);
    const rest = U.shuffle(sets.filter((s) => !due.includes(s) && !fresh.includes(s))).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    const picked = [...due, ...fresh.slice(0, 4), ...rest, ...fresh.slice(4)].slice(0, cfg().size);
    while (picked.length < cfg().size && sets.length) picked.push(U.pick(sets));
    return U.shuffle(picked).map((set) => ({ set, target: U.pick(set.words) }));
  }

  M.games.register({
    id: 'sound-twins',
    order: 8,
    emoji: '👂',
    color: 'pink',
    title: { ko: '소리 쌍둥이', en: 'Sound Twins' },
    blurb: { ko: '달? 탈? 딸? 잘 듣고 골라요', en: 'Hear the difference: 달 탈 딸' },

    status() {
      const sets = M.content.soundSets();
      if (!sets.length) return { ready: false, ko: '준비 중', en: 'No sound sets' };
      if (!M.speech.isReady() && M.speech.status() !== 'loading') return { ready: true, ko: '읽기 모드', en: 'Reading mode (no Korean voice)' };
      const due = sets.filter((s) => M.srs.isDue(s.id)).length;
      return due ? { ready: true, ko: `복습 ${due}개`, en: `${due} to review` } : { ready: true, ko: '귀를 훈련해요', en: 'Train your ear' };
    },

    start(host) {
      const questions = buildRound();
      const listening = M.speech.isReady();
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, mistakes: [] };
      let index = 0;
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());
      if (!listening) host.mascot.say('소리가 없어서 읽기 모드예요', 'No Korean voice, so this is reading mode', { duration: 4000 });

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(index, questions.length);
        if (index >= questions.length) return finish();
        ask(questions[index]);
      }

      function ask({ set, target }) {
        const words = U.shuffle(set.words);
        let locked = false;
        const prompt = listening
          ? h('div.prompt.prompt-listen', ui.audioButton(target.ko, { size: 'huge', label: 'Play the word' }), ui.audioButton(target.ko, { size: 'big', slow: true }))
          : h('div.prompt', h('div.sound-rom', target.rom), h('p.muted', ui.bi('로마자를 읽고 한글을 골라요', 'Read the romanization, then pick the Hangul', 'inline')));
        const cards = words.map((w, i) =>
          h(
            'button',
            { type: 'button', class: 'twin-card', lang: 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.twin-emoji', { 'aria-hidden': 'true' }, w.emoji),
            h('span.twin-ko', w.ko),
            h('span.twin-en', w.en)
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-sound',
            listening ? ui.exTag('잘 듣고 골라요', 'Which word do you hear?', '👂') : ui.exTag('어느 거예요?', 'Which one is it?', '👀'),
            prompt,
            h('div.twins', { role: 'group', style: { '--n': words.length } }, cards),
            listening ? h('p.type-tip', ui.bi('R 키로 다시 들어요', 'Press R to hear it again')) : null
          )
        );
        if (listening) M.speech.speakLater(target.ko, 350, { quiet: true });
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= words.length) {
            event.preventDefault();
            choose(n - 1);
          } else if (listening && M.keys.isReplay(event)) M.speech.speak(target.ko);
        });
        cleanup = stopKeys;

        function choose(i) {
          if (locked) return;
          locked = true;
          stopKeys();
          const picked = words[i];
          const correct = picked === target;
          cards.forEach((c) => (c.disabled = true));
          cards[i].classList.add(correct ? 'correct' : 'wrong');
          if (!correct) cards[words.indexOf(target)].classList.add('correct');
          onAnswer(set, target, picked, correct);
        }
      }

      function onAnswer(set, target, picked, correct) {
        M.srs.review(set.id, correct ? 'good' : 'again');
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().sound;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('soundsCorrect');
        } else {
          round.combo = 0;
          if (!round.mistakes.includes(set.id)) round.mistakes.push(set.id);
        }
        host.award(earned);
        host.react({ correct }, round.combo);
        M.store.save();

        // What differs between the twins, and how to hear it.
        const other = correct ? set.words.find((w) => w !== target) : picked;
        const diff = H.explainDifference(target.ko, other.ko);
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, target.ko), ui.audioButton(target.ko, { size: 'small' }), h('span.fb-en', `= ${target.en} · ${target.rom}`)),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, picked.ko), h('span.fb-en', ` = ${picked.en} · ${picked.rom}`)),
          diff && diff.tip ? tip(`${diff.expected} vs ${diff.given} (${KINDS[diff.kind] || 'letter'}): ${diff.tip}`) : null,
          h(
            'div.twin-compare',
            h('span.fb-label', ui.bi('비교해 봐요', 'Compare')),
            set.words.map((w) => h('span.twin-chip', h('span', { lang: 'ko' }, w.ko), ui.audioButton(w.ko, { size: 'small', label: `Play ${w.ko}` })))
          ),
        ];
        host.showFeedback({
          tone: correct ? 'good' : 'bad',
          points: earned,
          content,
          speak: target.ko,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        host.finish({
          gameId: 'sound-twins',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
          soundMistakes: round.mistakes,
        });
      }

      next();
    },
  });

  M.soundTwins = { buildRound };
})(window.Mallang);
