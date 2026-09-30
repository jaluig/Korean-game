# 말랑 한국어 · Mallang Korean

A cute, spaced-repetition Korean learning game that runs in your browser.
Meet 말랑이 (Mallang-i), a squishy rice-cake bunny with a sprout on its head:
every Korean word you learn becomes a plant in your **word garden**, and short
practice rounds keep it growing.

- **13 minigames:** 🎴 Word Cards · 🧩 Sentence Builder · ⚡️ Speed Match · 🎈 Balloon Pop · 🧪 Particle Lab · 🪄 Verb Magic · 🏪 Number Shop · 👂 Sound Twins · 🔗 Grammar Cards · 🎧 Dialogues · 📖 Reading · 🙇 Speech Levels · 🦜 Shadowing
- **13 topics** with 532 words and 290 sentences, each with short lesson notes: ☕ at the café · 🌞 my day · 👨‍👩‍👧 family & people · 🔢 numbers & time · 🛍️ shopping · 💗 feelings · 🗺️ finding the way · 📔 the past tense · ☔ weather · 🎨 hobbies & plans · 🚄 travel & transport · 💊 at the doctor's · 💼 school & work
- **18 grammar patterns** (-고, -지만, -아서/어서, -(으)면, -는데, -고 있어요, -(으)세요…) with 146 practice sentences, **19 listening dialogues** with two voices and a 🎭 role-play where you speak one part, and **40 short texts to read** (a diary, a text message, a menu, a receipt, a group chat, a weather forecast, a chat between friends in 반말…)
- **Speech levels:** 45 sentences in 합니다체, 해요체 and 반말, with who each one is for
- **Built-in Korean keyboard**, so you never need a Korean input method
- **Pronunciation audio** through your browser's own Korean voice (or, optionally, Azure's neural voices with your own key), **dictation** of whole sentences, and **🎤 speaking practice** and **shadowing** in Chrome and Edge
- **Streaks, points, levels, an adjustable daily goal, 53 badges** and 14 outfits for the mascot, saved on your computer
- Korean interface with small English subtitles, which you can turn off once you're ready, and a **dark theme**
- Works on **phones** too, and can be **installed as an app** that plays offline

<p align="center"><img src="docs/screenshots/home.png" alt="Home screen: the mascot, today's practice, the daily goal and the minigames" width="760"></p>

| Meeting a new word | Typing with the built-in keyboard | Feedback that explains the mistake |
| --- | --- | --- |
| ![A new-word card for 맛있어요 with its pronunciation and an example](docs/screenshots/word-intro.png) | ![Typing 학교 on the on-screen Korean keyboard](docs/screenshots/typing.png) | ![Sentence Builder explaining 에서 vs 에](docs/screenshots/sentence-feedback.png) |

| Balloon Pop | Particle Lab | Verb Magic |
| --- | --- | --- |
| ![Korean words floating across the sky as balloons](docs/screenshots/balloon-pop.png) | ![Choosing the missing particle from potion bottles](docs/screenshots/particle-lab.png) | ![Turning a verb into the past tense](docs/screenshots/verb-magic.png) |
| **Number Shop** | **Sound Twins** | **Dark theme** |
| ![A customer ordering four juices (주스 네 잔)](docs/screenshots/number-shop.png) | ![Picking the word you heard: 달, 탈 or 딸](docs/screenshots/sound-twins.png) | ![The home screen in the dark theme](docs/screenshots/dark.png) |
| **Grammar Cards** | **Dialogues** | **On a phone** |
| ![Grammar Cards explaining why 바빠서 can't come before a suggestion, and 바쁘니까 can](docs/screenshots/grammar-cards.png) | ![A conversation playing, with the speaker highlighted and the script hidden](docs/screenshots/dialogues.png) | ![Home, a Grammar Cards question and a dialogue on a phone](docs/screenshots/phone.png) |
| **Reading** | **Role-play** | **A new pattern** |
| ![A café notice with its first question: why is the café closed on Wednesday?](docs/screenshots/reading.png) | ![Role-play: the barista's line, then yours, said with the microphone and checked](docs/screenshots/role-play.png) | ![The -(으)세요 card, with its table of forms from 가세요 to 도우세요](docs/screenshots/grammar-new.png) |

## Quick start

1. Download or clone this folder.
2. Double-click **`index.html`**. That's it: no install and no build step.

Google Chrome or Microsoft Edge give the best experience, because they come with Korean voices.

If your browser won't save progress when the page is opened as a file (some browsers
restrict storage for `file://` pages), start a tiny local server in this folder instead:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
# or:  npm start  /  npx serve
```

To play on your phone, or offline, install it as an app: see [Install as an app](#install-as-an-app-and-play-offline).

## How it teaches

The game follows a few well-established ideas about learning vocabulary:

| Idea | How the game does it |
| --- | --- |
| **Spaced repetition** | Each word has a review date. Get it right and it waits longer (10 min → 1 day → 3 days → 1 week → 16 days → months). |
| **Missed words come back sooner** | A wrong answer drops the word two stages, makes it due right away and lowers its "ease", so it keeps returning until it sticks. It is also asked again a few cards later in the same round. Words you missed recently are marked 🥀 *tricky*. |
| **Active recall, step by step** | How you're asked depends on how well you know the word: 🌱 recognise it → 🌿 pick or hear the Korean → 🌷 build it from syllable tiles → 🌻 type it from memory. |
| **New + old, mixed** | Each Word Cards round mixes due reviews with a few new words. The number of new words shrinks when many reviews are waiting, and there's a daily cap (20 by default, adjustable in Settings), so reviews never pile up. Within a level, words come one topic at a time, so their sentences open up quickly. |
| **Your starting level** | You pick your level at the start (A1 / low A2 / A2). Words below it aren't thrown away: they come up as quick checks, 8 a day. Miss one and it goes back into your learning queue, so the gaps in what you know get found and filled. |
| **Immediate feedback that explains** | After every answer you see the correct answer, what you gave, and why it's wrong: e.g. *"ㄸ is tense: a tight sound with no puff of air"*, *"커피 ends in a vowel, so it takes 를"*, *"Working is something you do there, so the place takes 에서"*. |
| **Sentences only with words you know** | A sentence unlocks once you've learned all of its words. |
| **Grammar you can see** | Particle Lab turns your sentences into "which particle?" questions (을/를, 이/가, 에/에서, (으)로…), and Verb Magic drills verb forms (past, future, negative, "want to"…). The wrong options are the mistakes learners really make (`듣어요`, `먹아요`, `안 공부해요`), each with the reason, and every answer shows how the form is built. |
| **Train your ear** | Sound Twins plays one of two or three look-alike words (달 / 탈 / 딸, 거울 / 겨울, 반 / 방 / 밤) so you learn to hear the difference. Well-known sentences are sometimes dictated for you to write down. |
| **Practice counts everywhere** | The fast games (Speed Match, Balloon Pop, Particle Lab, Verb Magic, Number Shop) use the words and sentences you've learned: a slip marks that word or sentence as tricky, so Word Cards and the Sentence Builder bring it back soon. |
| **A daily goal that means real practice** | Presets from 250 ⭐ (about 6 minutes) to 1200 ⭐ (about 30), or any amount on a slider in Settings. |
| **Grammar in real sentences** | Grammar Cards teaches the endings that join ideas (-고, -지만, -아서/어서, -(으)면, -(으)니까, -(으)러, -(으)ㄹ 때, -기 전에, -(으)ㄴ 후에, -는데), the helpers for "can", "must" and "may", and everyday endings: -고 있어요 ("am …-ing"), -아/어 보다 ("try"), -(으)ㄹ게요 ("I'll…") and the polite -(으)세요 / -(으)셨어요. Each pattern starts with a card (meaning, how to make it with a table of forms, a note, examples), then you fill the blank in real sentences. The wrong options are the same word with another ending (a different meaning: `오면` "if it rains" vs `오니까` "because it's raining") and the slips learners really make (`먹아서`, `듣으면`, `가을 때`), each explained. Every pattern has its own review schedule. |
| **Listening to real conversations** | Dialogues plays short two-person conversations (ordering, asking the way, making plans…) with two different voices and the script hidden, then asks about them. After each answer you see the line that holds it; at the end, the whole script with translations. Reading the script first is allowed, for fewer points. |
| **Speaking in a conversation** | In the role-play, you take one part of a dialogue you've just heard and say its lines out loud: the other part answers you, and the game checks how close you were. Then you swap parts. |
| **Reading real texts** | Reading gives you short texts of the kinds you'd really meet (a diary entry, a text message, a note, a menu, a notice, a receipt, a review) built from the words you know, with questions that need careful reading: the wrong options are usually in the text too (another price, another day). The text stays on screen, and after each answer the sentence that holds it lights up. |
| **Polite, casual or formal?** | Speech Levels shows the same sentence in 합니다체 (formal), 해요체 (polite) and 반말 (casual), with who each one is for and what else changes (저 → 나, 네 → 응, 이에요 → 이야). Then: which level is this sentence, which one fits the person you're talking to, and say it in 반말 or 합니다체, next to the slips learners really make (`저는 학생이야`, `학생야`, `갑습니다`), each explained. |
| **Shadowing** | Hear a sentence you know and say it straight back, three times, a little faster each time (🐢 0.75× → 🚶 0.9× → 🐇 1.05×). In Chrome and Edge the 🎤 listens as soon as the voice stops and tells you how close you were. |

### The minigames

- **🎴 단어 카드 · Word Cards**: the main loop. New words get an introduction card (audio, pronunciation notes like `[감사함니다]`, dictionary form, an example sentence), then they're quizzed a few cards later. Keys: `1`–`4` pick an answer, `Enter` continues, `R` replays audio.
- **🧩 문장 만들기 · Sentence Builder**: tap word tiles in order to build a Korean sentence. The decoy tiles are real traps: wrong particles (`커피을`), 에 vs 에서, 둘 vs 두 before a counter. Well-known sentences switch to listening mode ("build what you hear").
- **⚡️ 번개 짝꿍 · Speed Match**: match Korean words to their meanings against a 60-second clock. Tricky and due words appear first; a mismatch sends that word back to Word Cards for a proper review. It unlocks after you've learned 6 words.
- **🎈 풍선 터뜨리기 · Balloon Pop**: Korean words float across the sky as balloons. Type what they mean in English before they reach the left side; an exact answer pops the balloon by itself, and `Enter` also accepts a small typo. Every 5 pops the wind gets stronger, 3 balloons that get away end the round, and 10 waves clear the sky. **Reverse mode** shows English balloons that you pop by typing the Korean on the built-in keyboard.
- **🧪 조사 실험실 · Particle Lab**: a sentence you know with one particle missing: pour in the right potion (을 or 를? 에 or 에서?). Wrong potions explain themselves, and the right one comes with its rule.
- **🪄 동사 변신 · Verb Magic**: a verb you've learned and a spell: present, past, negative, then later the future, "want to", "shall we?" and "please do it". Pick the right form (or type it, for verbs you know well) and see how it's built step by step, including the irregular verbs (들어요, 추워요, 몰라요…).
- **🏪 숫자 가게 · Number Shop**: run a little shop. Hand over "사과 세 개", read a price tag aloud (팔천오백 원), ring up the amount a customer says on the till, and tell the time (세 시 반). Native vs Sino-Korean mix-ups (삼 시, 셋 개) are the wrong answers, each explained.
- **👂 소리 쌍둥이 · Sound Twins**: hear a word and find it among its look-alike twins, from plain / aspirated / tense consonants to vowels and final consonants. Without a Korean voice it becomes a reading warm-up (romanization → Hangul).
- **🔗 문법 카드 · Grammar Cards**: one new pattern at a time (two a day at most), each introduced with its card, then practised in fill-the-blank sentences next to the patterns you already know. Sentences whose words you've learned come first, and a missed pattern comes back sooner. The 📖 button in the feedback, the garden and the summary reopen a pattern's card. It opens once you know 15 words.
- **🎧 대화 듣기 · Dialogues**: two conversations a round. ▶ plays the whole dialogue (🐢 slowly), `R` replays it, and every line in the script has its own 🔊. A dialogue opens once you know its key words, and the ones you found hard come back sooner. Without a Korean voice it becomes reading practice. In Chrome and Edge, **🎭 Role-play** on the script screen lets you take one speaker's part: the other part's lines are played for you, and you say yours out loud with 🎤 (`M` starts listening). Then swap parts.
- **📖 읽기 · Reading**: for when the dialogues feel easy. A short text from one of your topics (a diary entry, a text message, a note on the fridge, a menu, a notice…), then 2–3 questions while the text stays on screen. After each answer the sentence that holds it lights up, with its translation; at the end you get the whole text with translations and a 🔊 for every sentence. ▶ reads the text aloud (🐢 slowly). Showing the English first is allowed, for fewer points. A text opens once you know its key words.
- **🙇 말투 · Speech Levels**: 합니다체, 해요체 or 반말? The very first round opens with the card: the three levels, who each one is for, their endings and a table of what else changes (📖 reopens it any time). Each sentence opens once you know its key words and has its own review schedule, and its questions get harder as it grows: which level is this sentence → who are you talking to (👫 a close friend, 🛍️ a shop assistant, 📺 the news…), pick the sentence that fits → say it in 반말 or in 합니다체. Every wrong option is explained, and the feedback shows the sentence in all three levels with a 🔊 for each.
- **🦜 따라 말하기 · Shadowing**: five sentences you know a round (the ones you've built in the Sentence Builder and your focus topic's first). Each one is played three times, a little faster each time, and you say it straight back. In Chrome and Edge, with speaking practice on, the 🎤 opens as soon as the voice stops and checks you (`M` listens again, `R` replays); elsewhere, say it out loud and press 😊 *I said it*. It needs a Korean voice.

**Dictation and speaking.** Sentences you know well are sometimes dictated in the Sentence Builder: listen and write the whole sentence (spaces and punctuation don't matter). In Chrome and Edge, 🎤 buttons next to new words and answers let you say them out loud: the browser's speech recognition checks how close you were. Both can be switched off in Settings.

## Typing Korean

Typing exercises use the on-screen **2-set (두벌식)** keyboard, the standard Korean layout.
You can click the keys, or use your **own keyboard as it is**: the game reads the key
*positions*, so no Korean input method is needed. **R** is ㄱ, **K** is ㅏ, **Shift + R** is ㄲ, and so on. The letters
combine into syllables automatically (ㄱ + ㅏ + ㄴ → 간), and Backspace removes one letter at a time.
The small Latin letters on the keys can be hidden in Settings.

## Audio

Pronunciation uses the browser's built-in speech synthesis (`speechSynthesis`) with a Korean voice,
picking the most natural one it can find. You can choose a voice and the speed in **Settings**, or use
[Azure's voices](#azure-voices-optional) instead.

If no Korean voice is installed, the game keeps working without sound: 🔊 buttons turn grey,
and the game explains how to add a voice:

- **Easiest:** use Chrome or Edge, which include online Korean voices.
- **Windows:** Settings → Time & language → Speech → Manage voices → Add voices → Korean, then restart the browser.
- **macOS:** System Settings → Accessibility → Spoken Content → System voice → Manage Voices… → Korean (e.g. Yuna).

Speaking practice uses the browser's speech recognition (`SpeechRecognition`), which Chrome and Edge provide. It
needs a microphone, and Chrome sends the audio to its online speech service to recognise it. In browsers without
it, the 🎤 buttons simply don't appear.

### Azure voices (optional)

Microsoft Azure's Korean neural voices (SunHi, InJoon, Hyunsu…) sound more natural than most browsers' own. The
game can use them with a key from your own Azure Speech resource. Without a key, nothing changes.

**About the key.** This is a static site with no server of its own, and a web page can't keep a secret: whatever key
the page uses can be seen by anyone who opens the developer tools in *that* browser. So the key is never in the code
or in this repository. You paste it into **Settings → Sound → Azure voices**, where it's saved only in that
browser's local storage, apart from your progress (so it isn't in backups either), and sent only to
`https://<region>.tts.speech.microsoft.com`. People who open the game elsewhere don't get it. To keep the risk small,
use the free F0 tier, a Speech resource just for this game, and if the key ever leaks, **Regenerate Key 1** in the
Azure portal: the old key stops working at once. (Hiding the key from the browser completely would take a small
server of your own that calls Azure on the page's behalf.)

**Setting it up:**

1. An Azure account at [portal.azure.com](https://portal.azure.com). Signing up is free, but asks for a phone number
   and a card to verify who you are.
2. **Create a resource → Speech** (Azure AI Speech): any resource group (e.g. `mallang`), a region near you (e.g.
   Korea Central, East US, West Europe), a unique name, and the **Free F0** pricing tier.
3. Open the resource → **Keys and Endpoint**, and copy **KEY 1** and the **Location/Region** (e.g. `koreacentral`).
4. In the game: **Settings → Sound → Azure voices**: paste the key, type the region, pick a voice, and press
   **Save and test**.

**The free tier** includes 0.5 million characters of neural text to speech a month. Every character of the text
counts, spaces too, and a Hangul syllable counts as one. A word is 2–4 characters and a sentence 10–20, so even a
few hundred a day stay far below it. F0 also allows 20 requests a minute: in a very fast game, words over that
limit are said by the browser's voice. The game keeps every clip it fetches (in the browser's cache storage), so each
word is fetched only once, and clips you've already heard play offline too.

**How it sounds in the game.** The voice you choose reads everything; in dialogues, women speak with a woman's voice
and men with a man's (SunHi and InJoon, unless you choose another). Slower and faster speeds (Settings, 🐢) replay
the same clip. If Azure can't answer (offline, a wrong key, the limit), the browser's voice speaks instead and a
small note says why. **Remove the key** deletes the key and the stored clips from the browser. Voice names and
regions are in `js/core/config.js` (`azureSpeech`); they aren't secret, only the key is.

The list also has **선히 SunHi Dragon HD**, Azure's high-definition version of SunHi
(`ko-KR-SunHi:DragonHDLatestNeural`). It isn't part of the free tier: it needs a Speech resource on the paid
Standard (S0) tier, in a region with HD voices (e.g. `westeurope`, `francecentral`, `swedencentral`, `eastus`).

## Install as an app (and play offline)

When the game is opened from a web address rather than as a file, it can be installed like an app,
with its own icon and window, and it keeps working offline (a service worker, `sw.js`, keeps a copy
of every file). Browsers allow this only on `https://` addresses and on `localhost`:

1. Put this folder on any static web host with https (for example GitHub Pages), or, just for this
   computer, run `npm start` (`python3 -m http.server 8000`) and open http://localhost:8000.
   To play on your phone, use the https address: from `http://` plus your computer's network address,
   the game works but can't be installed or kept for offline play.
2. Install it:
   - **Chrome / Edge (computer or Android):** **Settings → App → Install the app** in the game, or the
     install icon in the address bar (Android: menu ⋮ → *Install app* / *Add to Home screen*).
   - **iPhone / iPad (Safari):** Share → *Add to Home Screen*.

On a phone, the menu moves to a tab bar at the bottom and the games fit the screen. Opened as a file
(`index.html` double-clicked), the game works exactly the same, just without the install option.

## Your progress

Everything (garden, streak, points, badges, settings) is saved automatically in your browser's
`localStorage`. In **Settings → Your data** you can download a backup file, restore it (for example
on another computer), or reset everything. Progress is kept separately for each way of opening the
game (as a file, from a web address, as the installed app), so use a backup to move it from one to
another. Older saves are upgraded automatically: when new topics are
added, words below your starting level become quick checks, a few a day.

Settings also has the theme (light, dark, or like your computer), the daily goal, how many new words a day
Word Cards may introduce, speaking practice, and installing the game as an app. 말랑이 gets a new outfit at most levels, up to level 20: pick one in the
wardrobe on the Stats screen.

## Adding content

Each topic is one file in `content/`. To add a topic:

1. Copy `content/cafe.js` to e.g. `content/weather.js` and change the `id`, title and words.
2. Add `<script src="content/weather.js"></script>` next to the other topics in `index.html`.
3. Run the tests (below): they catch most authoring mistakes.

```js
Mallang.content.registerTopic({
  id: 'weather',                       // ids are namespaced automatically: 'weather:rain'
  order: 3,
  emoji: '☔', color: 'sky',           // colours: pink, mint, butter, sky, lilac
  title: { ko: '날씨', en: 'Weather' },
  description: { ko: '날씨 이야기', en: 'Talk about the weather' },
  notes: [
    { title: { ko: '-네요', en: 'Noticing something' },
      text: 'Add **-네요** when you notice something: 춥네요! (It’s cold!)',
      examples: [{ ko: '비가 오네요.', en: 'Oh, it’s raining.' }] },
  ],
  words: [
    { id: 'rain', ko: '비', en: 'rain', level: 1, pos: 'noun', emoji: '🌧️', rom: 'bi',
      example: { ko: '비가 와요.', en: 'It’s raining.' } },
    { id: 'cold', ko: '추워요', en: "it's cold", level: 1, pos: 'adjective', emoji: '🥶', rom: 'chuwoyo',
      dict: '춥다', note: 'ㅂ-irregular: 춥 + 어요 → 추워요.',
      example: { ko: '오늘 추워요.', en: 'It’s cold today.' } },
  ],
  sentences: [
    { id: 's-rain', en: 'It is raining today.', ko: '오늘 비가 와요.',
      tiles: ['오늘', '비가', '와요'], gloss: ['today', 'rain (subject)', 'comes'],
      words: ['rain', 'day:today', 'day:come'],   // other topics' words: 'topic:id'
      traps: [{ tile: '비를', why: 'Rain is the subject here, so it takes 가: 비가 와요.' }] },
  ],
});
```

**Word fields:** `id`, `ko`, `en` and `level` (1 = A1, 2 = low A2, 3 = A2) are required. Optional:
`pos`, `emoji`, `rom` (romanization), `pron` (pronunciation in Hangul when it differs from the spelling),
`dict` (dictionary form of a verb), `note`, `example`, `accept` (other answers to accept when typing),
`avoid` (ids of words so close in meaning that they must never be offered as this word's wrong answers,
e.g. 차 "tea" and 녹차 "green tea"), `enAlt` (more English answers to accept when the meaning is typed in
Balloon Pop, e.g. `['to go', 'takeaway']`), and `form` (`'past'`, `'future'` or `'want'` for words that aren't
in the present tense, like 갔어요). Verb forms are checked against the conjugation engine by the tests.

**Sentence fields:** `en`, `ko`, `tiles` (the answer, in order), `words` (the words it uses; it unlocks
once they're learned). Optional: `gloss` (English for each tile), `traps` (tempting wrong tiles with an
explanation), `alts` (other correct word orders), `drill: false` (keep the sentence out of Particle Lab).
Particle traps like `커피을` for `커피를` are generated automatically, and so are the Particle Lab questions.

**Sound Twins** sets live in `content/sounds.js`: real words that differ in one sound, e.g.
`{ id: 'dal', words: [{ ko: '달', en: 'moon', emoji: '🌙', rom: 'dal' }, { ko: '탈', en: 'mask', emoji: '🎭', rom: 'tal' }] }`.
The game works out which letter differs and explains it.

**Grammar patterns** live in `content/grammar.js`. A question only names the word and the ending; the grammar
engine (`js/core/grammar.js`) makes the form, checks it against `answer`, and builds the wrong options with
their explanations: the same word with the endings in `contrast` (a different meaning, which the English
must make clear) and the typical slips for that word (`먹아서`, `들으면` vs `듣으면`…). `traps` adds
hand-written wrong options:

```js
{ id: 'nikka', order: 8, level: 3, emoji: '💬', form: 'nikka',
  title: { ko: '-(으)니까', en: 'because / since' },
  meaning: '…', how: '…', note: '…', examples: [{ ko: '…', en: '…' }],
  questions: [
    { id: 'rain', ko: '지금 비가 오니까 우산을 가져가세요.', en: 'It’s raining now, so take an umbrella.',
      answer: '오니까', dict: '오다', words: ['day:now', 'weather:raining', 'weather:umbrella'],
      contrast: ['myeon', 'jiman'],
      traps: [{ text: '와서', why: '-아서/어서 can’t give the reason for a request or suggestion (…세요, …(으)ㄹ까요?). Use -(으)니까: 오니까.' }] },
    // pos: 'adjective' for adjectives, tense: 'past' for 갔지만 / 먹었으니까 / 갔을 때
  ] },
```

The endings are `go` -고 · `jiman` -지만 · `aseo` -아서/어서 · `myeon` -(으)면 · `nikka` -(으)니까 · `reo` -(으)러 ·
`ttae` -(으)ㄹ 때 · `gijeone` -기 전에 · `hue` -(으)ㄴ 후에 · `aya` -아/어야 해요 · `ado` -아/어도 돼요 · `su` / `suNot`
-(으)ㄹ 수 있어요 / 없어요 · `goIt` -고 있어요 · `boseyo` / `bwasseoyo` -아/어 보세요 / 봤어요 · `lgeyo` -(으)ㄹ게요 ·
`neunde` -는데 / -(으)ㄴ데 · `seyo` -(으)세요 · `si` -(으)셨어요. The tests check that every answer matches the engine
and that every question has three explained wrong options.

**Dialogues** live in `content/dialogues.js`: two speakers (one `voice: 'high'`, one `'low'`), a few lines,
and questions whose options are `{ ko, en }` and whose `line` points at the line with the answer:

```js
{ id: 'cafe-order', topic: 'cafe', level: 1, scene: '☕', title: { ko: '카페에서 주문하기', en: 'Ordering at a café' },
  speakers: { A: { name: '직원', en: 'Barista', emoji: '🧑‍🍳', voice: 'low' },
              B: { name: '서연', en: 'Seoyeon', emoji: '👩', voice: 'high' } },
  lines: [{ who: 'A', ko: '어서 오세요. 뭐 드릴까요?', en: 'Welcome! What can I get you?' }, …],
  words: ['cafe:latte', 'cafe:cookie', 'cafe:cake'],   // it opens once these are learned
  questions: [{ q: { ko: '서연 씨는 뭘 마셔요?', en: 'What does Seoyeon drink?' },
                options: [{ ko: '라테', en: 'a latte' }, { ko: '녹차', en: 'green tea' }, { ko: '주스', en: 'juice' }],
                answer: 0, line: 1, why: 'Seoyeon says 라테 한 잔하고 쿠키 하나 주세요.' }] },
```

Write numbers in the lines in Hangul (세 시 반, 사천오백 원), so every voice reads them right.

**Reading texts** live in `content/reading.js`: the text sentence by sentence, and questions like the
dialogues' ones, whose `line` points at the sentence (or sentences, `[1, 3]`) with the answer. Numbers can
be in digits where a real text has them: the 🔊 reads a number with its counter in Hangul (7시 → 일곱 시,
3,500원 → 삼천오백 원), and a sentence whose number is a label gets `say`, how it's read aloud
(`{ ko: '2번 출구로 나오세요.', …, say: '이번 출구로 나오세요.' }`):

```js
{ id: 'cafe-menu', topic: 'cafe', level: 1, emoji: '📋',
  kind: { ko: '메뉴', en: 'A café menu' }, title: { ko: '말랑 카페 메뉴', en: 'The Mallang Café menu' },
  sentences: [{ ko: '커피는 삼천 원이에요.', en: 'Coffee is 3,000 won.' }, …],
  words: ['cafe:coffee', 'cafe:latte'],   // it opens once these are learned
  questions: [{ q: { ko: '라테는 얼마예요?', en: 'How much is a latte?' },
                options: [{ ko: '3,500원', en: '3,500 won' }, { ko: '3,000원', en: '3,000 won' }, { ko: '4,000원', en: '4,000 won' }],
                answer: 0, line: 1, why: 'The menu says 라테는 삼천오백 원이에요: a latte is 3,500 won.' }] },
```

**Speech levels** live in `content/speech-levels.js`: the card (the three levels, who each one is for, a table of
what changes), the scenes (who you're talking to, and the level that fits) and the sentences, each in all three
levels, with the scenes it fits and the slips learners make as wrong options (`traps`):

```js
{ id: 'student', level: 2, en: 'I’m a student.',
  formal: '저는 학생입니다.', polite: '저는 학생이에요.', casual: '나는 학생이야.',
  words: ['people:student'],            // it opens once these are learned
  scenes: ['friend', 'interview'],      // who you could say it to
  traps: [{ to: 'casual', text: '저는 학생이야.', why: 'In 반말, “I” is 나: 나는 학생이야.' }, …] },
```

## Adding a minigame

A minigame is one file in `js/games/` that registers itself; add its `<script>` tag in `index.html`
and it appears on the home screen.

```js
Mallang.games.register({
  id: 'my-game',
  order: 4,
  emoji: '🎯', color: 'sky',
  title: { ko: '내 게임', en: 'My Game' },
  blurb: { ko: '설명', en: 'What it does' },
  status(topicId) {           // shown on the home card
    return { ready: true, ko: '도전!', en: 'Try it' };
  },
  start(host) {
    // host.stage             element to draw into
    // host.topicId           the chosen topic ('all' or a topic id)
    // host.setProgress(d, t) progress bar
    // host.award(points)     add points (updates goal, streak, level)
    // host.react(result, combo)  sound + mascot reaction to { correct, almost }, combo counter
    // host.showFeedback({ tone, points, content, onContinue })
    // host.empty({ emoji, ko, en, text })   friendly "nothing to do / locked" card
    // host.onCleanup(fn)     called when the player leaves
    // host.finish(result)    end of round → summary screen ({ gameId, answers, correct, bestCombo,
    //                        mistakes, mainStat: { icon, value, ko, en } to replace the accuracy tile })
  },
});
```

Games can reuse the exercise types in `js/exercises/` (`intro`, `choice`, `tiles`, `typing`,
`sentence`, `dictation`), the spaced-repetition helpers in `js/core/srs.js` (`practice(id, correct)`
is the light update the fast games use), and the language engines: `M.numbers` (Korean number
readings), `M.conjugate` (verb forms with explanations and typical mistakes), `M.grammar` (connecting
and helper endings, with slips and meaning contrasts), `M.particles` (particle questions from sentences)
and `M.answers` (lenient checking of typed answers). `js/games/word-cards.js`
is a good example to copy; `js/games/particle-lab.js` is a small one.

## Project structure

```
index.html            loads everything (plain <script> tags, so it runs from file://)
css/                  base (tokens, light and dark theme, layout), components, screens, games, minigames,
                      phone (small screens, loaded last)
content/              one file per topic: words, sentences, lesson notes; sounds.js: Sound Twins sets;
                      grammar.js: grammar patterns; dialogues.js: listening dialogues; reading.js: reading texts;
                      speech-levels.js: speech levels
js/core/              no UI: config, Hangul engine, numbers, verb conjugation, grammar endings, particles,
                      answer checking, storage, spaced repetition, progress & badges, distractor picking,
                      speech (and the optional Azure voices), speech recognition, sound effects
js/ui/                components, mascot (and its outfits), Korean keyboard, feedback sheet, 🎤 buttons
js/exercises/         intro · choice · tiles · typing · sentence · dictation
js/games/             word-cards · sentence-builder · speed-match · balloon-pop · particle-lab ·
                      verb-magic · number-shop · sound-twins · grammar-cards · dialogues · reading ·
                      speech-levels · shadowing
js/screens/           onboarding · home · garden · stats · settings · play · summary
js/pwa.js             install & offline support (only when opened from a web address)
js/app.js             start-up and routing (#/home, #/play/word-cards…)
sw.js                 service worker: keeps a copy of every file for offline play
manifest.webmanifest  app name, icons and colours for installing (icons/ holds the icons)
tests/                unit tests for the core and the content (Node's built-in runner)
```

All tunable numbers (review intervals, round sizes, points, daily goals) are in `js/core/config.js`.

## Tests

The core logic and the content have unit tests that use Node's built-in test runner (Node 18+), with no packages to install:

```bash
npm test          # or: node --test tests/*.test.js
```

They cover the Hangul typing engine, Korean numbers, the verb conjugation engine and the grammar
endings (both checked against hand-verified tables of regular and irregular verbs, including the
typical slips), particle questions, answer checking, spaced-repetition scheduling and round building,
the minigames' round logic, streaks, levels, badges, saving, loading and upgrading old saves, and the
offline file list, and the optional Azure voices (against a simulated Azure: the key stays out of the progress and
backups, one request per clip, the browser's voice when Azure refuses). They also check every topic, grammar
pattern, dialogue, reading text and speech-level sentence for authoring mistakes
(including that every verb form and every grammar answer matches the engines).

## Why plain JavaScript?

The game should open straight from a file with no setup. Modern JavaScript *modules*
are blocked on `file://` pages in Chrome and Firefox, so the game uses classic `<script>` tags that
each add a piece to one global `Mallang` object. It's still organised into small modules with
registries for content, exercises and games, so it can grow without a framework or a build step.
The only external resource is an optional web font (Jua + Nunito from Google Fonts). Offline, your
system fonts are used and everything still works. Installing and the offline copy use a service worker,
which browsers only allow from a web address, so that part simply switches itself off on `file://`.

## Ideas for next steps

- Honorifics: 드세요, 계세요, 주무세요 and the -(으)시- in 가셨어요, and when to use them (a next step after Speech Levels)
- Longer listening: a short story or a podcast-style monologue in a few parts, with questions after each
- A weekly review: the words and sentences you missed most this week, in one round
