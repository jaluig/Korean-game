/**
 * App start-up: load progress, draw the top bar, and route between screens.
 * Routes are hash-based (#/home, #/play/word-cards…) so they work from file://.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const NAV = [
    { id: 'home', icon: '🏠', ko: '홈', en: 'Home' },
    { id: 'garden', icon: '🌱', ko: '정원', en: 'Garden' },
    { id: 'stats', icon: '📊', ko: '기록', en: 'Stats' },
    { id: 'settings', icon: '⚙️', ko: '설정', en: 'Settings' },
  ];

  const view = document.getElementById('view');
  const topbar = document.getElementById('topbar');
  let cleanup = null;
  let currentRoute = null;

  /* ---------- Top bar ---------- */

  const statEls = {};

  function buildTopbar() {
    const brandMascot = h('span.brand-mascot', { 'aria-hidden': 'true' });
    brandMascot.innerHTML = M.mascot.svg();
    statEls.mascot = brandMascot;
    statEls.streak = h('span.stat-chip.streak', { title: 'Day streak' });
    statEls.points = h('span.stat-chip.points', { title: 'Total points' });
    statEls.level = h('span.stat-chip.level', { title: 'Level' });
    statEls.nav = NAV.map((item) =>
      h('a.nav-link', { href: `#/${item.id}`, dataset: { route: item.id } }, h('span.nav-icon', { 'aria-hidden': 'true' }, item.icon), ui.bi(item.ko, item.en))
    );
    topbar.append(
      h(
        'div.topbar-inner',
        h('a.brand', { href: '#/home', 'aria-label': 'Mallang Korean — home' }, brandMascot, ui.bi('말랑 한국어', 'Mallang Korean', 'brand-name')),
        h('nav.nav', { 'aria-label': 'Main' }, statEls.nav),
        h('div.stat-chips', statEls.streak, statEls.points, statEls.level)
      )
    );
    updateStats();
  }

  function updateStats() {
    if (!statEls.streak) return;
    statEls.mascot.dataset.outfit = M.mascot.outfit();
    const streak = M.progress.currentStreak();
    statEls.streak.textContent = `🔥 ${streak}`;
    statEls.streak.classList.toggle('lit', M.progress.practisedToday());
    statEls.points.textContent = `⭐ ${M.store.state.totals.points.toLocaleString()}`;
    statEls.level.textContent = `Lv ${M.progress.levelInfo().level}`;
  }

  function updateNav(route) {
    for (const link of statEls.nav || []) {
      const active = link.dataset.route === route;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }

  /* ---------- Settings that change the whole page ---------- */

  const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function applySettings() {
    const s = M.store.state.settings;
    document.body.classList.toggle('no-en', !s.showEnglish);
    const dark = s.theme === 'dark' || (s.theme === 'system' && !!darkQuery && darkQuery.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  /* ---------- Routing ---------- */

  function parseHash() {
    const [name, arg] = location.hash.replace(/^#\/?/, '').split('/');
    return { name: name || 'home', arg: arg ? decodeURIComponent(arg) : undefined };
  }

  function route() {
    const { name, arg } = parseHash();
    if (!M.store.state.profile.onboarded && name !== 'onboarding') {
      location.replace('#/onboarding');
      return;
    }
    const screen = M.screens.get(name);
    if (!screen) {
      location.replace('#/home');
      return;
    }
    if (cleanup) {
      try {
        cleanup();
      } catch (err) {
        console.error(err);
      }
    }
    cleanup = null;
    ui.closeAllModals();
    M.keys.reset();
    document.querySelectorAll('.confetti').forEach((el) => el.remove());
    U.clear(view);
    document.body.dataset.screen = name;
    currentRoute = name;
    updateNav(name);
    updateStats();
    try {
      cleanup = screen.render(view, arg) || null;
    } catch (err) {
      console.error(err);
      view.append(h('div.card.error-card', h('h2', '😵 Something went wrong'), h('p', String(err && err.message)), h('a.btn.btn-primary', { href: '#/home' }, 'Home')));
    }
    window.scrollTo(0, 0);
    if (name !== 'play') view.focus({ preventScroll: true });
  }

  /* ---------- What's new (once per version, for returning players) ---------- */

  function whatsNew() {
    const profile = M.store.state.profile;
    if (!profile.onboarded || profile.seenVersion === M.version) return;
    profile.seenVersion = M.version;
    M.store.save();
    const games = ['balloon-pop', 'particle-lab', 'verb-magic', 'number-shop', 'sound-twins'].map((id) => M.games.get(id)).filter(Boolean);
    const topics = M.content.topics();
    const goal = M.progress.dailyGoal();
    const features = [
      ['✍️', 'Dictation: well-known sentences sometimes ask you to write down what you hear.'],
      M.mic.supported() ? ['🎤', 'Speaking practice: press 🎤 next to a word or sentence and say it out loud.'] : null,
      ['🌙', 'A dark theme (Settings → Display).'],
      ['🏅', `${M.progress.BADGES.length} badges to collect, and outfits for 말랑이 as you level up (wardrobe in Stats).`],
      ['🌅', 'A word of the day on the home screen.'],
    ].filter(Boolean);
    const dialog = ui.modal({
      title: { ko: '새로워졌어요!', en: 'What’s new in Mallang Korean' },
      cls: 'modal-wide whats-new',
      body: [
        h('h3', ui.bi(`새 게임 ${games.length}개`, `${games.length} new games`)),
        h('ul.whats-new-list', games.map((g) => h('li', h('span.whats-new-icon', { 'aria-hidden': 'true' }, g.emoji), ui.bi(g.title.ko, `${g.title.en}: ${g.blurb.en}`)))),
        h('h3', ui.bi('연습할 게 훨씬 많아요', 'Much more to practise')),
        h('p', `${topics.length} topics ${topics.map((t) => t.emoji).join(' ')} with ${M.content.words().length} words and ${M.content.sentences().length} sentences. Words below your starting level were added as quick checks, a few a day.`),
        h('ul.whats-new-list', features.map(([icon, text]) => h('li', h('span.whats-new-icon', { 'aria-hidden': 'true' }, icon), h('span', text)))),
        h('p.notice', `🎯 Your daily goal is now ${goal} ⭐, about ${M.progress.goalMinutes(goal)} minutes of practice. You can change it in Settings.`),
      ],
      actions: [ui.button({ ko: '좋아요!', en: 'Let’s go', variant: 'primary', onClick: () => dialog.close() })],
    });
  }

  /* ---------- Start ---------- */

  function start() {
    M.store.load();
    const problems = M.content.check();
    if (problems.length) console.warn(`[content] ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
    // New topics since last time: words below your starting level become quick checks.
    if (M.store.state.profile.onboarded && M.srs.syncStartLevel()) M.store.save();

    applySettings();
    if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', applySettings);
    buildTopbar();
    M.speech.init();

    M.events.on('progress', updateStats);
    M.events.on('settings', () => {
      applySettings();
      updateStats();
    });
    // Mid-round level-ups show on the summary; elsewhere, a quick toast.
    // A new outfit for 말랑이 is put on straight away (the wardrobe in Stats can change it).
    M.events.on('levelup', (level) => {
      const outfit = M.mascot.OUTFITS.find((o) => o.id && o.level === level);
      if (outfit) {
        M.store.state.profile.outfit = outfit.id;
        M.store.save();
        updateStats();
      }
      if (currentRoute !== 'play') {
        ui.toast({ icon: outfit ? outfit.emoji : '🎉', ko: `레벨 ${level}!`, en: outfit ? `Level ${level}! 말랑이 got a new outfit: ${outfit.en}` : `Level ${level}!`, tone: 'good' });
      }
    });

    if (!M.store.available) {
      document.body.prepend(
        h('div.storage-warning', '⚠️ ', ui.bi('저장이 안 돼요', 'This browser is blocking storage, so progress will be lost when the tab closes. See the README to run the game from a local server.', 'inline'))
      );
    } else if (M.store.recovered) {
      ui.toast({ icon: '🩹', ko: '저장 데이터가 손상돼서 새로 시작했어요', en: 'Your saved data was damaged, so the game started fresh (a copy was kept).', tone: 'warn', duration: 8000 });
    }

    window.addEventListener('hashchange', route);
    setTimeout(whatsNew, 400);
    // Streaks and "due" counts depend on the date: refresh when the tab comes back.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ['home', 'garden', 'stats'].includes(currentRoute)) route();
    });
    route();
  }

  start();
})(window.Mallang);
