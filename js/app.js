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

  function applySettings() {
    const s = M.store.state.settings;
    document.body.classList.toggle('no-en', !s.showEnglish);
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

  /* ---------- Start ---------- */

  function start() {
    M.store.load();
    const problems = M.content.check();
    if (problems.length) console.warn(`[content] ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);

    applySettings();
    buildTopbar();
    M.speech.init();

    M.events.on('progress', updateStats);
    M.events.on('settings', () => {
      applySettings();
      updateStats();
    });
    // Mid-round level-ups show on the summary; elsewhere, a quick toast.
    M.events.on('levelup', (level) => {
      if (currentRoute !== 'play') ui.toast({ icon: '🎉', ko: `레벨 ${level}!`, en: `Level ${level}!`, tone: 'good' });
    });

    if (!M.store.available) {
      document.body.prepend(
        h('div.storage-warning', '⚠️ ', ui.bi('저장이 안 돼요', 'This browser is blocking storage, so progress will be lost when the tab closes. See the README to run the game from a local server.', 'inline'))
      );
    } else if (M.store.recovered) {
      ui.toast({ icon: '🩹', ko: '저장 파일을 복구했어요', en: 'Your saved data was damaged, so a fresh start was made (a copy was kept).', tone: 'warn', duration: 8000 });
    }

    window.addEventListener('hashchange', route);
    // Streaks and "due" counts depend on the date: refresh when the tab comes back.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ['home', 'garden', 'stats'].includes(currentRoute)) route();
    });
    route();
  }

  start();
})(window.Mallang);
