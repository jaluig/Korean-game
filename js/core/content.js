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
  const honor = { card: null, items: [] };
  const stories = [];
  const topik = { listening: [], reading: [] };
  const replies = [];
  const sounds = { rules: [], items: [] };
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

  /** Who a plain sentence is about: what makes an honorific wrong there (the card explains each). */
  const PLAIN_WHO = ['self', 'younger', 'friend', 'child', 'thing'];

  /**
   * Honorifics (content/honorifics.js), practised in the Honorifics game: a card
   * (how -(으)시- is made, the verbs and nouns with an honorific word of their
   * own, 께서 and 께, the humble words, and why a wrong choice is wrong) and
   * items: the same idea about someone you respect (`honor`) and about someone
   * else (`plain`), each a sentence whose `answer` is the word asked for, with
   * the wrong forms learners really make (`traps`). Item ids become 'honor:<id>'.
   */
  function registerHonorifics({ card, items } = {}) {
    if (card) honor.card = Object.freeze(card);
    for (const it of items || []) {
      const id = `honor:${it.id}`;
      if (!it.id || !it.honor || !it.plain) problems.push(`honorifics item "${it.id}": needs id, honor and plain`);
      else if (honor.items.some((x) => x.id === id)) problems.push(`${id}: duplicate honorifics item`);
      else honor.items.push(Object.freeze({ ...it, id, localId: it.id, level: it.level || 1, type: 'honor', needs: it.words || [], traps: it.traps || [], index: honor.items.length }));
    }
  }

  function checkHonorifics(found) {
    if (!honor.items.length && !honor.card) return;
    const { card } = honor;
    if (!card || !card.title || !card.text || !Array.isArray(card.sections) || !Array.isArray(card.table) || !card.wrong) found.push('honorifics: the card needs title, text, sections, table and wrong');
    else {
      if (card.sections.length < 2) found.push('honorifics card: needs 2+ sections');
      for (const sec of card.sections) if (!sec.title || !sec.title.ko || !sec.title.en || !sec.text || !Array.isArray(sec.examples) || !sec.examples.length || sec.examples.some((e) => !e.ko || !e.en)) found.push(`honorifics card section "${sec.title && sec.title.en}": needs title { ko, en }, text and examples [{ ko, en }]`);
      for (const row of card.table) if (!row.en || !row.plain || !row.honor) found.push('honorifics card: each table row needs en, plain and honor');
      if (!card.wrong.respect) found.push('honorifics card: needs wrong.respect (a plain form about someone you respect)');
    }
    for (const it of honor.items) {
      if (![1, 2, 3].includes(it.level)) found.push(`${it.id}: level 1, 2 or 3`);
      for (const side of ['honor', 'plain']) {
        const x = it[side];
        if (!x.ko || !x.en || !x.answer || !x.dict) {
          found.push(`${it.id} ${side}: needs ko, en, answer and dict`);
          continue;
        }
        const at = x.ko.indexOf(x.answer);
        if (at < 0 || x.ko.indexOf(x.answer, at + 1) >= 0) found.push(`${it.id} ${side}: the answer "${x.answer}" must appear exactly once in "${x.ko}"`);
      }
      if (it.honor.answer && it.honor.answer === it.plain.answer) found.push(`${it.id}: the honorific and the plain answer must differ`);
      if (!PLAIN_WHO.includes(it.plain.who)) found.push(`${it.id} plain: "who" must be one of ${PLAIN_WHO.join(', ')}`);
      else if (card && card.wrong && !card.wrong[it.plain.who]) found.push(`honorifics card: needs wrong.${it.plain.who} (used by ${it.id})`);
      if (!it.needs.length) found.push(`${it.id}: list its key words in "words" (it opens once they're learned)`);
      for (const ref of it.needs) if (!words.has(ref)) found.push(`${it.id}: unknown word "${ref}" (use topic:id)`);
      if (!it.traps.length) found.push(`${it.id}: needs a trap (a wrong form learners make)`);
      const texts = it.traps.map((t) => t.text);
      if (new Set(texts).size < texts.length) found.push(`${it.id}: two traps are the same`);
      for (const t of it.traps) {
        if (!t.text || !t.why) found.push(`${it.id}: each trap needs text and why`);
        else if (t.text === it.honor.answer || t.text === it.plain.answer) found.push(`${it.id}: the trap "${t.text}" is one of the right answers`);
      }
    }
    // "Which plain word?" offers two other items' plain words: two must exist that can't also be right.
    if (honor.items.length >= 3) {
      for (const it of honor.items) {
        const others = new Set(honor.items.filter((x) => x !== it && x.plain.dict !== it.plain.dict && x.honor.dict !== it.honor.dict && x.plain.answer !== it.plain.answer).map((x) => x.plain.answer));
        if (others.size < 2) found.push(`${it.id}: fewer than two other items' plain words to offer as wrong options`);
      }
    }
  }

  /**
   * Stories (content/stories.js), heard in the Stories game: a short story or a
   * podcast-style talk in a few parts, read by one narrator, with questions
   * after each part (`line`: the sentence of that part with the answer).
   * Ids become 'story:<id>'.
   */
  function registerStories(list) {
    for (const st of list || []) {
      const id = `story:${st.id}`;
      if (!st.id || !Array.isArray(st.parts)) problems.push(`story "${st.id}": needs id and parts`);
      else if (stories.some((x) => x.id === id)) problems.push(`${id}: duplicate story`);
      else stories.push(Object.freeze({ ...st, id, localId: st.id, level: st.level || 1, type: 'story', needs: st.words || [], index: stories.length }));
    }
  }

  function checkStories(found) {
    for (const st of stories) {
      if (!topics.some((t) => t.id === st.topic)) found.push(`${st.id}: unknown topic "${st.topic}"`);
      if (!st.title || !st.title.ko || !st.title.en) found.push(`${st.id}: needs title { ko, en }`);
      if (!st.kind || !st.kind.ko || !st.kind.en) found.push(`${st.id}: needs kind { ko, en } (a story, a podcast…)`);
      if (!['high', 'low'].includes(st.voice)) found.push(`${st.id}: the narrator's voice is 'high' or 'low'`);
      if (![1, 2, 3].includes(st.level)) found.push(`${st.id}: level 1, 2 or 3`);
      if (st.parts.length < 2 || st.parts.length > 4) found.push(`${st.id}: needs 2–4 parts`);
      for (const ref of st.needs) if (!words.has(ref)) found.push(`${st.id}: unknown word "${ref}" (use topic:id)`);
      if (!st.needs.length) found.push(`${st.id}: list its key words in "words" (it opens once they're learned)`);
      st.parts.forEach((part, p) => {
        const label = `${st.id} part ${p + 1}`;
        const lines = Array.isArray(part.lines) ? part.lines : [];
        if (lines.length < 2) found.push(`${label}: needs 2+ lines`);
        lines.forEach((l, i) => {
          if (!l || !l.ko || !l.en) found.push(`${label} line ${i}: needs ko and en`);
          // It's read aloud: numbers in digits need a counter (7시), or a "say" with them in Hangul.
          else if (/\d/.test(l.say || M.numbers.readAloud(l.ko))) found.push(`${label} line ${i}: write the number in Hangul, or add "say"`);
        });
        const questions = Array.isArray(part.questions) ? part.questions : [];
        if (!questions.length) found.push(`${label}: needs a question`);
        questions.forEach((q, k) => {
          const qlabel = `${label} question ${k + 1}`;
          if (!q.q || !q.q.ko || !q.q.en) found.push(`${qlabel}: needs q: { ko, en }`);
          const options = Array.isArray(q.options) ? q.options : [];
          if (options.some((o) => !o || !o.ko || !o.en)) found.push(`${qlabel}: each option needs ko and en`);
          else if (options.length !== 3 || new Set(options.map((o) => o.ko)).size !== 3) found.push(`${qlabel}: needs 3 different options`);
          else if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length)) found.push(`${qlabel}: answer must be an option index`);
          const at = [].concat(q.line);
          if (!at.length || at.some((n) => !(Number.isInteger(n) && n >= 0 && n < lines.length))) found.push(`${qlabel}: "line" must point to the line(s) of this part with the answer`);
          if (!q.why) found.push(`${qlabel}: needs "why"`);
        });
      });
    }
  }

  /**
   * TOPIK I practice (content/topik.js): questions in the style of the real
   * test, in its two sections. Each entry is one thing to hear (`script`, read
   * aloud by a man 'm' and a woman 'w') or to read (`text`, or a `notice`), with
   * one question, or two for a "set". Its type is the kind of question: how many
   * lines it has, and the instruction shown above it (as on the real test).
   * Ids become 'topik:<id>'.
   */
  const TOPIK_TYPES = {
    listening: {
      reply: { lines: [1, 1], ko: '다음을 듣고 물음에 맞는 대답을 고르십시오.', en: 'Listen and choose the right answer to the question.' },
      next: { lines: [1, 1], ko: '다음을 듣고 이어지는 말을 고르십시오.', en: 'Listen and choose what comes next.' },
      place: { lines: [2, 2], ko: '여기는 어디입니까? 알맞은 것을 고르십시오.', en: 'Where are they? Choose the place.' },
      topic: { lines: [2, 2], ko: '다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.', en: 'What are they talking about?' },
      match: { lines: [3, 6], ko: '다음을 듣고 대화 내용과 같은 것을 고르십시오.', en: 'Listen and choose what matches the conversation.' },
      idea: { lines: [3, 6], ko: '다음을 듣고 {whose}의 중심 생각을 고르십시오.', en: 'Listen and choose what the {whose} mainly thinks.' },
      set: { lines: [3, 10], questions: 2, ko: '다음을 듣고 물음에 답하십시오.', en: 'Listen and answer the questions.' },
    },
    reading: {
      about: { lines: [2, 2], ko: '무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.', en: 'What is it about?' },
      blank: { lines: [1, 2], ko: '(    )에 들어갈 가장 알맞은 것을 고르십시오.', en: 'Choose what fits the blank best.' },
      notice: { lines: [0, 0], ko: '다음을 읽고 맞지 않는 것을 고르십시오.', en: 'Read it and choose what is NOT true.' },
      match: { lines: [3, 4], ko: '다음의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
      idea: { lines: [3, 4], ko: '다음을 읽고 중심 내용을 고르십시오.', en: 'Read it and choose the main idea.' },
      order: { lines: [4, 4], ko: '다음을 순서대로 맞게 나열한 것을 고르십시오.', en: 'Choose the right order of the sentences.' },
      set: { lines: [3, 8], questions: 2, ko: '다음을 읽고 물음에 답하십시오.', en: 'Read it and answer the questions.' },
    },
  };
  /** A notice (reading) looks like a poster, a phone message, a ticket, a list (a menu, a timetable) or a sign. */
  const NOTICE_KINDS = ['poster', 'message', 'ticket', 'list', 'sign'];
  /** Where does the quoted sentence go? Options ㉠–㉣ (kept in this order). */
  const TOPIK_MARKS = ['㉠', '㉡', '㉢', '㉣'];

  function registerTopik(sections = {}) {
    for (const section of Object.keys(TOPIK_TYPES)) {
      for (const t of sections[section] || []) {
        const id = `topik:${t.id}`;
        if (!t.id || !Array.isArray(t.questions)) problems.push(`topik "${t.id}": needs id and questions`);
        else if ([...topik.listening, ...topik.reading].some((x) => x.id === id)) problems.push(`${id}: duplicate TOPIK item`);
        else topik[section].push(Object.freeze({ ...t, id, localId: t.id, section, index: topik[section].length }));
      }
    }
  }

  const occurrences = (text, part) => text.split(part).length - 1;

  function checkTopik(found) {
    for (const t of [...topik.listening, ...topik.reading]) {
      const spec = TOPIK_TYPES[t.section][t.type];
      if (!spec) {
        found.push(`${t.id}: unknown ${t.section} type "${t.type}" (one of ${Object.keys(TOPIK_TYPES[t.section]).join(', ')})`);
        continue;
      }
      const listening = t.section === 'listening';
      const given = listening ? t.script : t.text;
      const lines = Array.isArray(given) ? given : [];
      const [min, max] = spec.lines;
      if (lines.length < min || lines.length > max) {
        found.push(`${t.id}: a ${t.section} "${t.type}" needs ${min === max ? min : `${min}–${max}`} ${listening ? 'lines in "script"' : 'sentences in "text"'}`);
      }
      lines.forEach((l, i) => {
        if (!l || !l.ko || !l.en) found.push(`${t.id} line ${i}: needs ko and en`);
        else if (listening && !['m', 'w'].includes(l.who)) found.push(`${t.id} line ${i}: who is 'm' (남자, a man) or 'w' (여자, a woman)`);
        // Read aloud: numbers in Hangul, or a "say" with them.
        else if (listening && /\d/.test(l.say || M.numbers.readAloud(l.ko))) found.push(`${t.id} line ${i}: write the number in Hangul, or add "say"`);
      });
      const all = lines.map((l) => (l && l.ko) || '').join(' ');
      if (listening && ['place', 'topic'].includes(t.type) && lines.length === 2 && lines[0]?.who === lines[1]?.who) found.push(`${t.id}: two people talk, one line each`);
      if (listening && t.type === 'idea' && !lines.some((l) => l && l.who === t.whose)) found.push(`${t.id}: "whose" ('m' or 'w') must be one of the speakers`);
      if (t.type === 'blank' && (all.match(/\(\s+\)/g) || []).length !== 1) found.push(`${t.id}: the text needs exactly one blank (    )`);
      if (t.type === 'notice') {
        const n = t.notice || {};
        if (!NOTICE_KINDS.includes(n.kind)) found.push(`${t.id}: notice.kind is one of ${NOTICE_KINDS.join(', ')}`);
        if (!n.title || !n.title.ko || !n.title.en) found.push(`${t.id}: the notice needs a title { ko, en }`);
        if (!Array.isArray(n.lines) || n.lines.length < 2 || n.lines.some((l) => !l || !l.ko || !l.en)) found.push(`${t.id}: the notice needs 2+ lines, each with ko and en`);
      }
      const want = spec.questions || 1;
      if (t.questions.length !== want) found.push(`${t.id}: a "${t.type}" has ${want === 1 ? 'one question' : `${want} questions`}`);
      t.questions.forEach((q, k) => {
        const label = `${t.id} question ${k + 1}`;
        if (!q || typeof q !== 'object') {
          found.push(`${label}: not a question`);
          return;
        }
        if (spec.questions ? !q.q || !q.q.ko || !q.q.en : q.q && (!q.q.ko || !q.q.en)) found.push(`${label}: needs q { ko, en }`);
        const options = Array.isArray(q.options) ? q.options : [];
        const texts = options.map((o) => (typeof o === 'string' ? o : o && o.ko));
        const marks = texts.every((x) => TOPIK_MARKS.includes(x));
        if (options.length !== 4 || texts.some((x) => !x) || new Set(texts).size !== 4) found.push(`${label}: needs 4 different options`);
        else if (t.type === 'order') {
          if (texts.some((x) => !/^(\((가|나|다|라)\)-){3}\((가|나|다|라)\)$/.test(x) || new Set(x.match(/[가나다라]/g)).size !== 4)) found.push(`${label}: each option is an order like (나)-(가)-(라)-(다)`);
        } else if (marks) {
          if (!q.quote || !q.quote.ko || !q.quote.en) found.push(`${label}: needs quote { ko, en }: the sentence to put in its place`);
          if (TOPIK_MARKS.some((m) => occurrences(all, m) !== 1)) found.push(`${label}: the text needs each of ㉠ ㉡ ㉢ ㉣ once`);
        } else if (options.some((o) => typeof o === 'string' || !o.en)) found.push(`${label}: each option needs ko and en`);
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4)) found.push(`${label}: answer must be an option index (0–3)`);
        if (!q.why) found.push(`${label}: needs "why"`);
        if (!marks && typeof q.q?.ko === 'string' && q.q.ko.includes('㉠') && occurrences(all, '㉠') !== 1) found.push(`${label}: the text needs the blank ( ㉠ ) once`);
      });
    }
  }

  /**
   * Choose your reply (content/replies.js): a conversation in which you play one
   * part. They speak (`{ them: { ko, en } }`), then you pick (or say) your line
   * from three (`{ you: [options] }`): one is right; after a wrong one they react
   * (`react`), and `why` explains it. Ids become 'reply:<id>'.
   */
  function registerReplies(list) {
    for (const r of list || []) {
      const id = `reply:${r.id}`;
      if (!r.id || !Array.isArray(r.steps)) problems.push(`reply "${r.id}": needs id and steps`);
      else if (replies.some((x) => x.id === id)) problems.push(`${id}: duplicate conversation`);
      else replies.push(Object.freeze({ ...r, id, localId: r.id, level: r.level || 1, type: 'reply', needs: r.words || [], index: replies.length }));
    }
  }

  function checkReplies(found) {
    for (const r of replies) {
      if (!topics.some((t) => t.id === r.topic)) found.push(`${r.id}: unknown topic "${r.topic}"`);
      if (!r.title || !r.title.ko || !r.title.en) found.push(`${r.id}: needs title { ko, en }`);
      if (![1, 2, 3].includes(r.level)) found.push(`${r.id}: level 1, 2 or 3`);
      if (!r.role || !r.role.ko || !r.role.en) found.push(`${r.id}: needs role { ko, en } (who you are in it)`);
      if (!r.goal || !r.goal.ko || !r.goal.en) found.push(`${r.id}: needs goal { ko, en } (what you want from it)`);
      const them = r.them || {};
      if (!them.name || !them.en || !them.emoji || !['high', 'low'].includes(them.voice)) found.push(`${r.id}: needs them { name, en, emoji, voice: 'high' | 'low' } (who you talk to)`);
      for (const ref of r.needs) if (!words.has(ref)) found.push(`${r.id}: unknown word "${ref}" (use topic:id)`);
      if (r.needs.length < 2) found.push(`${r.id}: list 2–4 key words in "words" (it opens once they're learned)`);
      const kinds = r.steps.map((st) => (st && st.them && st.you ? '?' : st && st.them ? 'them' : st && Array.isArray(st.you) ? 'you' : '?'));
      if (kinds.includes('?')) found.push(`${r.id}: each step is { them: { ko, en } } or { you: [three options] }`);
      if (kinds[0] !== 'them' || kinds[kinds.length - 1] !== 'them') found.push(`${r.id}: they speak first and last`);
      kinds.forEach((k, i) => {
        if (k === 'you' && kinds[i + 1] === 'you') found.push(`${r.id} step ${i}: they answer between two of your turns`);
      });
      const turns = kinds.filter((k) => k === 'you').length;
      if (turns < 3 || turns > 5) found.push(`${r.id}: needs 3–5 turns of yours`);
      // Everything is read aloud: numbers in Hangul, or a "say" with them.
      const spoken = (label, x) => {
        if (!x || !x.ko || !x.en) found.push(`${label}: needs ko and en`);
        else if (/\d/.test(x.say || M.numbers.readAloud(x.ko))) found.push(`${label}: write the number in Hangul, or add "say"`);
      };
      r.steps.forEach((st, i) => {
        const label = `${r.id} step ${i}`;
        if (st && st.them) spoken(label, st.them);
        if (!st || !Array.isArray(st.you)) return;
        const options = st.you;
        if (options.length !== 3 || new Set(options.map((o) => o && o.ko)).size !== 3) found.push(`${label}: needs 3 different options`);
        if (options.filter((o) => o && o.right).length !== 1) found.push(`${label}: exactly one option is right (right: true)`);
        options.forEach((o, k) => {
          spoken(`${label} option ${k + 1}`, o);
          if (o && !o.right) {
            spoken(`${label} option ${k + 1} react`, o.react);
            if (!o.why) found.push(`${label} option ${k + 1}: a wrong option needs "why"`);
          }
        });
      });
    }
  }

  /**
   * Sound changes (content/sound-changes.js): the rules that change how words
   * sound (연음, 비음화…), each with a card, and items: a word or phrase, how it's
   * said (`pron`, in Hangul, without brackets), wrong pronunciations and wrong
   * spellings learners might pick. Rule ids become 'pronrule:<id>', items 'pron:<id>'.
   */
  function registerSoundChanges({ rules, items } = {}) {
    for (const r of rules || []) {
      const id = `pronrule:${r.id}`;
      if (!r.id) problems.push('sound-change rule: needs an id');
      else if (sounds.rules.some((x) => x.id === id)) problems.push(`${id}: duplicate rule`);
      else sounds.rules.push(Object.freeze({ ...r, id, localId: r.id, level: r.level || 1, type: 'pronrule', index: sounds.rules.length }));
    }
    for (const x of items || []) {
      const id = `pron:${x.id}`;
      if (!x.id) problems.push('sound-change item: needs an id');
      else if (sounds.items.some((y) => y.id === id)) problems.push(`${id}: duplicate item`);
      else sounds.items.push(Object.freeze({ ...x, id, localId: x.id, rule: `pronrule:${x.rule}`, level: x.level || 1, type: 'pron', index: sounds.items.length }));
    }
    sounds.rules.sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.index - b.index);
  }

  function checkSoundChanges(found) {
    const plain = (t) => String(t).replace(/\s+/g, '');
    const known = new Map([...words.values()].map((w) => [plain(w.ko), w.id]));
    for (const r of sounds.rules) {
      if (!r.title || !r.title.ko || !r.title.en) found.push(`${r.id}: needs title { ko, en }`);
      if (!r.text) found.push(`${r.id}: needs text (the rule in plain English, Korean in **bold**)`);
      const examples = Array.isArray(r.examples) ? r.examples : [];
      if (examples.length < 2 || examples.some((e) => !e || !e.ko || !e.pron || !e.en)) found.push(`${r.id}: needs 2+ examples { ko, pron, en }`);
      else if (examples.some((e) => !/^[가-힣 ]+$/.test(e.pron) || plain(e.pron) === plain(e.ko))) found.push(`${r.id}: an example's pron is in Hangul only, without brackets, and differs from its spelling`);
      if (sounds.items.filter((x) => x.rule === r.id).length < 6) found.push(`${r.id}: needs 6+ items`);
    }
    for (const x of sounds.items) {
      if (!sounds.rules.some((r) => r.id === x.rule)) found.push(`${x.id}: unknown rule "${x.rule}"`);
      if (![1, 2, 3].includes(x.level)) found.push(`${x.id}: level 1, 2 or 3`);
      if (!x.ko || !x.pron || !x.en) {
        found.push(`${x.id}: needs ko, pron and en`);
        continue;
      }
      if (!/^[가-힣 ]+$/.test(x.pron)) found.push(`${x.id}: pron in Hangul only, without brackets`);
      if (plain(x.ko) === plain(x.pron)) found.push(`${x.id}: pron must differ from the spelling`);
      const wrong = Array.isArray(x.wrong) ? x.wrong : [];
      if (wrong.length < 2 || wrong.length > 3 || new Set(wrong.map(plain)).size !== wrong.length || wrong.some((w) => plain(w) === plain(x.pron) || !/^[가-힣 ]+$/.test(w))) {
        found.push(`${x.id}: needs 2–3 different wrong pronunciations in "wrong" (Hangul, not the right one)`);
      }
      const spellings = Array.isArray(x.spellings) ? x.spellings : [];
      if (spellings.length !== 2 || new Set(spellings.map(plain)).size !== 2 || spellings.some((w) => plain(w) === plain(x.ko) || !/^[가-힣 ]+$/.test(w))) {
        found.push(`${x.id}: needs 2 different wrong spellings in "spellings" (Hangul, not the right one)`);
      }
      // A wrong spelling must not be a real word that sounds the same (같이 → 가치 "value"): at least none of the game's words.
      for (const w of spellings) if (known.has(plain(w))) found.push(`${x.id}: the spelling "${w}" is a real word (${known.get(plain(w))}): pick another`);
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
        if (!lines.length || lines.some((n) => !(Number.isInteger(n) && n >= 0 && n < r.sentences.length))) found.push(`${label}: "line" must point to the sentence(s) with the answer`);
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
        if (!lines.length || lines.some((n) => !(Number.isInteger(n) && n >= 0 && n < d.lines.length))) found.push(`${label}: "line" must point to the line(s) with the answer`);
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
    checkHonorifics(found);
    checkStories(found);
    checkTopik(found);
    checkReplies(found);
    checkSoundChanges(found);
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
    registerHonorifics,
    registerStories,
    registerTopik,
    registerReplies,
    registerSoundChanges,
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
    honorifics: () => honor.items.slice(),
    honorItem: (id) => honor.items.find((x) => x.id === id) || null,
    honorCard: () => honor.card,
    PLAIN_WHO,
    stories: (topicId = 'all') => stories.filter((st) => !topicId || topicId === 'all' || st.topic === topicId),
    story: (id) => stories.find((st) => st.id === id) || null,
    /** TOPIK I practice items: one section ('listening' or 'reading') or both. */
    topik: (section) => (section ? topik[section] || [] : [...topik.listening, ...topik.reading]).slice(),
    topikItem: (id) => [...topik.listening, ...topik.reading].find((t) => t.id === id) || null,
    TOPIK_TYPES,
    TOPIK_MARKS,
    NOTICE_KINDS,
    replies: (topicId = 'all') => replies.filter((r) => !topicId || topicId === 'all' || r.topic === topicId),
    reply: (id) => replies.find((r) => r.id === id) || null,
    soundRules: () => sounds.rules.slice(),
    soundRule: (id) => sounds.rules.find((r) => r.id === id) || null,
    /** Sound-change items: all, or one rule's ('pronrule:<id>'). */
    soundItems: (ruleId) => sounds.items.filter((x) => !ruleId || x.rule === ruleId),
    soundItem: (id) => sounds.items.find((x) => x.id === id) || null,
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
