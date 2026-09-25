/**
 * The content registry: topics, their words, sentences and lesson notes.
 *
 * Each file in /content calls `Mallang.content.registerTopic({...})`.
 * Ids are namespaced automatically: word "water" in topic "cafe" becomes
 * "cafe:water", so different topics can't clash. See README → "Adding content".
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const topics = [];
  const words = new Map();
  const sentences = new Map();
  const soundSets = [];
  const grammar = [];
  const dialogues = [];
  const problems = [];

  const qualify = (topicId, ref) => (ref.includes(':') ? ref : `${topicId}:${ref}`);

  function registerTopic(def) {
    if (!def || !def.id) throw new Error('registerTopic: a topic needs an "id"');
    if (topics.some((t) => t.id === def.id)) throw new Error(`registerTopic: topic "${def.id}" exists already`);

    const topic = {
      id: def.id,
      order: def.order ?? topics.length + 1,
      emoji: def.emoji || '📘',
      color: def.color || 'pink',
      title: def.title || { ko: def.id, en: def.id },
      description: def.description || { ko: '', en: '' },
      notes: def.notes || [],
      wordIds: [],
      sentenceIds: [],
    };

    (def.words || []).forEach((w, index) => {
      const id = qualify(def.id, w.id || '');
      if (!w.id || !w.ko || !w.en) problems.push(`${def.id}: word #${index + 1} needs id, ko and en`);
      if (words.has(id)) problems.push(`${id}: duplicate word id`);
      words.set(id, Object.freeze({ ...w, id, localId: w.id, topicId: def.id, index, level: w.level || 1, type: 'word' }));
      topic.wordIds.push(id);
    });

    (def.sentences || []).forEach((s, index) => {
      const id = qualify(def.id, s.id || '');
      if (sentences.has(id)) problems.push(`${id}: duplicate sentence id`);
      sentences.set(
        id,
        Object.freeze({
          ...s,
          id,
          topicId: def.id,
          index,
          level: s.level || 1,
          type: 'sentence',
          ko: s.ko || `${(s.tiles || []).join(' ')}.`,
          needs: (s.words || []).map((ref) => qualify(def.id, ref)),
          traps: s.traps || [],
          alts: s.alts || [],
        })
      );
      topic.sentenceIds.push(id);
    });

    topics.push(topic);
    topics.sort((a, b) => a.order - b.order);
    return topic;
  }

  /**
   * Sound Twins: sets of real words that differ in a single sound (달 / 탈 / 딸).
   * Each set: { id, words: [{ ko, en, emoji, rom }] }. Ids become 'sound:<id>'.
   */
  function registerSoundSets(list) {
    for (const set of list || []) {
      const id = `sound:${set.id}`;
      if (!set.id || !Array.isArray(set.words) || set.words.length < 2) problems.push(`sound set "${set.id}": needs an id and 2+ words`);
      else if (soundSets.some((s) => s.id === id)) problems.push(`${id}: duplicate sound set`);
      else soundSets.push(Object.freeze({ ...set, id, localId: set.id, index: soundSets.length, type: 'sound' }));
    }
  }

  /**
   * Grammar patterns (content/grammar.js), practised in Grammar Cards. Ids become
   * 'grammar:<id>'. Each pattern has an intro (title, meaning, how, note,
   * examples) and questions: a sentence (ko, en) whose `answer` is the form of
   * `dict` with the pattern's ending. Word refs are 'topic:id'.
   */
  function registerGrammar(list) {
    for (const g of list || []) {
      const id = `grammar:${g.id}`;
      if (!g.id || !g.form || !Array.isArray(g.questions)) problems.push(`grammar "${g.id}": needs id, form and questions`);
      else if (grammar.some((x) => x.id === id)) problems.push(`${id}: duplicate grammar pattern`);
      else {
        const questions = g.questions.map((q, i) =>
          Object.freeze({
            ...q,
            id: `${id}#${q.id || i + 1}`,
            pattern: id,
            form: q.form || g.form,
            pos: q.pos || 'verb',
            tense: q.tense || 'present',
            needs: q.words || [],
            contrast: q.contrast || [],
            traps: q.traps || [],
          })
        );
        grammar.push(Object.freeze({ ...g, id, localId: g.id, level: g.level || 1, type: 'grammar', examples: g.examples || [], questions }));
      }
    }
    grammar.sort((a, b) => a.level - b.level || (a.order ?? 99) - (b.order ?? 99));
  }

  /**
   * Listening dialogues (content/dialogues.js). Ids become 'dialogue:<id>'.
   * Two speakers, a few lines, and comprehension questions: q { ko, en },
   * options [{ ko, en }] with `answer` the index of the right one, and `line`
   * (a 0-based index or a list of them): where in the dialogue the answer is.
   */
  function registerDialogues(list) {
    for (const d of list || []) {
      const id = `dialogue:${d.id}`;
      if (!d.id || !Array.isArray(d.lines) || !Array.isArray(d.questions)) problems.push(`dialogue "${d.id}": needs id, lines and questions`);
      else if (dialogues.some((x) => x.id === id)) problems.push(`${id}: duplicate dialogue`);
      else dialogues.push(Object.freeze({ ...d, id, localId: d.id, level: d.level || 1, type: 'dialogue', needs: d.words || [], index: dialogues.length }));
    }
  }

  function checkGrammar(found) {
    for (const g of grammar) {
      if (!g.title || !g.meaning || !g.how) found.push(`${g.id}: needs title, meaning and how`);
      if (g.examples.length < 2) found.push(`${g.id}: needs 2+ examples`);
      if (g.questions.length < 5) found.push(`${g.id}: needs 5+ questions`);
      for (const q of g.questions) {
        if (!q.ko || !q.en || !q.answer || !q.dict) {
          found.push(`${q.id}: needs ko, en, answer and dict`);
          continue;
        }
        const at = q.ko.indexOf(q.answer);
        if (at < 0 || q.ko.indexOf(q.answer, at + 1) >= 0) found.push(`${q.id}: the answer "${q.answer}" must appear exactly once in "${q.ko}"`);
        for (const ref of q.needs) if (!words.has(ref)) found.push(`${q.id}: unknown word "${ref}" (use topic:id)`);
        for (const t of q.traps) if (!t.text || !t.why) found.push(`${q.id}: each trap needs "text" and "why"`);
      }
    }
  }

  function checkDialogues(found) {
    for (const d of dialogues) {
      const who = Object.keys(d.speakers || {});
      if (who.length !== 2) found.push(`${d.id}: needs exactly two speakers`);
      if (!topics.some((t) => t.id === d.topic)) found.push(`${d.id}: unknown topic "${d.topic}"`);
      if (d.lines.length < 3) found.push(`${d.id}: needs 3+ lines`);
      d.lines.forEach((l, i) => {
        if (!who.includes(l.who) || !l.ko || !l.en) found.push(`${d.id} line ${i}: needs who (${who.join('/')}), ko and en`);
      });
      for (const ref of d.needs) if (!words.has(ref)) found.push(`${d.id}: unknown word "${ref}" (use topic:id)`);
      if (d.questions.length < 2) found.push(`${d.id}: needs 2+ questions`);
      d.questions.forEach((q, i) => {
        const label = `${d.id} question ${i + 1}`;
        if (!q.q || !q.q.ko || !q.q.en) found.push(`${label}: needs q: { ko, en }`);
        const options = Array.isArray(q.options) ? q.options : [];
        if (options.some((o) => !o || !o.ko || !o.en)) found.push(`${label}: each option needs ko and en`);
        else if (options.length < 3 || new Set(options.map((o) => o.ko)).size !== options.length) found.push(`${label}: needs 3+ different options`);
        else if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length)) found.push(`${label}: answer must be an option index`);
        const lines = [].concat(q.line);
        if (!lines.length || lines.some((n) => !(n >= 0 && n < d.lines.length))) found.push(`${label}: "line" must point to the line(s) with the answer`);
      });
    }
  }

  /** Check every topic for authoring mistakes. Returns a list of messages. */
  function check() {
    const found = [...problems];
    for (const w of words.values()) {
      for (const ref of w.avoid || []) {
        if (!words.has(qualify(w.topicId, ref))) found.push(`${w.id}: "avoid" lists unknown word "${ref}"`);
      }
    }
    for (const s of sentences.values()) {
      const label = `sentence ${s.id}`;
      if (!s.en || !Array.isArray(s.tiles) || !s.tiles.length) {
        found.push(`${label}: needs "en" and a non-empty "tiles" list`);
        continue;
      }
      if (U.normalize(s.ko) !== U.normalize(s.tiles.join(' '))) {
        found.push(`${label}: tiles "${s.tiles.join(' ')}" don't match "${s.ko}"`);
      }
      if (s.gloss && s.gloss.length !== s.tiles.length) found.push(`${label}: gloss needs one entry per tile`);
      for (const ref of s.needs) if (!words.has(ref)) found.push(`${label}: unknown word "${ref}"`);
      if (!s.needs.length) found.push(`${label}: list the words it uses in "words" (it unlocks once they're learned)`);
      for (const trap of s.traps) {
        if (!trap.tile || !trap.why) found.push(`${label}: each trap needs "tile" and "why"`);
        if (s.tiles.includes(trap.tile)) found.push(`${label}: trap "${trap.tile}" is also part of the answer`);
      }
      const sorted = [...s.tiles].sort().join('|');
      for (const alt of s.alts) {
        if ([...alt].sort().join('|') !== sorted) found.push(`${label}: alternative order must use the same tiles`);
      }
    }
    checkGrammar(found);
    checkDialogues(found);
    return found;
  }

  const inTopic = (topicId) => (item) => !topicId || topicId === 'all' || item.topicId === topicId;

  M.content = {
    registerTopic,
    registerSoundSets,
    registerGrammar,
    registerDialogues,
    check,
    grammar: () => grammar.slice(),
    grammarPattern: (id) => grammar.find((g) => g.id === id) || null,
    dialogues: (topicId = 'all') => dialogues.filter((d) => !topicId || topicId === 'all' || d.topic === topicId),
    dialogue: (id) => dialogues.find((d) => d.id === id) || null,
    soundSets: () => soundSets.slice(),
    soundSet: (id) => soundSets.find((s) => s.id === id) || null,
    topics: () => topics.slice(),
    topic: (id) => topics.find((t) => t.id === id) || null,
    word: (id) => words.get(id) || null,
    sentence: (id) => sentences.get(id) || null,
    item: (id) => words.get(id) || sentences.get(id) || null,
    /** All words, or only those of one topic ('all' = every topic). */
    words: (topicId = 'all') => [...words.values()].filter(inTopic(topicId)),
    sentences: (topicId = 'all') => [...sentences.values()].filter(inTopic(topicId)),
  };
})(window.Mallang);
