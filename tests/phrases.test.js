const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const P = M.phrases;
const { DAY } = M.config.time;
const plain = (t) => String(t).replace(/[\s.,!?~]+/g, '');

test('the set phrases are well-formed, and each has its moments and the phrases wrong there', () => {
  assert.deepEqual(M.content.check().filter((p) => p.startsWith('phrase')), []);
  const all = M.content.phrases();
  assert.ok(all.length >= 30, `${all.length} phrases`);
  assert.equal(new Set(all.map((p) => plain(p.ko))).size, all.length, 'every phrase once');
  const ids = new Set(all.map((p) => p.localId));
  for (const p of all) {
    assert.ok(p.situations.length >= 1, p.id);
    for (const s of p.situations) {
      assert.ok(s.wrong.length >= 3 && s.wrong.every((id) => ids.has(id) && id !== p.localId), `${p.id}: ${s.en}`);
    }
    for (const id of p.needs) assert.ok(M.content.word(id), `${p.id}: ${id}`);
  }
  // Most phrases can be asked the other way round too ("when do you say it?").
  const both = all.filter((p) => P.whenQuestion(p)).length;
  assert.ok(both >= all.length * 0.8, `${both} of ${all.length}`);
});

test('a round: the new phrases’ cards first, then a question for each, due phrases before the others', () => {
  M.store.reset();
  const c = M.config.session.phrases;
  assert.equal(M.games.get('phrases').status().ready, true, 'open from the start');
  let steps = P.planRound(NOON);
  const cards = steps.filter((s) => s.card);
  assert.ok(cards.length >= c.firstRound && cards.length <= c.firstRound + 1, 'four new phrases on the very first round (five to keep a pair together)');
  assert.deepEqual(steps.slice(0, cards.length), cards, 'nothing to review yet: the cards open the round');
  const questions = steps.filter((s) => !s.card);
  assert.equal(questions.length, c.size);
  assert.ok(questions.every((q) => cards.some((x) => x.card === q.phrase)), 'only the new phrases');
  for (const p of cards.map((x) => x.card)) {
    const mine = questions.filter((q) => q.phrase === p);
    if (p.situations.length > 1) assert.equal(new Set(mine.map((q) => q.situation)).size, mine.length, `${p.id}: a situation once a round`);
  }
  // Met phrases, two of them due: those come first, before the new phrases' cards.
  const all = M.content.phrases();
  for (const p of all.slice(0, 6)) M.srs.introduce(p.id, NOON - 10 * DAY);
  M.srs.review(all[0].id, 'good', NOON - 10 * DAY);
  M.srs.review(all[1].id, 'good', NOON - 10 * DAY);
  for (const p of all.slice(2, 6)) M.srs.review(p.id, 'good', NOON - 1000);
  steps = P.planRound(NOON);
  assert.ok(!steps[0].card && [all[0], all[1]].includes(steps[0].phrase), 'a due phrase opens the round');
  const asked = steps.filter((s) => !s.card).map((s) => s.phrase);
  assert.ok(asked.includes(all[0]) && asked.includes(all[1]), 'both due phrases come up');
  const added = steps.filter((s) => s.card).length;
  assert.ok(added === c.newPerRound || added === c.newPerRound + 1, `${added}: three new ones (four to keep a pair together)`);
  // Many due: no new phrases this round.
  for (const p of all.slice(0, 12)) {
    M.srs.introduce(p.id, NOON - 10 * DAY);
    M.srs.review(p.id, 'good', NOON - 10 * DAY);
  }
  assert.equal(P.planRound(NOON).filter((s) => s.card).length, 0);
});

test('new phrases: a few a day, a pair never split, and “what do you say?” before “when?”', () => {
  const c = M.config.session.phrases;
  const all = M.content.phrases();
  const partners = (a, b) => a.situations.some((s) => s.wrong.includes(b.localId)) && b.situations.some((s) => s.wrong.includes(a.localId));
  // A pair at the end of a round's new phrases comes in whole.
  const i = all.findIndex((p, n) => n >= 2 && all[n + 1] && partners(p, all[n + 1]) && p.level === all[n + 1].level && all[n - 2].level === p.level);
  assert.ok(i > 0, 'a pair to try');
  M.store.reset();
  for (const p of all.slice(0, i - 2)) {
    M.srs.introduce(p.id, NOON - 3 * DAY);
    M.srs.review(p.id, 'good', NOON - 1000);
  }
  const steps = P.planRound(NOON);
  const fresh = steps.filter((s) => s.card).map((s) => s.card);
  assert.deepEqual(fresh, all.slice(i - 2, i + 2), `${all[i].ko} comes with ${all[i + 1].ko}`);
  for (const p of fresh) {
    const kinds = steps.filter((s) => s.phrase === p).map((s) => s.kind);
    if (kinds.length === 2) assert.deepEqual(kinds, ['what', 'when'], p.id);
  }
  for (let n = 1; n < steps.length; n++) if (steps[n].phrase && steps[n - 1].phrase === steps[n].phrase) assert.fail(`${steps[n].phrase.id} twice in a row`);
  // The daily allowance: once it's used up, no new phrases until tomorrow.
  M.store.reset();
  for (const p of all.slice(0, c.newPerDay)) M.srs.introduce(p.id, NOON - 1000);
  assert.equal(P.newLeftToday(NOON), 0);
  assert.equal(P.planRound(NOON).filter((s) => s.card).length, 0);
  assert.equal(P.newLeftToday(NOON + DAY), c.newPerDay);
});

test('questions: one right answer, wrong ones from the situation’s list, every option explained', () => {
  M.store.reset();
  const all = M.content.phrases();
  for (const p of all) {
    for (const s of p.situations) {
      const q = P.whatQuestion(p, s);
      assert.equal(q.options.length, 4, `${p.id}: ${s.en}`);
      assert.equal(q.options.filter((o) => o.correct).length, 1);
      assert.equal(q.options.find((o) => o.correct).text, p.ko);
      const wrong = new Set(s.wrong.map((id) => M.content.phrase(`phrase:${id}`).ko));
      for (const o of q.options.filter((x) => !x.correct)) assert.ok(wrong.has(o.text) && o.why, `${p.id}: ${o.text}`);
      assert.equal(new Set(q.options.map((o) => o.text)).size, 4, 'four different phrases');
    }
    const w = P.whenQuestion(p);
    if (!w) continue;
    assert.equal(w.options.length, 3);
    const right = w.options.filter((o) => o.correct);
    assert.equal(right.length, 1);
    assert.ok(p.situations.some((s) => s.en === right[0].text), `${p.id}: its own moment`);
    for (const o of w.options.filter((x) => !x.correct)) {
      const owner = all.find((x) => x.situations.some((s) => s.en === o.text));
      const s = owner.situations.find((x) => x.en === o.text);
      assert.ok(s.wrong.includes(p.localId), `${p.id}: “${o.text}” lists it as wrong`);
      assert.ok(o.why.includes(owner.ko));
    }
  }
});

test('how a phrase went decides when it comes back, and the badge counts right answers', () => {
  assert.equal(P.gradeFor(0, 2), 'good');
  assert.equal(P.gradeFor(1, 1), 'hard', 'one slip next to a right answer');
  assert.equal(P.gradeFor(1, 0), 'again', 'a review’s only question, missed');
  assert.equal(P.gradeFor(2, 0), 'again');
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'phrases-50');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('phrasesRight', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the phrase checker catches authoring mistakes', () => {
  const [first] = M.content.phrases();
  M.content.registerPhrases([
    { id: 'bad-shape', ko: 'hello', en: 'A gloss that is far too long to be shown under the phrase on a small phone', level: 4, reply: { ko: '네' }, words: ['nowhere:word'], situations: [{ emoji: '🙂' }] },
    { id: 'bad-wrong', ko: first.ko, en: 'x', when: 'w', situations: [{ emoji: '🍚', en: first.situations[0].en, wrong: ['bad-wrong', 'nowhere', 'nowhere'] }] },
    { id: 'bad-none', ko: '어', en: 'x', when: 'w' },
    { id: 'bad-list', ko: '음', en: 'x', when: 'w', situations: { emoji: '🙂', en: 'A moment', wrong: [] } },
    { id: 'bad-more', ko: '많이 드세요', en: '   ', when: 'w'.repeat(170), words: ['day:thanksfood'],
      situations: [{ emoji: 'x', en: 'Somewhere' }, { emoji: '🍚', en: first.situations[0].en.replace(/’/g, "'").toUpperCase(), wrong: 'bad-none' }] },
  ]);
  const found = M.content.check().filter((p) => p.includes(':bad-'));
  const has = (re) => assert.ok(found.some((p) => re.test(p)), `${re}\n${found.join('\n')}`);
  has(/bad-shape: needs ko, en and when/);
  has(/bad-shape: level 1, 2 or 3/);
  has(/bad-shape: "en" is a short gloss/);
  has(/bad-shape: "reply" is \{ ko, en \}/);
  has(/bad-shape: unknown word "nowhere:word"/);
  has(/bad-shape situation 1: needs an emoji and en/);
  has(/bad-wrong: the same phrase as/);
  has(/bad-wrong situation 1: the same situation as/);
  has(/bad-wrong situation 1: needs 3\+ different phrases/);
  has(/bad-wrong situation 1: "wrong" lists the phrase itself/);
  has(/bad-wrong situation 1: "wrong" lists unknown phrase "nowhere"/);
  has(/bad-none: needs 1\+ situations/);
  has(/bad-list: "situations" is a list/);
  has(/bad-list: needs 1\+ situations/);
  has(/bad-more: needs ko, en and when/);
  has(/bad-more: "when" is 160 characters at most/);
  has(/bad-more: "words" is the game word the phrase is, and day:thanksfood is 잘 먹겠습니다/);
  has(/bad-more situation 1: needs an emoji and en/);
  has(/bad-more situation 2: the same situation as/);
  has(/bad-more situation 2: needs 3\+ different phrases/);
  // …and a malformed phrase can't break the game.
  assert.ok(P.planRound(NOON).length > 0);
});
