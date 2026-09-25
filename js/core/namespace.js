/**
 * Mallang Korean — the global namespace.
 *
 * The game is plain JavaScript loaded with classic <script> tags (no build
 * step, no ES modules), so it runs straight from a local file. Every file adds
 * its piece to the single global `Mallang` object, e.g. `Mallang.srs`.
 */
(function (global) {
  'use strict';

  const M = global.Mallang || (global.Mallang = {});
  M.version = '0.3.0';

  /** Tiny publish/subscribe bus so separate parts of the UI can stay in sync. */
  const listeners = new Map();
  M.events = {
    on(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
      return () => listeners.get(name).delete(fn);
    },
    emit(name, payload) {
      for (const fn of listeners.get(name) || []) {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[events] "${name}" handler failed`, err);
        }
      }
    },
  };

  /**
   * A registry holds pluggable parts (games, exercise types, screens) by id.
   * `list()` returns them sorted by their optional `order` field.
   */
  function createRegistry(kind) {
    const entries = new Map();
    return {
      register(def) {
        if (!def || !def.id) throw new Error(`[${kind}] a registration needs an "id"`);
        if (entries.has(def.id)) console.warn(`[${kind}] "${def.id}" was registered twice; keeping the last one`);
        entries.set(def.id, def);
        return def;
      },
      get(id) {
        return entries.get(id);
      },
      list() {
        return [...entries.values()].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      },
    };
  }

  M.games = createRegistry('game');
  M.exercises = createRegistry('exercise');
  M.screens = createRegistry('screen');

  /** In-memory hand-over between screens (e.g. a finished round → its summary). */
  M.session = { lastResult: null };
})(window);
