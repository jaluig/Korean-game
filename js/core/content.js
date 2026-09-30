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
  const readings = [];
  const speech = { card: null, scenes: [], items: [] };
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

  /**
   * Reading passages (content/reading.js): a short text per topic (a diary, a
   * message, a notice…), sentence by sentence, with comprehension questions
   * whose `line` points at the sentence(s) with the answer. Ids become 'reading:<id>'.
   */
  function registerReadings(list) {
    for (const r of list || []) {
      const id = `reading:${r.id}`;
      if (!r.id || !Array.isArray(r.sentences) || !Array.isArray(r.questions)) problems.push(`reading "${r.id}": needs id, sentences and questions`);
      else if (readings.some((x) => x.id === id)) problems.push(`${id}: duplicate reading`);
      else readings.push(Object.freeze({ ...r, id, localId: r.id, level: r.level || 1, type: 'reading', needs: r.words || [], index: readings.length }));
    }
  }

  /** The three speech levels, most formal first. */
  const LEVELS = ['formal', 'polite', 'casual'];

  /**
   * Speech levels (content/speech-levels.js), practised in Speech Levels: a card
   * (the three levels and when to use each), scenes (who you're talking to, and
   * the level that fits) and items: one sentence in all three levels, with the
   * wrong versions learners really make. Item ids become 'speech:<id>'.
   */
  function registerSpeechLevels({ card, scenes, items } = {}) {
    if (card) speech.card = Object.freeze(card);
    for (const s of scenes || []) {
      if (!s.id || !LEVELS.includes(s.to)) problems.push(`speech scene "${s.id}": needs an id and to: formal | polite | casual`);
      else if (speech.scenes.some((x) => x.id === s.id)) problems.push(`speech scene "${s.id}": duplicate`);
      else speech.scenes.push(Object.freeze({ ...s }));
    }
    for (const it of items || []) {
      const id = `speech:${it.id}`;
      if (!it.id || !it.formal || !it.polite || !it.casual) problems.push(`speech item "${it.id}": needs id, formal, polite and casual`);
      else if (speech.items.some((x) => x.id === id)) problems.push(`${id}: duplicate speech item`);
      else {
        speech.items.push(
          Object.freeze({ ...it, id, localId: it.id, level: it.level || 1, type: 'speech', needs: it.words || [], scenes: it.scenes || [], traps: it.traps || [], index: speech.items.length })
        );
      }
    }
  }

  // What each level's sentences end with (a check for typos): 합니다체 in -니다 / -니까 (or -시오 / -시다),
  // 해요체 in 요, 반말 in neither.
  const ENDS = {
    formal: /(니다|니까|시오|시다)[.?!~]*$/,
    polite: /요[.?!~]*$/,
    casual: /^(?![\s\S]*(요|니다|니까)[.?!~]*$)/,
  };

  function checkSpeech(found) {
    if (!speech.items.length && !speech.scenes.length && !speech.card) return;
    const { card } = speech;
    if (!card || !card.title || !card.text || !Array.isArray(card.levels) || !Array.isArray(card.table)) found.push('speech levels: the card needs title, text, levels and table');
    else {
      if (card.levels.map((l) => l.to).join() !== LEVELS.join()) found.push('speech levels: the card lists the levels formal, polite, casual, in that order');
      for (const l of card.levels) if (!l.ko || !l.en || !l.emoji || !l.when || !l.ending || !l.example || !l.example.ko || !l.example.en) found.push(`speech levels card, ${l.to}: needs ko, en, emoji, ending, when and example { ko, en }`);
      for (const row of card.table) if (!row.en || LEVELS.some((to) => !row[to])) found.push('speech levels card: each table row needs en, formal, polite and casual');
      for (const picked of LEVELS) for (const wanted of LEVELS) if (picked !== wanted && !(card.wrong && card.wrong[picked] && card.wrong[picked][wanted])) found.push(`speech levels card: needs wrong.${picked}.${wanted} (why ${picked} doesn't fit where ${wanted} does)`);
    }
    for (const to of LEVELS) if (!speech.scenes.some((s) => s.to === to)) found.push(`speech levels: needs a scene for ${to}`);
    for (const s of speech.scenes) if (!s.emoji || !s.ko || !s.en) found.push(`speech scene "${s.id}": needs emoji, ko and en`);
    for (const it of speech.items) {
      if (!it.en) found.push(`${it.id}: needs en`);
      if (![1, 2, 3].includes(it.level)) found.push(`${it.id}: level 1, 2 or 3`);
      const forms = LEVELS.map((to) => it[to]);
      if (new Set(forms.map(U.normalize)).size < 3) found.push(`${it.id}: the three levels must differ`);
      for (const to of LEVELS) if (!ENDS[to].test(it[to])) found.push(`${it.id}: "${it[to]}" doesn't end like ${to} speech`);
      if (!it.needs.length) found.push(`${it.id}: list its key words in "words" (it opens once they're learned)`);
      for (const ref of it.needs) if (!words.has(ref)) found.push(`${it.id}: unknown word "${ref}" (use topic:id)`);
      for (const ref of it.scenes) if (!speech.scenes.some((s) => s.id === ref)) found.push(`${it.id}: unknown scene "${ref}"`);
      for (const to of ['formal', 'casual']) if (!it.traps.some((t) => t.to === to)) found.push(`${it.id}: needs a trap for ${to}`);
      for (const t of it.traps) {
        if (!['formal', 'casual'].includes(t.to) || !t.text || !t.why) found.push(`${it.id}: each trap needs to (formal | casual), text and why`);
        else if (forms.some((f) => U.normalize(f) === U.normalize(t.text))) found.push(`${it.id}: the trap "${t.text}" is one of the right sentences`);
      }
      for (const to of ['formal', 'casual']) {
        const texts = it.traps.filter((t) => t.to === to && t.text).map((t) => U.normalize(t.text));
        if (new Set(texts).size < texts.length) found.push(`${it.id}: two ${to} traps are the same`);
      }
    }
  }

  function checkReadings(found) {
    for (const r of readings) {
      if (!topics.some((t) => t.id === r.topic)) found.push(`${r.id}: unknown topic "${r.topic}"`);
      if (!r.title || !r.title.ko || !r.title.en) found.push(`${r.id}: needs title { ko, en }`);
      if (!r.kind || !r.kind.ko || !r.kind.en) found.push(`${r.id}: needs kind { ko, en } (a diary, a message…)`);
      if (r.sentences.length < 3) found.push(`${r.id}: needs 3+ sentences`);
      r.sentences.forEach((s, i) => {
        if (!s || !s.ko || !s.en) found.push(`${r.id} sentence ${i}: needs ko and en`);
        // It's read aloud: numbers in digits need a counter (7시, 3,000원), or a "say" with them in Hangul.
        else if (/\d/.test(s.say || M.numbers.readAloud(s.ko))) found.push(`${r.id} sentence ${i}: add "say", the sentence as it's read aloud with its numbers in Hangul`);
      });
      for (const ref of r.needs) if (!words.has(ref)) found.push(`${r.id}: unknown word "${ref}" (use topic:id)`);
      if (r.questions.length < 2) found.push(`${r.id}: needs 2+ questions`);
      r.questions.forEach((q, i) => {
        const label = `${r.id} question ${i + 1}`;
        if (!q.q || !q.q.ko || !q.q.en) found.push(`${label}: needs q: { ko, en }`);
        const options = Array.isArray(q.options) ? q.options : [];
        if (options.some((o) => !o || !o.ko || !o.en)) found.push(`${label}: each option needs ko and en`);
        else if (options.length < 3 || new Set(options.map((o) => o.ko)).size !== options.length) found.push(`${label}: needs 3+ different options`);
        else if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length)) found.push(`${label}: answer must be an option index`);
        const lines = [].concat(q.line);
        if (!lines.length || lines.some((n) => !(n >= 0 && n < r.sentences.length))) found.push(`${label}: "line" must point to the sentence(s) with the answer`);
        if (!q.why) found.push(`${label}: needs "why"`);
      });
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
    checkReadings(found);
    checkSpeech(found);
    return found;
  }

  const inTopic = (topicId) => (item) => !topicId || topicId === 'all' || item.topicId === topicId;

  M.content = {
    registerTopic,
    registerSoundSets,
    registerGrammar,
    registerDialogues,
    registerReadings,
    registerSpeechLevels,
    check,
    grammar: () => grammar.slice(),
    grammarPattern: (id) => grammar.find((g) => g.id === id) || null,
    dialogues: (topicId = 'all') => dialogues.filter((d) => !topicId || topicId === 'all' || d.topic === topicId),
    dialogue: (id) => dialogues.find((d) => d.id === id) || null,
    readings: (topicId = 'all') => readings.filter((r) => !topicId || topicId === 'all' || r.topic === topicId),
    reading: (id) => readings.find((r) => r.id === id) || null,
    speechLevels: () => speech.items.slice(),
    speechItem: (id) => speech.items.find((x) => x.id === id) || null,
    speechScenes: () => speech.scenes.slice(),
    speechCard: () => speech.card,
    LEVELS,
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
