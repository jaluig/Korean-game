const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang();
const key = M.config.storageKey;

test('progress survives a save and reload', () => {
  M.store.reset();
  M.store.state.totals.points = 42;
  M.store.state.items['cafe:water'] = { ...M.srs.blank(), stage: 3 };
  M.store.save();
  M.store.state = null;
  M.store.load();
  assert.equal(M.store.state.totals.points, 42);
  assert.equal(M.store.state.items['cafe:water'].stage, 3);
});

test('new settings get defaults when loading an older save', () => {
  localStorage.setItem(key, JSON.stringify({ version: 1, settings: { sfx: false }, items: {} }));
  M.store.load();
  assert.equal(M.store.state.settings.sfx, false);
  assert.equal(M.store.state.settings.dailyGoal, M.config.defaultDailyGoal);
  assert.equal(M.store.state.totals.points, 0);
});

test('a damaged save is set aside instead of crashing', () => {
  localStorage.setItem(key, '{not json');
  M.store.load();
  assert.equal(M.store.recovered, true);
  assert.equal(M.store.state.totals.points, 0);
  assert.ok(localStorage.keys().some((k) => k.startsWith(`${key}/damaged-`)));
});

test('export and import round-trip; other files are rejected', () => {
  M.store.reset();
  M.store.state.totals.points = 7;
  const backup = M.store.exportJson();
  M.store.reset();
  M.store.importJson(backup);
  assert.equal(M.store.state.totals.points, 7);
  assert.equal(M.store.state.app, undefined);
  assert.throws(() => M.store.importJson('{"hello": 1}'), /not a Mallang Korean backup/);
  assert.throws(() => M.store.importJson('nope'));
});

test('version 1 saves get the raised daily goals, and old days keep their goal', () => {
  const cases = [[50, 250], [100, 500], [200, 800], [150, 150]];
  for (const [before, after] of cases) {
    localStorage.setItem(key, JSON.stringify({ version: 1, settings: { dailyGoal: before }, items: {}, days: { '2026-09-20': { points: 120 } } }));
    M.store.load();
    assert.equal(M.store.state.settings.dailyGoal, after, `${before} → ${after}`);
    assert.equal(M.store.state.days['2026-09-20'].goal, before);
    assert.equal(M.store.state.version, M.store.defaultState().version);
  }
});

test('new settings have defaults', () => {
  M.store.reset();
  assert.equal(M.store.state.settings.theme, 'light');
  assert.equal(M.store.state.settings.dailyGoal, M.config.defaultDailyGoal);
});

test('version 2 saves keep their streak; only today, if it counted without the goal, waits for the goal', () => {
  const U = M.utils;
  const today = U.dayKey();
  const yesterday = U.addDays(today, -1);
  const save = (points, lastDay = today) =>
    localStorage.setItem(key, JSON.stringify({ version: 2, settings: { dailyGoal: 500 }, items: {}, streak: { current: 6, best: 9, lastDay }, days: { [today]: { points, goal: 500 } } }));
  // Practised today below the goal: today no longer counts, the five days before it do.
  save(120);
  M.store.load();
  assert.deepEqual(M.store.state.streak, { current: 5, best: 9, lastDay: yesterday });
  assert.equal(M.progress.currentStreak(), 5);
  // Reaching the goal today brings it back to six.
  M.progress.addPoints(380);
  assert.equal(M.progress.currentStreak(), 6);
  // The goal already reached today, or no practice yet today: nothing changes.
  save(600);
  M.store.load();
  assert.deepEqual(M.store.state.streak, { current: 6, best: 9, lastDay: today });
  save(0, yesterday);
  M.store.load();
  assert.deepEqual(M.store.state.streak, { current: 6, best: 9, lastDay: yesterday });
  assert.equal(M.store.state.version, 3);
});

test('the streak check uses the goal the day was played with (a version 1 save’s old goal, a goal raised later)', () => {
  const U = M.utils;
  const today = U.dayKey();
  // Version 1: today met the old goal of 100 (raised to 500 on loading), so today stays counted.
  localStorage.setItem(key, JSON.stringify({ version: 1, settings: { dailyGoal: 100 }, items: {}, streak: { current: 3, best: 3, lastDay: today }, days: { [today]: { points: 120 } } }));
  M.store.load();
  assert.equal(M.store.state.settings.dailyGoal, 500);
  assert.deepEqual(M.store.state.streak, { current: 3, best: 3, lastDay: today });
  // Version 2: today's goal of 250 was reached, then the goal was raised to 800.
  localStorage.setItem(key, JSON.stringify({ version: 2, settings: { dailyGoal: 800 }, items: {}, streak: { current: 3, best: 3, lastDay: today }, days: { [today]: { points: 300, goal: 250 } } }));
  M.store.load();
  assert.deepEqual(M.store.state.streak, { current: 3, best: 3, lastDay: today });
});
