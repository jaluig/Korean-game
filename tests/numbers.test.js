const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang({ content: false });
const N = M.numbers;

test('Sino-Korean numbers drop 일 before 십, 백, 천 and 만, and space by 만', () => {
  const cases = {
    0: '영', 1: '일', 6: '육', 10: '십', 11: '십일', 16: '십육', 20: '이십', 99: '구십구',
    100: '백', 110: '백십', 1000: '천', 1500: '천오백', 2019: '이천십구', 3500: '삼천오백',
    10000: '만', 12500: '만 이천오백', 20000: '이만', 45000: '사만 오천', 100000: '십만',
    110000: '십일만', 1000000: '백만', 12345678: '천이백삼십사만 오천육백칠십팔', 100000000: '일억',
  };
  for (const [n, reading] of Object.entries(cases)) assert.equal(N.sino(Number(n)), reading, n);
});

test('native Korean numbers, and their short forms before a counter', () => {
  const plain = { 1: '하나', 2: '둘', 3: '셋', 4: '넷', 5: '다섯', 10: '열', 11: '열하나', 20: '스물', 21: '스물하나', 30: '서른', 99: '아흔아홉' };
  for (const [n, reading] of Object.entries(plain)) assert.equal(N.native(Number(n)), reading, n);
  const short = { 1: '한', 2: '두', 3: '세', 4: '네', 5: '다섯', 10: '열', 11: '열한', 12: '열두', 20: '스무', 21: '스물한', 24: '스물네', 30: '서른' };
  for (const [n, reading] of Object.entries(short)) assert.equal(N.nativeBefore(Number(n)), reading, n);
});

test('counters use their own number system', () => {
  assert.equal(N.count(3, '개'), '세 개');
  assert.equal(N.count(1, '잔'), '한 잔');
  assert.equal(N.count(2, '병'), '두 병');
  assert.equal(N.count(20, '살'), '스무 살');
  assert.equal(N.count(30, '분'), '삼십 분');
  assert.equal(N.count(3, '층'), '삼 층');
  assert.equal(N.count(5000, '원'), '오천 원');
});

test('times, months, dates, prices and ages', () => {
  assert.equal(N.time(3, 30), '세 시 삼십 분');
  assert.equal(N.time(3, 30, { half: true }), '세 시 반');
  assert.equal(N.time(12, 0), '열두 시');
  assert.equal(N.time(15, 5), '세 시 오 분');
  assert.equal(N.time(11, 45), '열한 시 사십오 분');
  assert.equal(N.time(0, 10), '열두 시 십 분');
  assert.deepEqual([1, 6, 10, 11, 12].map(N.month), ['일월', '유월', '시월', '십일월', '십이월']);
  assert.equal(N.date(3, 15), '삼월 십오일');
  assert.equal(N.price(12500), '만 이천오백 원');
  assert.equal(N.price(10000), '만 원');
  assert.equal(N.won(12500), '12,500원');
  assert.equal(N.age(25), '스물다섯 살');
  assert.equal(N.age(20), '스무 살');
  assert.deepEqual(N.breakdown(12500).map((p) => p.ko), ['만', '이천', '오백']);
  assert.deepEqual(N.breakdown(150000).map((p) => p.ko), ['십오만']);
});

test('typical number mistakes are wrong, and explained', () => {
  const price = N.priceMistakes(3000);
  assert.ok(price.some((m) => m.text === '세천 원' && /Sino-Korean/.test(m.why)));
  assert.ok(price.some((m) => m.text === '삼백 원'));
  assert.ok(!price.some((m) => m.text === N.price(3000)));

  const time = N.timeMistakes(3, 30);
  for (const text of ['삼 시 삼십 분', '세 시 서른 분', '셋 시 삼십 분']) assert.ok(time.some((m) => m.text === text), text);
  assert.ok(!time.some((m) => m.text === '세 시 삼십 분'));

  const count = N.countMistakes(3, '개', { noun: '사과', wrongCounter: '잔' });
  for (const text of ['사과 삼 개', '사과 셋 개', '사과 세 잔']) assert.ok(count.some((m) => m.text === text), text);
  assert.ok(!count.some((m) => m.text === '사과 세 개'));

  const age = N.ageMistakes(20);
  for (const text of ['이십 살', '스물 살']) assert.ok(age.some((m) => m.text === text), text);
  for (const list of [price, time, count, age]) for (const m of list) assert.ok(m.why, m.text);
});
