/**
 * Tunable numbers in one place: review intervals, session sizes, points.
 * Change these to rebalance the game — nothing else needs to be touched.
 */
(function (M) {
  'use strict';

  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  M.config = {
    storageKey: 'mallang-korean/v1',
    time: { MINUTE, HOUR, DAY },

    /** Spaced repetition. Each word grows through stages; stage 0 = not learned yet. */
    srs: {
      // How long to wait before the next review once a word reaches a stage.
      intervals: [0, 10 * MINUTE, 1 * DAY, 3 * DAY, 7 * DAY, 16 * DAY],
      maxStage: 5,
      maxInterval: 180 * DAY,
      // "Ease" shrinks every time a word is missed, so tricky words come back sooner.
      startEase: 2.5,
      minEase: 1.3,
      maxEase: 2.8,
      fuzz: 0.1, // ±10% jitter so reviews don't all land at the same moment
      // Words below the chosen starting level are "assumed known" and checked a few per day.
      assumedChecksPerDay: 8,
    },

    session: {
      // maxNewWhenEmpty: a brand-new garden with nothing to review gets a bigger first handful.
      wordCards: { size: 12, maxNew: 3, maxNewWhenEmpty: 5, retryGap: 3, maxRetries: 2 },
      sentences: { size: 6, maxNew: 2 },
      // minWords is one more than pairsOnBoard, so a fresh word can always replace a matched one.
      speedMatch: { seconds: 60, pairsOnBoard: 5, minWords: 6 },
      newWordsPerDay: 15, // a gentle cap so reviews never pile up
    },

    points: {
      intro: 2, // meeting a new word
      choice: 10,
      listen: 10,
      tiles: 12,
      typing: 15,
      almost: 5,
      sentence: 15,
      sentenceWithHint: 8,
      match: 3,
      comboEvery: 5, // every 5 correct in a row…
      comboBonus: 5, // …earns a bonus
      perfectRound: 20,
    },

    dailyGoals: [
      { points: 50, ko: '가볍게', en: 'Casual', minutes: 5 },
      { points: 100, ko: '보통', en: 'Regular', minutes: 10 },
      { points: 200, ko: '열심히', en: 'Serious', minutes: 20 },
    ],
    defaultDailyGoal: 100,

    /** Starting levels offered at the beginning (and in Settings). */
    startLevels: [
      {
        level: 1,
        emoji: '🐣',
        ko: '처음이에요',
        en: 'Starting out',
        cefr: 'A1',
        desc: 'I can read Hangul and know a handful of words.',
      },
      {
        level: 2,
        emoji: '🐥',
        ko: '조금 알아요',
        en: 'I know a little',
        cefr: 'low A2',
        desc: 'I know basic words, greetings and a few simple sentences.',
      },
      {
        level: 3,
        emoji: '🐤',
        ko: '기초가 탄탄해요',
        en: 'Solid basics',
        cefr: 'A2',
        desc: 'I can order at a café and talk a little about my day.',
      },
    ],
  };
})(window.Mallang);
