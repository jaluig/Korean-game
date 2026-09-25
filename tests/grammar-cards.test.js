const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const G = M.grammar;
const { DAY } = M.config.time;
const squash = (t) => String(t).replace(/\s+/g, '');
// Pairs that overlap in meaning: one can't be the "wrong meaning" option of the other.
const OVERLAP = [['myeon', 'ttae'], ['aseo', 'nikka'], ['aseo', 'go'], ['hue', 'go'], ['su', 'ado'], ['hue', 'aseo']];

function learnWords(now = NOON) {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, now - 3 * DAY);
}

test('the grammar content is complete and has no authoring problems', () => {
  const patterns = M.content.grammar();
  assert.ok(patterns.length >= 12, `${patterns.length} patterns`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('grammar')), []);
  const used = new Set();
  for (const g of patterns) {
    assert.ok(g.title.ko && g.title.en && g.meaning && g.how && g.emoji, g.id);
    assert.ok([1, 2, 3].includes(g.level), `${g.id} level`);
    assert.ok(g.examples.length >= 2, `${g.id} examples`);
    assert.ok(g.questions.length >= 7, `${g.id} has only ${g.questions.length} questions`);
    assert.ok(G.table(g.form).length >= 3, `${g.id} table`);
    for (const q of g.questions) used.add(q.form);
  }
  for (const id of Object.keys(G.ENDINGS)) assert.ok(used.has(id), `no question practises ${id}`);
});

test('every answer is the form the engine makes, and every question has four fair options', () => {
  for (const g of M.content.grammar()) {
    for (const q of g.questions) {
      const right = G.form(q.dict, q.form, { pos: q.pos, tense: q.tense });
      assert.ok(right, `${q.id}: the engine can't make ${q.dict} + ${q.form}`);
      assert.ok([right.text, ...right.variants].map(squash).includes(squash(q.answer)), `${q.id}: "${q.answer}" but the engine makes "${right.text}"`);
      for (const c of q.contrast) {
        assert.ok(G.ENDINGS[c] && c !== q.form, `${q.id}: contrast ${c}`);
        assert.ok(!OVERLAP.some(([a, b]) => (a === c && b === q.form) || (b === c && a === q.form)), `${q.id}: ${c} overlaps with ${q.form}`);
      }
      for (let i = 0; i < 5; i++) {
        const built = G.question(q);
        assert.equal(built.options.length, 4, `${q.id}: ${built.options.map((o) => o.text).join(' / ')}`);
        assert.equal(built.options.filter((o) => o.correct).length, 1, q.id);
        assert.equal(new Set(built.options.map((o) => squash(o.text))).size, 4, `${q.id}: duplicate options`);
        for (const o of built.options) assert.ok(o.why && o.why.length > 8, `${q.id}: ${o.text} has no explanation`);
        assert.equal(`${built.before}${built.answer}${built.after}`, q.ko, q.id);
      }
    }
  }
});

test('Grammar Cards opens after a few words, then starts with the first two patterns', () => {
  M.store.reset();
  assert.equal(M.games.get('grammar-cards').status().ready, false, 'locked before any words are known');
  learnWords();
  assert.equal(M.games.get('grammar-cards').status().ready, true);
  const steps = M.grammarCards.planRound({ now: NOON });
  const intros = steps.filter((s) => s.kind === 'intro').map((s) => s.pattern.localId);
  const [first, second] = M.content.grammar();
  assert.deepEqual(intros, [first.localId, second.localId]);
  assert.equal(steps[0].kind, 'intro', 'nothing to review yet, so the round opens with the first card');
  assert.equal(steps[1].pattern, first, 'its questions come right after the card');
  const questions = steps.filter((s) => s.kind === 'question');
  assert.equal(questions.length, M.config.session.grammarCards.size);
  assert.equal(new Set(questions.map((s) => s.q.id)).size, questions.length, 'no question twice');
  assert.ok(questions.every((s) => [first, second].includes(s.pattern)), 'only the patterns being learned');
});

test('Grammar Cards: two new patterns a day, due ones first, then practice', () => {
  learnWords();
  const all = M.content.grammar();
  M.grammarCards.planRound({ now: NOON }).filter((s) => s.kind === 'intro').forEach((s) => M.srs.introduce(s.pattern.id, NOON));
  // Same day: the allowance is used up, so it's practice on what was learned.
  let steps = M.grammarCards.planRound({ now: NOON + 60000 });
  assert.equal(steps.filter((s) => s.kind === 'intro').length, 0);
  assert.ok(steps.every((s) => s.pattern === all[0] || s.pattern === all[1]));
  // Next day: one new pattern per round.
  steps = M.grammarCards.planRound({ now: NOON + DAY });
  assert.deepEqual(steps.filter((s) => s.kind === 'intro').map((s) => s.pattern.id), [all[2].id]);
  // With many patterns due, no new one: the reviews come first.
  for (const g of all.slice(0, 6)) Object.assign(M.srs.record(g.id), { stage: 3, due: NOON - DAY, interval: 3 * DAY, introduced: NOON - 9 * DAY });
  steps = M.grammarCards.planRound({ now: NOON + 2 * DAY });
  assert.equal(steps.filter((s) => s.kind === 'intro').length, 0);
  const due = new Set(steps.map((s) => s.pattern.id));
  for (const g of all.slice(0, 6)) assert.ok(due.has(g.id), `${g.id} is due`);
});

test('Grammar Cards prefers sentences whose words you know', () => {
  M.store.reset();
  M.utils.random = Math.random;
  const g = M.content.grammar().find((p) => p.questions.some((q) => q.needs.length));
  const target = g.questions.find((q) => q.needs.length);
  for (const id of target.needs) M.srs.introduce(id, NOON);
  const picked = M.grammarCards.pickQuestions(g, 1, 'all', new Set());
  assert.ok(picked[0].needs.every((id) => M.srs.isIntroduced(id)), picked[0].id);
});
