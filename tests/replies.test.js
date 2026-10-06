const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const R = M.replies;
const { DAY } = M.config.time;

const learnAll = () => {
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
};

test('the conversations are well-formed, and there are some for every topic', () => {
  assert.deepEqual(M.content.check().filter((p) => p.includes('reply')), []);
  const all = M.content.replies();
  assert.ok(all.length >= 16, `${all.length} conversations`);
  for (const t of M.content.topics()) assert.ok(all.some((r) => r.topic === t.id), `a conversation for ${t.id}`);
  for (const r of all) {
    const turns = r.steps.filter((st) => st.you);
    assert.ok(turns.length >= 3, `${r.id}: turns`);
    for (const st of turns) assert.equal(st.you.filter((o) => o.right).length, 1, `${r.id}: one right reply a turn`);
  }
  assert.ok(all.filter((r) => r.level === 1).length >= 3, 'some at level 1');
});

test('a round: two conversations, due ones first, the focus topic first, only the open ones', () => {
  M.store.reset();
  assert.deepEqual(R.pickRound('all', NOON), [], 'nothing opens before its words are learned');
  learnAll();
  const round = R.pickRound('all', NOON);
  assert.equal(round.length, M.config.session.replies.perRound);
  assert.ok(round.every(R.isUnlocked));
  const topic = M.content.replies()[M.content.replies().length - 1].topic;
  assert.equal(R.pickRound(topic, NOON)[0].topic, topic);
  // One that went badly comes back first.
  const missed = M.content.replies()[3];
  M.srs.review(missed.id, 'again', NOON - DAY);
  assert.equal(R.pickRound('all', NOON)[0].id, missed.id);
});

test('how a conversation went decides when it comes back', () => {
  assert.equal(R.gradeFor(0), 'good');
  assert.equal(R.gradeFor(1), 'hard');
  assert.equal(R.gradeFor(3), 'again');
});

test('a spoken reply picks the option it sounds like, and only a clear one', () => {
  const options = [{ ko: '카드로 계산할게요.' }, { ko: '카드를 계산할게요.' }, { ko: '현금으로 낼게요.' }];
  assert.equal(R.heardOption(options, ['현금으로 낼게요']), 2);
  assert.equal(R.heardOption(options, ['안녕하세요']), null, 'nothing close');
  assert.equal(R.heardOption(options, ['카드 계산할게요']), null, 'too close to two of them to tell');
  assert.equal(R.heardOption(options, ['카드로 계산할게요', '카드를 계산할게요']), 0, 'the best of the alternatives');
});

test('the game is ready once a conversation is open, and the badge counts first-time replies', () => {
  M.store.reset();
  const game = M.games.get('replies');
  assert.equal(game.status().ready, false);
  learnAll();
  assert.equal(game.status().ready, true);
  const badge = M.progress.BADGES.find((b) => b.id === 'replies-50');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('repliesRight', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the reply checker catches authoring mistakes', () => {
  M.content.registerReplies([
    { id: 'bad-shape', topic: 'nowhere', level: 4, steps: [{ you: [] }, { you: [] }] },
    {
      id: 'bad-turn', topic: 'cafe', level: 1, scene: '☕', title: { ko: '가', en: 'a' }, role: { ko: '나', en: 'me' }, goal: { ko: '목표', en: 'goal' },
      them: { name: '직원', en: 'Staff', emoji: '🧑', voice: 'high' }, words: ['cafe:water', 'cafe:please'],
      steps: [
        { them: { ko: '2번 출구로 와요?', en: 'x' } }, // (a number that's a label stays in digits: 3시 would be read 세 시)
        { you: [{ ko: '네.', en: 'Yes.', right: true }, { ko: '네.', en: 'Yes.' }, { ko: '아니요.', en: 'No.', right: true }] },
        { them: { ko: '네.', en: 'OK.' } },
      ],
    },
    {
      id: 'bad-both', topic: 'cafe', level: 1, scene: '☕', title: { ko: '가', en: 'a' }, role: { ko: '나', en: 'me' }, goal: { ko: '목표', en: 'goal' },
      them: { name: '직원', en: 'Staff', emoji: '🧑', voice: 'high' }, words: ['cafe:water', 'cafe:please'],
      steps: [{ them: { ko: '네.', en: 'OK.' } }, { them: { ko: '네.', en: 'OK.' }, you: [] }, { them: { ko: '네.', en: 'OK.' } }],
    },
  ]);
  const found = M.content.check().filter((p) => p.includes(':bad-'));
  const has = (re) => assert.ok(found.some((p) => re.test(p)), `${re}\n${found.join('\n')}`);
  has(/bad-shape: unknown topic/);
  has(/bad-shape: level 1, 2 or 3/);
  has(/bad-shape: needs goal/);
  has(/bad-shape: they speak first and last/);
  has(/bad-shape step 0: they answer between two of your turns/);
  has(/bad-turn: needs 3–5 turns of yours/);
  has(/bad-turn step 0: write the number in Hangul/);
  has(/bad-turn step 1: needs 3 different options/);
  has(/bad-turn step 1: exactly one option is right/);
  has(/bad-turn step 1 option 2 react: needs ko and en/);
  has(/bad-both: each step is \{ them: \{ ko, en \} \} or \{ you: \[three options\] \}/);
});
