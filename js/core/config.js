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
      // Balloons cross the sky in `travel` ms at first; every wave (`popsPerWave` pops) is faster.
      balloonPop: {
        lives: 3, minWords: 6, popsPerWave: 5, waves: 10, speedUp: 0.88,
        travel: 16000, minTravel: 5500, spawn: 3600, minSpawn: 1200, onScreen: 3, maxOnScreen: 6,
      },
      particleLab: { size: 10, minQuestions: 3 },
      verbMagic: { size: 10, minVerbs: 4, typeFromStage: 4, harderFormsAfter: 12 },
      numberShop: { size: 8 },
      soundTwins: { size: 10 },
      // A well-known sentence is sometimes written from dictation instead of built from tiles.
      dictation: { fromStage: 4, chance: 0.35 },
      newWordsPerDay: 20, // default cap (adjustable in Settings) so reviews never pile up
      newWordsChoices: [10, 15, 20, 30],
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
      balloon: 4,
      balloonReverse: 6,
      particle: 10,
      verb: 12,
      verbTyped: 18,
      number: 10,
      register: 12,
      sound: 8,
      dictation: 20,
      spoken: 3,
      comboEvery: 5, // every 5 correct in a row…
      comboBonus: 5, // …earns a bonus
      perfectRound: 20,
    },

    // Daily goal presets. A focused minute of practice earns roughly 40 ⭐.
    dailyGoals: [
      { points: 250, ko: '가볍게', en: 'Casual', minutes: 6 },
      { points: 500, ko: '보통', en: 'Regular', minutes: 12 },
      { points: 800, ko: '열심히', en: 'Serious', minutes: 20 },
      { points: 1200, ko: '도전', en: 'Challenge', minutes: 30 },
    ],
    defaultDailyGoal: 500,
    customGoal: { min: 100, max: 3000, step: 50 },
    pointsPerMinute: 40,

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
