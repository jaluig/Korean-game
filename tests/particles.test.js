const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang();
const P = M.particles;

test('particles are found inside tiles, but not inside words', () => {
  assert.deepEqual({ ...P.split('커피를'), particle: undefined }, { stem: '커피', form: '를', particle: undefined, punct: '' });
  assert.equal(P.split('집에서').form, '에서');
  assert.equal(P.split('학교에').form, '에');
  assert.equal(P.split('빵이').stem, '빵');
  assert.equal(P.split('사과'), null, '사과 is a word, not 사 + 과');
  assert.equal(P.split('같이'), null);
  assert.equal(P.split('주세요'), null);
  assert.equal(P.split('커피을'), null, 'only textbook forms count');
});

test('the right form follows the last sound', () => {
  assert.equal(P.rightForm('커피', 'eul'), '를');
  assert.equal(P.rightForm('빵', 'eul'), '을');
  assert.equal(P.rightForm('집', 'euro'), '으로');
  assert.equal(P.rightForm('버스', 'euro'), '로');
  assert.equal(P.rightForm('지하철', 'euro'), '로', 'ㄹ takes 로');
});

test('every drill has one right answer and clearly wrong options, each explained', () => {
  let count = 0;
  for (const s of M.content.sentences()) {
    for (const d of P.drills(s)) {
      count++;
      const label = `${s.id} #${d.index}`;
      assert.ok(d.options.length >= 3 && d.options.length <= 4, label);
      assert.equal(d.options.filter((o) => o.correct).length, 1, label);
      assert.equal(d.options.find((o) => o.correct).text, d.answer, label);
      assert.equal(new Set(d.options.map((o) => o.text)).size, d.options.length, `${label} options are distinct`);
      assert.equal(s.tiles[d.index], `${d.stem}${d.answer}${d.punct}`, label);
      for (const o of d.options) assert.ok(o.why && o.why.length > 10, `${label} ${o.text}`);
    }
  }
  assert.ok(count >= 20, `${count} drills`);
});

test('hand-written traps are used as wrong options', () => {
  const d = P.drills(M.content.sentence('day:s-gohome'))[0];
  const eseo = d.options.find((o) => o.text === '에서');
  assert.ok(eseo && /에 marks where you are going/.test(eseo.why));
});
