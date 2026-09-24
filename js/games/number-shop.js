/**
 * Minigame 7 — 숫자 가게 · Number Shop: you run a little shop. Customers ask
 * for things and you use Korean numbers to serve them:
 *   - "사과 세 개 주세요." → hand over the right number of items (native numbers + counters)
 *   - "이거 얼마예요?"     → read the price tag aloud (Sino-Korean numbers)
 *   - "여기 만 이천오백 원이요." → type the amount the customer hands you on the till
 *   - "지금 몇 시예요?"    → tell the time (native hours, Sino-Korean minutes)
 * Wrong answers are the classic mix-ups (삼 시, 셋 개, 팔백오십 원), each explained.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const N = M.numbers;
  const cfg = () => M.config.session.numberShop;
  const points = () => M.config.points;

  const CUSTOMERS = ['🐻', '🐰', '🐱', '🦊', '🐼', '🐨', '🐯', '🐸', '🐧', '🐹'];
  const GOODS = [
    { ko: '사과', emoji: '🍎', counter: '개', wrong: '잔', word: 'cafe:apple' },
    { ko: '빵', emoji: '🍞', counter: '개', wrong: '권', word: 'cafe:bread' },
    { ko: '쿠키', emoji: '🍪', counter: '개', wrong: '병', word: 'cafe:cookie' },
    { ko: '커피', emoji: '☕', counter: '잔', wrong: '권', word: 'cafe:coffee' }, // (not 개: 커피 두 개 is common too)
    { ko: '주스', emoji: '🥤', counter: '잔', wrong: '장', word: 'cafe:juice' },
    { ko: '물', emoji: '💧', counter: '병', wrong: '권', word: 'cafe:water' },
    { ko: '책', emoji: '📕', counter: '권', wrong: '개', word: 'day:book' },
    { ko: '사진', emoji: '🖼️', counter: '장', wrong: '병', word: 'hobbies:photo' },
  ];
  const TASKS = ['count', 'price', 'register', 'time'];

  // Content words behind each number, so practice here helps them grow in the garden.
  const SINO_WORD = { 1: 'numbers:il', 2: 'numbers:i', 3: 'numbers:sam', 10: 'numbers:sip' };
  const NATIVE_WORD = { 1: 'cafe:one', 2: 'cafe:two', 3: 'numbers:three', 4: 'numbers:four', 5: 'numbers:five', 10: 'numbers:ten' };
  const UNIT_WORD = { 10: 'numbers:sip', 100: 'numbers:hundred', 1000: 'numbers:thousand', 10000: 'numbers:tenthousand' };
  const COUNTER_WORD = { 개: 'numbers:item', 잔: 'cafe:cup', 시: 'numbers:oclock', 분: 'numbers:minute', 원: 'numbers:won' };

  /** 12500 → the words for 만, 천, 백 and 이 (and 오, if it were a word). */
  function sinoWords(n) {
    const ids = [];
    for (const value of [10000, 1000, 100, 10, 1]) {
      const d = Math.floor(n / value) % 10;
      if (!d) continue;
      if (UNIT_WORD[value]) ids.push(UNIT_WORD[value]);
      if ((d > 1 || value === 1) && SINO_WORD[d]) ids.push(SINO_WORD[d]); // 일 is silent before 십, 백, 천, 만
    }
    return [...new Set(ids)];
  }

  const between = (min, max, step = 1) => min + step * U.randInt(Math.floor((max - min) / step) + 1);

  /** A price for the tier: 1 = thousands, 2 = hundreds, 3 = over 10,000. */
  function pickPrice(tier) {
    if (tier === 1) return between(1000, 9500, 500);
    if (tier === 2) return between(1100, 9900, 100);
    return between(10000, 99000, 500);
  }

  function pickTime(tier) {
    const hour = between(1, 12);
    if (tier === 1) return { hour, minute: 0 };
    if (tier === 2) return { hour, minute: U.pick([0, 30, 30, 10, 20]) };
    return { hour, minute: between(5, 55, 5) };
  }

  /** Eight customers: every kind of task at least once, weaker kinds more often. */
  function planRound(size) {
    const kinds = U.shuffle(TASKS.slice());
    while (kinds.length < size) kinds.push(U.weightedPick(TASKS, (t) => M.progress.skillWeight(`number:${t}`)));
    const plan = U.shuffle(kinds.slice(0, size));
    return plan.map((kind, i) => ({ kind, tier: Math.min(3, 1 + Math.floor((i * 3) / size)) }));
  }

  M.games.register({
    id: 'number-shop',
    order: 7,
    emoji: '🏪',
    color: 'butter',
    title: { ko: '숫자 가게', en: 'Number Shop' },
    blurb: { ko: '가격, 시간, 개수를 말해요', en: 'Prices, times and counting' },

    status() {
      const best = M.store.state.totals.numbersCorrect;
      return { ready: true, ko: best ? `숫자 ${best}개 맞혔어요` : '가게를 열어요!', en: best ? `${U.plural(best, 'number')} right so far` : 'Open the shop!' };
    },

    start(host) {
      const plan = planRound(cfg().size);
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, mistakes: [] };
      let index = 0;
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(index, plan.length);
        if (index >= plan.length) return finish();
        const task = plan[index];
        const customer = CUSTOMERS[(index + U.randInt(CUSTOMERS.length)) % CUSTOMERS.length];
        cleanup = TASK_UI[task.kind](task, customer);
      }

      /** The customer and what they say (with 🔊, spoken automatically). */
      function scene(customer, say, extra) {
        const bubble = h('div.shop-bubble', h('span.shop-say', { lang: 'ko' }, say.ko), ui.audioButton(say.speak || say.ko, { size: 'small' }), say.en ? h('span.shop-say-en', say.en) : null);
        if (M.store.state.settings.autoPlayAudio || say.listen) M.speech.speakLater(say.speak || say.ko, 350, { quiet: true });
        return h('div.shop-scene', h('div.shop-awning', { 'aria-hidden': 'true' }), h('div.shop-row', h('div.shop-customer', { 'aria-hidden': 'true' }, customer), bubble), extra);
      }

      function choiceButtons(options, onPick) {
        let locked = false;
        const buttons = options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option option-ko', lang: 'ko', on: { click: () => pick(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text)
          )
        );
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= options.length) {
            event.preventDefault();
            pick(n - 1);
          }
        });
        function pick(i) {
          if (locked) return;
          locked = true;
          stopKeys();
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(options[i].correct ? 'correct' : 'wrong');
          if (!options[i].correct) buttons[options.findIndex((o) => o.correct)].classList.add('correct');
          onPick(options[i]);
        }
        return { el: h('div.options', { role: 'group' }, buttons), stop: stopKeys };
      }

      const TASK_UI = {
        /* "사과 세 개 주세요." → hand over that many. */
        count(task, customer) {
          const goods = U.pick(GOODS);
          const n = task.tier === 1 ? between(1, 5) : between(2, 10);
          const reading = N.count(n, goods.counter);
          const say = { ko: `${goods.ko} ${reading} 주세요.` };
          let given = 0;
          const basket = h('div.shop-basket', { 'aria-live': 'polite' });
          const shelf = h('div.shop-shelf', { role: 'group', 'aria-label': 'Shelf' });
          const giveBtn = ui.button({ icon: '🛍️', ko: '드리기', en: 'Hand it over', variant: 'primary', size: 'big', onClick: give });
          const draw = () => {
            U.clear(basket).append(given ? Array.from({ length: given }, (_, i) => h('button.shop-item.in', { type: 'button', 'aria-label': `Put one ${goods.ko} back`, on: { click: () => change(-1) } }, goods.emoji)) : h('span.shop-basket-empty', ui.bi('바구니가 비었어요', 'Tap the shelf to add')));
            basket.append(h('span.shop-count', `${given}`));
          };
          const change = (d) => {
            given = U.clamp(given + d, 0, 12);
            M.sfx.play('tap');
            draw();
          };
          for (let i = 0; i < 12; i++) shelf.append(h('button.shop-item', { type: 'button', 'aria-label': `Add one ${goods.ko}`, on: { click: () => change(1) } }, goods.emoji));
          draw();
          host.stage.append(h('div.ex.ex-shop', ui.exTag('주문대로 담아요', 'Give the customer what they ask for', '🛒'), scene(customer, say, h('div.shop-counter', shelf, h('div.shop-basket-wrap', h('span.shop-basket-label', '🧺'), basket))), h('div.ex-actions', giveBtn)));
          giveBtn.focus({ preventScroll: true });
          const stopKeys = M.keys.push((event) => {
            if (event.repeat) return;
            if (event.key === '+' || event.key === 'ArrowUp') change(1);
            else if (event.key === '-' || event.key === 'ArrowDown' || event.key === 'Backspace') change(-1);
            else return;
            event.preventDefault();
          });
          let done = false;
          function give() {
            if (done) return;
            done = true;
            stopKeys();
            giveBtn.disabled = true;
            const correct = given === n;
            answered('count', correct, {
              words: [goods.word, COUNTER_WORD[goods.counter], NATIVE_WORD[n]].filter(Boolean),
              speak: `${goods.ko} ${reading}`,
              answer: `${goods.ko} ${reading}`,
              answerEn: `${n} × ${goods.emoji}`,
              given: correct ? null : `${given} × ${goods.emoji}`,
              tips: [
                `${reading} = ${n}.`,
                'Count things with native Korean numbers (하나, 둘, 셋…). Before a counter, 하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네, 스물 → 스무.',
              ],
              note: `${goods.counter} is the counter for ${N.COUNTERS[goods.counter].en}: ${goods.ko} ${reading}.`,
            });
          }
          return stopKeys;
        },

        /* "이거 얼마예요?" → read the price tag. */
        price(task, customer) {
          const won = pickPrice(task.tier);
          const right = N.price(won);
          const goods = U.pick(GOODS);
          const wrong = U.sample(N.priceMistakes(won), 3);
          const options = U.shuffle([{ text: right, correct: true }, ...wrong.map((m) => ({ ...m, correct: false }))]);
          const tag = h('div.price-tag', h('span.price-item', { 'aria-hidden': 'true' }, goods.emoji), h('span.price-won', N.won(won)));
          const choice = choiceButtons(options, (o) =>
            answered('price', o.correct, {
              words: [...sinoWords(won), COUNTER_WORD['원']],
              speak: right,
              answer: right,
              answerEn: N.won(won),
              given: o.correct ? null : o.text,
              tips: [o.why, 'Prices use Sino-Korean numbers (일, 이, 삼…), counted in 만 (10,000s): 12,500 = 만 이천오백.'],
              note: breakdownTip(won),
            })
          );
          host.stage.append(h('div.ex.ex-shop', ui.exTag('가격을 말해요', 'Tell the customer the price', '🏷️'), scene(customer, { ko: '이거 얼마예요?', en: 'How much is this?' }, h('div.shop-counter.center', tag)), choice.el));
          return choice.stop;
        },

        /* "여기 만 이천오백 원이요." → type the amount on the till. */
        register(task, customer) {
          const won = pickPrice(task.tier);
          const reading = N.price(won);
          const listen = M.speech.isReady() && task.tier >= 2 && U.random() < 0.5;
          let digits = '';
          const screen = h('span.till-digits', '0');
          const shown = h('div.till-screen', h('span.till-won', '₩'), screen);
          const set = (next) => {
            digits = next.replace(/^0+/, '').slice(0, 7);
            screen.textContent = digits ? Number(digits).toLocaleString('en-US') : '0';
          };
          const press = (key) => {
            if (done) return;
            M.sfx.play('tap');
            if (key === '⌫') set(digits.slice(0, -1));
            else if (key === 'C') set('');
            else set(digits + key);
          };
          const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '00', '000', '⌫'];
          const pad = h('div.till-keys', keys.map((k) => h('button.till-key', { type: 'button', class: /\d/.test(k) ? '' : 'fn', on: { ...M.keys.noMouseFocus, click: () => press(k) } }, k)));
          const payBtn = ui.button({ icon: '💳', ko: '계산', en: 'Ring it up', variant: 'primary', size: 'big', onClick: submit });
          const say = listen ? { ko: '🔊 잘 들어 보세요', speak: `여기 ${reading}이요.`, listen: true } : { ko: `여기 ${reading}이요.`, en: 'Here you are.' };
          host.stage.append(
            h(
              'div.ex.ex-shop',
              ui.exTag('받은 돈을 찍어요', listen ? 'Listen: how much is the customer giving you? Type it on the till' : 'The customer pays: type the amount on the till', '🧮'),
              scene(customer, say, h('div.shop-counter.center', h('div.till', shown, pad))),
              h('div.ex-actions', h('span.key-hint', ui.bi('숫자 키', '0–9, Enter')), payBtn)
            )
          );
          let done = false;
          const stopKeys = M.keys.push((event) => {
            if (event.repeat && event.key === 'Enter') return;
            if (/^\d$/.test(event.key)) press(event.key);
            else if (event.key === 'Backspace') press('⌫');
            else if (event.key === 'Enter' && !M.keys.isControl(event)) submit();
            else return;
            event.preventDefault();
          });
          function submit() {
            if (done) return;
            if (!digits) {
              shown.classList.remove('nudge');
              void shown.offsetWidth;
              shown.classList.add('nudge');
              return;
            }
            done = true;
            stopKeys();
            payBtn.disabled = true;
            const given = Number(digits);
            const correct = given === won;
            if (correct) M.sfx.play('coin');
            answered('register', correct, {
              words: [...sinoWords(won), COUNTER_WORD['원']],
              speak: reading,
              answer: reading,
              answerEn: N.won(won),
              given: correct ? null : `${N.won(given)} (${N.price(given)})`,
              tips: [],
              note: breakdownTip(won),
            });
          }
          return stopKeys;
        },

        /* "지금 몇 시예요?" → tell the time. */
        time(task, customer) {
          const { hour, minute } = pickTime(task.tier);
          const half = minute === 30 && U.random() < 0.5;
          const right = N.time(hour, minute, { half });
          const wrong = U.sample(N.timeMistakes(hour, minute), 3);
          const options = U.shuffle([{ text: right, correct: true }, ...wrong.map((m) => ({ ...m, correct: false }))]);
          const choice = choiceButtons(options, (o) =>
            answered('time', o.correct, {
              words: [COUNTER_WORD['시'], NATIVE_WORD[hour], minute ? COUNTER_WORD['분'] : null, ...(minute ? sinoWords(minute) : [])].filter(Boolean),
              speak: right,
              answer: right,
              answerEn: `${hour}:${String(minute).padStart(2, '0')}`,
              given: o.correct ? null : o.text,
              tips: [o.why],
              note: 'Hours use native Korean numbers (한 시, 두 시, 세 시…); minutes use Sino-Korean numbers (십 분, 삼십 분). Half past is 반: 세 시 반.',
            })
          );
          host.stage.append(h('div.ex.ex-shop', ui.exTag('시간을 말해요', 'Tell the customer the time', '🕒'), scene(customer, { ko: '지금 몇 시예요?', en: 'What time is it now?' }, h('div.shop-counter.center', clock(hour, minute))), choice.el));
          return choice.stop;
        },
      };

      function breakdownTip(won) {
        const parts = N.breakdown(won);
        return `${N.price(won)} = ${parts.map((p) => `${p.ko} (${p.value.toLocaleString('en-US')})`).join(' + ')}`;
      }

      function clock(hour, minute) {
        const hAngle = ((hour % 12) + minute / 60) * 30;
        const mAngle = minute * 6;
        const ticks = Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return `<circle cx="${50 + 40 * Math.sin(a)}" cy="${50 - 40 * Math.cos(a)}" r="${i % 3 === 0 ? 3 : 1.8}" />`;
        }).join('');
        const el = h('div.shop-clock', h('div.clock-face', { role: 'img', 'aria-label': `${hour}:${String(minute).padStart(2, '0')}` }), h('div.clock-digital', `${hour}:${String(minute).padStart(2, '0')}`));
        el.firstChild.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" class="clock-rim"/><g class="clock-ticks">${ticks}</g>
          <line x1="50" y1="50" x2="${50 + 24 * Math.sin((hAngle * Math.PI) / 180)}" y2="${50 - 24 * Math.cos((hAngle * Math.PI) / 180)}" class="clock-hour"/>
          <line x1="50" y1="50" x2="${50 + 34 * Math.sin((mAngle * Math.PI) / 180)}" y2="${50 - 34 * Math.cos((mAngle * Math.PI) / 180)}" class="clock-minute"/>
          <circle cx="50" cy="50" r="3.5" class="clock-pin"/></svg>`;
        return el;
      }

      /** Record the answer and show feedback: `tips` explain a mistake, `note` is always shown. */
      function answered(kind, correct, { words, speak, answer, answerEn, given, tips = [], note }) {
        for (const id of U.uniqueBy(words || [], (x) => x)) if (M.content.word(id)) M.srs.practice(id, correct);
        M.progress.recordAnswer(correct);
        M.progress.skill(`number:${kind}`, correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = kind === 'register' ? points().register : points().number;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('numbersCorrect');
        } else {
          round.combo = 0;
          for (const id of words || []) if (M.content.word(id) && M.srs.isIntroduced(id) && !round.mistakes.includes(id)) round.mistakes.push(id);
        }
        host.award(earned);
        host.react({ correct }, round.combo);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(speak, 300, { quiet: true });
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, answer), ui.audioButton(speak, { size: 'small' }), h('span.fb-en', `= ${answerEn}`)),
          given ? h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, given)) : null,
          ...(correct ? [] : tips.map(tip)),
          tip(note),
        ];
        host.showFeedback({
          tone: correct ? 'good' : 'bad',
          points: earned,
          content,
          speak,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        host.finish({
          gameId: 'number-shop',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: round.mistakes,
          perfect: false,
          mainStat: { icon: '🏪', value: `${round.correct}/${round.answers}`, ko: '손님', en: 'happy customers' },
        });
      }

      next();
    },
  });

  M.numberShop = { planRound, pickPrice, pickTime, sinoWords };
})(window.Mallang);
