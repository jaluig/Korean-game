/**
 * TOPIK I practice: a short mock test in the style of the real Test of
 * Proficiency in Korean, level I (1급–2급), built from content/topik.js.
 *
 * - A test is the listening section (듣기), the reading section (읽기) or both.
 *   Each section has the real test's kinds of questions in its order
 *   (config: session.topik.blueprint), 10 questions a section.
 * - The items seen least recently come first, so tests repeat as late as possible.
 * - Nothing is marked until the end. The score is out of 100 a section (200 for
 *   both), and the level is what that share of the points means on the real
 *   test: 80 of 200 is level 1, 140 is level 2.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const cfg = () => M.config.session.topik;

  /** The kinds of test, and the sections each one has. */
  const KINDS = {
    listening: { sections: ['listening'], emoji: '🎧', ko: '듣기', en: 'Listening' },
    reading: { sections: ['reading'], emoji: '📖', ko: '읽기', en: 'Reading' },
    full: { sections: ['listening', 'reading'], emoji: '📝', ko: '듣기 + 읽기', en: 'Listening + reading' },
  };

  function store() {
    const s = M.store.state;
    if (!s.topik) s.topik = { history: [], best: {}, seen: {} };
    return s.topik;
  }

  /** The least recently seen item of these types (never seen first; random among equals). */
  function pickItem(section, types, used) {
    const seen = store().seen;
    const pool = M.content.topik(section).filter((t) => types.includes(t.type) && !used.has(t.id));
    if (!pool.length) return null;
    const oldest = Math.min(...pool.map((t) => seen[t.id] || 0));
    return U.pick(pool.filter((t) => (seen[t.id] || 0) === oldest));
  }

  /** Options ㉠–㉣ (where a sentence goes) stay in order; the others are shuffled. */
  const keepsOrder = (q) => q.options.every((o) => M.content.TOPIK_MARKS.includes(o));

  /** A page of the test: an item and its questions, with the options in the order shown. */
  function page(item) {
    return {
      item,
      questions: item.questions.map((q) => {
        const order = keepsOrder(q) ? [0, 1, 2, 3] : U.shuffle([0, 1, 2, 3]);
        return { q, order, answer: order.indexOf(q.answer), chosen: null, number: 0 };
      }),
    };
  }

  /**
   * A new test of this kind: { kind, started, sections: [{ section, pages }] }.
   * The questions are numbered 1, 2, 3… across the sections, as on the real test.
   */
  function build(kind, now = U.now()) {
    const spec = KINDS[kind];
    if (!spec) throw new Error(`Unknown TOPIK practice test "${kind}"`);
    let number = 0;
    const sections = spec.sections.map((section) => {
      const used = new Set();
      const pages = [];
      for (const [types, count] of cfg().blueprint[section]) {
        for (let i = 0; i < count; i++) {
          const item = pickItem(section, [].concat(types), used);
          if (!item) break;
          used.add(item.id);
          pages.push(page(item));
        }
      }
      for (const p of pages) for (const x of p.questions) x.number = ++number;
      return { section, pages };
    });
    return { kind, started: now, sections };
  }

  const perItem = (section, types) => M.content.TOPIK_TYPES[section][[].concat(types)[0]].questions || 1;

  /** How many questions a test of this kind has, and the minutes it would get at the real test's pace. */
  function size(kind) {
    let questions = 0;
    let seconds = 0;
    for (const section of KINDS[kind].sections) {
      const n = cfg().blueprint[section].reduce((sum, [types, count]) => sum + count * perItem(section, types), 0);
      questions += n;
      seconds += n * cfg().secondsPer[section];
    }
    return { questions, minutes: Math.round(seconds / 60) };
  }

  /** Are there enough questions for a whole test of this kind? */
  function ready(kind) {
    return KINDS[kind].sections.every((section) =>
      cfg().blueprint[section].every(([types, count]) => M.content.topik(section).filter((t) => [].concat(types).includes(t.type)).length >= count)
    );
  }

  /** The TOPIK I level a share of the points stands for (0: not level 1 yet). */
  const levelFor = (percent) => (cfg().levels.find((l) => percent >= l.percent) || { level: 0 }).level;

  /** The result: each section out of 100, the total, and the level it stands for. */
  function score(test) {
    const parts = test.sections.map(({ section, pages }) => {
      const questions = pages.flatMap((p) => p.questions);
      const correct = questions.filter((x) => x.chosen === x.answer).length;
      return { section, correct, total: questions.length, score: questions.length ? Math.round((100 * correct) / questions.length) : 0 };
    });
    const points = parts.reduce((n, p) => n + p.score, 0);
    const max = 100 * parts.length;
    return {
      kind: test.kind,
      parts,
      score: points,
      max,
      correct: parts.reduce((n, p) => n + p.correct, 0),
      total: parts.reduce((n, p) => n + p.total, 0),
      level: levelFor((100 * points) / max),
    };
  }

  /** Remember a finished test: its result (the newest first) and the best score of its kind. */
  function record(test, result, now = U.now()) {
    const t = store();
    t.history.unshift({
      at: now,
      kind: test.kind,
      score: result.score,
      max: result.max,
      correct: result.correct,
      total: result.total,
      level: result.level,
      ms: now - test.started,
      parts: result.parts.map(({ section, score: points }) => ({ section, score: points })),
    });
    t.history.length = Math.min(t.history.length, cfg().history);
    t.best[test.kind] = Math.max(t.best[test.kind] || 0, result.score);
    M.progress.bump('topikTests');
    if (test.kind === 'full') M.progress.best('topikFull', result.score);
  }

  /** An item was shown (it comes back in later tests as late as possible). */
  function markSeen(item, now = U.now()) {
    store().seen[item.id] = now;
  }

  M.topik = {
    KINDS,
    build,
    size,
    ready,
    score,
    levelFor,
    record,
    markSeen,
    keepsOrder,
    /** The best score of a kind of test, or null before the first one. */
    best: (kind) => store().best[kind] ?? null,
    history: () => store().history.slice(),
  };
})(window.Mallang);
