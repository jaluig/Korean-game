const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const S = M.signs;
const { DAY } = M.config.time;
const plain = (t) => String(t).replace(/[\s.,!?~]+/g, '');

test('the signs are well-formed, every look is used, and each sign has its moment and the signs wrong for it', () => {
  assert.deepEqual(M.content.check().filter((p) => p.startsWith('sign')), []);
  const all = M.content.signs();
  assert.ok(all.length >= 30, `${all.length} signs`);
  for (const look of M.content.SIGN_LOOKS) assert.ok(all.some((x) => x.look === look), `a ${look} sign`);
  assert.equal(new Set(all.map((x) => plain(x.ko))).size, all.length, 'every sign once');
  const ids = new Set(all.map((x) => x.localId));
  for (const x of all) {
    assert.ok(x.wrong.length >= 3 && x.wrong.every((id) => ids.has(id) && id !== x.localId), x.id);
    for (const id of x.needs) assert.equal(plain(M.content.word(id).ko), plain(x.ko), `${x.id}: ${id}`);
  }
});

test('a round: the new signs’ cards first, “what does it say?” before “which sign?”, due signs first', () => {
  M.store.reset();
  const c = M.config.session.signs;
  assert.equal(M.games.get('signs').status().ready, true, 'open from the start');
  let steps = S.planRound(NOON);
  const cards = steps.filter((s) => s.card);
  assert.ok(cards.length >= c.firstRound && cards.length <= c.firstRound + 1, 'four new signs on the very first round (five to keep a pair together)');
  assert.deepEqual(steps.slice(0, cards.length), cards, 'nothing to review yet: the cards open the round');
  const questions = steps.filter((s) => !s.card);
  assert.equal(questions.length, c.size);
  for (const { card } of cards) {
    const kinds = steps.filter((s) => s.sign === card).map((s) => s.kind);
    if (kinds.length === 2) assert.deepEqual(kinds, ['read', 'find'], card.id);
  }
  for (let n = 1; n < steps.length; n++) if (steps[n].sign && steps[n - 1].sign === steps[n].sign) assert.fail(`${steps[n].sign.id} twice in a row`);
  // Two met signs due: one opens the round, both come up.
  const all = M.content.signs();
  for (const x of all.slice(0, 6)) M.srs.introduce(x.id, NOON - 10 * DAY);
  M.srs.review(all[0].id, 'good', NOON - 10 * DAY);
  M.srs.review(all[1].id, 'good', NOON - 10 * DAY);
  for (const x of all.slice(2, 6)) M.srs.review(x.id, 'good', NOON - 1000);
  steps = S.planRound(NOON);
  assert.ok(!steps[0].card && [all[0], all[1]].includes(steps[0].sign), 'a due sign opens the round');
  // The daily allowance: once it's used up, no new signs until tomorrow.
  M.store.reset();
  for (const x of all.slice(0, c.newPerDay)) M.srs.introduce(x.id, NOON - 1000);
  assert.equal(S.newLeftToday(NOON), 0);
  assert.equal(S.planRound(NOON).filter((s) => s.card).length, 0);
});

test('questions: one right answer, wrong meanings never too close, wrong signs from the sign’s list', () => {
  M.store.reset();
  const all = M.content.signs();
  for (const x of all) {
    for (let i = 0; i < 3; i++) {
      const read = S.readQuestion(x);
      assert.equal(read.options.length, 4, x.id);
      assert.equal(read.options.filter((o) => o.correct).length, 1);
      assert.equal(read.options.find((o) => o.correct).text, x.en);
      assert.equal(new Set(read.options.map((o) => o.text.toLowerCase())).size, 4, `${x.id}: four different meanings`);
      for (const o of read.options.filter((y) => !y.correct)) {
        const y = all.find((z) => z.en === o.text);
        assert.ok(!x.avoid.includes(y.localId) && !y.avoid.includes(x.localId), `${x.id}: ${y.id} means nearly the same`);
        assert.ok(o.why, `${x.id}: why`);
      }
      // Same-look meanings first, so the colour gives nothing away.
      const sameLook = all.filter((y) => y !== x && y.look === x.look && !x.avoid.includes(y.localId) && !y.avoid.includes(x.localId)).length;
      const fromLook = read.options.filter((o) => !o.correct && all.find((z) => z.en === o.text).look === x.look).length;
      assert.ok(fromLook >= Math.min(3, sameLook), `${x.id}: ${fromLook} of ${sameLook} same-look meanings`);
      const find = S.findQuestion(x);
      assert.equal(find.options.length, 4, x.id);
      assert.equal(find.options.find((o) => o.correct).sign, x);
      for (const o of find.options.filter((y) => !y.correct)) assert.ok(x.wrong.includes(o.sign.localId), `${x.id}: ${o.sign.id}`);
    }
  }
});

test('how a sign went decides when it comes back, and the badge counts right answers', () => {
  assert.equal(S.gradeFor(0, 2), 'good');
  assert.equal(S.gradeFor(1, 1), 'hard');
  assert.equal(S.gradeFor(1, 0), 'again', 'a review’s only question, missed');
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'signs-50');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('signsRight', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the sign checker catches authoring mistakes', () => {
  const [first] = M.content.signs();
  M.content.registerSigns([
    { id: 'bad-shape', ko: '', en: '', look: 'neon', level: 4, icon: 'x', words: ['nowhere:word'], wrong: ['bad-shape', 'nowhere'], avoid: ['nowhere'] },
    { id: 'bad-more', ko: first.ko, en: first.en.toUpperCase(), look: 'info', where: 'w', need: first.need, words: ['day:thanksfood'], wrong: [first.localId, first.localId, 'bad-shape'], avoid: [first.localId] },
    { id: 'bad-say', ko: '50% 할인', en: 'Half price', look: 'tag', where: 'w', need: 'n', wrong: 'nope' },
    { id: 'bad-said', ko: '미세요', say: '당기세요', en: 'No smoking!', look: 'shop', where: 'w', need: 'Look for 미세요 on the door.', wrong: [first.localId, 'bad-say', 'bad-shape'] },
    { id: 'bad-near', ko: '가나', en: 'x', look: 'info', where: 'w', need: 'n2', wrong: ['bad-other', 'bad-say', 'bad-shape'], avoid: [] },
  ]);
  M.content.registerSigns([{ id: 'bad-other', ko: '다라', en: 'y', look: 'info', where: 'w', need: 'n3', wrong: ['bad-said', 'bad-say', 'bad-shape'], avoid: ['bad-near'] }]);
  const found = M.content.check().filter((p) => p.includes(':bad-'));
  const has = (re) => assert.ok(found.some((p) => re.test(p)), `${re}\n${found.join('\n')}`);
  has(/bad-shape: needs ko, en, where and need/);
  has(/bad-shape: look is one of/);
  has(/bad-shape: level 1, 2 or 3/);
  has(/bad-shape: "icon" is an emoji/);
  has(/bad-shape: unknown word "nowhere:word"/);
  has(/bad-shape: needs 3\+ different signs in "wrong"/);
  has(/bad-shape: "wrong" lists the sign itself/);
  has(/bad-shape: "avoid" lists unknown sign "nowhere"/);
  has(/bad-more: the same sign as/);
  has(/bad-more: the same meaning as/);
  has(/bad-more: the same "need" as/);
  has(/bad-more: "words" is the game word the sign is, and day:thanksfood is 잘 먹겠습니다/);
  has(/bad-more: .* is in "wrong", but they mean nearly the same/);
  has(/bad-say: add "say"/);
  has(/bad-say: needs 3\+ different signs in "wrong"/);
  has(/bad-said: "say" is only for a sign with digits or symbols/);
  has(/bad-said: the need names the sign/);
  has(/bad-said: the same meaning as sign:no-smoking/); // (“No smoking!”: the same, but for the “!”)
  has(/bad-near: bad-other is in "wrong", but they mean nearly the same/); // (bad-other lists bad-near in its "avoid")
  // …and a malformed sign can't break the game.
  assert.ok(S.planRound(NOON).length > 0);
});
