const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;
const H = M.honorifics;

function learnWords() {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('the honorifics items are well-formed: every level, each about someone you respect and someone else', () => {
  const items = M.content.honorifics();
  assert.ok(items.length >= 30, `${items.length} items`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('honor')), []);
  for (const level of [1, 2, 3]) assert.ok(items.some((it) => it.level === level), `level ${level}`);
  for (const who of ['self', 'younger']) assert.ok(items.some((it) => it.plain.who === who), `a plain side about ${who}`);
  for (const it of items) for (const id of it.needs) assert.ok(M.content.word(id).level <= it.level, `${it.id}: ${id} is harder than the item`);
  const card = M.content.honorCard();
  assert.ok(card.sections.length >= 3 && card.table.length >= 8);
});

test('Honorifics opens once the key words are known: due items first, a few new ones a round', () => {
  M.store.reset();
  assert.equal(H.pickRound(NOON).length, 0, 'nothing before any words are learned');
  assert.ok(H.nextLocked());
  learnWords();
  const first = H.pickRound(NOON);
  assert.equal(first.length, M.config.session.honorifics.newPerRound, 'a few new items at a time');
  assert.ok(first.every((it) => it.level === 1), 'the easiest first');
  const known = M.content.honorifics().find((it) => it.level === 2);
  M.srs.introduce(known.id, NOON - 3 * DAY);
  assert.equal(H.pickRound(NOON)[0].id, known.id, 'a due item comes first');
});

test('a new item starts with "which plain word?", then a blank about someone you respect', () => {
  learnWords();
  const steps = H.planRound(NOON);
  for (const id of new Set(steps.map((s) => s.item.id))) {
    const kinds = steps.filter((s) => s.item.id === id).map((s) => s.kind);
    assert.equal(kinds[0], 'meaning', id);
    if (kinds[1]) assert.equal(kinds[1], 'honor', id);
  }
  const it = M.content.honorifics()[0];
  assert.equal(H.kindFor(it, 1), 'honor');
  for (let i = 0; i < 20; i++) assert.ok(['honor', 'plain'].includes(H.kindFor(it, 3)));
});

test('every question has exactly one right option, three different ones, and every wrong one explained', () => {
  learnWords();
  for (let round = 0; round < 5; round++) {
    for (const it of M.content.honorifics()) {
      const questions = [H.question(it, 'meaning'), ...it.traps.flatMap((trap) => [H.question(it, 'honor', { trap }), H.question(it, 'plain', { trap })])];
      for (const q of questions) {
        const label = `${it.id} ${q.kind}`;
        assert.equal(q.options.length, 3, `${label}: three options`);
        assert.equal(q.options.filter((o) => o.correct).length, 1, `${label}: one right option`);
        assert.equal(new Set(q.options.map((o) => o.text)).size, 3, `${label}: three different options`);
        for (const o of q.options.filter((x) => !x.correct)) assert.ok(o.why, `${label}: "${o.text}" is explained`);
        const right = q.options.find((o) => o.correct).text;
        assert.equal(right, q.kind === 'honor' ? it.honor.answer : it.plain.answer, label);
      }
    }
  }
});

test('"which plain word?" never offers another form of the same verb', () => {
  for (const it of M.content.honorifics()) {
    for (const other of H.otherPlain(it)) {
      assert.notEqual(other.plain.dict, it.plain.dict, `${it.id} / ${other.id}`);
      assert.notEqual(other.honor.dict, it.honor.dict, `${it.id} / ${other.id}`);
    }
  }
});

test('"which plain word?" offers words of the same kind first: a noun for a noun, a past verb for a past verb', () => {
  for (const it of M.content.honorifics()) {
    const same = new Set(H.otherPlain(it).filter((x) => H.formOf(x.plain) === H.formOf(it.plain)).map((x) => x.plain.answer));
    for (let i = 0; i < 5; i++) {
      const wrong = H.question(it, 'meaning').options.filter((o) => !o.correct);
      assert.equal(wrong.filter((o) => same.has(o.text)).length, Math.min(2, same.size), it.id);
    }
  }
  assert.equal(H.formOf({ answer: '집에', dict: '집' }), 'noun');
  assert.equal(H.formOf({ answer: '갔어요', dict: '가다' }), 'past');
  assert.equal(H.formOf({ answer: '있어요', dict: '있다' }), 'present');
  assert.equal(H.formOf({ answer: '잘 거예요', dict: '자다' }), 'future');
});

test('the Honorifics badge counts right answers', () => {
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'honor-50');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('honorCorrect', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the checker catches a broken honorifics item', () => {
  M.content.registerHonorifics({
    items: [{ id: 'broken', level: 4, words: ['cafe:nothing'], honor: { ko: '가세요. 가세요.', en: 'x', answer: '가세요', dict: '가시다' }, plain: { ko: '가요.', en: 'y', answer: '와요', dict: '가다', who: 'nobody' }, traps: [{ text: '가세요', why: 'z' }] }],
  });
  const problems = M.content.check().filter((p) => p.includes('honor:broken'));
  for (const expected of [/level 1, 2 or 3/, /exactly once/, /"who" must be/, /unknown word/, /one of the right answers/]) {
    assert.ok(problems.some((p) => expected.test(p)), `reports ${expected}`);
  }
});
