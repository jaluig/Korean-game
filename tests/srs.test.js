const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang();
const { MINUTE, DAY } = M.config.time;
const srs = M.srs;

function fresh() {
  M.store.reset();
  M.utils.random = () => 0.5; // no jitter
}

test('a new word is introduced, then grows with correct answers', () => {
  fresh();
  const id = 'cafe:water';
  assert.equal(srs.stageOf(id), 0);
  srs.introduce(id, NOON);
  assert.equal(srs.stageOf(id), 1);
  assert.equal(srs.peek(id).due, NOON + 10 * MINUTE);

  // The in-session quiz right after the introduction graduates it.
  srs.review(id, 'good', NOON + MINUTE);
  assert.equal(srs.stageOf(id), 2);
  assert.equal(srs.peek(id).due, NOON + MINUTE + DAY);

  srs.review(id, 'good', NOON + 2 * DAY);
  assert.equal(srs.stageOf(id), 3);
});

test('a wrong answer drops two stages, flags the word and makes it due now', () => {
  fresh();
  const id = 'cafe:coffee';
  Object.assign(srs.record(id), { stage: 4, interval: 7 * DAY, due: NOON });
  srs.review(id, 'again', NOON);
  const r = srs.peek(id);
  assert.equal(r.stage, 2);
  assert.equal(r.due, NOON);
  assert.equal(r.flag, true);
  assert.equal(r.lapses, 1);
  assert.ok(r.ease < M.config.srs.startEase, 'ease drops so it comes back sooner');
  assert.ok(srs.isTricky(id));

  // Two correct answers in a row clear the "tricky" flag.
  srs.review(id, 'good', NOON + MINUTE);
  assert.ok(srs.isTricky(id));
  srs.review(id, 'good', NOON + 10 * DAY);
  assert.ok(!srs.isTricky(id));
});

test('missed words get shorter intervals than easy ones', () => {
  fresh();
  const easy = srs.record('cafe:milk');
  const hard = srs.record('cafe:bread');
  Object.assign(easy, { stage: 2, interval: DAY, due: NOON });
  Object.assign(hard, { stage: 2, interval: DAY, due: NOON, ease: 1.5 });
  srs.review('cafe:milk', 'good', NOON);
  srs.review('cafe:bread', 'good', NOON);
  assert.ok(hard.interval < easy.interval);
});

test('reviewing long before it is due does not grow a word', () => {
  fresh();
  const id = 'cafe:tea';
  Object.assign(srs.record(id), { stage: 3, interval: 3 * DAY, due: NOON + 3 * DAY });
  srs.review(id, 'good', NOON + MINUTE);
  assert.equal(srs.stageOf(id), 3);
  assert.equal(srs.peek(id).correct, 1);
});

test('"hard" keeps the stage and shortens the wait', () => {
  fresh();
  const id = 'cafe:tea';
  Object.assign(srs.record(id), { stage: 3, interval: 3 * DAY, due: NOON });
  srs.review(id, 'hard', NOON);
  const r = srs.peek(id);
  assert.equal(r.stage, 3);
  assert.ok(r.due - NOON < 3 * DAY);
});

test('Speed Match misses mark words tricky and due, but never grow them', () => {
  fresh();
  const id = 'day:go';
  assert.equal(srs.practice(id, false, NOON), null, 'unknown words are ignored');
  Object.assign(srs.record(id), { stage: 3, interval: 3 * DAY, due: NOON + 2 * DAY });
  srs.practice(id, true, NOON);
  assert.equal(srs.stageOf(id), 3);
  srs.practice(id, false, NOON);
  assert.ok(srs.isTricky(id));
  assert.ok(srs.isDue(id, NOON));
});

test('starting level assumes easier words are known and spreads their checks over days', () => {
  fresh();
  srs.review('day:home', 'again', NOON); // practised before: must be kept as is
  srs.applyStartLevel(2, NOON);

  const level1 = M.content.words().filter((w) => w.level === 1);
  const level2 = M.content.words().filter((w) => w.level === 2);
  for (const w of level1) {
    if (w.id === 'day:home') continue;
    const r = srs.peek(w.id);
    assert.equal(r.stage, 2, w.id);
    assert.equal(r.assumed, true);
  }
  assert.equal(srs.peek('day:home').assumed, false);
  for (const w of level2) assert.equal(srs.peek(w.id), null);

  const dueToday = level1.filter((w) => srs.isDue(w.id, NOON + MINUTE)).length;
  assert.equal(dueToday, M.config.srs.assumedChecksPerDay + 1); // + the practised word

  // Checking assumed words doesn't use up today's allowance of new words.
  const newBefore = srs.newToday(NOON + MINUTE);
  level1.slice(0, 5).forEach((w) => srs.review(w.id, 'good', NOON + MINUTE));
  assert.equal(srs.newToday(NOON + MINUTE), newBefore);

  // Lowering the level again forgets assumptions, but not real practice.
  srs.applyStartLevel(1, NOON);
  const untouched = level1.slice(5).find((w) => w.id !== 'day:home');
  assert.equal(srs.peek(untouched.id), null);
  assert.notEqual(srs.peek(level1[0].id), null, 'a checked word keeps its progress');
  assert.notEqual(srs.peek('day:home'), null);
});

test('words added after onboarding below your level become quick checks, queued after the waiting ones', () => {
  fresh();
  M.store.state.profile.startLevel = 2;
  const level1 = M.content.words().filter((w) => w.level === 1);
  assert.equal(srs.syncStartLevel(NOON), level1.length);
  for (const w of level1) assert.equal(srs.peek(w.id).assumed, true, w.id);
  assert.equal(srs.syncStartLevel(NOON), 0, 'nothing twice');
  // A word practised for real is never touched.
  delete M.store.state.items[level1[0].id];
  srs.introduce(level1[0].id, NOON);
  delete M.store.state.items[level1[1].id];
  assert.equal(srs.syncStartLevel(NOON), 1);
  assert.equal(srs.peek(level1[0].id).assumed, false);
  const lastDue = Math.max(...level1.slice(2).map((w) => srs.peek(w.id).due));
  assert.ok(srs.peek(level1[1].id).due >= lastDue - DAY, 'the new check goes to the back of the queue');
});

test('the first round introduces a handful of words, each quizzed after its intro', () => {
  fresh();
  const { steps, freshIds } = srs.buildWordSession({ now: NOON });
  assert.equal(freshIds.length, M.config.session.wordCards.maxNewWhenEmpty);
  assert.equal(steps.length, freshIds.length * 2);
  for (const id of freshIds) {
    const intro = steps.findIndex((s) => s.kind === 'intro' && s.id === id);
    const quiz = steps.findIndex((s) => s.kind === 'quiz' && s.id === id);
    assert.ok(intro >= 0 && quiz > intro + 1, `${id} is quizzed after something else`);
  }
  // Curriculum order: level 1 first, one topic at a time.
  assert.ok(freshIds.every((id) => M.content.word(id).level === 1));
  assert.deepEqual([...new Set(freshIds.map((id) => id.split(':')[0]))], ['cafe']);
});

test('lots of due reviews squeeze out new words', () => {
  fresh();
  const words = M.content.words().slice(0, 14);
  words.forEach((w) => Object.assign(srs.record(w.id), { stage: 2, interval: DAY, due: NOON - DAY }));
  const { steps, freshIds, dueCount } = srs.buildWordSession({ now: NOON });
  assert.equal(freshIds.length, 1);
  assert.equal(dueCount, M.config.session.wordCards.size - 2);
  assert.equal(steps.length, M.config.session.wordCards.size);
  const ids = steps.map((s) => `${s.kind}:${s.id}`);
  assert.equal(new Set(ids).size, ids.length, 'no step repeats');
});

test('tricky words come first in a review round', () => {
  fresh();
  const words = M.content.words().slice(0, 6);
  words.forEach((w) => Object.assign(srs.record(w.id), { stage: 3, interval: 3 * DAY, due: NOON - DAY }));
  srs.record(words[5].id).flag = true;
  const { steps } = srs.buildWordSession({ now: NOON });
  assert.equal(steps[0].id, words[5].id);
});

test('the daily cap on new words is respected', () => {
  fresh();
  const words = M.content.words();
  words.slice(0, M.config.session.newWordsPerDay).forEach((w) => srs.introduce(w.id, NOON));
  assert.equal(srs.newToday(NOON), M.config.session.newWordsPerDay);
  const { freshIds } = srs.buildWordSession({ now: NOON + MINUTE });
  assert.equal(freshIds.length, 0);
  // …and resets the next day.
  assert.ok(srs.wordPreview('all', NOON + DAY).fresh > 0);
});

test('sentences unlock once their words are learned', () => {
  fresh();
  const s = M.content.sentence('cafe:s-water');
  assert.equal(srs.isUnlocked(s), false);
  assert.deepEqual(srs.missingWords(s), ['cafe:water', 'cafe:please']);
  assert.equal(srs.buildSentenceSession({ now: NOON }).steps.length, 0);

  srs.introduce('cafe:water', NOON);
  srs.introduce('cafe:please', NOON);
  assert.equal(srs.isUnlocked(s), true);
  const { steps } = srs.buildSentenceSession({ now: NOON });
  assert.deepEqual(steps.map((x) => x.id), ['cafe:s-water']);
});

test('Speed Match only uses learned words, urgent ones first', () => {
  fresh();
  assert.equal(srs.matchPool('all', NOON).length, 0);
  ['cafe:water', 'cafe:coffee', 'cafe:tea'].forEach((id) => {
    srs.introduce(id, NOON);
    srs.review(id, 'good', NOON);
  });
  srs.practice('cafe:tea', false, NOON);
  const pool = srs.matchPool('all', NOON + MINUTE);
  assert.equal(pool.length, 3);
  assert.equal(pool[0].id, 'cafe:tea');
});

test('summary counts stages and growth', () => {
  fresh();
  srs.introduce('cafe:water', NOON);
  const s = srs.summary('cafe', NOON);
  assert.equal(s.total, M.content.words('cafe').length);
  assert.equal(s.byStage[1], 1);
  assert.equal(s.started, 1);
  assert.ok(s.growth > 0 && s.growth < 0.05);
});
