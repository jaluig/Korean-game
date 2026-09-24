const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;

function learnEverything() {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('every new minigame is registered with a home card', () => {
  for (const id of ['balloon-pop', 'particle-lab', 'verb-magic', 'number-shop', 'sound-twins']) {
    const game = M.games.get(id);
    assert.ok(game, id);
    assert.ok(game.emoji && game.title.ko && game.title.en && game.blurb.en, id);
  }
});

test('Particle Lab builds a round of fair questions from learned sentences', () => {
  M.store.reset();
  assert.equal(M.particleLab.questionPool('all').length, 0, 'nothing before any words are learned');
  learnEverything();
  const round = M.particleLab.buildRound('all');
  assert.equal(round.length, M.config.session.particleLab.size);
  const seen = new Set();
  for (const { sentence, drill } of round) {
    const key = `${sentence.id}#${drill.index}`;
    assert.ok(!seen.has(key), `${key} asked twice`);
    seen.add(key);
    assert.equal(drill.options.filter((o) => o.correct).length, 1);
  }
});

test('Verb Magic uses learned verbs and unlocks harder spells with practice', () => {
  learnEverything();
  const pool = M.verbMagic.verbPool('all');
  assert.ok(pool.some((w) => w.id === 'day:eat'));
  assert.ok(!pool.some((w) => w.id === 'cafe:please'), '주세요 is not the present tense of 주다');
  assert.deepEqual(M.verbMagic.formsUnlocked(), ['present', 'past', 'negative']);
  M.store.state.totals.verbsCorrect = 100;
  assert.equal(M.verbMagic.formsUnlocked().length, 7);
  const round = M.verbMagic.buildRound(pool);
  assert.equal(round.length, M.config.session.verbMagic.size);
  assert.equal(new Set(round.map((q) => `${q.word.id}|${q.form}`)).size, round.length, 'no spell twice');
  for (const { word, form } of round) {
    assert.ok(M.conjugate.applies(word.dict, form, { pos: word.pos }), `${word.dict} ${form}`);
    const right = M.conjugate.conjugate(word.dict, form, { pos: word.pos }).text;
    const wrong = M.verbMagic.wrongOptions(word, form);
    assert.equal(wrong.length, 3, `${word.dict} ${form}`);
    assert.ok(!wrong.some((w) => w.text === right));
    assert.equal(new Set(wrong.map((w) => w.text)).size, 3);
  }
});

test('every verb form Verb Magic can ask has three distinct wrong options', () => {
  learnEverything();
  M.store.state.totals.verbsCorrect = 100;
  for (const word of M.verbMagic.verbPool('all')) {
    for (const f of M.conjugate.FORMS) {
      if (!M.verbMagic.playable(word, f.id)) continue;
      const right = M.conjugate.conjugate(word.dict, f.id, { pos: word.pos }).text;
      const wrong = M.verbMagic.wrongOptions(word, f.id).map((w) => w.text);
      assert.equal(new Set(wrong).size, 3, `${word.dict} ${f.id}`);
      assert.ok(!wrong.includes(right), `${word.dict} ${f.id}`);
    }
  }
});

test('Number Shop mixes every kind of customer and gets harder', () => {
  const plan = M.numberShop.planRound(8);
  assert.equal(plan.length, 8);
  for (const kind of ['count', 'price', 'register', 'time']) assert.ok(plan.some((t) => t.kind === kind), kind);
  const tiers = plan.map((t) => t.tier);
  assert.deepEqual(tiers, [...tiers].sort(), 'tiers never go down');
  assert.equal(tiers[0], 1);
  assert.equal(tiers[tiers.length - 1], 3);
  for (let i = 0; i < 200; i++) {
    const t1 = M.numberShop.pickPrice(1);
    const t3 = M.numberShop.pickPrice(3);
    assert.ok(t1 >= 1000 && t1 < 10000 && t1 % 500 === 0, String(t1));
    assert.ok(t3 >= 10000 && t3 < 100000, String(t3));
    const { hour, minute } = M.numberShop.pickTime(3);
    assert.ok(hour >= 1 && hour <= 12 && minute % 5 === 0 && minute < 60);
  }
});

test('Number Shop connects numbers to the words that name them', () => {
  const ids = M.numberShop.sinoWords(12500);
  for (const id of ['numbers:tenthousand', 'numbers:thousand', 'numbers:hundred', 'numbers:i']) assert.ok(ids.includes(id), id);
  assert.ok(!M.numberShop.sinoWords(1000).includes('numbers:il'), '천, not 일천');
});

test('Sound Twins: every twin in a set differs in one explainable sound', () => {
  const sets = M.content.soundSets();
  assert.ok(sets.length >= 20);
  for (const set of sets) {
    for (const a of set.words) {
      assert.ok(a.ko && a.en && a.emoji && a.rom, `${set.id} ${a.ko}`);
      for (const b of set.words) {
        if (a === b) continue;
        const diff = M.hangul.explainDifference(a.ko, b.ko);
        assert.ok(diff && diff.tip && !/Look closely/.test(diff.tip), `${set.id}: ${a.ko} vs ${b.ko}`);
      }
    }
  }
});

test('Sound Twins reviews due sets first and grows them with spaced repetition', () => {
  M.store.reset();
  const [first] = M.content.soundSets();
  M.srs.review(first.id, 'good', NOON - 2 * DAY);
  M.srs.review(first.id, 'good', NOON - 2 * DAY);
  Object.assign(M.srs.record(first.id), { due: NOON - 1000 });
  const round = M.soundTwins.buildRound(NOON);
  assert.equal(round.length, M.config.session.soundTwins.size);
  assert.ok(round.some((q) => q.set.id === first.id), 'the due set is in the round');
  for (const q of round) assert.ok(q.set.words.includes(q.target));
});
