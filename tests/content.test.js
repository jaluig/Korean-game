const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang();
const D = M.distractors;

test('content has no authoring mistakes', () => {
  assert.deepEqual(M.content.check(), []);
});

test('every word has what the exercises need', () => {
  const words = M.content.words();
  assert.ok(words.length >= 60);
  for (const w of words) {
    assert.ok(w.emoji, `${w.id} emoji`);
    assert.ok(w.pos, `${w.id} pos`);
    assert.ok([1, 2, 3].includes(w.level), `${w.id} level`);
    assert.ok(w.example && w.example.ko && w.example.en, `${w.id} example`);
    assert.ok(/^[가-힣 ?]+$/.test(w.ko), `${w.id} is plain Hangul`);
  }
  const meanings = words.map((w) => w.en.toLowerCase());
  assert.equal(new Set(meanings).size, meanings.length, 'English meanings are unique');
});

test('every topic has words at each level and some sentences', () => {
  for (const topic of M.content.topics()) {
    for (const level of [1, 2, 3]) {
      assert.ok(M.content.words(topic.id).some((w) => w.level === level), `${topic.id} level ${level}`);
    }
    assert.ok(M.content.sentences(topic.id).length >= 10, topic.id);
    assert.ok(topic.notes.length >= 2, `${topic.id} lesson notes`);
  }
});

test('particle traps explain the rule', () => {
  assert.equal(D.particleTrap('커피를').tile, '커피을');
  assert.match(D.particleTrap('커피를').why, /vowel/);
  assert.equal(D.particleTrap('빵이').tile, '빵가');
  assert.match(D.particleTrap('빵이').why, /consonant/);
  assert.equal(D.particleTrap('같이'), null, '같이 is a word, not 같 + 이');
  assert.equal(D.particleTrap('주세요'), null);
});

test('sentence tiles always contain the answer plus decoys', () => {
  const known = M.content.words();
  for (const s of M.content.sentences()) {
    for (const decoys of [1, 2, 3]) {
      const { tiles } = D.sentenceTiles(s, { decoys, knownWords: known });
      const texts = tiles.map((t) => t.text);
      for (const t of s.tiles) assert.ok(texts.includes(t), `${s.id} contains ${t}`);
      assert.equal(tiles.length, s.tiles.length + decoys, s.id);
      const decoyTexts = tiles.filter((t) => !t.answer).map((t) => t.text);
      for (const t of decoyTexts) assert.ok(!s.tiles.includes(t), `${s.id}: decoy ${t} is not an answer tile`);
    }
  }
});

test('filler tiles are never the bare form of an answer tile', () => {
  const known = M.content.words();
  for (let round = 0; round < 25; round++) {
    for (const s of M.content.sentences()) {
      const { tiles } = D.sentenceTiles(s, { decoys: 3, knownWords: known });
      const answers = s.tiles.map(M.utils.normalize);
      for (const t of tiles.filter((x) => x.word)) {
        const bare = M.utils.normalize(t.text);
        assert.ok(!answers.some((a) => a.startsWith(bare)), `${s.id}: filler ${t.text}`);
      }
    }
  }
});

test('near-synonyms never appear as each other’s wrong options', () => {
  const pool = M.content.words();
  const pairs = [
    ['cafe:tea', 'cafe:greentea'],
    ['cafe:coffee', 'cafe:americano'],
    ['day:meet', 'day:watch'],
  ];
  for (let round = 0; round < 25; round++) {
    for (const [a, b] of pairs) {
      for (const [x, y] of [[a, b], [b, a]]) {
        const word = M.content.word(x);
        const ids = [...D.meaningOptions(word, pool, 3), ...D.formOptions(word, pool, 3)].map((w) => w.id);
        assert.ok(!ids.includes(y), `${x} offered ${y}`);
      }
    }
  }
});

test('syllable tiles contain every syllable of the answer', () => {
  for (const w of M.content.words()) {
    const tiles = D.syllableTiles(w);
    const answer = [...M.utils.noSpaces(M.utils.normalize(w.ko))];
    const answerTiles = tiles.filter((t) => t.answer).map((t) => t.text);
    assert.deepEqual([...answerTiles].sort(), [...answer].sort(), w.id);
    assert.ok(tiles.length > answer.length, `${w.id} has decoys`);
  }
});

test('multiple-choice options are distinct and never the answer', () => {
  const pool = M.content.words();
  for (const w of pool) {
    const meanings = D.meaningOptions(w, pool, 3);
    assert.equal(meanings.length, 3);
    assert.ok(!meanings.some((x) => x.en === w.en));
    assert.equal(new Set(meanings.map((x) => x.en)).size, 3);

    const forms = D.formOptions(w, pool, 3);
    assert.equal(forms.length, 3);
    assert.ok(!forms.some((x) => x.ko === w.ko));
  }
});
