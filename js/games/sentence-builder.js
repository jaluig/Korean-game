/**
 * Minigame 2 — 문장 만들기 · Sentence Builder: put words in order to make a
 * Korean sentence. Trains word order and particles (을/를, 이/가, 에/에서…).
 * A sentence unlocks once you've learned all of its words.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const points = () => M.config.points;

  M.games.register({
    id: 'sentence-builder',
    order: 2,
    emoji: '🧩',
    color: 'mint',
    title: { ko: '문장 만들기', en: 'Sentence Builder' },
    blurb: { ko: '단어로 문장 만들기', en: 'Put words together' },

    status(topicId) {
      const p = M.srs.sentencePreview(topicId);
      if (!p.unlocked) {
        const next = M.srs.nextLockedSentence(topicId);
        const missing = next ? M.srs.missingWords(next).length : 0;
        return { ready: false, ko: '단어를 더 배워요', en: `Learn ${missing || 'a few'} more word${missing === 1 ? '' : 's'} to unlock` };
      }
      if (p.due + p.fresh > 0) return { ready: true, ko: `복습 ${p.due} · 새 문장 ${p.fresh}`, en: `${p.due} to review · ${p.fresh} new` };
      return { ready: true, ko: '추가 연습', en: `${p.unlocked} sentences to practise` };
    },

    start(host) {
      const plan = M.srs.buildSentenceSession({ topicId: host.topicId });
      if (!plan.steps.length) {
        const next = M.srs.nextLockedSentence(host.topicId);
        const missing = next ? M.srs.missingWords(next).map((id) => M.content.word(id).ko) : [];
        host.empty({
          emoji: '🔒',
          ko: '아직 문장이 없어요',
          en: 'No sentences yet',
          text: missing.length
            ? `Sentences unlock once you know their words. Learn ${missing.join(', ')} in Word Cards to open the next one.`
            : 'Learn a few words in Word Cards first — sentences unlock once you know their words.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const steps = plan.steps.slice();
      const retried = new Set();
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, mistakes: new Set(), learned: [] };
      let index = 0;
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());
      next();

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        U.clear(host.stage);
        host.setProgress(index, steps.length);
        if (index >= steps.length) return finish();

        const sentence = M.content.sentence(steps[index].id);
        const stage = M.srs.stageOf(sentence.id);
        if (stage === 0) round.learned.push(sentence.id);
        cleanup = M.exercises.get('sentence').render({
          el: host.stage,
          item: sentence,
          stage,
          answer: (result) => onAnswer(sentence, result),
        });
      }

      function onAnswer(sentence, result) {
        M.srs.review(sentence.id, result.grade);
        M.progress.recordAnswer(result.correct);
        round.answers++;
        let earned = 0;
        if (result.correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = result.grade === 'good' ? points().sentence : points().sentenceWithHint;
          M.progress.bump('sentencesCorrect');
        } else {
          round.combo = 0;
          round.mistakes.add(sentence.id);
          if (!retried.has(sentence.id)) {
            retried.add(sentence.id);
            steps.splice(Math.min(index + 3, steps.length), 0, { kind: 'sentence', id: sentence.id, retry: true });
          }
        }
        host.award(earned);
        host.react(result, round.combo);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) setTimeout(() => M.speech.speak(sentence.ko, { quiet: true }), 250);

        host.showFeedback({
          tone: result.correct ? 'good' : 'bad',
          points: earned,
          content: M.ui.feedback.forSentence(sentence, result),
          speak: sentence.ko,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        host.finish({
          gameId: 'sentence-builder',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          sentencesLearned: round.learned,
          mistakes: [...round.mistakes],
          perfect: false,
        });
      }
    },
  });
})(window.Mallang);
