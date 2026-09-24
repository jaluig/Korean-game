/**
 * Korean numbers: the two number systems, and how to read them aloud.
 *
 *  - Sino-Korean (일, 이, 삼…): prices, minutes, months and dates, floors.
 *  - Native Korean (하나, 둘, 셋…): counting things, hours and age.
 *
 * Every function returns Hangul, e.g. price(12500) → '만 이천오백 원'.
 * There are also the mistakes learners typically make, each with a short
 * explanation, for the Number Shop's wrong answers.
 */
(function (M) {
  'use strict';

  const U = M.utils;

  /* ---------- Sino-Korean ---------- */

  const SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const SMALL_UNITS = ['', '십', '백', '천'];
  const BIG_UNITS = ['', '만', '억', '조'];

  /** 1–9999 → '천이백삼십사'. 일 is dropped before 십, 백 and 천 (십, not 일십). */
  function sinoGroup(n) {
    let out = '';
    const digits = String(n).padStart(4, '0').split('').map(Number);
    digits.forEach((d, i) => {
      const unit = SMALL_UNITS[3 - i];
      if (d) out += (d === 1 && unit ? '' : SINO[d]) + unit;
    });
    return out;
  }

  /**
   * Sino-Korean reading: 12500 → '만 이천오백'. Groups of four digits are
   * spaced (만 이천오백), and 10000 is just 만, not 일만.
   */
  function sino(n) {
    let rest = Math.floor(Math.abs(Number(n) || 0));
    if (rest === 0) return SINO[0];
    const parts = [];
    for (let unit = 0; rest > 0; unit++) {
      const group = rest % 10000;
      if (group) parts.unshift((unit === 1 && group === 1 ? '' : sinoGroup(group)) + BIG_UNITS[unit]);
      rest = Math.floor(rest / 10000);
    }
    return parts.join(' ');
  }

  /* ---------- Native Korean ---------- */

  const NATIVE_ONES = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
  const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
  // Before a counter, 1–4 and 20 shorten: 한 개, 두 잔, 세 명, 네 시, 스무 살.
  const SHORT = { 하나: '한', 둘: '두', 셋: '세', 넷: '네', 스물: '스무' };

  const isNativeRange = (n) => Number.isInteger(n) && n >= 1 && n <= 99;

  /** Native Korean number, 1–99: 3 → '셋', 21 → '스물하나'. (From 100 on, Koreans use Sino-Korean.) */
  function native(n) {
    if (!isNativeRange(n)) return sino(n);
    return NATIVE_TENS[Math.floor(n / 10)] + NATIVE_ONES[n % 10];
  }

  /** The form used before a counter: 3 → '세', 20 → '스무', 21 → '스물한'. */
  function nativeBefore(n) {
    if (!isNativeRange(n)) return sino(n);
    const tens = NATIVE_TENS[Math.floor(n / 10)];
    const ones = NATIVE_ONES[n % 10];
    return ones ? tens + (SHORT[ones] || ones) : SHORT[tens] || tens;
  }

  /* ---------- Counters ---------- */

  /** Which number system each counter uses. */
  const COUNTERS = {
    개: { system: 'native', en: 'things' },
    잔: { system: 'native', en: 'cups / glasses' },
    병: { system: 'native', en: 'bottles' },
    명: { system: 'native', en: 'people' },
    마리: { system: 'native', en: 'animals' },
    권: { system: 'native', en: 'books' },
    장: { system: 'native', en: 'flat things (tickets, paper)' },
    켤레: { system: 'native', en: 'pairs (shoes, socks)' },
    벌: { system: 'native', en: 'sets of clothes' },
    살: { system: 'native', en: 'years of age' },
    시: { system: 'native', en: "o'clock" },
    시간: { system: 'native', en: 'hours (duration)' },
    번: { system: 'native', en: 'times' },
    원: { system: 'sino', en: 'won' },
    분: { system: 'sino', en: 'minutes' },
    초: { system: 'sino', en: 'seconds' },
    층: { system: 'sino', en: 'floor' },
    년: { system: 'sino', en: 'year' },
    일: { system: 'sino', en: 'day (date)' },
    주일: { system: 'sino', en: 'weeks' },
    인분: { system: 'sino', en: 'portions' },
  };

  /** '세 개', '오 분', '만 원'… The number is read in the counter's own system. */
  function count(n, counter) {
    const info = COUNTERS[counter];
    const reading = info && info.system === 'native' ? nativeBefore(n) : sino(n);
    return `${reading} ${counter}`;
  }

  /* ---------- Time, dates, money, age ---------- */

  /** '세 시 삼십 분' (or '세 시 반' with { half: true }). Hours are native, minutes Sino-Korean. */
  function time(hour, minute = 0, { half = false } = {}) {
    const h12 = ((((hour - 1) % 12) + 12) % 12) + 1;
    const parts = [count(h12, '시')];
    if (minute === 30 && half) parts.push('반');
    else if (minute) parts.push(count(minute, '분'));
    return parts.join(' ');
  }

  /** '유월', '시월', '삼월'… (6 and 10 drop their final consonant.) */
  function month(m) {
    if (m === 6) return '유월';
    if (m === 10) return '시월';
    return `${sino(m)}월`;
  }

  /** '삼월 십오일'. */
  const date = (m, d) => `${month(m)} ${sino(d)}일`;

  /** '만 이천오백 원'. */
  const price = (won) => `${sino(won)} 원`;

  /** '스물다섯 살', '스무 살'. */
  const age = (years) => count(years, '살');

  /** 12500 → '12,500원' (how prices are written). */
  const won = (n) => `${Math.round(n).toLocaleString('en-US')}원`;

  /** The pieces of a Sino-Korean number: 12500 → [{ ko: '만', value: 10000 }, { ko: '이천', value: 2000 }, { ko: '오백', value: 500 }]. */
  function breakdown(n) {
    const parts = [];
    let rest = Math.floor(n);
    for (const [value, unit] of [[1e8, '억'], [1e4, '만'], [1000, '천'], [100, '백'], [10, '십'], [1, '']]) {
      const k = Math.floor(rest / value);
      if (!k) continue;
      rest -= k * value;
      const head = value >= 1e4 ? (k === 1 && value === 1e4 ? '' : sino(k)) : k === 1 && unit ? '' : SINO[k];
      parts.push({ ko: head + unit, value: k * value });
    }
    return parts;
  }

  /* ---------- Typical mistakes (for wrong answers that teach) ---------- */

  /**
   * Readings of numbers that are easy to confuse with n (one place off, digits
   * swapped): 8500 → [850, 85000, 8050, 5800]. Each is a correct reading of a
   * different number, so it's wrong for a clear reason.
   */
  function neighbours(n) {
    const out = new Set();
    const add = (x) => {
      if (Number.isInteger(x) && x > 0 && x !== n && x < 1e9) out.add(x);
    };
    add(n * 10);
    if (n % 10 === 0) add(n / 10);
    const digits = String(n).split('');
    // Move a non-zero digit one place (8500 → 8050), or swap two different digits (8500 → 5800).
    for (let i = 0; i < digits.length; i++) {
      for (let j = i + 1; j < digits.length; j++) {
        if (digits[i] === digits[j]) continue;
        const swapped = digits.slice();
        [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
        if (swapped[0] !== '0') add(Number(swapped.join('')));
      }
    }
    return [...out];
  }

  /** Wrong readings of a price, each with a reason. */
  function priceMistakes(n) {
    const mistakes = neighbours(n).map((x) => ({
      text: price(x),
      why: `${price(x)} is ${won(x)}.`,
      value: x,
    }));
    // Counting with native numbers is a classic mix-up: prices always use 일, 이, 삼…
    const lead = breakdown(n)[0];
    if (lead && lead.value < 10000 && lead.value >= 1000 && lead.value / 1000 >= 2 && lead.value / 1000 <= 4) {
      const k = lead.value / 1000;
      const wrong = price(n).replace(lead.ko, `${nativeBefore(k)}천`);
      mistakes.push({ text: wrong, why: `Prices use Sino-Korean numbers (일, 이, 삼…): ${SINO[k]}천, not ${nativeBefore(k)}천.`, value: null });
    }
    return mistakes;
  }

  /** Wrong readings of a time, each with a reason. */
  function timeMistakes(hour, minute) {
    const h12 = ((((hour - 1) % 12) + 12) % 12) + 1;
    const right = time(h12, minute);
    const out = [];
    const add = (text, why) => {
      if (text !== right && !out.some((m) => m.text === text)) out.push({ text, why });
    };
    const mins = minute ? ` ${count(minute, '분')}` : '';
    add(`${sino(h12)} 시${mins}`, `Hours use native Korean numbers: ${count(h12, '시')}, not ${sino(h12)} 시.`);
    if (minute && isNativeRange(minute)) {
      add(`${count(h12, '시')} ${nativeBefore(minute)} 분`, `Minutes use Sino-Korean numbers: ${count(minute, '분')}, not ${nativeBefore(minute)} 분.`);
    }
    if (native(h12) !== nativeBefore(h12)) {
      add(`${native(h12)} 시${mins}`, `Before a counter, ${native(h12)} shortens to ${nativeBefore(h12)}: ${count(h12, '시')}.`);
    }
    const otherHour = (h12 % 12) + 1;
    add(time(otherHour, minute), `${time(otherHour, minute)} is ${otherHour}:${String(minute).padStart(2, '0')}.`);
    if (minute >= 10 && minute % 10 !== 0 && minute % 11 !== 0) {
      const flipped = Number(String(minute).split('').reverse().join(''));
      if (flipped < 60) add(time(h12, flipped), `${count(flipped, '분')} is ${flipped} minutes.`);
    }
    return out;
  }

  /**
   * Wrong ways to count n things with a counter: Sino-Korean numbers, the long
   * form (셋 개), or a counter that doesn't fit ({ wrongCounter: '잔' }).
   */
  function countMistakes(n, counter, { noun = '', wrongCounter } = {}) {
    const lead = noun ? `${noun} ` : '';
    const right = `${lead}${count(n, counter)}`;
    const out = [];
    const add = (text, why) => {
      if (text !== right && !out.some((m) => m.text === text)) out.push({ text, why });
    };
    add(`${lead}${sino(n)} ${counter}`, `Count with native Korean numbers: ${count(n, counter)}, not ${sino(n)} ${counter}.`);
    if (native(n) !== nativeBefore(n)) {
      add(`${lead}${native(n)} ${counter}`, `Before a counter, ${native(n)} shortens to ${nativeBefore(n)}: ${count(n, counter)}.`);
    }
    if (wrongCounter && COUNTERS[wrongCounter]) {
      add(`${lead}${count(n, wrongCounter)}`, `${wrongCounter} counts ${COUNTERS[wrongCounter].en}. ${noun || 'This'} uses ${counter}.`);
    }
    const other = n > 1 && U.random() < 0.5 ? n - 1 : n + 1;
    add(`${lead}${count(other, counter)}`, `${count(other, counter)} is ${other}.`);
    return out;
  }

  /** Wrong ways to say an age. */
  function ageMistakes(years) {
    const right = age(years);
    const out = [];
    const add = (text, why) => {
      if (text !== right && !out.some((m) => m.text === text)) out.push({ text, why });
    };
    add(`${sino(years)} 살`, `Age uses native Korean numbers with 살: ${right}. (The formal way is ${sino(years)} 세.)`);
    if (native(years) !== nativeBefore(years)) add(`${native(years)} 살`, `Before a counter, ${native(years)} shortens to ${nativeBefore(years)}: ${right}.`);
    add(age(years + 1), `${age(years + 1)} is ${years + 1}.`);
    return out;
  }

  M.numbers = {
    COUNTERS,
    sino,
    native,
    nativeBefore,
    count,
    time,
    month,
    date,
    price,
    age,
    won,
    breakdown,
    neighbours,
    priceMistakes,
    timeMistakes,
    countMistakes,
    ageMistakes,
  };
})(window.Mallang);
