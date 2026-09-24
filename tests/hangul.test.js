const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang({ content: false });
const H = M.hangul;
const type = (keys) => H.assemble([...keys]);

test('decompose and compose are inverses', () => {
  assert.deepEqual({ ...H.decompose('닭') }, { initial: 'ㄷ', vowel: 'ㅏ', final: 'ㄺ' });
  assert.deepEqual({ ...H.decompose('가') }, { initial: 'ㄱ', vowel: 'ㅏ', final: '' });
  assert.equal(H.compose('ㄷ', 'ㅏ', 'ㄺ'), '닭');
  assert.equal(H.compose('ㄱ', 'ㅏ'), '가');
  assert.equal(H.decompose('a'), null);
  assert.equal(H.compose('ㄳ', 'ㅏ'), null);
});

test('the typing automaton behaves like a 2-set Korean IME', () => {
  assert.equal(type('ㄱㅏㄴ'), '간');
  assert.equal(type('ㄱㅏㄴㅏ'), '가나'); // the final jumps to the next syllable
  assert.equal(type('ㄷㅏㄹㄱ'), '닭'); // double final
  assert.equal(type('ㄷㅏㄹㄱㅏ'), '달가'); // …and splits again before a vowel
  assert.equal(type('ㅇㅗㅐ'), '왜'); // compound vowel
  assert.equal(type('ㅃㅏㅇ'), '빵');
  assert.equal(type('ㅇㅏㅃㅏ'), '아빠'); // ㅃ can never be a final
  assert.equal(type('ㄱ'), 'ㄱ');
  assert.equal(type('ㅏ'), 'ㅏ');
  assert.equal(type('ㄱㄴ'), 'ㄱㄴ');
  assert.equal(type('ㅁㅜㄹ ㅈㅜㅅㅔㅇㅛ'), '물 주세요');
});

test('toKeys → assemble round-trips real words', () => {
  const words = ['괜찮아요', '없어요', '읽어요', '맛있어요', '감사합니다', '아이스 아메리카노', '포장해 주세요', '같이', '뚫어요', '의사', '왜요', '얼마예요?', '갈비'];
  for (const word of words) assert.equal(H.assemble(H.toKeys(word)), word, word);
});

test('backspace removes one keystroke at a time', () => {
  const keys = H.toKeys('닭');
  assert.deepEqual(keys, ['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ']);
  assert.equal(H.assemble(keys.slice(0, -1)), '달');
  assert.equal(H.assemble(keys.slice(0, -2)), '다');
  assert.equal(H.assemble(keys.slice(0, -3)), 'ㄷ');
});

test('physical keys map to the 2-set layout, with Shift for tense consonants', () => {
  assert.equal(H.letterForKey('KeyQ'), 'ㅂ');
  assert.equal(H.letterForKey('KeyQ', true), 'ㅃ');
  assert.equal(H.letterForKey('KeyO', true), 'ㅒ');
  assert.equal(H.letterForKey('KeyA', true), 'ㅁ'); // no shifted form → plain letter
  assert.equal(H.letterForKey('Digit1'), null);
  const all = H.LAYOUT_ROWS.flat().map((code) => H.letterForKey(code));
  assert.equal(new Set(all).size, 26);
});

test('particles follow the final consonant', () => {
  assert.equal(H.particle('커피', '을/를'), '를');
  assert.equal(H.particle('물', '을/를'), '을');
  assert.equal(H.particle('빵', '이/가'), '이');
  assert.equal(H.particle('김치', '이/가'), '가');
  assert.equal(H.particle('저', '은/는'), '는');
  assert.equal(H.particle('서울', '으로/로'), '로'); // ㄹ takes 로
  assert.equal(H.particle('집', '으로/로'), '으로');
  assert.equal(H.hasFinal('얼마예요?'), false);
});

test('explainDifference pinpoints the confused letter', () => {
  const tense = H.explainDifference('딸기', '달기');
  assert.equal(tense.index, 0);
  assert.equal(tense.kind, 'initial');
  assert.match(tense.tip, /tense/);

  assert.match(H.explainDifference('물', '불').tip, /“m”/);
  assert.match(H.explainDifference('카페', '카패').tip, /sound almost the same/);
  assert.match(H.explainDifference('감', '간').tip, /lips/);
  assert.match(H.explainDifference('가', '간').tip, /no final consonant/);
  assert.match(H.explainDifference('간', '가').tip, /Don't forget/);
  assert.equal(H.explainDifference('포장해 주세요', '포장해주세요'), null);
  assert.equal(H.explainDifference('물', '물이'), null);
});

test('lookalikes returns valid, different syllables', () => {
  for (let i = 0; i < 20; i++) {
    const alts = H.lookalikes('딸', 4);
    assert.ok(alts.length > 0);
    for (const s of alts) {
      assert.ok(H.isSyllable(s));
      assert.notEqual(s, '딸');
    }
  }
});

test('spellingDistance counts keystrokes', () => {
  assert.equal(H.spellingDistance('물', '물'), 0);
  assert.equal(H.spellingDistance('물', '불'), 1);
  assert.equal(H.spellingDistance('포장해 주세요', '포장해주세요'), 0);
});
