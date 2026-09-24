/**
 * Picking wrong options that actually teach something: meanings from the same
 * topic, Korean words that look alike, syllables with easily-confused letters,
 * and particle traps in sentences (커피을 instead of 커피를).
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const H = M.hangul;

  /** Highest-scoring entries with distinct keys. */
  function topDistinct(scored, count, keyFn, exclude = []) {
    const seen = new Set(exclude);
    const out = [];
    for (const { item } of scored.sort((a, b) => b.score - a.score)) {
      const key = keyFn(item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length === count) break;
    }
    return out;
  }

  /** Wrong English meanings for a word: same topic and word type make it a real test. */
  function meaningOptions(word, pool, count = 3) {
    const scored = pool
      .filter((w) => w.id !== word.id && w.en !== word.en)
      .map((w) => ({
        item: w,
        score: (w.topicId === word.topicId ? 1.5 : 0) + (w.pos === word.pos ? 2 : 0) + U.random() * 2.5,
      }));
    return topDistinct(scored, count, (w) => w.en.toLowerCase(), [word.en.toLowerCase()]);
  }

  /** Wrong Korean words: prefer ones that look or sound alike. */
  function formOptions(word, pool, count = 3) {
    const length = [...U.noSpaces(word.ko)].length;
    const scored = pool
      .filter((w) => w.id !== word.id && w.ko !== word.ko && w.en !== word.en)
      .map((w) => {
        const distance = H.spellingDistance(word.ko, w.ko);
        const lengthGap = Math.abs([...U.noSpaces(w.ko)].length - length);
        return {
          item: w,
          score: Math.max(0, 5 - distance) * 0.7 - lengthGap * 0.6 + (w.pos === word.pos ? 1.5 : 0) + U.random() * 2,
        };
      });
    return topDistinct(scored, count, (w) => w.ko, [word.ko]);
  }

  /**
   * Tiles for "build the word": every syllable of the answer plus look-alike
   * decoys (딸 → 달, 탈…), so building it takes careful spelling, not guessing.
   */
  function syllableTiles(word) {
    const answer = [...U.noSpaces(U.normalize(word.ko))];
    const wanted = answer.length === 1 ? 5 : U.clamp(answer.length, 2, 4);
    const decoys = new Set();
    for (const syllable of U.shuffle(answer)) {
      for (const alt of H.lookalikes(syllable, 2)) if (!answer.includes(alt)) decoys.add(alt);
    }
    const tiles = [
      ...answer.map((text) => ({ text, answer: true })),
      ...U.sample([...decoys], wanted).map((text) => ({ text, answer: false })),
    ];
    return U.shuffle(tiles);
  }

  /* ---------- Sentences ---------- */

  // [after a consonant, after a vowel]
  const PARTICLES = [
    ['을', '를'],
    ['은', '는'],
    ['이', '가'],
    ['과', '와'],
  ];

  let knownStems = null;
  const isKnownWord = (text) => {
    if (!knownStems) knownStems = new Set(M.content.words().map((w) => w.ko));
    return knownStems.has(text);
  };

  /**
   * A wrong-particle version of a tile, with the rule explained:
   * '커피를' → { tile: '커피을', why: '커피 ends in a vowel, so it takes 를…' }.
   */
  function particleTrap(tile) {
    for (const [afterConsonant, afterVowel] of PARTICLES) {
      for (const used of [afterConsonant, afterVowel]) {
        if (!tile.endsWith(used)) continue;
        const stem = tile.slice(0, -used.length);
        if (!stem || !isKnownWord(stem)) continue;
        const final = H.hasFinal(stem);
        const right = final ? afterConsonant : afterVowel;
        if (used !== right) continue; // the tile itself isn't the textbook form
        const wrong = final ? afterVowel : afterConsonant;
        const why = final
          ? `${stem} ends in a consonant (받침), so it takes ${right}. ${wrong} goes after vowels.`
          : `${stem} ends in a vowel, so it takes ${right}. ${wrong} goes after consonants.`;
        return { tile: stem + wrong, why };
      }
    }
    return null;
  }

  /**
   * Tiles for the Sentence Builder: the answer plus `decoys` extra tiles.
   * Hand-written traps come first (they carry the best explanations), then
   * particle traps, then other words the learner knows.
   */
  function sentenceTiles(sentence, { decoys = 2, knownWords = [] } = {}) {
    const answer = sentence.tiles;
    const auto = answer.map(particleTrap).filter(Boolean);
    const traps = U.uniqueBy([...U.shuffle(sentence.traps), ...U.shuffle(auto)], (t) => t.tile)
      .filter((t) => !answer.includes(t.tile))
      .slice(0, decoys);

    const fillers = U.sample(
      U.uniqueBy(knownWords, (w) => w.ko).filter(
        (w) => !w.ko.includes(' ') && !answer.includes(w.ko) && !traps.some((t) => t.tile === w.ko)
      ),
      Math.max(0, decoys - traps.length)
    );

    const tiles = [
      ...answer.map((text) => ({ text, answer: true })),
      ...traps.map((trap) => ({ text: trap.tile, trap })),
      ...fillers.map((w) => ({ text: w.ko, word: w })),
    ];
    return { tiles: U.shuffle(tiles), traps };
  }

  M.distractors = { meaningOptions, formOptions, syllableTiles, particleTrap, sentenceTiles };
})(window.Mallang);
