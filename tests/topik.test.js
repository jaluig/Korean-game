const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang();
const T = M.topik;
const cfg = M.config.session.topik;

test('the TOPIK I questions are well-formed, and there are enough for every kind of test', () => {
  const problems = M.content.check().filter((p) => p.includes('topik'));
  assert.deepEqual(problems, []);
  for (const kind of Object.keys(T.KINDS)) assert.ok(T.ready(kind), `${kind}: enough questions for a whole test`);
  // Every blueprint slot has a few items to choose from, so tests don't repeat straight away.
  for (const section of ['listening', 'reading']) {
    for (const [types, count] of cfg.blueprint[section]) {
      const n = M.content.topik(section).filter((t) => [].concat(types).includes(t.type)).length;
      assert.ok(n >= 2 * count, `${section} ${[].concat(types).join('/')}: ${n} items`);
    }
  }
});

test('a test follows the real test: its kinds of questions in order, numbered across the sections', () => {
  M.store.reset();
  const t = T.build('full', NOON);
  assert.deepEqual(t.sections.map((s) => s.section), ['listening', 'reading']);
  const numbers = t.sections.flatMap((s) => s.pages.flatMap((p) => p.questions.map((x) => x.number)));
  assert.deepEqual(numbers, Array.from({ length: 20 }, (_, i) => i + 1));
  for (const s of t.sections) {
    const expected = cfg.blueprint[s.section].flatMap(([types, count]) => Array(count).fill([].concat(types)));
    assert.equal(s.pages.length, expected.length);
    s.pages.forEach((p, i) => assert.ok(expected[i].includes(p.item.type), `${s.section} page ${i + 1}: ${p.item.type}`));
    assert.equal(new Set(s.pages.map((p) => p.item.id)).size, s.pages.length, 'no item twice in a test');
  }
  assert.deepEqual(T.size('listening'), { questions: 10, minutes: 13 });
  assert.deepEqual(T.size('reading'), { questions: 10, minutes: 15 });
  assert.deepEqual(T.size('full'), { questions: 20, minutes: 28 });
});

test('options are shuffled, except the places ㉠–㉣, and the right one is tracked', () => {
  M.store.reset();
  for (let i = 0; i < 20; i++) {
    const t = T.build('reading', NOON);
    for (const p of t.sections[0].pages) {
      for (const x of p.questions) {
        assert.equal(x.order[x.answer], x.q.answer, 'the shown answer is the right option');
        assert.deepEqual([...x.order].sort(), [0, 1, 2, 3]);
        if (T.keepsOrder(x.q)) assert.deepEqual(x.order, [0, 1, 2, 3]);
      }
    }
  }
});

test('the items seen least recently come first', () => {
  M.store.reset();
  const replies = M.content.topik('listening').filter((t) => t.type === 'reply');
  const fresh = replies.slice(0, 2);
  for (const item of replies.slice(2)) T.markSeen(item, NOON);
  const t = T.build('listening', NOON + 1000);
  const picked = t.sections[0].pages.filter((p) => p.item.type === 'reply').map((p) => p.item.id);
  assert.deepEqual(picked.sort(), fresh.map((x) => x.id).sort());
});

test('the score: out of 100 a section, 200 for both, and the level it stands for', () => {
  M.store.reset();
  assert.equal(T.levelFor(70), 2);
  assert.equal(T.levelFor(69.5), 1);
  assert.equal(T.levelFor(40), 1);
  assert.equal(T.levelFor(39), 0);
  const t = T.build('full', NOON);
  const [listening, reading] = t.sections.map((s) => s.pages.flatMap((p) => p.questions));
  listening.forEach((x, i) => (x.chosen = i < 7 ? x.answer : (x.answer + 1) % 4)); // 7 of 10
  reading.forEach((x, i) => (x.chosen = i < 6 ? x.answer : null)); // 6 of 10, 4 left out
  const result = T.score(t);
  assert.deepEqual(result.parts.map((p) => [p.section, p.correct, p.total, p.score]), [['listening', 7, 10, 70], ['reading', 6, 10, 60]]);
  assert.equal(result.score, 130);
  assert.equal(result.max, 200);
  assert.equal(result.level, 1, '130 of 200: level 1 (level 2 needs 140)');
  reading.forEach((x) => (x.chosen = x.answer));
  assert.equal(T.score(t).level, 2);
});

test('finished tests are remembered: the newest first, the best of each kind, and two badges', () => {
  M.store.reset();
  const badge = (id) => M.progress.BADGES.find((b) => b.id === id).earned(M.store.state);
  assert.equal(badge('topik-first'), false);
  const take = (kind, right, at) => {
    const t = T.build(kind, at - 60000);
    t.sections.flatMap((s) => s.pages.flatMap((p) => p.questions)).forEach((x, i) => (x.chosen = i < right ? x.answer : (x.answer + 1) % 4));
    const result = T.score(t);
    T.record(t, result, at);
    return result;
  };
  take('reading', 5, NOON);
  assert.equal(badge('topik-first'), true);
  assert.equal(badge('topik-2'), false);
  take('full', 13, NOON + 1000); // 100 + 30
  assert.equal(badge('topik-2'), false);
  take('full', 15, NOON + 2000); // 100 + 50 = 150
  assert.equal(badge('topik-2'), true);
  take('full', 4, NOON + 3000);
  const history = T.history();
  assert.deepEqual(history.map((r) => r.score), [40, 150, 130, 50]);
  assert.equal(history[0].ms, 60000);
  assert.equal(T.best('full'), 150);
  assert.equal(T.best('reading'), 50);
  assert.equal(T.best('listening'), null, 'not taken yet');
  for (let i = 0; i < cfg.history + 5; i++) take('listening', 3, NOON + 10000 + i);
  assert.equal(T.history().length, cfg.history);
});

test('the TOPIK checker catches authoring mistakes', () => {
  M.content.registerTopik({
    listening: [
      { id: 'bad-type', type: 'riddle', script: [], questions: [{}] },
      { id: 'bad-reply', type: 'reply', script: [{ who: 'x', ko: '3시에 와요?', en: 'x' }], questions: [{ options: ['a', 'b'], answer: 5 }] },
      { id: 'bad-idea', type: 'idea', whose: 'm', script: [{ who: 'w', ko: '가', en: 'a' }, { who: 'w', ko: '나', en: 'b' }, { who: 'w', ko: '다', en: 'c' }], questions: [{ options: [{ ko: '1', en: '1' }, { ko: '2', en: '2' }, { ko: '3', en: '3' }, { ko: '4', en: '4' }], answer: 0, why: 'x' }] },
      { id: 'bad-numbers', type: 'next', script: [{ who: 'w', ko: '3 주세요.', en: 'Three, please.' }], questions: [{ options: [{ ko: '1', en: '1' }, { ko: '2', en: '2' }, { ko: '3', en: '3' }, { ko: '4', en: '4' }], answer: 0, why: 'x' }] },
    ],
    reading: [
      { id: 'bad-blank', type: 'blank', text: [{ ko: '배가 고픕니다. 밥을 먹습니다.', en: 'x' }], questions: [{ options: [{ ko: '1', en: '1' }, { ko: '2', en: '2' }, { ko: '3', en: '3' }, { ko: '4', en: '4' }], answer: 0, why: 'x' }] },
      { id: 'bad-notice', type: 'notice', notice: { kind: 'flyer', lines: [] }, questions: [{ options: [{ ko: '1', en: '1' }, { ko: '2', en: '2' }, { ko: '3', en: '3' }, { ko: '4', en: '4' }], answer: 0, why: 'x' }] },
      { id: 'bad-order', type: 'order', text: [{ ko: '가', en: 'a' }, { ko: '나', en: 'b' }, { ko: '다', en: 'c' }, { ko: '라', en: 'd' }], questions: [{ options: ['(가)-(나)-(다)-(라)', '(가)-(가)-(다)-(라)', '(나)-(가)-(다)-(라)', '(다)-(가)-(나)-(라)'], answer: 0, why: 'x' }] },
      { id: 'bad-set', type: 'set', text: [{ ko: '하나 (㉠)', en: 'a' }, { ko: '둘', en: 'b' }, { ko: '셋', en: 'c' }], questions: [{ q: { ko: '다음 문장이 들어갈 곳은?', en: 'Where?' }, options: ['㉠', '㉡', '㉢', '㉣'], answer: 0, why: 'x' }] },
    ],
  });
  const found = M.content.check().filter((p) => p.includes(':bad-'));
  const has = (re) => assert.ok(found.some((p) => re.test(p)), `expected a problem matching ${re}\n${found.join('\n')}`);
  has(/bad-type: unknown listening type "riddle"/);
  has(/bad-reply line 0: who is 'm'/);
  has(/bad-reply question 1: needs 4 different options/);
  has(/bad-reply question 1: answer must be an option index/);
  has(/bad-reply question 1: needs "why"/);
  has(/bad-idea: "whose"/);
  has(/bad-numbers line 0: write the number in Hangul/);
  has(/bad-blank: the text needs exactly one blank/);
  has(/bad-notice: notice.kind is one of/);
  has(/bad-notice: the notice needs a title/);
  has(/bad-order question 1: each option is an order/);
  has(/bad-set: a "set" has 2 questions/);
  has(/bad-set question 1: needs quote/);
  has(/bad-set question 1: the text needs each of ㉠ ㉡ ㉢ ㉣ once/);
});

test('a badly broken TOPIK item is reported, not thrown', () => {
  M.content.registerTopik({
    listening: [
      { id: 'broken-script', type: 'place', script: 'not a list', questions: [null] },
      { id: 'broken-lines', type: 'topic', script: [null, null], questions: [{ q: { en: 'no Korean' }, options: [null, 1], answer: 0 }] },
    ],
    reading: [{ id: 'broken-set', type: 'set', text: [{ ko: '( ㉠ )', en: 'x' }, null, { ko: '셋', en: 'c' }], questions: [{ q: { en: '㉠?' } }, 'nope'] }],
  });
  let found;
  assert.doesNotThrow(() => (found = M.content.check().filter((p) => p.includes(':broken-'))));
  assert.ok(found.some((p) => /broken-script: a listening "place" needs 2 lines/.test(p)));
  assert.ok(found.some((p) => /broken-script question 1: not a question/.test(p)));
  assert.ok(found.some((p) => /broken-lines question 1: needs q/.test(p)));
  assert.ok(found.some((p) => /broken-set question 2: not a question/.test(p)));
});
