const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;
const S = M.stories;

function learnWords() {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('every story is well-formed: parts with questions about their own lines', () => {
  const list = M.content.stories();
  assert.ok(list.length >= 8, `${list.length} stories`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('story')), []);
  for (const level of [1, 2, 3]) assert.ok(list.some((st) => st.level === level), `level ${level}`);
  for (const st of list) {
    assert.ok(st.parts.length >= 2 && st.parts.length <= 4, `${st.id}: parts`);
    for (const id of st.needs) assert.ok(M.content.word(id).level <= st.level, `${st.id}: ${id} is harder than the story`);
    for (const part of st.parts) {
      assert.ok(part.questions.length >= 1, `${st.id}: a question after each part`);
      for (const q of part.questions) {
        assert.equal(q.options.length, 3, `${st.id}: three options`);
        for (const n of [].concat(q.line)) assert.ok(part.lines[n], `${st.id}: the answer's line is in its part`);
      }
      // Every line reaches the voice without digits.
      for (const l of part.lines) assert.doesNotMatch(l.say || M.numbers.readAloud(l.ko), /\d/, `${st.id}: ${l.ko}`);
    }
    assert.equal(S.questionCount(st), st.parts.reduce((n, p) => n + p.questions.length, 0));
  }
});

test('Stories opens once the key words are known: one story a round, due and new ones first', () => {
  M.store.reset();
  assert.deepEqual(S.pickRound('all', NOON), []);
  assert.ok(S.nextLocked());
  learnWords();
  const first = S.pickRound('all', NOON);
  assert.equal(first.length, 1);
  assert.equal(first[0].level, 1, 'the easiest first');
  M.srs.review(first[0].id, 'good', NOON);
  const second = S.pickRound('all', NOON + 1000);
  assert.notEqual(second[0], first[0], 'then another');
  M.srs.review(first[0].id, 'again', NOON + 2000);
  assert.equal(S.pickRound('all', NOON + 3000)[0], first[0], 'a missed one comes back first');
});

test('Stories prefers the focus topic', () => {
  learnWords();
  for (const st of M.content.stories().slice(0, 4)) assert.equal(S.pickRound(st.topic, NOON)[0].topic, st.topic);
});

test('the narrator reads every line in the story’s voice, at the normal pitch, numbers in Hangul', () => {
  const female = { name: 'Yuna', voiceURI: 'yuna' };
  const male = { name: 'Microsoft InJoon', voiceURI: 'injoon' };
  const said = [];
  M.speech = { voice: () => female, voices: () => [female, male], speak: (text, opts) => said.push({ text, ...opts }) && true, stop: () => {} };
  for (const voice of ['high', 'low']) {
    const st = M.content.stories().find((x) => x.voice === voice);
    if (!st) continue;
    said.length = 0;
    S.reader(st, st.parts[0].lines).line(1);
    assert.equal(said.length, 1);
    assert.equal(said[0].text, st.parts[0].lines[1].say || M.numbers.readAloud(st.parts[0].lines[1].ko));
    assert.equal(said[0].voice, voice === 'low' ? male : female, `${voice}: a ${voice === 'low' ? 'man' : 'woman'}’s voice`);
    assert.equal(said[0].pitch, 1);
  }
});

test('the Stories badge counts stories heard to the end', () => {
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'stories-10');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('storiesHeard', 10);
  assert.equal(badge.earned(M.store.state), true);
});

test('the checker catches a broken story', () => {
  M.content.registerStories([{ id: 'broken', topic: 'nowhere', level: 1, title: { ko: '제목', en: 'Title' }, voice: 'loud', words: [], parts: [{ lines: [{ ko: '3개 있어요.', en: '' }], questions: [{ q: { ko: '?', en: '?' }, options: [{ ko: 'a', en: 'a' }], answer: 0, line: 5 }] }] }]);
  const problems = M.content.check().filter((p) => p.includes('story:broken'));
  for (const expected of [/unknown topic/, /kind/, /voice/, /2–4 parts/, /key words/, /2\+ lines/, /needs ko and en/, /3 different options/, /"line" must point/, /needs "why"/]) {
    assert.ok(problems.some((p) => expected.test(p)), `reports ${expected}`);
  }
});
