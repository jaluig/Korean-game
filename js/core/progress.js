/**
 * Motivation: points, levels, the daily goal, streaks and badges.
 *
 * - Points (⭐) come from correct answers; they fill the daily goal and raise your level.
 * - The streak (🔥) counts days in a row with any practice at all.
 * - Badges reward habits that genuinely help learning (streaks, typing, sentences…).
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const state = () => M.store.state;

  const dailyGoal = () => state().settings.dailyGoal;

  /** Today's record. It remembers the day's goal, so changing the goal later doesn't rewrite history. */
  function dayRecord(now = U.now()) {
    const key = U.dayKey(now);
    const day = state().days[key] || (state().days[key] = { points: 0, answers: 0, correct: 0, rounds: 0 });
    day.goal = dailyGoal();
    return day;
  }

  const todayPoints = (now = U.now()) => state().days[U.dayKey(now)]?.points || 0;
  const goalMet = (now = U.now()) => todayPoints(now) >= dailyGoal();
  /** Roughly how many minutes of practice a goal takes. */
  function goalMinutes(points = dailyGoal()) {
    const preset = M.config.dailyGoals.find((g) => g.points === points);
    return preset ? preset.minutes : Math.max(1, Math.round(points / M.config.pointsPerMinute));
  }

  /** The goal that counted on a given day (today: the current one). */
  const goalOn = (key, now = U.now()) => (key === U.dayKey(now) ? dailyGoal() : state().days[key]?.goal ?? dailyGoal());

  /* ---------- Levels: Lv 2 at 100 points, and each level needs 100 more than the last ---------- */

  const levelStart = (level) => 50 * level * (level - 1);

  function levelInfo(points = state().totals.points) {
    let level = 1;
    while (points >= levelStart(level + 1)) level++;
    const start = levelStart(level);
    const end = levelStart(level + 1);
    return { level, points, start, end, progress: (points - start) / (end - start), toNext: end - points };
  }

  /* ---------- Streak: consecutive days with any practice ---------- */

  function markPractised(now = U.now()) {
    const s = state().streak;
    const today = U.dayKey(now);
    if (s.lastDay === today) return false;
    s.current = s.lastDay === U.addDays(today, -1) ? s.current + 1 : 1;
    s.lastDay = today;
    s.best = Math.max(s.best, s.current);
    return true;
  }

  /** The streak as it stands right now (0 once a whole day was missed). */
  function currentStreak(now = U.now()) {
    const s = state().streak;
    const today = U.dayKey(now);
    return s.lastDay === today || s.lastDay === U.addDays(today, -1) ? s.current : 0;
  }

  const practisedToday = (now = U.now()) => state().streak.lastDay === U.dayKey(now);

  /** A streak that ended since the last visit (for a gentle "let's start again"). */
  function brokenStreak(now = U.now()) {
    const s = state().streak;
    return s.current > 1 && currentStreak(now) === 0 ? s.current : 0;
  }

  /** The last n days: points earned and whether the goal was met. */
  function recentActivity(n = 7, now = U.now()) {
    return U.recentDays(n, now).map((key) => {
      const d = state().days[key];
      const points = d?.points || 0;
      const goal = goalOn(key, now);
      return { key, points, goal, practised: points > 0, goalMet: points >= goal, today: key === U.dayKey(now) };
    });
  }

  /* ---------- Recording activity ---------- */

  function addPoints(amount, now = U.now()) {
    if (!(amount > 0)) return;
    const goal = dailyGoal();
    const before = todayPoints(now);
    const levelBefore = levelInfo().level;

    state().totals.points += amount;
    dayRecord(now).points += amount;
    const streakGrew = markPractised(now);

    M.events.emit('progress', { amount });
    if (streakGrew) M.events.emit('streak', currentStreak(now));
    if (before < goal && before + amount >= goal) M.events.emit('goal', goal);
    const levelAfter = levelInfo().level;
    if (levelAfter > levelBefore) M.events.emit('levelup', levelAfter);
  }

  function recordAnswer(correct, now = U.now()) {
    const totals = state().totals;
    const day = dayRecord(now);
    totals.answers++;
    day.answers++;
    if (correct) {
      totals.correct++;
      day.correct++;
    }
  }

  /** Increase a lifetime counter, e.g. bump('typedCorrect'). */
  function bump(counter, by = 1) {
    state().totals[counter] = (state().totals[counter] || 0) + by;
  }

  /** Points for saying something well with 🎤: once per word or sentence per day. */
  function rewardSpeech(text, now = U.now()) {
    const day = dayRecord(now);
    day.spoken = day.spoken || [];
    if (day.spoken.includes(text)) return false;
    day.spoken.push(text);
    bump('spokenGood');
    addPoints(M.config.points.spoken, now);
    return true;
  }

  /** Accuracy per skill (a verb form, a particle, a kind of number task…). */
  function skill(id, correct) {
    const skills = state().skills || (state().skills = {});
    const s = skills[id] || (skills[id] = { seen: 0, correct: 0 });
    s.seen++;
    if (correct) s.correct++;
  }

  /** How likely a skill should come up: weak or new skills more often (1–3). */
  function skillWeight(id) {
    const s = (state().skills || {})[id];
    if (!s || s.seen < 3) return 2;
    return 1 + 2 * (1 - s.correct / s.seen);
  }

  /** Keep the best value of a lifetime counter, e.g. best('bestMatch', 17). */
  function best(counter, value) {
    state().totals[counter] = Math.max(state().totals[counter] || 0, value);
  }

  /** Called when a round of any game ends. Returns the badges newly earned. */
  function finishRound(result, now = U.now()) {
    const totals = state().totals;
    totals.rounds++;
    dayRecord(now).rounds++;
    if (result.perfect) totals.perfectRounds++;
    if (result.gameId) {
      totals.gamesPlayed = totals.gamesPlayed || {};
      totals.gamesPlayed[result.gameId] = (totals.gamesPlayed[result.gameId] || 0) + 1;
    }
    const hour = new Date(now).getHours();
    if (hour >= 22 || hour < 4) bump('nightRounds');
    if (hour >= 5 && hour < 8) bump('earlyRounds');
    markPractised(now);
    const earned = checkBadges(now);
    M.store.save();
    M.events.emit('progress', { amount: 0 });
    return earned;
  }

  /* ---------- Badges ---------- */

  const grownWords = (s) =>
    Object.entries(s.items).filter(([id, r]) => M.content.word(id) && r.stage >= 2 && !r.assumed).length;
  const goalDays = (s) => Object.values(s.days).filter((d) => d.points > 0 && d.points >= (d.goal ?? s.settings.dailyGoal)).length;
  const count = (s, key) => s.totals[key] || 0;
  const everyTopicStarted = (s) => {
    const topics = M.content.topics();
    return topics.length > 0 && topics.every((t) => t.wordIds.some((id) => s.items[id] && s.items[id].stage >= 1 && !s.items[id].assumed));
  };
  const everyGamePlayed = (s) => {
    const games = M.games.list();
    return games.length > 0 && games.every((g) => (s.totals.gamesPlayed || {})[g.id]);
  };

  const BADGES = [
    { id: 'first-round', emoji: '👣', ko: '첫걸음', en: 'First steps', desc: 'Finish your first round.',
      earned: (s) => s.totals.rounds >= 1 },
    { id: 'words-10', emoji: '🌿', ko: '작은 정원', en: 'Little garden', desc: 'Grow 10 words to 🌿 or beyond.',
      earned: (s) => grownWords(s) >= 10 },
    { id: 'words-30', emoji: '🏡', ko: '푸른 정원', en: 'Green thumb', desc: 'Grow 30 words to 🌿 or beyond.',
      earned: (s) => grownWords(s) >= 30 },
    { id: 'streak-3', emoji: '🔥', ko: '3일 연속', en: 'On a roll', desc: 'Practise 3 days in a row.',
      earned: (s) => s.streak.best >= 3 },
    { id: 'streak-7', emoji: '🗓️', ko: '일주일 연속', en: 'Week warrior', desc: 'Practise 7 days in a row.',
      earned: (s) => s.streak.best >= 7 },
    { id: 'perfect', emoji: '💯', ko: '만점', en: 'Flawless', desc: 'Finish a Word Cards round without a mistake.',
      earned: (s) => s.totals.perfectRounds >= 1 },
    { id: 'typist', emoji: '⌨️', ko: '타자 요정', en: 'Typing fairy', desc: 'Type 10 correct answers on the Korean keyboard.',
      earned: (s) => s.totals.typedCorrect >= 10 },
    { id: 'sentence-chef', emoji: '🍳', ko: '문장 요리사', en: 'Sentence chef', desc: 'Build 10 sentences correctly.',
      earned: (s) => s.totals.sentencesCorrect >= 10 },
    { id: 'lightning', emoji: '⚡', ko: '번개 손', en: 'Lightning hands', desc: 'Make 15 matches in one Speed Match round.',
      earned: (s) => s.totals.bestMatch >= 15 },
    { id: 'bloom-again', emoji: '🌸', ko: '다시 피었어요', en: 'Bloom again', desc: 'Grow a word you once struggled with to 🌻.',
      earned: (s) => Object.values(s.items).some((r) => r.lapses >= 2 && r.stage >= 4) },
    { id: 'first-tree', emoji: '🌲', ko: '첫 나무', en: 'First tree', desc: 'Grow a word all the way to 🌳.',
      earned: (s) => Object.entries(s.items).some(([id, r]) => M.content.word(id) && r.stage >= 5 && !r.assumed) },
    { id: 'words-60', emoji: '🌳', ko: '작은 숲', en: 'Little forest', desc: 'Grow 60 words to 🌿 or beyond.',
      earned: (s) => grownWords(s) >= 60 },
    { id: 'words-120', emoji: '🏞️', ko: '큰 숲', en: 'Big forest', desc: 'Grow 120 words to 🌿 or beyond.',
      earned: (s) => grownWords(s) >= 120 },
    { id: 'explorer', emoji: '🗺️', ko: '탐험가', en: 'Explorer', desc: 'Learn at least one word in every topic.',
      earned: everyTopicStarted },
    { id: 'streak-14', emoji: '🌟', ko: '2주 연속', en: 'Two weeks strong', desc: 'Practise 14 days in a row.',
      earned: (s) => s.streak.best >= 14 },
    { id: 'streak-30', emoji: '🏆', ko: '한 달 연속', en: 'A month of Korean', desc: 'Practise 30 days in a row.',
      earned: (s) => s.streak.best >= 30 },
    { id: 'goal-5', emoji: '🎯', ko: '목표 달성', en: 'Goal getter', desc: 'Reach your daily goal on 5 days.',
      earned: (s) => goalDays(s) >= 5 },
    { id: 'goal-20', emoji: '🥇', ko: '목표 장인', en: 'Goal master', desc: 'Reach your daily goal on 20 days.',
      earned: (s) => goalDays(s) >= 20 },
    { id: 'combo-20', emoji: '☄️', ko: '불꽃 콤보', en: 'On fire', desc: 'Get 20 answers right in a row.',
      earned: (s) => count(s, 'bestCombo') >= 20 },
    { id: 'balloons-30', emoji: '🎈', ko: '풍선 사냥꾼', en: 'Balloon hunter', desc: 'Pop 30 balloons in one round of Balloon Pop.',
      earned: (s) => count(s, 'bestBalloon') >= 30 },
    { id: 'sky-cleared', emoji: '🌈', ko: '맑은 하늘', en: 'Clear skies', desc: 'Clear all the waves in Balloon Pop.',
      earned: (s) => count(s, 'skyCleared') >= 1 },
    { id: 'particles-30', emoji: '🧪', ko: '조사 박사', en: 'Particle pro', desc: 'Choose 30 particles correctly in Particle Lab.',
      earned: (s) => count(s, 'particlesCorrect') >= 30 },
    { id: 'verbs-30', emoji: '🪄', ko: '동사 마법사', en: 'Verb wizard', desc: 'Cast 30 verb spells correctly in Verb Magic.',
      earned: (s) => count(s, 'verbsCorrect') >= 30 },
    { id: 'numbers-30', emoji: '🏪', ko: '숫자 박사', en: 'Number whiz', desc: 'Serve 30 customers correctly in Number Shop.',
      earned: (s) => count(s, 'numbersCorrect') >= 30 },
    { id: 'ears-30', emoji: '👂', ko: '황금 귀', en: 'Golden ears', desc: 'Hear 30 sound twins correctly.',
      earned: (s) => count(s, 'soundsCorrect') >= 30 },
    { id: 'scribe', emoji: '✍️', ko: '받아쓰기 왕', en: 'Dictation star', desc: 'Write 5 sentences perfectly from dictation.',
      earned: (s) => count(s, 'dictationsCorrect') >= 5 },
    { id: 'brave-voice', emoji: '🎤', ko: '용감한 목소리', en: 'Brave voice', desc: 'Say 10 words or sentences well with 🎤.',
      earned: (s) => count(s, 'spokenGood') >= 10 },
    { id: 'all-games', emoji: '🎮', ko: '게임 탐험가', en: 'Game explorer', desc: 'Play every minigame at least once.',
      earned: everyGamePlayed },
    { id: 'night-owl', emoji: '🦉', ko: '올빼미', en: 'Night owl', desc: 'Finish a round after 10 p.m.',
      earned: (s) => count(s, 'nightRounds') >= 1 },
    { id: 'early-bird', emoji: '🐤', ko: '아침형 인간', en: 'Early bird', desc: 'Finish a round before 8 a.m.',
      earned: (s) => count(s, 'earlyRounds') >= 1 },
    { id: 'level-5', emoji: '⭐', ko: '레벨 5', en: 'Rising star', desc: 'Reach level 5.',
      earned: (s) => levelInfo(s.totals.points).level >= 5 },
    { id: 'level-10', emoji: '💫', ko: '레벨 10', en: 'Superstar', desc: 'Reach level 10.',
      earned: (s) => levelInfo(s.totals.points).level >= 10 },
  ];

  function checkBadges(now = U.now()) {
    const s = state();
    const earned = [];
    for (const badge of BADGES) {
      if (!s.badges[badge.id] && badge.earned(s)) {
        s.badges[badge.id] = now;
        earned.push(badge);
      }
    }
    return earned;
  }

  M.progress = {
    BADGES,
    todayPoints,
    dailyGoal,
    goalMet,
    goalOn,
    goalMinutes,
    levelInfo,
    currentStreak,
    practisedToday,
    brokenStreak,
    recentActivity,
    addPoints,
    recordAnswer,
    bump,
    best,
    skill,
    skillWeight,
    rewardSpeech,
    finishRound,
    checkBadges,
  };
})(window.Mallang);
