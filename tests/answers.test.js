const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang({ content: false });
const A = M.answers;
const word = (en, extra = {}) => ({ ko: '물', en, ...extra });

test('English answers accept any alternative and skip little words', () => {
  const ok = (en, typed) => assert.ok(A.matchEnglish(word(en), typed).ok, `${en} ← ${typed}`);
  const no = (en, typed) => assert.ok(!A.matchEnglish(word(en), typed).ok, `${en} ← ${typed}`);
  ok('home / house', 'house');
  ok('home / house', 'Home');
  ok("it's okay / I'm fine", 'fine');
  ok("it's okay / I'm fine", 'its okay');
  ok('this (thing)', 'this');
  ok('this (thing)', 'this thing');
  ok('three (native number)', 'three');
  ok('go', 'to go');
  ok("it's delicious", 'delicious');
  ok('café', 'cafe');
  ok('favourite', 'favorite');
  ok('practise', 'practice');
  ok('strawberry', 'strawbery', 'one typo in a longer word');
  ok('get up / wake up', 'wake up');
  ok('water', { toString: () => 'water' });
  no('water', 'wine');
  no('tea', 'toe', 'no typos forgiven in short words');
  no('water', '');
  assert.equal(A.matchEnglish(word('water'), 'water').exact, true);
  assert.equal(A.matchEnglish(word('strawberry'), 'strawbery').exact, false);
});

test('extra English answers can be listed per word', () => {
  assert.ok(A.matchEnglish(word('please give me', { enAlt: ['please'] }), 'please').ok);
});

test('Korean answers ignore spaces and punctuation, and allow accepted forms', () => {
  assert.ok(A.matchKorean({ ko: '얼마예요?' }, '얼마예요'));
  assert.ok(A.matchKorean({ ko: '아이스 아메리카노' }, '아이스아메리카노'));
  assert.ok(A.matchKorean({ ko: '감사합니다', accept: ['고맙습니다'] }, '고맙습니다'));
  assert.ok(!A.matchKorean({ ko: '물' }, '불'));
});
