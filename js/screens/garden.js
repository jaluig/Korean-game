/**
 * The Word Garden: every word as a plant that grows with each successful
 * review. Filter by what's due, tricky or mastered; click a word for details.
 * Also home to the lesson notes of each topic.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  /* ---------- Lesson notes ---------- */

  ui.showLessonNotes = (topic) => {
    const sections = topic.notes.map((note) =>
      h(
        'section.note',
        h('h3', ui.bi(note.title.ko, note.title.en)),
        h('p', ui.richText(note.text)),
        note.examples && note.examples.length
          ? h(
              'ul.note-examples',
              note.examples.map((ex) =>
                h('li', h('span.note-ko', { lang: 'ko' }, ex.ko), ui.audioButton(ex.ko.replace(/→/g, ','), { size: 'small' }), h('span.note-en', ex.en))
              )
            )
          : null
      )
    );
    const dialog = ui.modal({
      title: { ko: `${topic.emoji} ${topic.title.ko} · 레슨 노트`, en: `${topic.title.en} — lesson notes` },
      body: sections,
      cls: 'modal-wide',
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  };

  /* ---------- Word details ---------- */

  function showWord(word) {
    const r = M.srs.peek(word.id);
    const stage = r ? r.stage : 0;
    const info = ui.STAGES[stage];
    const settings = M.store.state.settings;
    const now = U.now();

    let status;
    if (!r || stage === 0) status = ui.bi('아직 안 배웠어요', 'Not learned yet — it will come up in Word Cards.');
    else if (r.assumed) status = ui.bi('확인 예정', `You probably know this — it will be checked ${U.relativeTime(r.due, now).en}.`);
    else if (r.due <= now) status = ui.bi('지금 복습할 수 있어요', 'Ready for review now 💧');
    else {
      const when = U.relativeTime(r.due, now);
      status = ui.bi(`다음 복습: ${when.ko}`, `Next review ${when.en}`);
    }

    const accuracy = r && r.seen ? Math.round((r.correct / r.seen) * 100) : null;
    const dialog = ui.modal({
      cls: 'modal-word',
      body: [
        h('div.word-detail-top', h('span.word-detail-emoji', { 'aria-hidden': 'true' }, word.emoji), h('span.word-detail-plant', { title: info.en }, info.emoji)),
        h('div.intro-word', h('span.ko-word', { lang: 'ko' }, word.ko), ui.audioButton(word.ko, { size: 'big' })),
        word.pron ? h('div.intro-pron', `[${word.pron}]`) : null,
        settings.showRomanization && word.rom ? h('div.intro-rom', word.rom) : null,
        h('div.intro-meaning', word.en),
        word.dict ? h('div.intro-dict', ui.bi('기본형', 'dictionary form'), h('b', { lang: 'ko' }, word.dict)) : null,
        word.note ? h('p.intro-note', '💡 ', word.note) : null,
        word.example ? ui.example(word.example) : null,
        h(
          'div.word-detail-status',
          h('div', h('b', `${info.emoji} `), ui.bi(info.ko, `${info.en} — ${info.desc}`, 'inline')),
          h('div', status),
          r && r.flag ? h('div.tricky-note', '🥀 ', ui.bi('어려운 단어', 'Tricky — get it right twice in a row to clear this', 'inline')) : null,
          r && r.seen ? h('div.word-detail-stats', `Seen ${r.seen}× · ${accuracy}% correct · missed ${r.wrong}×`) : null
        ),
      ],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }

  /* ---------- Filters ---------- */

  const FILTERS = [
    { id: 'all', ko: '전체', en: 'All', test: () => true },
    { id: 'due', ko: '복습', en: 'Due 💧', test: (w, r, now) => r && r.stage >= 1 && r.due <= now },
    { id: 'tricky', ko: '어려운 단어', en: 'Tricky 🥀', test: (w, r) => r && r.flag },
    { id: 'growing', ko: '자라는 중', en: 'Growing', test: (w, r) => r && r.stage >= 1 && r.stage < 5 },
    { id: 'mastered', ko: '마스터', en: 'Mastered 🌳', test: (w, r) => r && r.stage >= 5 },
    { id: 'new', ko: '안 배운 단어', en: 'Not started', test: (w, r) => !r || r.stage === 0 },
  ];

  function wordTile(word, now) {
    const r = M.srs.peek(word.id);
    const stage = r ? r.stage : 0;
    const due = r && stage >= 1 && r.due <= now;
    return h(
      'button',
      {
        type: 'button',
        class: `plant-tile stage-${stage} ${r && r.assumed ? 'assumed' : ''} ${r && r.flag ? 'tricky' : ''}`.replace(/\s+/g, ' ').trim(),
        title: `${word.en} — ${ui.STAGES[stage].en}`,
        on: { click: () => showWord(word) },
      },
      h('span.plant', { 'aria-hidden': 'true' }, ui.plant(stage)),
      h('span.plant-ko', { lang: 'ko' }, word.ko),
      h('span.plant-en', word.en),
      due ? h('span.plant-badge.due', { title: 'Ready for review' }, '💧') : null,
      r && r.flag ? h('span.plant-badge.tricky', { title: 'Tricky word' }, '🥀') : null
    );
  }

  M.screens.register({
    id: 'garden',

    render(view) {
      let filter = 'all';
      const draw = () => {
        const now = U.now();
        const all = M.srs.summary('all', now);
        const active = FILTERS.find((f) => f.id === filter);
        const count = (f) => M.content.words().filter((w) => f.test(w, M.srs.peek(w.id), now)).length;

        const legend = h(
          'ol.legend',
          ui.STAGES.map((s, i) => h('li', { title: s.desc }, h('span.legend-plant', { 'aria-hidden': 'true' }, s.emoji), ui.bi(s.ko, s.en), h('span.legend-count', String(all.byStage[i]))))
        );

        const chips = h(
          'div.filter-chips',
          { role: 'group', 'aria-label': 'Filter words' },
          FILTERS.map((f) =>
            h(
              'button',
              {
                type: 'button',
                class: `chip ${f.id === filter ? 'active' : ''}`.trim(),
                'aria-pressed': String(f.id === filter),
                on: {
                  click: () => {
                    filter = f.id;
                    draw();
                  },
                },
              },
              ui.bi(f.ko, f.en),
              h('span.chip-count', String(count(f)))
            )
          )
        );

        const sections = M.content.topics().map((topic) => {
          const words = M.content.words(topic.id).filter((w) => active.test(w, M.srs.peek(w.id), now));
          const s = M.srs.summary(topic.id, now);
          return h(
            'section',
            { class: `garden-topic tone-${topic.color}` },
            h(
              'div.garden-topic-head',
              h('h2', h('span', { 'aria-hidden': 'true' }, `${topic.emoji} `), ui.bi(topic.title.ko, topic.title.en)),
              h('div.garden-topic-growth', ui.bar(s.growth, { color: topic.color, label: `${topic.title.en} growth` }), h('span', `${Math.round(s.growth * 100)}%`)),
              h('button.btn.btn-soft.btn-small', { type: 'button', on: { click: () => ui.showLessonNotes(topic) } }, h('span.btn-icon', '📖'), ui.bi('레슨 노트', 'Lesson notes'))
            ),
            words.length
              ? h('div.plant-grid', words.map((w) => wordTile(w, now)))
              : h('p.muted', ui.bi('여기에는 단어가 없어요', 'No words here with this filter.'))
          );
        });

        U.clear(view).append(
          h(
            'div.garden',
            h(
              'div.page-head',
              h('h1', ui.bi('단어 정원', 'Word garden')),
              h('p.page-sub', 'Every word is a plant. Each time you remember it on time, it grows — and waits longer before its next review. Missed words (🥀) come back sooner.')
            ),
            legend,
            chips,
            sections
          )
        );
      };
      draw();
      return null;
    },
  });
})(window.Mallang);
