/**
 * Checking typed answers leniently, for fast games like Balloon Pop.
 *
 * English: "home / house" accepts either word, hints in brackets are optional
 * ("this (thing)" → "this"), little words like "to", "a", "it's" or "I'm" can
 * be left out, British and American spellings both count, and one typo in a
 * longer word is forgiven. Words can list more answers in `enAlt`.
 * Korean: the word or any of its `accept` forms, ignoring spaces and ?/!.
 */
(function (M) {
  'use strict';

  const U = M.utils;

  const SPELLING = [
    ['colour', 'color'], ['favourite', 'favorite'], ['practise', 'practice'], ['grey', 'gray'], ['centre', 'center'],
    ['theatre', 'theater'], ['neighbour', 'neighbor'], ['travelling', 'traveling'], ['cancelled', 'canceled'],
    ['jewellery', 'jewelry'], ['pyjamas', 'pajamas'], ['mum', 'mom'], ['programme', 'program'], ['metre', 'meter'],
  ];
  // Small words that can be left out at the start of an answer.
  const LEADING = /^(?:to be|to|a|an|the|it is|it's|its|i am|i'm|im|you are|you're|be)\s+/;

  /** Lower-case, no accents or punctuation, one spelling, single spaces. */
  function clean(text) {
    let t = String(text ?? '')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    for (const [uk, us] of SPELLING) t = t.replace(new RegExp(`\\b${uk}\\b`, 'g'), us);
    let before;
    do {
      before = t;
      t = t.replace(LEADING, '');
    } while (t !== before);
    return t.replace(/'/g, '').trim();
  }

  /** Every accepted English answer for a word, cleaned. */
  function englishAnswers(word) {
    const out = new Set();
    const add = (text) => {
      const t = clean(text);
      if (t) out.add(t);
    };
    for (const alt of String(word.en).split('/')) {
      add(alt.replace(/\([^)]*\)/g, ' ')); // "this (thing)" → "this"
      add(alt.replace(/[()]/g, ' ')); // … and "this thing"
    }
    (word.enAlt || []).forEach(add);
    return [...out];
  }

  /** How many typos to forgive: none in short words, one from 5 letters, two from 10. */
  const forgiven = (answer) => (answer.length >= 10 ? 2 : answer.length >= 5 ? 1 : 0);

  /**
   * Does a typed English answer match the word? → { ok, exact, answer }.
   * `answer` is the accepted answer it matched (or came closest to).
   */
  function matchEnglish(word, typed) {
    const given = clean(typed);
    const answers = englishAnswers(word);
    if (!given) return { ok: false, exact: false, answer: answers[0] || '' };
    if (answers.includes(given)) return { ok: true, exact: true, answer: given };
    let best = { ok: false, exact: false, answer: answers[0] || '', distance: Infinity };
    for (const answer of answers) {
      const distance = U.levenshtein(given, answer);
      if (distance < best.distance) best = { ok: distance <= forgiven(answer), exact: false, answer, distance };
    }
    return { ok: best.ok, exact: false, answer: best.answer };
  }

  const koKey = (text) => U.noSpaces(U.normalize(text));

  /** Does typed Korean match the word (or one of its `accept` forms)? */
  function matchKorean(word, typed) {
    const given = koKey(typed);
    if (!given) return false;
    return [word.ko, ...(word.accept || [])].some((ko) => koKey(ko) === given);
  }

  M.answers = { clean, englishAnswers, matchEnglish, matchKorean };
})(window.Mallang);
