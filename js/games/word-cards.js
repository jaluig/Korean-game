/**
 * Minigame 1 — 단어 카드 · Word Cards: the main learning loop.
 *
 * A round mixes due reviews with a few new words. The exercise gets harder as
 * a word grows: recognise it (🌱) → pick or hear the Korean (🌿) → build it
 * from syllables (🌷) → type it from memory (🌻 and up). Missed words come
 * back a few cards later in the same round, in an easier format.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const points = () => M.config.points;

  /** Pick the exercise for a word based on how well it's known. */
  function chooseFormat(word) {
    const stage = M.srs.stageOf(word.id);
    const canListen = M.speech.isReady();
    const roll = U.random();
    if (stage <= 1) {
      return canListen && roll < 0.3 ? { type: 'choice', mode: 'listen-en', points: 'listen' } : { type: 'choice', mode: 'ko-en', points: 'choice' };
    }
    if (stage === 2) {
      return canListen && roll < 0.35 ? { type: 'choice', mode: 'listen-ko', points: 'listen' } : { type: 'choice', mode: 'en-ko', points: 'choice' };
    }
    if (stage === 3 || !M.store.state.settings.typing) return { type: 'tiles', points: 'tiles' };
    return canListen && roll < 0.3 ? { type: 'typing', mode: 'audio', points: 'typing' } : { type: 'typing', mode: 'en', points: 'typing' };
  }

  /** Did the learner already hear the word while answering? */
  const heardIt = (format) => format.mode === 'ko-en' || format.mode === 'listen-en' || format.mode === 'listen-ko' || format.mode === 'audio';

  M.games.register({
    id: 'word-cards',
    order: 1,
    emoji: '🎴',
    color: 'pink',
    title: { ko: '단어 카드', en: 'Word Cards' },
    blurb: { ko: '새 단어 배우고 복습하기', en: 'Learn new words & review' },

    /** Shown on the home screen. */
    status(topicId) {
      const p = M.srs.wordPreview(topicId);
      if (p.due + p.fresh > 0) return { ready: true, ko: `복습 ${p.due} · 새 단어 ${p.fresh}`, en: `${p.due} to review · ${p.fresh} new` };
      if (p.known) return { ready: true, ko: '추가 연습', en: 'All caught up — extra practice' };
      return { ready: false, ko: '내일 또 만나요', en: 'New words done for today' };
    },

    start(host) {
      const plan = M.srs.buildWordSession({ topicId: host.topicId });
      if (!plan.steps.length) {
        // Point to a practice game that has something to do.
        const extra = ['balloon-pop', 'particle-lab', 'verb-magic', 'number-shop', 'sound-twins']
          .map((id) => M.games.get(id))
          .find((g) => g && g.status(host.topicId).ready);
        host.empty({
          emoji: '🌙',
          ko: '오늘은 다 했어요!',
          en: 'All done for today!',
          text: 'You have learned all of today’s new words and nothing is due. Your garden needs time to grow, so come back tomorrow, or keep practising in another game. (You can raise the number of new words per day in Settings.)',
          actions: extra ? [{ ko: extra.title.ko, en: `Play ${extra.title.en}`, href: `#/play/${extra.id}` }] : [],
        });
        return;
      }

      const cfg = M.config.session.wordCards;
      const steps = plan.steps.slice();
      const pool = M.content.words();
      const retries = new Map();
      const round = { gameId: 'word-cards', answers: 0, correct: 0, combo: 0, bestCombo: 0, learned: [], grown: [], mistakes: new Set() };
      let index = 0;
      let cleanup = null;

      host.onCleanup(() => cleanup && cleanup());
      if (plan.extraCount && !plan.dueCount && !plan.freshIds.length) {
        host.mascot.say('복습 끝! 추가 연습해요.', 'Nothing due — extra practice!', { duration: 3500 });
      }
      next();

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(index, steps.length);
        if (index >= steps.length) return finish();

        const step = steps[index];
        const word = M.content.word(step.id);
        if (step.kind === 'intro') {
          cleanup = M.exercises.get('intro').render({
            el: host.stage,
            item: word,
            onDone: () => {
              M.srs.introduce(word.id);
              round.learned.push(word.id);
              host.award(points().intro);
              M.store.save();
              index++;
              next();
            },
          });
          return;
        }

        const format = chooseFormat(word);
        cleanup = M.exercises.get(format.type).render({
          el: host.stage,
          item: word,
          mode: format.mode,
          pool,
          answer: (result) => onAnswer(word, format, result),
        });
      }

      function onAnswer(word, format, result) {
        const stageBefore = M.srs.stageOf(word.id);
        M.srs.review(word.id, result.grade);
        M.progress.recordAnswer(result.correct);
        round.answers++;

        let earned = 0;
        if (result.grade === 'again') {
          round.combo = 0;
          round.mistakes.add(word.id);
          // Ask again a few cards later (the lower stage means an easier format).
          const tries = retries.get(word.id) || 0;
          if (tries < cfg.maxRetries) {
            retries.set(word.id, tries + 1);
            steps.splice(Math.min(index + 1 + cfg.retryGap, steps.length), 0, { kind: 'quiz', id: word.id, retry: true });
          }
        } else {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = result.grade === 'good' ? points()[format.points] : points().almost;
          if (result.grade === 'good' && round.combo % points().comboEvery === 0) earned += points().comboBonus;
          if (result.typed && result.grade === 'good') M.progress.bump('typedCorrect');
          if (M.srs.stageOf(word.id) > stageBefore && !round.grown.includes(word.id)) round.grown.push(word.id);
        }

        host.award(earned);
        host.react(result, round.combo);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio && (!heardIt(format) || !result.correct)) {
          M.speech.speakLater(word.ko, 250, { quiet: true });
        }

        host.showFeedback({
          tone: result.almost ? 'almost' : result.correct ? 'good' : 'bad',
          points: earned,
          content: M.ui.feedback.forWord(word, result),
          speak: word.ko,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        const perfect = round.mistakes.size === 0 && round.answers >= 5;
        if (perfect) host.award(points().perfectRound);
        host.finish({
          gameId: 'word-cards',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: round.learned,
          grown: round.grown,
          mistakes: [...round.mistakes],
          perfect,
        });
      }
    },
  });
})(window.Mallang);
