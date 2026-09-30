/**
 * Settings: display, sound & voice, practice options, starting level, and
 * backing up / restoring / resetting progress.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const settings = () => M.store.state.settings;

  function save() {
    M.store.save();
    M.events.emit('settings');
  }

  function toggle(key, ko, en, desc) {
    return h(
      'label.setting.toggle',
      h('input', {
        type: 'checkbox',
        checked: !!settings()[key],
        dataset: { focus: `toggle-${key}` },
        on: {
          change: (event) => {
            settings()[key] = event.target.checked;
            save();
          },
        },
      }),
      h('span.toggle-track', { 'aria-hidden': 'true' }, h('span.toggle-knob')),
      h('span.setting-text', h('span.setting-name', ui.bi(ko, en)), desc ? h('span.setting-desc', desc) : null)
    );
  }

  /** A row of radio "pills". options: [{ value, ko, en, sub }] */
  function choice(name, options, current, onPick) {
    return h(
      'div.segmented',
      { role: 'radiogroup' },
      options.map((o) =>
        h(
          'label',
          { class: `segment ${o.value === current ? 'checked' : ''}`.trim() },
          h('input', {
            type: 'radio',
            name,
            value: String(o.value),
            checked: o.value === current,
            dataset: { focus: `${name}-${o.value}` },
            on: { change: () => onPick(o.value) },
          }),
          ui.bi(o.ko, o.en),
          o.sub ? h('span.segment-sub', o.sub) : null
        )
      )
    );
  }

  /** Daily goal: a few presets, or any value on the slider. */
  function goalSetting() {
    const s = settings();
    const { min, max, step } = M.config.customGoal;
    const minutes = (points) => M.progress.goalMinutes(points);
    const value = h('output.goal-custom-value', { for: 'goal-range' });
    const show = (points) => {
      value.textContent = `${points} ⭐ · ~${minutes(points)} min`;
    };
    const range = h('input.goal-range', {
      id: 'goal-range',
      type: 'range',
      min,
      max,
      step,
      value: s.dailyGoal,
      dataset: { focus: 'goal-range' },
      on: {
        input: (event) => show(Number(event.target.value)),
        change: (event) => {
          s.dailyGoal = Number(event.target.value);
          save();
          redraw();
        },
      },
    });
    show(s.dailyGoal);
    return h(
      'div.setting',
      h(
        'span.setting-text',
        h('span.setting-name', ui.bi('하루 목표', 'Daily goal')),
        h('span.setting-desc', `Points (⭐) to earn each day. A focused minute of practice earns about ${M.config.pointsPerMinute} ⭐.`)
      ),
      choice(
        'goal',
        M.config.dailyGoals.map((g) => ({ value: g.points, ko: g.ko, en: `${g.en} · ${g.points} ⭐`, sub: `~${g.minutes} min` })),
        s.dailyGoal,
        (points) => {
          s.dailyGoal = points;
          save();
          redraw();
        }
      ),
      h('div.goal-custom', h('label', { for: 'goal-range' }, ui.bi('직접 정하기', 'Or choose your own', 'inline')), range, value)
    );
  }

  function section(icon, ko, en, ...rows) {
    return h('section.card.settings-section', h('h2.card-title', h('span', { 'aria-hidden': 'true' }, `${icon} `), ui.bi(ko, en)), rows);
  }

  function voiceSection() {
    const status = M.speech.browserStatus();
    const voices = M.speech.voices();
    const rows = [];
    const azureOn = M.azureSpeech.configured();
    const sayBrowser = (text) => M.speech.speakWithBrowser(text); // (with Azure on, M.speech.speak would use Azure)

    if (status === 'ready') {
      const current = M.speech.voice();
      rows.push(
        h(
          'div.setting',
          h(
            'span.setting-text',
            h('span.setting-name', azureOn ? ui.bi('브라우저 목소리', 'Browser voice') : ui.bi('목소리', 'Voice')),
            h('span.setting-desc', `${voices.length} Korean voice${voices.length === 1 ? '' : 's'} found.${azureOn ? ' It speaks when Azure can’t.' : ''}`)
          ),
          h(
            'div.voice-row',
            h(
              'select.select',
              {
                'aria-label': 'Korean voice',
                on: {
                  change: (event) => {
                    settings().voiceURI = event.target.value;
                    save();
                    sayBrowser('안녕하세요! 반가워요.');
                  },
                },
              },
              voices.map((v) => h('option', { value: v.voiceURI, selected: current && v.voiceURI === current.voiceURI }, `${v.name}${v.localService ? '' : ' (online)'}`))
            ),
            ui.button({ icon: '🔊', ko: '들어 보기', en: 'Test', variant: 'soft', size: 'small', onClick: () => sayBrowser('안녕하세요! 반가워요.') })
          )
        )
      );
    } else if (status === 'loading') {
      rows.push(h('p.muted', '⏳ ', ui.bi('목소리를 찾는 중…', 'Looking for Korean voices…', 'inline')));
    } else if (azureOn) {
      rows.push(h('p.setting-desc', '🔇 This browser has no Korean voice of its own, so there’s no sound when Azure can’t answer.'));
    } else {
      rows.push(h('div.notice.notice-warn', h('b', '🔇 No Korean voice found. '), ui.voiceHelp()));
    }
    rows.push(azureSetting());

    rows.push(
      h(
        'div.setting',
        h('span.setting-text', h('span.setting-name', ui.bi('말하기 속도', 'Speaking speed'))),
        choice(
          'rate',
          [
            { value: 0.7, ko: '천천히', en: 'Slow' },
            { value: 0.9, ko: '보통', en: 'Normal' },
            { value: 1.05, ko: '빠르게', en: 'Fast' },
          ],
          settings().speechRate,
          (value) => {
            settings().speechRate = value;
            save();
            M.speech.speak('천천히 말해 주세요.', { quiet: true });
            redraw();
          }
        )
      )
    );
    rows.push(toggle('autoPlayAudio', '자동 재생', 'Play pronunciation automatically', 'Hear each word when it appears and after you answer.'));
    rows.push(toggle('sfx', '효과음', 'Sound effects', 'Little dings and pops.'));
    if (M.mic.supported()) {
      rows.push(toggle('speaking', '말하기 연습', 'Speaking practice 🎤', 'Show 🎤 buttons next to words and sentences: say them out loud and the browser checks you (in role-plays and Shadowing too). Needs a microphone; Chrome uses its online speech service for this.'));
    } else {
      rows.push(h('p.setting-desc', '🎤 Speaking practice needs a browser with speech recognition, like Chrome or Edge.'));
    }
    return section('🔊', '소리', 'Sound', rows);
  }

  /* ---------- Azure voices (optional): your own key, kept only in this browser ---------- */

  let azureDraft = null; // what's typed but not saved yet (a redraw mustn't lose it)
  let azureNote = null; // { tone, text }: the last test's result
  let azureAttempt = 0; // (a test that ends after "Remove" doesn't report)

  function azureSetting() {
    const A = M.azureSpeech;
    const c = M.config.azureSpeech;
    const saved = A.settings();
    const on = A.configured();
    const draft = azureDraft || (azureDraft = { key: '', region: saved.region, voice: A.mainVoice() });
    const labelOf = (name) => (c.voices.find((v) => v.name === name) || { label: name }).label;
    const note = (tone, text) => {
      azureNote = { tone, text };
      redraw();
    };
    const input = (name, attrs) =>
      h('input.text-input', {
        ...attrs,
        value: draft[name],
        autocomplete: 'off',
        spellcheck: 'false',
        autocapitalize: 'off',
        dataset: { focus: `azure-${name}` },
        on: { input: (event) => (draft[name] = event.target.value) },
      });
    const field = (ko, en, control) => h('label.azure-field', h('span.azure-field-name', ui.bi(ko, en, 'inline')), control);

    async function saveAndTest() {
      const attempt = ++azureAttempt;
      const key = draft.key.trim() || saved.key;
      if (!key) return note('bad', 'Paste your key first: KEY 1 on your Speech resource’s “Keys and Endpoint” page.');
      if (!/^[a-z0-9]+$/.test(draft.region.trim().toLowerCase().replace(/\s+/g, ''))) return note('bad', 'Add the region too: the “Location/Region” on the same page, e.g. koreacentral.');
      A.save({ key, region: draft.region, voice: draft.voice });
      draft.key = ''; // (once saved, the key isn't put back into the page)
      draft.region = A.settings().region;
      note('', '⏳ Asking Azure…');
      try {
        await A.test();
        if (attempt === azureAttempt) note('good', `✅ It works: ${labelOf(A.mainVoice())} from Azure is speaking now.`);
      } catch (err) {
        if (attempt === azureAttempt) note('bad', `❌ ${err.message} Until it works, the browser’s voice speaks.`);
      }
    }

    async function remove() {
      const ok = await ui.confirm({
        title: { ko: 'Azure 키를 지울까요?', en: 'Remove the Azure key?' },
        text: 'The key and the stored Azure audio are removed from this browser, and the browser’s voice speaks again.',
        ok: { ko: '지우기', en: 'Remove' },
        cancel: { ko: '취소', en: 'Cancel' },
      });
      if (!ok) return;
      azureAttempt++;
      A.forget();
      azureDraft = null;
      note('', 'Removed from this browser. The browser’s voice speaks again.');
    }

    const voice = h(
      'select.select',
      {
        'aria-label': 'Azure voice',
        dataset: { focus: 'azure-voice' },
        on: {
          change: (event) => {
            draft.voice = event.target.value;
            if (!on) return;
            A.save({ ...A.settings(), voice: draft.voice });
            M.speech.speak('안녕하세요! 반가워요.');
          },
        },
      },
      c.voices.map((v) => h('option', { value: v.name, selected: v.name === draft.voice }, `${v.label} · ${v.female ? '여성 woman' : '남성 man'}`))
    );
    let shown = azureNote;
    if (!shown && on && A.rejected()) shown = { tone: 'bad', text: `❌ ${(A.lastError() || {}).message || 'Azure didn’t accept the key.'} Until it works, the browser’s voice speaks.` };
    if (!shown) shown = { tone: '', text: on ? `✅ On: ${labelOf(A.mainVoice())} (${saved.region}). When Azure can’t answer, the browser’s voice speaks.` : 'Off: the browser’s voice speaks.' };
    const status = h(`p.setting-desc.azure-status${shown.tone ? `.${shown.tone}` : ''}`, { role: 'status' }, shown.text);
    const saveButton = ui.button({ icon: '💾', ko: '저장하고 들어 보기', en: 'Save and test', variant: 'mint', size: 'small', onClick: saveAndTest });
    saveButton.dataset.focus = 'azure-save';
    const removeButton = on ? ui.button({ icon: '🗑️', ko: '키 지우기', en: 'Remove the key', variant: 'soft', size: 'small', onClick: remove }) : null;
    if (removeButton) removeButton.dataset.focus = 'azure-remove';

    return h(
      'div.azure-setting',
      h(
        'span.setting-text',
        h('span.setting-name', ui.bi('Azure 목소리', 'Azure voices (optional)')),
        h('span.setting-desc', 'Microsoft Azure’s Korean voices sound more natural. They need a key from your own Azure Speech resource; its free tier is enough. How to get one: “Azure voices” in the README.')
      ),
      h(
        'div.azure-fields',
        // (a masked text box, not a password box: browsers would offer to save the key as this site's password)
        field(
          '키',
          'Key',
          input('key', {
            type: 'text',
            class: 'secret-input',
            placeholder: on ? 'Saved (paste a new key to change it)' : 'Paste KEY 1 here',
            'aria-label': 'Azure Speech key',
            'data-lpignore': 'true',
            'data-1p-ignore': 'true',
            'data-form-type': 'other',
          })
        ),
        field('지역', 'Region', input('region', { type: 'text', list: 'azure-regions', placeholder: 'e.g. koreacentral', 'aria-label': 'Azure region' })),
        field('목소리', 'Voice', voice)
      ),
      h('datalist', { id: 'azure-regions' }, c.regions.map((r) => h('option', { value: r }))),
      h('div.voice-row', saveButton, removeButton),
      status,
      h(
        'p.setting-desc.azure-privacy',
        '🔒 The key is kept only in this browser: it’s not in the game’s files or in your backups, and it’s sent only to Azure. Anyone using this browser could still see it in the developer tools, so use a free (F0) resource, and if the key ever leaks, regenerate it in the Azure portal.'
      )
    );
  }

  let redraw = () => {};

  async function changeLevel(level) {
    if (level === M.store.state.profile.startLevel) return;
    const ok = await ui.confirm({
      title: { ko: '시작 레벨을 바꿀까요?', en: 'Change your starting level?' },
      text: 'Words you have already practised keep their progress. Words you haven’t practised yet are re-sorted: below your level they become quick checks, the rest become new words.',
      ok: { ko: '바꾸기', en: 'Change' },
      cancel: { ko: '취소', en: 'Cancel' },
    });
    if (ok) {
      M.srs.applyStartLevel(level);
      save();
      ui.toast({ icon: '✅', ko: '바꿨어요!', en: 'Starting level updated.', tone: 'good' });
    }
    redraw();
  }

  function exportProgress() {
    const blob = new Blob([M.store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = h('a', { href: url, download: `mallang-korean-progress-${U.dayKey()}.json` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    ui.toast({ icon: '💾', ko: '저장했어요', en: 'Backup downloaded.', tone: 'good' });
  }

  function importProgress(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const ok = await ui.confirm({
        title: { ko: '불러올까요?', en: 'Restore this backup?' },
        text: 'This replaces your current progress with the backup.',
        ok: { ko: '불러오기', en: 'Restore' },
        cancel: { ko: '취소', en: 'Cancel' },
        danger: true,
      });
      if (!ok) return;
      try {
        M.store.importJson(String(reader.result));
        M.events.emit('settings');
        M.events.emit('progress', { amount: 0 });
        ui.toast({ icon: '✅', ko: '불러왔어요!', en: 'Progress restored.', tone: 'good' });
        redraw();
      } catch (err) {
        ui.toast({ icon: '⚠️', ko: '불러올 수 없어요', en: err.message || 'That file could not be read.', tone: 'warn', duration: 6000 });
      }
    };
    reader.readAsText(file);
  }

  async function resetProgress() {
    const ok = await ui.confirm({
      title: { ko: '처음부터 다시 할까요?', en: 'Reset all progress?' },
      text: 'This deletes your points, streak, badges and word garden. Export a backup first if you might want it back.',
      ok: { ko: '모두 지우기', en: 'Delete everything' },
      cancel: { ko: '취소', en: 'Cancel' },
      danger: true,
    });
    if (!ok) return;
    M.store.reset();
    M.events.emit('settings');
    M.events.emit('progress', { amount: 0 });
    location.hash = '#/onboarding';
  }

  /** Install as an app / play offline (js/pwa.js): what's possible depends on how the game was opened. */
  function appSection() {
    const pwa = M.pwa || {};
    let status;
    let action = null;
    if (pwa.installed) status = '✅ You’re using the installed app. It works offline, too.';
    else if (pwa.justInstalled) status = '✅ Installed! Open 말랑 한국어 from your home screen or your list of apps.';
    else if (pwa.installPrompt) {
      status = 'Install 말랑 한국어 as an app: it gets its own icon and window, and works offline.';
      action = ui.button({ icon: '📲', ko: '앱 설치하기', en: 'Install the app', variant: 'mint', onClick: () => pwa.install().then(() => redraw()) });
    } else if (pwa.web && !pwa.secure) status = 'From this address, the game can’t be installed or kept for offline play: browsers allow that only on https:// addresses and on this computer (localhost). Everything else works as usual.';
    else if (pwa.web && pwa.ios) status = 'On iPhone or iPad: tap Share, then “Add to Home Screen”. It works offline once it has been opened.';
    else if (pwa.web) status = 'This page works offline once it has loaded. To install it as an app, use your browser’s menu (Install app / Add to Home Screen).';
    else status = 'You opened the game as a file, which works fine. To install it as an app (for your phone, or to play offline), open it from a web address: see “Install as an app” in the README.';
    return section(
      '📲',
      '앱',
      'App',
      h('p.setting-desc', status),
      action ? h('div.data-actions', action) : null,
      h('p.setting-desc', 'Progress is saved separately for each way of opening the game (file, web address, installed app). To move it, download a backup below and restore it there.')
    );
  }

  M.screens.register({
    id: 'settings',

    render(view) {
      redraw = () => ui.keepFocus(() => {
        const s = settings();
        const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, on: { change: (e) => importProgress(e.target.files[0]) } });

        U.clear(view).append(
          h(
            'div.settings',
            h('div.page-head', h('h1', ui.bi('설정', 'Settings'))),
            section(
              '🎨',
              '화면',
              'Display',
              h(
                'div.setting',
                h('span.setting-text', h('span.setting-name', ui.bi('테마', 'Theme'))),
                choice(
                  'theme',
                  [
                    { value: 'light', ko: '☀️ 밝게', en: 'Light' },
                    { value: 'dark', ko: '🌙 어둡게', en: 'Dark' },
                    { value: 'system', ko: '💻 자동', en: 'Like my computer' },
                  ],
                  s.theme,
                  (value) => {
                    s.theme = value;
                    save();
                    redraw();
                  }
                )
              ),
              toggle('showEnglish', '영어 도움말', 'English hints', 'Small English subtitles under the Korean interface text. Turn them off when you feel ready!'),
              toggle('showRomanization', '로마자', 'Romanization', 'Show romanized spelling (e.g. “gamsahamnida”) on word cards. Hangul-only is better for learning.')
            ),
            voiceSection(),
            section(
              '📚',
              '연습',
              'Practice',
              goalSetting(),
              h(
                'div.setting',
                h(
                  'span.setting-text',
                  h('span.setting-name', ui.bi('하루 새 단어', 'New words per day')),
                  h('span.setting-desc', 'How many brand-new words Word Cards may introduce each day. Reviews are never capped.')
                ),
                choice(
                  'newwords',
                  M.config.session.newWordsChoices.map((n) => ({ value: n, ko: `${n}개`, en: n <= 10 ? 'gentle' : n >= 30 ? 'lots' : n === M.config.session.newWordsPerDay ? 'default' : '' })),
                  s.newWordsPerDay,
                  (value) => {
                    s.newWordsPerDay = value;
                    save();
                    redraw();
                  }
                )
              ),
              h(
                'div.setting',
                h('span.setting-text', h('span.setting-name', ui.bi('시작 레벨', 'Starting level')), h('span.setting-desc', 'Words below this level are treated as “probably known” and checked a few per day.')),
                choice(
                  'level',
                  M.config.startLevels.map((l) => ({ value: l.level, ko: `${l.emoji} ${l.ko}`, en: `${l.en} (${l.cefr})` })),
                  M.store.state.profile.startLevel,
                  changeLevel
                )
              ),
              toggle('typing', '타자 연습', 'Typing exercises', 'Well-known words are typed with the Korean keyboard. Off = build them from tiles instead.'),
              toggle('keyHints', '키보드 힌트', 'Keyboard letter hints', 'Show the matching English key (q, w, e…) on the on-screen keyboard.')
            ),
            appSection(),
            section(
              '💾',
              '데이터',
              'Your data',
              h('p.setting-desc', M.store.available ? 'Progress is saved automatically in this browser. Download a backup to keep it safe or move it to another computer.' : '⚠️ This browser is blocking storage, so progress will be lost when you close the tab. See the README for how to run the game from a local server.'),
              h(
                'div.data-actions',
                ui.button({ icon: '⬇️', ko: '백업 저장', en: 'Download backup', variant: 'soft', onClick: exportProgress }),
                ui.button({ icon: '⬆️', ko: '백업 불러오기', en: 'Restore backup', variant: 'soft', onClick: () => fileInput.click() }),
                ui.button({ icon: '🗑️', ko: '초기화', en: 'Reset everything', variant: 'danger', onClick: resetProgress }),
                fileInput
              )
            ),
            h('p.about', `말랑 한국어 · Mallang Korean v${M.version} — made with 💖 for learning Korean.`)
          )
        );
      });
      redraw();
      const off = M.events.on('speech:status', () => redraw());
      const offApp = M.events.on('pwa', () => redraw());
      return () => {
        off();
        offApp();
        redraw = () => {};
        azureDraft = null;
        azureNote = null;
      };
    },
  });
})(window.Mallang);
