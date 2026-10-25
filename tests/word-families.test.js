const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const W = M.wordFamilies;
const { DAY } = M.config.time;
const plain = (t) => String(t).replace(/\s+/g, '');

const learnAll = () => {
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
};

test('the word families are well-formed, and their words really share the syllable', () => {
  assert.deepEqual(M.content.check().filter((p) => p.includes('family')), []);
  const all = M.content.wordFamilies();
  assert.ok(all.length >= 20, `${all.length} families`);
  for (const f of all) {
    assert.ok(f.needs.length >= 2, `${f.id}: words`);
    for (const id of f.needs) assert.ok(M.content.word(id).ko.includes(f.syllable), `${f.id}: ${id}`);
    for (const g of f.guess) assert.ok(!f.needs.some((id) => plain(M.content.word(id).ko) === plain(g.ko)), `${f.id}: ${g.ko} is to guess, not one of its words`);
  }
});

test('a round: nothing until two words of a family are known, then due families first and one new one at most', () => {
  M.store.reset();
  assert.deepEqual(W.pickRound(NOON), []);
  assert.equal(M.games.get('word-families').status().ready, false);
  const [f] = M.content.wordFamilies();
  M.srs.introduce(f.needs[0], NOON - DAY);
  assert.equal(W.isOpen(f), false, 'one word is not enough');
  M.srs.introduce(f.needs[1], NOON - DAY);
  assert.equal(W.isOpen(f), true);
  learnAll();
  let round = W.pickRound(NOON);
  assert.equal(round.length, M.config.session.wordFamilies.perRound);
  assert.equal(M.games.get('word-families').status().ready, true);
  // Two met families, one of them due: the due one first, then at most one new one.
  const [a, b] = M.content.wordFamilies();
  M.srs.introduce(a.id, NOON - 5 * DAY);
  M.srs.review(a.id, 'good', NOON - 5 * DAY);
  M.srs.introduce(b.id, NOON - DAY);
  M.srs.review(b.id, 'good', NOON - 1000);
  round = W.pickRound(NOON + 2 * DAY);
  assert.equal(round[0].id, a.id, 'the due family first');
  assert.ok(round.filter((f2) => !M.srs.isIntroduced(f2.id)).length <= M.config.session.wordFamilies.newPerRound);
});

test('questions: every option is different, exactly one is right, and the wrong ones are explained', () => {
  M.store.reset();
  learnAll();
  for (const f of M.content.wordFamilies()) {
    for (let i = 0; i < 5; i++) {
      const meaning = W.meaningQuestion(f);
      assert.ok(meaning, `${f.id}: a meaning question`);
      assert.ok(meaning.options.length >= 3);
      assert.equal(meaning.options.filter((o) => o.correct).length, 1);
      assert.equal(meaning.options.find((o) => o.correct).text, f.meaning);
      assert.equal(new Set(meaning.options.map((o) => o.text.toLowerCase())).size, meaning.options.length, `${f.id}: different meanings`);
      for (const o of meaning.options.filter((x) => !x.correct)) assert.ok(o.why, `${f.id}: why`);
      assert.ok(meaning.words.length >= 2 && meaning.words.every((w) => w.ko.includes(f.syllable)));
      for (const g of f.guess) {
        const q = W.guessQuestion(f, g);
        assert.equal(q.options.length, 3);
        assert.equal(q.options.find((o) => o.correct).text, g.en);
      }
      const belongs = W.belongsQuestion(f);
      if (!belongs) continue;
      assert.equal(belongs.options.length, 3);
      const right = belongs.options.filter((o) => o.correct);
      assert.equal(right.length, 1);
      const members = [...f.needs.map((id) => M.content.word(id).ko), ...f.guess.map((g) => g.ko)].map(plain);
      assert.ok(members.includes(plain(right[0].text)), `${f.id}: ${right[0].text} is in the family`);
      for (const o of belongs.options.filter((x) => !x.correct)) {
        assert.ok(!members.includes(plain(o.text)), `${f.id}: ${o.text} is a look-alike`);
        assert.ok(o.text.includes(f.syllable) && o.why, `${f.id}: ${o.text}`);
      }
      assert.ok(!belongs.clue.some((w) => plain(w.ko) === plain(right[0].text)), 'the answer isn’t one of the clues');
      // Right after a word was guessed, the answer is another word of the family.
      for (const g of f.guess) assert.notEqual(plain(W.belongsQuestion(f, { after: g }).options.find((o) => o.correct).text), plain(g.ko), `${f.id}: not ${g.ko} again`);
    }
  }
  // Most families have a "which word belongs?" question.
  const withBelongs = M.content.wordFamilies().filter((f) => W.belongsQuestion(f)).length;
  assert.ok(withBelongs >= M.content.wordFamilies().length * 0.6, `${withBelongs} with look-alikes`);
});

test('meanings too close to be each other’s wrong answer', () => {
  const fam = (meaning, extra = {}) => ({ localId: meaning, meaning, ...extra });
  assert.equal(W.tooClose(fam('old'), fam('Old')), true, 'the same short meaning');
  assert.equal(W.tooClose(fam('old'), fam('old, former')), true);
  assert.equal(W.tooClose(fam('place'), fam('a place to stay')), true);
  assert.equal(W.tooClose(fam('a professional'), fam('a room')), false, '“a” is no meaning');
  assert.equal(W.tooClose(fam('tea'), fam('vehicle')), false);
  assert.equal(W.tooClose(fam('tea'), fam('vehicle', { avoid: ['tea'] })), true, 'avoid works both ways');
});

test('how a family went decides when it comes back, and the badge counts right answers', () => {
  assert.equal(W.gradeFor(0), 'good');
  assert.equal(W.gradeFor(1), 'hard');
  assert.equal(W.gradeFor(2), 'again');
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'families-50');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('familiesRight', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the word-family checker catches authoring mistakes', () => {
  M.content.registerWordFamilies([
    { id: 'bad-shape', syllable: '학교', hanja: 'XY', meaning: '', level: 5, words: ['cafe:water', 'nowhere:word'], guess: [{ ko: '학원' }], lookalikes: [{ ko: '학' }] },
    { id: 'bad-guess', syllable: '실', hanja: '室', meaning: 'room again', level: 1, words: ['work:classroom'], guess: [{ ko: '침실', en: 'bedroom', hint: 'h', wrong: ['bedroom', 'x'] }, { ko: '책상', en: 'desk', hint: 'h', wrong: ['a', 'b'] }], lookalikes: [{ ko: '교실', en: 'classroom', hanja: '室', why: 'w' }] },
    { id: 'bad-twice', syllable: '차', hanja: '茶', meaning: 'Tea', level: 1, words: ['cafe:tea', 'cafe:tea'], guess: [{ ko: '차', en: 'tea', hint: 'h', wrong: ['a', 'b'] }, { ko: '녹차', en: 'green tea', hint: 'h', wrong: ['c', 'd'] }, { ko: '녹 차', en: 'green tea', hint: 'h', wrong: ['c', 'd'] }] },
    { id: 'bad-meaning', syllable: '방', hanja: '房', meaning: 'Room', level: 1, words: ['work:classroom', 'work:office'], guess: [] },
  ]);
  const found = M.content.check().filter((p) => p.includes(':bad-'));
  const has = (re) => assert.ok(found.some((p) => re.test(p)), `${re}\n${found.join('\n')}`);
  has(/bad-shape: syllable is one Hangul syllable/);
  has(/bad-shape: hanja is the one Chinese character/);
  has(/bad-shape: needs a short meaning/);
  has(/bad-shape: level 1, 2 or 3/);
  has(/bad-shape: unknown word "nowhere:word"/);
  has(/bad-shape: needs 2–4 words to guess/);
  has(/bad-shape guess 1: needs ko, en and hint/);
  has(/bad-shape look-alike 1: needs ko, en and why/);
  has(/bad-guess: needs 2\+ game words/);
  has(/bad-guess: same syllable and hanja or meaning as/);
  has(/bad-guess guess 1: needs 2 different wrong meanings/);
  has(/bad-guess guess 2: 책상 doesn't contain 실/);
  has(/bad-guess look-alike 1: hanja is another Chinese character/);
  has(/bad-guess look-alike 1: 교실 is in the family too/);
  has(/bad-twice: a word is listed twice in "words"/);
  has(/bad-twice: same syllable and hanja or meaning as family:cha-tea/);
  has(/bad-twice guess 1: 차 is one of the family's words already/);
  has(/bad-twice guess 3: 녹 차 is listed twice/);
  has(/bad-meaning: same meaning as family:sil-room/);
});
