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
      // Grammar patterns have their own daily allowance; a new one gets its card and a few questions right away.
      grammarCards: { size: 10, newPerDay: 2, questionsNew: 3, questionsDue: 2, maxDueForNew: 4, minWords: 15 },
      // Two dialogues a round. With a single Korean voice, the low (male) speaker is pitched down a little to
      // tell the two apart; the high one keeps the natural pitch, because raising it makes voices (Google's
      // especially) hard to understand. With a male and a female voice, both speak at their natural pitch.
      dialogues: { perRound: 2, slowRate: 0.7, linePause: 350, pitch: { high: 1, low: 0.8 } },
      // Two short texts a round; the text stays on screen while you answer.
      reading: { perRound: 2 },
      // Eight questions a round, at most four new sentences; the card comes first on the very first round.
      speechLevels: { size: 8, newPerRound: 4 },
      // Five sentences a round, each heard and said three times, a little faster each time. `listenGap`: a
      // short pause after the voice before the 🎤 opens (so it doesn't hear the end of it).
      shadowing: { size: 5, rates: [0.75, 0.9, 1.05], minSentences: 3, listenGap: 200, great: 0.9, close: 0.7 },
      // Eight questions a round, at most four new items; the card comes first on the very first round.
      honorifics: { size: 8, newPerRound: 4 },
      // One story a round (it's long): 2–3 parts, with questions after each.
      stories: { perRound: 1 },
      // The words and sentences missed most in the last seven days, at most `size` of them.
      weeklyReview: { size: 12 },
      // Two conversations a round; you pick (or say) your replies.
      replies: { perRound: 2 },
      // Eight questions a round; a new rule (its card and four of its words) once the rules you've met are all seen.
      soundChanges: { size: 8, newPerRound: 4 },
      // TOPIK I practice: a short mock test, 10 questions a section, with the kinds of questions in the real test's
      // order (a list of types: one of them). Each listening item can be heard twice, as on the real test.
      topik: {
        blueprint: {
          listening: [['reply', 2], ['next', 1], ['place', 1], ['topic', 1], ['match', 2], ['idea', 1], ['set', 1]],
          reading: [['about', 1], ['blank', 2], ['notice', 1], ['match', 1], [['idea', 'order'], 1], ['set', 2]],
        },
        plays: 2,
        // The real test's pace (40 minutes for 30 listening questions, 60 for 40 reading ones): the suggested time.
        secondsPer: { listening: 80, reading: 90 },
        // A share of the points and the TOPIK I level it stands for: 140 of 200 is level 2, 80 of 200 level 1.
        levels: [{ level: 2, percent: 70 }, { level: 1, percent: 40 }],
        history: 30, // past results kept
      },
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
      grammar: 12,
      dialogue: 12,
      dialogueRead: 6, // answered after reading the script
      reading: 12,
      readingHelped: 6, // answered after showing the English
      rolePlay: 6, // a line said well in a role-play (once a day per line)
      speech: 12, // a Speech Levels question
      shadow: 4, // a sentence said back well, each time (checked by the 🎤)
      shadowSelf: 2, // …or said back and ticked off yourself (no speech recognition)
      honor: 12, // an Honorifics question
      story: 12, // a Stories question
      storyRead: 6, // answered after showing the script
      topik: 30, // a right answer in a TOPIK I practice test (each takes a minute or more)
      reply: 12, // a reply right the first time (Choose your reply)
      replyRetry: 4, // …or the second time
      pron: 10, // a Sound changes question
      dictation: 20,
      spoken: 3,
      comboEvery: 5, // every 5 correct in a row…
      comboBonus: 5, // …earns a bonus
      perfectRound: 20,
    },

    /**
     * Optional Azure Speech voices (Settings → Sound). Only your key is secret, and it's never here: you
     * paste it into Settings and it stays in your browser. Voice names and regions are the same for everyone.
     */
    azureSpeech: {
      // Azure's Korean neural voices. The chosen one reads everything; in dialogues, a female and a male voice.
      voices: [
        { name: 'ko-KR-SunHiNeural', label: '선히 SunHi', female: true },
        { name: 'ko-KR-InJoonNeural', label: '인준 InJoon', female: false },
        { name: 'ko-KR-HyunsuNeural', label: '현수 Hyunsu', female: false },
        { name: 'ko-KR-JiMinNeural', label: '지민 JiMin', female: true },
        { name: 'ko-KR-YuJinNeural', label: '유진 YuJin', female: true },
        { name: 'ko-KR-SeoHyeonNeural', label: '서현 SeoHyeon', female: true },
        { name: 'ko-KR-SoonBokNeural', label: '순복 SoonBok', female: true },
        { name: 'ko-KR-BongJinNeural', label: '봉진 BongJin', female: false },
        { name: 'ko-KR-GookMinNeural', label: '국민 GookMin', female: false },
        // Azure's HD voice: it needs the paid (S0) tier and a region with HD voices (westeurope, francecentral,
        // swedencentral, eastus, eastus2, westus2, canadacentral, centralindia, southeastasia).
        { name: 'ko-KR-SunHi:DragonHDLatestNeural', label: '선히 SunHi Dragon HD (paid)', female: true },
      ],
      female: 'ko-KR-SunHiNeural', // the default voice, and the women's voice in dialogues when a man's voice is chosen
      male: 'ko-KR-InJoonNeural', // the men's voice in dialogues when a woman's voice is chosen
      format: 'audio-24khz-48kbitrate-mono-mp3',
      // Suggestions for the region field (the "Location/Region" on the resource's Keys and Endpoint page).
      regions: [
        'koreacentral', 'japaneast', 'japanwest', 'eastasia', 'southeastasia', 'australiaeast', 'centralindia',
        'eastus', 'eastus2', 'westus', 'westus2', 'westus3', 'centralus', 'southcentralus', 'canadacentral',
        'brazilsouth', 'westeurope', 'northeurope', 'uksouth', 'francecentral', 'germanywestcentral',
        'swedencentral', 'switzerlandnorth', 'norwayeast', 'italynorth',
      ],
      timeout: 5000, // ms to wait for Azure before the browser's voice speaks instead
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
