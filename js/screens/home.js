/**
 * Home: the mascot's greeting, today's recommended practice, the daily goal,
 * the week's streak, the minigames and the topics (pick one to focus on).
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  /** What should the learner do next? */
  function recommendation(topicId) {
    const words = M.srs.wordPreview(topicId);
    if (words.due + words.fresh > 0) {
      return {
        game: 'word-cards',
        ko: `복습 ${words.due} · 새 단어 ${words.fresh}`,
        en: `${plural(words.due, 'word')} to review · ${words.fresh} new`,
      };
    }
    const sentences = M.srs.sentencePreview(topicId);
    if (sentences.due + sentences.fresh > 0) {
      return { game: 'sentence-builder', ko: `문장 ${sentences.due + sentences.fresh}개`, en: `${plural(sentences.due + sentences.fresh, 'sentence')} ready` };
    }
    // All caught up: suggest a different practice game each day.
    const extras = ['balloon-pop', 'particle-lab', 'verb-magic', 'speed-match', 'number-shop', 'sound-twins']
      .map((id) => M.games.get(id))
      .filter((g) => g && g.status(topicId).ready);
    if (extras.length) {
      const [y, m, d] = U.dayKey().split('-').map(Number);
      const game = extras[(y * 372 + m * 31 + d) % extras.length];
      return { game: game.id, ko: `복습 끝! ${game.title.ko} 한 판?`, en: `All caught up — a round of ${game.title.en}?` };
    }
    return { game: 'word-cards', ko: '추가 연습', en: 'Extra practice' };
  }

  function mascotMessage(topicId) {
    const P = M.progress;
    const words = M.srs.wordPreview(topicId);
    const tricky = M.srs.summary(topicId).tricky;
    const broken = P.brokenStreak();
    if (broken) return { ko: '다시 시작해 봐요!', en: `Your ${broken}-day streak ended — let's start a new one today!` };
    if (P.goalMet()) return { ko: '오늘 목표 달성! 🎉', en: 'Daily goal done! Extra practice makes it stick.' };
    if (tricky) return { ko: `어려운 단어 ${tricky}개에 물을 줘요 💧`, en: `${plural(tricky, 'tricky word')} could use some water.` };
    if (words.due) return { ko: `복습할 단어가 ${words.due}개 있어요`, en: `${plural(words.due, 'word')} ${words.due === 1 ? 'is' : 'are'} ready for review.` };
    if (words.fresh) return { ko: '새 단어 배워 볼까요?', en: 'Shall we learn some new words?' };
    return { ko: '오늘 할 일 끝!', en: 'All caught up — see you tomorrow!' };
  }

  function heroCard(topicId) {
    const mascot = M.mascot.create({ size: 150, bubble: false });
    const hello = M.mascot.greeting();
    const message = mascotMessage(topicId);
    const rec = recommendation(topicId);
    const game = M.games.get(rec.game);
    const topic = M.content.topic(topicId);

    return h(
      'section.card.home-hero',
      h('div.hero-mascot', mascot.el),
      h(
        'div.hero-main',
        h('div.hero-bubble', h('p.hero-hello', ui.bi(hello.ko, hello.en)), h('p.hero-message', ui.bi(message.ko, message.en))),
        h(
          'a.btn.btn-primary.btn-big.btn-cta',
          { href: `#/play/${rec.game}` },
          h('span.btn-icon', { 'aria-hidden': 'true' }, '▶\uFE0E'),
          h('span.cta-text', ui.bi('오늘의 연습 시작', "Start today's practice"), h('span.cta-sub', `${game.emoji} `, ui.bi(rec.ko, rec.en, 'inline')))
        ),
        h('p.hero-focus', '🎯 ', ui.bi(`범위: ${topic ? topic.title.ko : '전체 주제'}`, `Practising: ${topic ? topic.title.en : 'all topics'}`, 'inline'))
      )
    );
  }

  function goalCard() {
    const P = M.progress;
    const goal = P.dailyGoal();
    const today = P.todayPoints();
    const streak = P.currentStreak();
    const week = P.recentActivity(7);

    return h(
      'section.card.home-goal',
      h('h2.card-title', ui.bi('오늘의 목표', 'Daily goal')),
      h(
        'div.goal-row',
        ui.ring(today / goal, {
          size: 116,
          stroke: 13,
          color: today >= goal ? 'var(--mint-deep)' : 'var(--pink-deep)',
          label: `${today} of ${goal} points today`,
          children: [h('div.ring-num', String(Math.min(today, goal))), h('div.ring-sub', `/ ${goal} ⭐`)],
        }),
        h(
          'div.streak-box',
          h('div.streak-flame', { class: streak ? 'lit' : '' }, '🔥'),
          h('div.streak-num', String(streak)),
          h('div.streak-label', ui.bi('일 연속', streak === 1 ? 'day streak' : 'days streak'))
        )
      ),
      h(
        'ol.week',
        { 'aria-label': 'This week' },
        week.map((d) =>
          h(
            'li',
            { class: `day ${d.practised ? 'done' : ''} ${d.goalMet ? 'goal' : ''} ${d.today ? 'today' : ''}`.replace(/\s+/g, ' ').trim(), title: `${d.key}: ${d.points} points` },
            h('span.day-name', WEEKDAYS[U.weekday(d.key)]),
            h('span.day-dot', { 'aria-hidden': 'true' }, d.goalMet ? '★' : d.practised ? '●' : '')
          )
        )
      )
    );
  }

  /** The same word all day, a different one tomorrow. */
  function wordOfTheDay() {
    const words = M.content.words();
    let hash = 7;
    for (const ch of U.dayKey()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return words[hash % words.length];
  }

  function wordOfDayCard() {
    const w = wordOfTheDay();
    if (!w) return null;
    const stage = M.srs.stageOf(w.id);
    return h(
      'section.card.home-wotd',
      h('span.wotd-label', ui.bi('오늘의 단어', 'Word of the day')),
      h('span.wotd-emoji', { 'aria-hidden': 'true' }, w.emoji),
      h('span.wotd-word', h('span.wotd-ko', { lang: 'ko' }, w.ko), ui.audioButton(w.ko, { size: 'small' }), h('span.wotd-en', w.en)),
      w.example ? h('span.wotd-example', h('span', { lang: 'ko' }, w.example.ko), h('span.wotd-example-en', w.example.en)) : null,
      h(
        'button.link-btn.wotd-more',
        { type: 'button', title: stage ? ui.STAGES[stage].en : 'Not learned yet', on: { click: () => ui.showWord && ui.showWord(w) } },
        `${ui.plant(stage)} `,
        ui.bi('자세히', 'More', 'inline')
      )
    );
  }

  function gameCard(game, topicId) {
    const status = game.status(topicId);
    const body = [
      h('div.game-emoji', { 'aria-hidden': 'true' }, game.emoji),
      h('h3.game-title', ui.bi(game.title.ko, game.title.en)),
      h('p.game-blurb', ui.bi(game.blurb.ko, game.blurb.en)),
      h('p.game-status', status.ready ? '' : '🔒 ', ui.bi(status.ko, status.en)),
    ];
    if (status.ready) return h('a', { class: `card game-card tone-${game.color}`, href: `#/play/${game.id}` }, body);
    return h(
      'button',
      {
        type: 'button',
        class: `card game-card tone-${game.color} locked`,
        on: { click: () => ui.toast({ icon: '🔒', ko: status.ko, en: status.en }) },
      },
      body
    );
  }

  function topicCard(topic, focus, onPick) {
    const id = topic ? topic.id : 'all';
    const s = M.srs.summary(id);
    const selected = focus === id;
    const title = topic ? topic.title : { ko: '전체 주제', en: 'All topics' };
    const card = h(
      'div',
      { class: `card topic-card tone-${topic ? topic.color : 'lilac'} ${selected ? 'selected' : ''}`.trim() },
      h(
        'button.topic-pick',
        { type: 'button', 'aria-pressed': String(selected), dataset: { focus: `topic-${id}` }, on: { click: () => onPick(id) } },
        h('span.topic-emoji', { 'aria-hidden': 'true' }, topic ? topic.emoji : '🌈'),
        h(
          'span.topic-text',
          h('span.topic-title', ui.bi(title.ko, title.en)),
          h('span.topic-desc', topic ? ui.bi(topic.description.ko, topic.description.en, 'inline') : ui.bi('모두 섞어서', 'Mix everything', 'inline'))
        ),
        selected ? h('span.topic-check', { 'aria-hidden': 'true' }, '✓') : null
      ),
      ui.bar(s.growth, { color: topic ? topic.color : 'lilac', label: `${title.en}: garden growth` }),
      h(
        'div.topic-meta',
        h('span', `${ui.plant(1)} ${s.started}/${s.total} `, ui.bi('시작', 'started', 'inline')),
        h('span', `${ui.plant(5)} ${s.mastered} `, ui.bi('마스터', 'mastered', 'inline')),
        topic ? h('button.link-btn', { type: 'button', on: { click: () => ui.showLessonNotes(topic) } }, '📖 ', ui.bi('레슨 노트', 'Notes', 'inline')) : null
      )
    );
    return card;
  }

  M.screens.register({
    id: 'home',

    render(view) {
      const state = M.store.state;
      const draw = () => {
        const focus = state.settings.focusTopic;
        const topicId = M.content.topic(focus) ? focus : 'all';
        U.clear(view).append(
          h(
            'div.home',
            h('div.home-top', heroCard(topicId), goalCard()),
            wordOfDayCard(),
            h('h2.section-title', ui.bi('게임', 'Games')),
            h('div.game-grid', M.games.list().map((g) => gameCard(g, topicId))),
            h('h2.section-title', ui.bi('주제', 'Topics'), h('span.section-hint', ui.bi('연습할 주제를 골라요', 'Choose what to practise'))),
            h(
              'div.topic-grid',
              topicCard(null, topicId, pick),
              M.content.topics().map((t) => topicCard(t, topicId, pick))
            )
          )
        );
      };
      const pick = (id) => {
        state.settings.focusTopic = id;
        M.store.save();
        M.sfx.play('tap');
        ui.keepFocus(draw);
      };
      draw();
      return null;
    },
  });
})(window.Mallang);
