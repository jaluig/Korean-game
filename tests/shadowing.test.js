const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;
const S = M.shadowing;
const size = () => M.config.session.shadowing.size;

function learnTopics(...topics) {
  M.store.reset();
  M.utils.random = Math.random;
  for (const t of topics) for (const w of M.content.words(t)) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('Shadowing uses sentences whose words you know, the focus topic’s first', () => {
  M.store.reset();
  assert.equal(S.pool().length, 0, 'nothing before any words are learned');
  learnTopics('cafe', 'day');
  const pool = S.pool();
  assert.ok(pool.length >= size());
  for (const s of pool) assert.ok(s.needs.every(M.srs.isIntroduced), `${s.id}: its words are known`);
  const round = S.pickRound('day');
  assert.equal(round.length, size());
  assert.ok(round.every((s) => s.topicId === 'day'), 'the focus topic first');
  assert.equal(new Set(round.map((s) => s.id)).size, round.length, 'five different sentences');
});

test('the sentences you have built come first', () => {
  learnTopics('cafe', 'day');
  const built = S.pool().filter((s) => s.topicId === 'day').slice(0, 3);
  for (const s of built) M.srs.introduce(s.id, NOON - DAY);
  for (let i = 0; i < 10; i++) {
    const ids = S.pickRound('all').map((s) => s.id);
    for (const s of built) assert.ok(ids.slice(0, built.length).includes(s.id), `${s.id} comes first`);
  }
});

test('each try is judged like the 🎤 buttons, and every pass is a little faster', () => {
  assert.equal(S.tone(0.95), 'great');
  assert.equal(S.tone(0.75), 'close');
  assert.equal(S.tone(0.5), 'miss');
  const { rates } = M.config.session.shadowing;
  assert.equal(rates.length, 3);
  rates.forEach((r, i) => i && assert.ok(r > rates[i - 1], 'faster each time'));
});

test('the Shadowing badge counts the sentences said back well', () => {
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'shadow-30');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('shadowGood', 30);
  assert.equal(badge.earned(M.store.state), true);
});
