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

  function dayRecord(now = U.now()) {
    const key = U.dayKey(now);
    return state().days[key] || (state().days[key] = { points: 0, answers: 0, correct: 0, rounds: 0 });
  }

  const todayPoints = (now = U.now()) => state().days[U.dayKey(now)]?.points || 0;
  const dailyGoal = () => state().settings.dailyGoal;
  const goalMet = (now = U.now()) => todayPoints(now) >= dailyGoal();

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
      return { key, points, practised: points > 0, goalMet: points >= dailyGoal(), today: key === U.dayKey(now) };
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
    markPractised(now);
    const earned = checkBadges(now);
    M.store.save();
    M.events.emit('progress', { amount: 0 });
    return earned;
  }

  /* ---------- Badges ---------- */

  const grownWords = (s) =>
    Object.entries(s.items).filter(([id, r]) => M.content.word(id) && r.stage >= 2 && !r.assumed).length;

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
    { id: 'perfect', emoji: '💯', ko: '완벽해요', en: 'Flawless', desc: 'Finish a Word Cards round without a mistake.',
      earned: (s) => s.totals.perfectRounds >= 1 },
    { id: 'typist', emoji: '⌨️', ko: '타자 요정', en: 'Typing fairy', desc: 'Type 10 correct answers on the Korean keyboard.',
      earned: (s) => s.totals.typedCorrect >= 10 },
    { id: 'sentence-chef', emoji: '🍳', ko: '문장 요리사', en: 'Sentence chef', desc: 'Build 10 sentences correctly.',
      earned: (s) => s.totals.sentencesCorrect >= 10 },
    { id: 'lightning', emoji: '⚡', ko: '번개 손', en: 'Lightning hands', desc: 'Make 15 matches in one Speed Match round.',
      earned: (s) => s.totals.bestMatch >= 15 },
    { id: 'bloom-again', emoji: '🌸', ko: '다시 피었어요', en: 'Bloom again', desc: 'Grow a word you once struggled with to 🌻.',
      earned: (s) => Object.values(s.items).some((r) => r.lapses >= 2 && r.stage >= 4) },
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
    levelInfo,
    currentStreak,
    practisedToday,
    brokenStreak,
    recentActivity,
    addPoints,
    recordAnswer,
    bump,
    best,
    finishRound,
    checkBadges,
  };
})(window.Mallang);
