const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;

function learnWords() {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('every reading text is well-formed, and every topic has one', () => {
  const list = M.content.readings();
  assert.ok(list.length >= 12, `${list.length} texts`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('reading')), []);
  for (const topic of M.content.topics()) assert.ok(list.some((r) => r.topic === topic.id), `no text for ${topic.id}`);
  for (const r of list) {
    assert.ok([1, 2, 3].includes(r.level), `${r.id}: level`);
    assert.ok(r.needs.length >= 1, `${r.id}: key words`);
    for (const id of r.needs) assert.ok(M.content.word(id).level <= r.level, `${r.id}: ${id} is harder than the text`);
    assert.ok(r.questions.length >= 2, `${r.id}: questions`);
    for (const q of r.questions) {
      assert.equal(q.options.length, 3, `${r.id}: three options`);
      for (const n of [].concat(q.line)) assert.ok(r.sentences[n], `${r.id}: the answer's sentence`);
    }
  }
});

test('the checker catches a broken reading text', () => {
  const bad = { id: 'x', topic: 'nowhere', level: 1, kind: { ko: '메모' }, title: { ko: '제목', en: 'Title' }, sentences: [{ ko: '안녕하세요.', en: 'Hello.' }], words: ['cafe:nothing'], questions: [] };
  // (it stays registered, but it never opens: its word doesn't exist)
  const before = M.content.readings().length;
  M.content.registerReadings([bad]);
  const problems = M.content.check().filter((p) => p.includes('reading:x'));
  assert.ok(problems.some((p) => /topic/.test(p)), 'unknown topic');
  assert.ok(problems.some((p) => /kind/.test(p)), 'kind needs ko and en');
  assert.ok(problems.some((p) => /sentence/.test(p)), 'too short');
  assert.ok(problems.some((p) => /cafe:nothing/.test(p)), 'unknown word');
  assert.ok(problems.some((p) => /question/.test(p)), 'no questions');
  assert.equal(M.content.readings().length, before + 1);
});

test('Reading opens once the key words are known, due and new ones first', () => {
  M.store.reset();
  assert.deepEqual(M.reading.pickRound('all', NOON), []);
  assert.ok(M.reading.nextLocked());
  learnWords();
  const size = M.config.session.reading.perRound;
  const first = M.reading.pickRound('all', NOON);
  assert.equal(first.length, size);
  assert.ok(first.every((r) => r.level === 1), 'the easiest first');
  for (const r of first) M.srs.review(r.id, 'good', NOON);
  const second = M.reading.pickRound('all', NOON + 1000);
  assert.ok(second.every((r) => !first.includes(r)), 'then others');
  M.srs.review(first[0].id, 'again', NOON + 2000);
  assert.equal(M.reading.pickRound('all', NOON + 3000)[0], first[0], 'a missed one comes back first');
});

test('Reading prefers the focus topic', () => {
  learnWords();
  for (const topic of ['weather', 'hobbies']) {
    const picked = M.reading.pickRound(topic, NOON);
    assert.ok(picked.length);
    assert.equal(picked[0].topic, topic);
  }
});

test('the reader reads every sentence in one voice, at the normal pitch', () => {
  const voice = { name: 'Yuna', voiceURI: 'yuna' };
  const said = [];
  M.speech = { voice: () => voice, voices: () => [voice], speak: (text, opts) => said.push({ text, ...opts }) && true, stop: () => {} };
  const r = M.content.readings()[0];
  M.reading.reader(r).line(1);
  assert.equal(said.length, 1);
  assert.equal(said[0].text, r.sentences[1].say || M.numbers.readAloud(r.sentences[1].ko));
  assert.equal(said[0].voice, voice);
  assert.equal(said[0].pitch, 1);
});

test('numbers in digits are read aloud in Hangul, in the right system', () => {
  const read = M.numbers.readAloud;
  assert.equal(read('커피는 3,500원이에요.'), '커피는 삼천오백 원이에요.');
  assert.equal(read('수업은 7시 30분에 시작해요.'), '수업은 일곱 시 삼십 분에 시작해요.');
  assert.equal(read('1시간 30분 걸려요.'), '한 시간 삼십 분 걸려요.');
  assert.equal(read('학생이 8명 있어요. 20살이에요.'), '학생이 여덟 명 있어요. 스무 살이에요.');
  assert.equal(read('6월 15일, 10월'), '유월 십오 일, 시월');
  assert.equal(read('2번 출구'), '2번 출구', '번 can be "times" or "number …": left for "say"');
  assert.equal(read('안녕하세요'), '안녕하세요');
  // Every sentence of every text reaches the voice without digits.
  for (const r of M.content.readings()) for (const s of r.sentences) assert.doesNotMatch(s.say || read(s.ko), /\d/, `${r.id}: ${s.ko}`);
});

test('reading and role-play badges', () => {
  M.store.reset();
  const ids = M.progress.BADGES.map((b) => b.id);
  assert.ok(ids.includes('bookworm') && ids.includes('role-play'));
  assert.equal(new Set(M.progress.BADGES.map((b) => b.emoji)).size, ids.length, 'every badge has its own emoji');
  const s = M.store.state;
  const badge = (id) => M.progress.BADGES.find((b) => b.id === id);
  assert.equal(badge('bookworm').earned(s), false);
  s.totals.readingsDone = 10;
  s.totals.rolePlayGood = 20;
  assert.equal(badge('bookworm').earned(s), true);
  assert.equal(badge('role-play').earned(s), true);
});

test('a role-play line said well is rewarded once a day, points left to the game', () => {
  M.store.reset();
  const points = M.store.state.totals.points;
  assert.equal(M.progress.rewardSpeech('안녕하세요', NOON, { points: false }), true);
  assert.equal(M.progress.rewardSpeech('안녕하세요', NOON + 1000, { points: false }), false, 'once a day');
  assert.equal(M.store.state.totals.points, points, 'the game gives the points');
  assert.equal(M.progress.rewardSpeech('안녕하세요', NOON + DAY), true, 'again the next day');
  assert.ok(M.store.state.totals.points > points);
});
