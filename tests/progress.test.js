const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang();
const { DAY } = M.config.time;
const P = M.progress;

test('levels need a little more each time', () => {
  assert.equal(P.levelInfo(0).level, 1);
  assert.equal(P.levelInfo(99).level, 1);
  assert.equal(P.levelInfo(100).level, 2);
  assert.equal(P.levelInfo(299).level, 2);
  assert.equal(P.levelInfo(300).level, 3);
  assert.equal(P.levelInfo(1000).level, 5);
  const info = P.levelInfo(200);
  assert.equal(info.toNext, 100);
  assert.equal(info.progress, 0.5);
});

test('the streak counts consecutive days with practice', () => {
  M.store.reset();
  P.addPoints(10, NOON);
  assert.equal(P.currentStreak(NOON), 1);
  P.addPoints(10, NOON + 1000); // same day
  assert.equal(P.currentStreak(NOON), 1);
  P.addPoints(10, NOON + DAY);
  assert.equal(P.currentStreak(NOON + DAY), 2);
  // Still alive the next day before practising…
  assert.equal(P.currentStreak(NOON + 2 * DAY), 2);
  // …but gone after a full missed day.
  assert.equal(P.currentStreak(NOON + 3 * DAY), 0);
  assert.equal(P.brokenStreak(NOON + 3 * DAY), 2);
  P.addPoints(10, NOON + 3 * DAY);
  assert.equal(P.currentStreak(NOON + 3 * DAY), 1);
  assert.equal(M.store.state.streak.best, 2);
});

test('events fire when the daily goal and a new level are reached', () => {
  M.store.reset();
  const seen = [];
  const offGoal = M.events.on('goal', () => seen.push('goal'));
  const offLevel = M.events.on('levelup', (level) => seen.push(`level ${level}`));
  P.addPoints(60, NOON);
  P.addPoints(50, NOON);
  P.addPoints(50, NOON);
  offGoal();
  offLevel();
  assert.deepEqual(seen, ['goal', 'level 2']);
  assert.equal(P.todayPoints(NOON), 160);
  assert.ok(P.goalMet(NOON));
});

test('recent activity lists the last days, oldest first', () => {
  M.store.reset();
  P.addPoints(120, NOON);
  const week = P.recentActivity(7, NOON);
  assert.equal(week.length, 7);
  assert.equal(week[6].today, true);
  assert.equal(week[6].points, 120);
  assert.equal(week[6].goalMet, true);
  assert.equal(week[5].practised, false);
});

test('badges are awarded once', () => {
  M.store.reset();
  assert.deepEqual(P.finishRound({}, NOON).map((b) => b.id), ['first-round']);
  assert.deepEqual(P.finishRound({ perfect: true }, NOON).map((b) => b.id), ['perfect']);
  assert.deepEqual(P.finishRound({ perfect: true }, NOON), []);
});
