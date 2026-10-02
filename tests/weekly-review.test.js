const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;
const W = M.weeklyReview;

function learn(ids, now = NOON - 3 * DAY) {
  for (const id of ids) M.srs.introduce(id, now);
}

test('wrong answers and quick-game slips are remembered day by day, for two weeks', () => {
  M.store.reset();
  const [a, b] = M.content.words('cafe');
  learn([a.id, b.id]);
  M.srs.review(a.id, 'again', NOON);
  M.srs.review(a.id, 'again', NOON + 1000);
  M.srs.review(b.id, 'good', NOON);
  M.srs.practice(b.id, false, NOON - DAY);
  M.srs.review(b.id, 'hard', NOON);
  const week = M.srs.misses(7, NOON);
  assert.equal(week.get(a.id), 2);
  assert.equal(week.get(b.id), 1, 'a slip in a quick game counts; "almost" and right answers don’t');
  assert.equal(M.srs.misses(1, NOON).get(b.id), undefined, 'yesterday’s slip is not today’s');
  // A miss three weeks later: the old days are forgotten.
  M.srs.review(a.id, 'again', NOON + 21 * DAY);
  assert.deepEqual(Object.keys(M.store.state.misses), [M.utils.dayKey(NOON + 21 * DAY)]);
});

test('the weekly review: the most missed first, only words and sentences you know, only this week', () => {
  M.store.reset();
  const words = M.content.words('day').slice(0, 5);
  learn(words.map((w) => w.id));
  const sentence = M.content.sentences().find((s) => s.needs.every((id) => words.some((w) => w.id === id))) || M.content.sentences()[0];
  learn([...sentence.needs, sentence.id]);
  const miss = (id, n, at) => {
    for (let i = 0; i < n; i++) M.srs.logMiss(id, at);
  };
  miss(words[0].id, 1, NOON);
  miss(words[1].id, 3, NOON - 2 * DAY);
  miss(sentence.id, 2, NOON - 6 * DAY);
  miss(words[2].id, 5, NOON - 8 * DAY); // last week: not this one
  miss('grammar:go', 4, NOON); // not a word or a sentence
  miss(M.content.words('cafe')[0].id, 4, NOON); // never learned
  const ids = W.pool(NOON).map((x) => x.id);
  assert.deepEqual(ids, [words[1].id, sentence.id, words[0].id]);
  assert.deepEqual(W.pool(NOON)[0], { id: words[1].id, count: 3 });
});

test('in a save’s first week of remembering misses, words still tricky from this week come too, after the rest', () => {
  M.store.reset();
  const [a, b, c] = M.content.words('people');
  learn([a.id, b.id, c.id]);
  Object.assign(M.srs.record(a.id), { flag: true, last: NOON - 2 * DAY });
  Object.assign(M.srs.record(b.id), { flag: true, last: NOON - 10 * DAY });
  M.srs.logMiss(c.id, NOON);
  M.store.state.profile.missLogSince = NOON - DAY;
  assert.deepEqual(W.pool(NOON), [{ id: c.id, count: 1 }, { id: a.id, count: 0 }]);
  // After that week, only what was really missed.
  M.store.state.profile.missLogSince = NOON - 8 * DAY;
  assert.deepEqual(W.pool(NOON), [{ id: c.id, count: 1 }]);
});

test('what the weekly review went over leaves the list', () => {
  M.store.reset();
  const [a, b] = M.content.words('day');
  learn([a.id, b.id]);
  M.srs.logMiss(a.id, NOON - DAY);
  M.srs.logMiss(a.id, NOON);
  M.srs.logMiss(b.id, NOON);
  M.srs.clearMisses([a.id]);
  assert.deepEqual(W.pool(NOON), [{ id: b.id, count: 1 }]);
});

test('a round is at most the configured size, and the game is ready only with something to review', () => {
  M.store.reset();
  M.utils.random = Math.random;
  const words = M.content.words('cafe').slice(0, 20);
  learn(words.map((w) => w.id));
  const game = M.games.get('weekly-review');
  const now = M.utils.now();
  assert.equal(game.status().ready, false);
  words.forEach((w, i) => M.srs.logMiss(w.id, now - (i % 5) * DAY));
  assert.equal(W.pickRound(now).length, M.config.session.weeklyReview.size);
  assert.equal(game.status().ready, true);
});

test('the weekly review badge', () => {
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'weekly-4');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('weeklyReviews', 4);
  assert.equal(badge.earned(M.store.state), true);
});
