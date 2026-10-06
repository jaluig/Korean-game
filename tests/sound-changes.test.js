const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const S = M.soundChanges;
const plain = (t) => String(t).replace(/\s+/g, '');

test('the sound-change rules and items are well-formed', () => {
  assert.deepEqual(M.content.check().filter((p) => p.includes('pron')), []);
  const rules = M.content.soundRules();
  assert.ok(rules.length >= 7, `${rules.length} rules`);
  assert.deepEqual(rules.map((r) => r.order), [...rules.map((r) => r.order)].sort((a, b) => a - b), 'in teaching order');
  for (const r of rules) assert.ok(M.content.soundItems(r.id).length >= 6, `${r.id}: items`);
  // The game's own words say the same as the items about them.
  const words = new Map(M.content.words().map((w) => [w.ko, w]));
  for (const x of M.content.soundItems()) {
    const w = words.get(x.ko);
    if (w && w.pron) assert.equal(plain(w.pron), plain(x.pron), `${x.id} vs ${w.id}`);
  }
});

test('the rules come one at a time: the first card first, the next once the rules met are all seen', () => {
  M.store.reset();
  const [first, second] = M.content.soundRules();
  let plan = S.planRound(NOON);
  assert.equal(plan.rule.id, first.id);
  assert.ok(plan.items.length > 4 && plan.items.every((x) => x.rule === first.id), 'the first round: the first rule’s words');
  M.srs.introduce(first.id, NOON);
  for (const x of plan.items) M.srs.review(x.id, 'good', NOON);
  plan = S.planRound(NOON + 1000);
  const unseen = M.content.soundItems(first.id).filter((x) => M.srs.stageOf(x.id) === 0);
  if (unseen.length) {
    assert.equal(plan.rule, null, 'not while some of the rule’s words are unseen');
    for (const x of M.content.soundItems(first.id)) M.srs.review(x.id, 'good', NOON + 2000);
  }
  plan = S.planRound(NOON + 3000);
  assert.equal(plan.rule.id, second.id);
  assert.ok(plan.items.slice(0, M.config.session.soundChanges.newPerRound).every((x) => x.rule === second.id), 'the new rule’s words first');
  assert.ok(plan.items.length <= M.config.session.soundChanges.size);
});

test('questions: three options, one right, every wrong one explained', () => {
  for (const x of M.content.soundItems()) {
    for (const kind of ['how', 'spell']) {
      const q = S.question(x, kind);
      assert.equal(q.options.length, 3);
      assert.equal(q.options.filter((o) => o.correct).length, 1);
      assert.equal(new Set(q.options.map((o) => plain(o.text))).size, 3, `${x.id} ${kind}: different options`);
      assert.equal(q.options.find((o) => o.correct).text, kind === 'how' ? x.pron : x.ko);
      for (const o of q.options.filter((o) => !o.correct)) assert.ok(o.why, `${x.id}: why`);
    }
  }
  const x = M.content.soundItems().find((it) => it.wrong.some((w) => plain(w) === plain(it.ko)));
  if (x) {
    M.utils.random = () => 0; // (the letter-by-letter one is offered)
    const q = S.question({ ...x, wrong: [x.ko, ...x.wrong.filter((w) => plain(w) !== plain(x.ko))].slice(0, 2) }, 'how');
    assert.ok(q.options.some((o) => !o.correct && /letter by letter/.test(o.why)));
    M.utils.random = Math.random;
  }
});

test('the game is always ready, and the badge counts right answers', () => {
  M.store.reset();
  assert.equal(M.games.get('sound-changes').status().ready, true);
  const badge = M.progress.BADGES.find((b) => b.id === 'pron-50');
  M.progress.bump('pronCorrect', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the sound-change checker catches authoring mistakes', () => {
  M.content.registerSoundChanges({
    rules: [
      { id: 'bad-rule', order: 99, level: 1, title: { ko: '가' } },
      { id: 'bad-ex', order: 99, level: 1, title: { ko: '가', en: 'a' }, text: 'a', examples: [{ ko: '먹어요', pron: '[머거요]', en: 'eat' }, { ko: '입어요', pron: '입어요', en: 'wear' }] },
    ],
    items: [
      { id: 'bad-real', rule: 'bad-rule', level: 1, ko: '같이', pron: '가치', en: 'together', wrong: ['가티', '갇이'], spellings: ['학교', '갇히'] },
      { id: 'bad-same', rule: 'bad-rule', level: 1, ko: '학교', pron: '학교', en: 'school', wrong: ['학꾜'], spellings: ['학교', '하교'] },
      { id: 'bad-brackets', rule: 'nowhere', level: 5, ko: '학년', pron: '[항년]', en: 'grade', wrong: ['학년', '하견'], spellings: ['항년', '학연'] },
    ],
  });
  const found = M.content.check().filter((p) => p.includes(':bad-'));
  const has = (re) => assert.ok(found.some((p) => re.test(p)), `${re}\n${found.join('\n')}`);
  has(/bad-rule: needs title/);
  has(/bad-rule: needs text/);
  has(/bad-rule: needs 2\+ examples/);
  has(/bad-rule: needs 6\+ items/);
  has(/bad-same: pron must differ from the spelling/);
  has(/bad-same: needs 2–3 different wrong pronunciations/);
  has(/bad-same: needs 2 different wrong spellings/);
  has(/bad-brackets: unknown rule/);
  has(/bad-brackets: level 1, 2 or 3/);
  has(/bad-brackets: pron in Hangul only/);
  has(/bad-ex: an example's pron is in Hangul only/);
  has(/bad-real: the spelling "학교" is a real word/);
});
