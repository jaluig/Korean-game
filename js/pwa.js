/**
 * Installable app (PWA): when the game is opened from a web address (http or
 * https, e.g. `npm start` or a web host), it registers the service worker
 * (sw.js) so it works offline, and it can be installed like an app. Opened
 * as a file (index.html double-clicked), none of this applies: browsers
 * don't allow service workers or app manifests there. The game works the
 * same either way.
 */
(function (M) {
  'use strict';

  const web = location.protocol === 'http:' || location.protocol === 'https:';
  // Browsers allow offline copies and installing only on https:// addresses and on this computer (localhost).
  const secure = web && window.isSecureContext === true && 'serviceWorker' in navigator;
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

  M.pwa = {
    /** Served from a web address. */
    web,
    /** …where the offline copy and installing are allowed. */
    secure,
    /** Running as the installed app. */
    installed: standalone(),
    /** Just installed from this page (which is still a browser tab). */
    justInstalled: false,
    /** The browser's install prompt, once it offers one (Chrome, Edge). */
    installPrompt: null,
    /** iPhone / iPad Safari: installing is done from the Share menu. */
    ios: /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),

    /** Show the browser's install dialog. Resolves to true when the learner installs. */
    async install() {
      const prompt = M.pwa.installPrompt;
      if (!prompt) return false;
      M.pwa.installPrompt = null;
      prompt.prompt();
      const choice = await prompt.userChoice;
      M.events.emit('pwa');
      return choice && choice.outcome === 'accepted';
    },
  };

  if (!web) return;

  // Added here rather than in index.html: loaded from a file, the manifest link only causes an error.
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = 'manifest.webmanifest';
  document.head.append(link);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // offered in Settings instead of the browser's own mini-bar
    M.pwa.installPrompt = event;
    M.events.emit('pwa');
  });
  window.addEventListener('appinstalled', () => {
    M.pwa.installPrompt = null;
    M.pwa.justInstalled = true;
    M.events.emit('pwa');
  });

  if (secure) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Offline mode is not available:', err));
    });
  }
})(window.Mallang);
