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
