/**
 * Hangul toolkit:
 *  - split syllables into letters (jamo) and build them back,
 *  - the 2-set (두벌식) typing automaton behind the on-screen keyboard,
 *  - particle rules (을/를, 이/가…),
 *  - spelling comparison that explains *why* two spellings differ.
 */
(function (M) {
  'use strict';

  const U = M.utils;

  const SYLLABLE_START = 0xac00;
  const SYLLABLE_END = 0xd7a3;
  const INITIALS = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'];
  const VOWELS = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'];
  const FINALS = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];

  // Two keystrokes that merge into one letter.
  const VOWEL_COMBOS = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const FINAL_COMBOS = {
    'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ',
    'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
  };
  const SPLITS = {};
  for (const [pair, merged] of Object.entries({ ...VOWEL_COMBOS, ...FINAL_COMBOS })) SPLITS[merged] = [...pair];

  const VOWEL_SET = new Set(VOWELS);
  const CONSONANT_SET = new Set([...INITIALS, ...FINALS.filter(Boolean)]);
  // Letters that can close a syllable when typed on their own key (ㄸ ㅃ ㅉ never can).
  const SINGLE_FINALS = new Set(FINALS.filter((f) => f && !SPLITS[f]));

  const isSyllable = (ch) => {
    const code = String(ch).charCodeAt(0);
    return code >= SYLLABLE_START && code <= SYLLABLE_END;
  };
  const isVowel = (ch) => VOWEL_SET.has(ch);
  const isConsonant = (ch) => CONSONANT_SET.has(ch);
  const isJamo = (ch) => isVowel(ch) || isConsonant(ch);

  /** '닭' → { initial: 'ㄷ', vowel: 'ㅏ', final: 'ㄺ' }; null for non-syllables. */
  function decompose(ch) {
    if (!ch || !isSyllable(ch)) return null;
    const code = ch.charCodeAt(0) - SYLLABLE_START;
    return {
      initial: INITIALS[Math.floor(code / 588)],
      vowel: VOWELS[Math.floor((code % 588) / 28)],
      final: FINALS[code % 28],
    };
  }

  /** ('ㄷ', 'ㅏ', 'ㄺ') → '닭'; null if the letters can't form a syllable. */
  function compose(initial, vowel, final = '') {
    const l = INITIALS.indexOf(initial);
    const v = VOWELS.indexOf(vowel);
    const t = FINALS.indexOf(final);
    if (l < 0 || v < 0 || t < 0) return null;
    return String.fromCharCode(SYLLABLE_START + (l * 21 + v) * 28 + t);
  }

  /** Text → the keystrokes you would press on a 2-set keyboard ('과' → ㄱ ㅗ ㅏ). */
  function toKeys(text) {
    const keys = [];
    for (const ch of String(text)) {
      const parts = decompose(ch);
      if (!parts) {
        keys.push(...(SPLITS[ch] || [ch]));
        continue;
      }
      keys.push(parts.initial, ...(SPLITS[parts.vowel] || [parts.vowel]));
      if (parts.final) keys.push(...(SPLITS[parts.final] || [parts.final]));
    }
    return keys;
  }

  /**
   * The 2-set typing automaton: keystrokes → text, exactly like a Korean IME.
   * e.g. ㄱ ㅏ ㄴ → '간', then ㅏ → '가나' (the ㄴ jumps to the new syllable).
   * Because the keyboard keeps the list of keys, backspace = drop the last key.
   */
  function assemble(keys) {
    let out = '';
    let cur = null; // the syllable being built: { l, v, t }
    const flush = () => {
      if (cur) out += render(cur);
      cur = null;
    };

    for (const key of keys) {
      if (isVowel(key)) {
        if (cur && cur.t) {
          // 간 + ㅏ → 가 + 나 ; 닭 + ㅏ → 달 + 가
          const parts = SPLITS[cur.t];
          const moved = parts ? parts[1] : cur.t;
          cur.t = parts ? parts[0] : '';
          flush();
          cur = { l: moved, v: key, t: '' };
        } else if (cur && cur.v) {
          const merged = VOWEL_COMBOS[cur.v + key];
          if (merged) cur.v = merged;
          else {
            flush();
            cur = { l: '', v: key, t: '' };
          }
        } else if (cur && cur.l) {
          cur.v = key;
        } else {
          flush();
          cur = { l: '', v: key, t: '' };
        }
      } else if (isConsonant(key)) {
        if (cur && cur.l && cur.v && !cur.t && SINGLE_FINALS.has(key)) {
          cur.t = key;
        } else if (cur && cur.t && FINAL_COMBOS[cur.t + key]) {
          cur.t = FINAL_COMBOS[cur.t + key];
        } else {
          flush();
          cur = { l: key, v: '', t: '' };
        }
      } else {
        flush();
        out += key;
      }
    }
    flush();
    return out;
  }

  function render({ l, v, t }) {
    if (l && v) return compose(l, v, t) || l + v + t;
    return l + v + t; // a lone letter stays as it is
  }

  /* ---------- 2-set (두벌식) keyboard layout ---------- */

  /** Physical key (KeyboardEvent.code) → [letter, letter with Shift]. */
  const LAYOUT = {
    KeyQ: ['ㅂ', 'ㅃ'], KeyW: ['ㅈ', 'ㅉ'], KeyE: ['ㄷ', 'ㄸ'], KeyR: ['ㄱ', 'ㄲ'], KeyT: ['ㅅ', 'ㅆ'],
    KeyY: ['ㅛ'], KeyU: ['ㅕ'], KeyI: ['ㅑ'], KeyO: ['ㅐ', 'ㅒ'], KeyP: ['ㅔ', 'ㅖ'],
    KeyA: ['ㅁ'], KeyS: ['ㄴ'], KeyD: ['ㅇ'], KeyF: ['ㄹ'], KeyG: ['ㅎ'],
    KeyH: ['ㅗ'], KeyJ: ['ㅓ'], KeyK: ['ㅏ'], KeyL: ['ㅣ'],
    KeyZ: ['ㅋ'], KeyX: ['ㅌ'], KeyC: ['ㅊ'], KeyV: ['ㅍ'], KeyB: ['ㅠ'], KeyN: ['ㅜ'], KeyM: ['ㅡ'],
  };
  const LAYOUT_ROWS = [
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
    ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'],
  ];

  function letterForKey(code, shift = false) {
    const entry = LAYOUT[code];
    if (!entry) return null;
    return (shift && entry[1]) || entry[0];
  }

  /* ---------- Particles ---------- */

  /** Does the last Hangul syllable end in a final consonant (받침)? */
  function hasFinal(word) {
    const chars = [...String(word).trim()];
    for (let i = chars.length - 1; i >= 0; i--) {
      const parts = decompose(chars[i]);
      if (parts) return parts.final !== '';
    }
    return false;
  }

  /**
   * Pick the right form of a two-form particle.
   * particle('커피', '을/를') → '를' ; particle('물', '이/가') → '이'
   * The first form goes after a consonant, the second after a vowel.
   */
  function particle(word, pair) {
    const [afterConsonant, afterVowel] = pair.split('/');
    if (pair === '으로/로') {
      const last = decompose([...String(word).trim()].pop());
      return last && last.final && last.final !== 'ㄹ' ? afterConsonant : afterVowel;
    }
    return hasFinal(word) ? afterConsonant : afterVowel;
  }

  /* ---------- Look-alike letters and spelling explanations ---------- */

  const SIMILAR = {
    initial: [
      ['ㄱ', 'ㅋ', 'ㄲ'], ['ㄷ', 'ㅌ', 'ㄸ'], ['ㅂ', 'ㅍ', 'ㅃ'], ['ㅈ', 'ㅊ', 'ㅉ'], ['ㅅ', 'ㅆ'],
      ['ㅁ', 'ㅂ'], ['ㄴ', 'ㄹ'], ['ㄴ', 'ㄷ'], ['ㅇ', 'ㅎ'],
    ],
    vowel: [
      ['ㅓ', 'ㅗ'], ['ㅏ', 'ㅓ'], ['ㅗ', 'ㅜ'], ['ㅜ', 'ㅡ'], ['ㅐ', 'ㅔ'], ['ㅒ', 'ㅖ'],
      ['ㅏ', 'ㅑ'], ['ㅓ', 'ㅕ'], ['ㅗ', 'ㅛ'], ['ㅜ', 'ㅠ'], ['ㅕ', 'ㅛ'],
      ['ㅚ', 'ㅙ', 'ㅞ'], ['ㅘ', 'ㅝ'], ['ㅟ', 'ㅢ'], ['ㅢ', 'ㅣ'],
    ],
    final: [
      ['', 'ㄴ'], ['', 'ㅇ'], ['', 'ㄹ'], ['ㄴ', 'ㅇ'], ['ㄴ', 'ㅁ'], ['ㅁ', 'ㅇ'],
      ['ㄱ', 'ㅂ'], ['ㄱ', 'ㄲ', 'ㅋ'], ['ㅂ', 'ㅍ'], ['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ'],
    ],
  };

  function neighbours(kind, letter) {
    const out = new Set();
    for (const group of SIMILAR[kind]) {
      if (group.includes(letter)) group.forEach((x) => x !== letter && out.add(x));
    }
    return [...out];
  }

  /** Plausible misspellings of one syllable, e.g. '딸' → ['달', '탈', '떨'…]. */
  function lookalikes(syllable, count = 3) {
    const parts = decompose(syllable);
    if (!parts) return [];
    const found = new Set();
    for (const kind of ['initial', 'vowel', 'final']) {
      for (const alt of neighbours(kind, parts[kind])) {
        const next = { ...parts, [kind]: alt };
        const s = compose(next.initial, next.vowel, next.final);
        if (s && s !== syllable) found.add(s);
      }
    }
    return U.sample([...found], count);
  }

  const puff = (plain, strong) => `${plain} is soft; ${strong} is aspirated — say it with a puff of air.`;
  const tense = (plain, tight) => `${tight} is tense: a tight sound with no puff of air, unlike the softer ${plain}.`;
  const strongVsTight = (strong, tight) => `${strong} comes with a strong puff of air; ${tight} is tight with no air.`;
  const sameSound = (a, b) => `${a} and ${b} sound almost the same today — you just have to remember the spelling.`;

  /** Short explanations for letters learners often mix up. Keys are sorted pairs. */
  const LETTER_TIPS = {
    'ㄱ|ㅋ': puff('ㄱ', 'ㅋ'), 'ㄱ|ㄲ': tense('ㄱ', 'ㄲ'), 'ㄲ|ㅋ': strongVsTight('ㅋ', 'ㄲ'),
    'ㄷ|ㅌ': puff('ㄷ', 'ㅌ'), 'ㄷ|ㄸ': tense('ㄷ', 'ㄸ'), 'ㄸ|ㅌ': strongVsTight('ㅌ', 'ㄸ'),
    'ㅂ|ㅍ': puff('ㅂ', 'ㅍ'), 'ㅂ|ㅃ': tense('ㅂ', 'ㅃ'), 'ㅃ|ㅍ': strongVsTight('ㅍ', 'ㅃ'),
    'ㅈ|ㅊ': puff('ㅈ', 'ㅊ'), 'ㅈ|ㅉ': tense('ㅈ', 'ㅉ'), 'ㅉ|ㅊ': strongVsTight('ㅊ', 'ㅉ'),
    'ㅅ|ㅆ': 'ㅆ is tense: a sharper, hissing “ss”. ㅅ is a soft “s”.',
    'ㅁ|ㅂ': 'ㅁ is “m” (lips closed, humming). ㅂ is “b/p”.',
    'ㄴ|ㄹ': 'ㄴ is “n”. ㄹ is a light flap between “r” and “l”.',
    'ㄴ|ㄷ': 'ㄴ is “n” (air through the nose). ㄷ is “d/t”.',
    'ㅇ|ㅎ': 'At the start of a syllable ㅇ is silent, while ㅎ is “h”.',
    'ㅓ|ㅗ': 'ㅓ (eo) is an open “uh” with relaxed lips. ㅗ (o) needs rounded lips.',
    'ㅏ|ㅓ': 'ㅏ (a) is “ah”; ㅓ (eo) is “uh”.',
    'ㅗ|ㅜ': 'ㅗ (o) is like “oh”; ㅜ (u) is like “oo”.',
    'ㅜ|ㅡ': 'ㅜ (u): round your lips. ㅡ (eu): keep your lips flat, like a grin.',
    'ㅐ|ㅔ': sameSound('ㅐ', 'ㅔ'),
    'ㅒ|ㅖ': sameSound('ㅒ', 'ㅖ'),
    'ㅏ|ㅑ': 'ㅑ adds a “y”: ya. ㅏ is just “a”.',
    'ㅓ|ㅕ': 'ㅕ adds a “y”: yeo. ㅓ is just “eo”.',
    'ㅗ|ㅛ': 'ㅛ adds a “y”: yo. ㅗ is just “o”.',
    'ㅜ|ㅠ': 'ㅠ adds a “y”: yu. ㅜ is just “u”.',
    'ㅕ|ㅛ': 'ㅕ (yeo) is an open “yuh”; ㅛ (yo) has rounded lips.',
    'ㅙ|ㅚ': 'ㅚ, ㅙ and ㅞ all sound like “we” — you just have to remember the spelling.',
    'ㅚ|ㅞ': 'ㅚ, ㅙ and ㅞ all sound like “we” — you just have to remember the spelling.',
    'ㅙ|ㅞ': 'ㅚ, ㅙ and ㅞ all sound like “we” — you just have to remember the spelling.',
    'ㅘ|ㅝ': 'ㅘ is “wa” (ㅗ+ㅏ); ㅝ is “wuh” (ㅜ+ㅓ, written “wo” in romanization).',
    'ㅟ|ㅢ': 'ㅟ is “wi” (ㅜ+ㅣ); ㅢ is “ui” (ㅡ+ㅣ).',
    'ㅢ|ㅣ': 'ㅢ is “ui” (ㅡ+ㅣ); ㅣ is just “i”.',
  };

  const T_SOUND = new Set(['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ']);
  const FINAL_TIPS = {
    'ㄴ|ㅇ': 'Final ㄴ is “n” (tongue up behind your teeth). Final ㅇ is “ng” as in “sing”.',
    'ㄴ|ㅁ': 'Final ㅁ closes your lips (“m”); final ㄴ keeps them open (“n”).',
    'ㅁ|ㅇ': 'Final ㅁ closes your lips (“m”); final ㅇ is “ng” as in “sing”.',
    'ㄱ|ㅂ': 'Final ㄱ is a clipped “k”; final ㅂ is a clipped “p” (your lips close).',
    'ㄱ|ㄲ': 'As a final (받침), ㄱ and ㄲ sound the same unless a vowel follows — remember the spelling.',
    'ㄱ|ㅋ': 'As a final (받침), ㄱ and ㅋ sound the same unless a vowel follows — remember the spelling.',
    'ㄲ|ㅋ': 'As a final (받침), ㄲ and ㅋ sound the same unless a vowel follows — remember the spelling.',
    'ㅂ|ㅍ': 'As a final (받침), ㅂ and ㅍ sound the same unless a vowel follows — remember the spelling.',
    'ㄲ|ㅂ': 'Final ㄲ is a clipped “k” (tongue at the back); final ㅂ is a clipped “p” (your lips close).',
    'ㄴ|ㄹ': 'Final ㄹ is an “l” (the tongue stays up on the roof of your mouth); final ㄴ is “n”.',
    'ㄹ|ㅅ': 'Final ㄹ is an “l”; final ㅅ sounds like a clipped “t”.',
    'ㅁ|ㅂ': 'Both close your lips: final ㅁ hums (“m”), final ㅂ is a silent, clipped “p”.',
  };

  /** One-sentence tip about two letters in the same position of a syllable. */
  function letterTip(kind, expected, given) {
    if (kind === 'final') {
      if (!given) return `Don't forget the final consonant (받침) ${expected}.`;
      if (!expected) return `There's no final consonant (받침) here — no ${given}.`;
      if (T_SOUND.has(expected) && T_SOUND.has(given)) {
        return `As a final (받침), ${expected} and ${given} both sound like a clipped “t” unless a vowel follows — remember which one is written.`;
      }
    }
    const key = [expected, given].sort().join('|');
    const table = kind === 'final' ? FINAL_TIPS : LETTER_TIPS;
    return table[key] || `Look closely: ${expected}, not ${given}.`;
  }

  /**
   * Compare the expected spelling with the learner's and describe the first
   * difference, e.g. ('딸기', '달기') →
   * { index: 0, expected: '딸', given: '달', kind: 'initial', tip: 'ㄸ is tense…' }.
   * Returns null when the words are the same or too different to compare.
   */
  function explainDifference(expected, given) {
    const a = [...U.noSpaces(U.normalize(expected))];
    const b = [...U.noSpaces(U.normalize(given))];
    if (a.join('') === b.join('') || a.length !== b.length) return null;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[i]) continue;
      const pa = decompose(a[i]);
      const pb = decompose(b[i]);
      if (!pa || !pb) return { index: i, expected: a[i], given: b[i], kind: null, tip: null };
      for (const kind of ['initial', 'vowel', 'final']) {
        if (pa[kind] !== pb[kind]) {
          return { index: i, expected: a[i], given: b[i], kind, tip: letterTip(kind, pa[kind], pb[kind]) };
        }
      }
    }
    return null;
  }

  /** Number of keystrokes that differ between two spellings (spaces ignored). */
  function spellingDistance(a, b) {
    return U.levenshtein(toKeys(U.noSpaces(a)), toKeys(U.noSpaces(b)));
  }

  M.hangul = {
    INITIALS,
    VOWELS,
    FINALS,
    LAYOUT,
    LAYOUT_ROWS,
    isSyllable,
    isVowel,
    isConsonant,
    isJamo,
    decompose,
    compose,
    toKeys,
    assemble,
    letterForKey,
    hasFinal,
    particle,
    lookalikes,
    letterTip,
    explainDifference,
    spellingDistance,
  };
})(window.Mallang);
