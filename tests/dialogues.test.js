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

test('every dialogue is well-formed: two voices, questions that point at their line', () => {
  const list = M.content.dialogues();
  assert.ok(list.length >= 12, `${list.length} dialogues`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('dialogue')), []);
  for (const topic of M.content.topics()) assert.ok(list.some((d) => d.topic === topic.id), `no dialogue for ${topic.id}`);
  for (const d of list) {
    const voices = Object.values(d.speakers).map((s) => s.voice).sort();
    assert.deepEqual(voices, ['high', 'low'], `${d.id}: one high and one low voice`);
    assert.ok(d.needs.length >= 1, `${d.id}: key words`);
    assert.ok([1, 2, 3].includes(d.level), `${d.id}: level`);
    for (const q of d.questions) {
      assert.equal(q.options.length, 3, `${d.id}: three options`);
      assert.ok(q.why, `${d.id}: explanation`);
    }
  }
});

test('Dialogues opens once the key words are known, due and new ones first', () => {
  M.store.reset();
  assert.deepEqual(M.dialogues.pickRound('all', NOON), []);
  assert.ok(M.dialogues.nextLocked());
  learnWords();
  const size = M.config.session.dialogues.perRound;
  const first = M.dialogues.pickRound('all', NOON);
  assert.equal(first.length, size);
  assert.ok(first.every((d) => d.level === 1), 'the easiest first');
  // Hear them: the next round brings others, unless one is due again.
  for (const d of first) M.srs.review(d.id, 'good', NOON);
  const second = M.dialogues.pickRound('all', NOON + 1000);
  assert.ok(second.every((d) => !first.includes(d)));
  M.srs.review(first[0].id, 'again', NOON + 2000);
  assert.equal(M.dialogues.pickRound('all', NOON + 3000)[0], first[0], 'a missed one comes back first');
});

test('Dialogues prefers the focus topic', () => {
  learnWords();
  const topic = 'shopping';
  const picked = M.dialogues.pickRound(topic, NOON);
  assert.ok(picked.length);
  assert.equal(picked[0].topic, topic);
});

test('the two speakers sound different: a second voice if there is one, else the pitch', () => {
  const d = M.content.dialogues()[0];
  const low = Object.keys(d.speakers).find((k) => d.speakers[k].voice === 'low');
  const high = Object.keys(d.speakers).find((k) => d.speakers[k].voice === 'high');
  const yuna = { name: 'Yuna', voiceURI: 'yuna', lang: 'ko-KR' };
  const injoon = { name: 'Microsoft InJoon Online (Natural)', voiceURI: 'injoon', lang: 'ko-KR' };
  M.speech = { voice: () => yuna, voices: () => [yuna] };
  let v = M.dialogues.voicesFor(d);
  assert.equal(v[low].voice, yuna);
  assert.ok(v[high].pitch > 1 && v[low].pitch < 1);
  M.speech = { voice: () => yuna, voices: () => [yuna, { name: 'Sora', voiceURI: 'sora' }, injoon] };
  v = M.dialogues.voicesFor(d);
  assert.equal(v[low].voice, injoon, 'a male voice for the low speaker when there is one');
  assert.equal(v[high].voice, yuna);
});
