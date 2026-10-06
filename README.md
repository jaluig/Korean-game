# 말랑 한국어 · Mallang Korean

A cute, spaced-repetition Korean learning game that runs in your browser.
Meet 말랑이 (Mallang-i), a squishy rice-cake bunny with a sprout on its head:
every Korean word you learn becomes a plant in your **word garden**, and short
practice rounds keep it growing.

- **18 minigames:** 🎴 Word Cards · 🧩 Sentence Builder · ⚡️ Speed Match · 🎈 Balloon Pop · 🧪 Particle Lab · 🪄 Verb Magic · 🏪 Number Shop · 👂 Sound Twins · 👄 Sound Changes · 🔗 Grammar Cards · 🎧 Dialogues · 💬 Choose Your Reply · 📖 Reading · 🙇 Speech Levels · 🦜 Shadowing · 👵 Honorifics · 📻 Stories · 🗓️ Weekly Review
- **13 topics** with 727 words and 368 sentences, each with short lesson notes: ☕ at the café · 🌞 my day · 👨‍👩‍👧 family & people · 🔢 numbers & time · 🛍️ shopping · 💗 feelings · 🗺️ finding the way · 📔 the past tense · ☔ weather · 🎨 hobbies & plans · 🚄 travel & transport · 💊 at the doctor's · 💼 school & work
- **22 grammar patterns** (-고, -지만, -아서/어서, -(으)면, -는데, -(으)려고, -고 있어요, -(으)세요, -지 마세요…) with 232 practice sentences, **29 listening dialogues** with two voices and a 🎭 role-play where you speak one part, **53 short texts to read** (a diary, a text message, a menu, a receipt, a group chat, a weather forecast, a chat between friends in 반말…), and **16 stories and podcasts** in a few parts for longer listening
- **Speech levels and honorifics:** 60 sentences in 합니다체, 해요체 and 반말, with who each one is for, and 60 on showing respect for the person you talk about (가세요, 주무세요, 드세요, 연세, 드려요…)
- **Conversations you take part in:** 22 in which you pick (or say) your reply and the other person reacts, and **how Korean really sounds**: 7 rules of sound change (먹어요 [머거요], 학년 [항년], 좋다 [조타]) with 63 words to hear and say
- **Built-in Korean keyboard**, so you never need a Korean input method
- **Pronunciation audio** through your browser's own Korean voice (or, optionally, Azure's neural voices with your own key), **dictation** of whole sentences, and **🎤 speaking practice** and **shadowing** in Chrome and Edge
- **An adjustable daily goal, a streak of the days you reach it, points, levels, 60 badges** and 14 outfits for the mascot, saved on your computer
- Korean interface with small English subtitles, which you can turn off once you're ready, and a **dark theme**
- A **weekly review** of the words and sentences you missed most
- **TOPIK I practice tests**: listening and reading in the style of the real test (113 questions), with your score and the level it stands for
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
| **How Korean really sounds** | Korean isn't always said the way it's spelled. Sound Changes takes the rules one at a time, each with its card: linking (먹어요 [머거요]), the quiet ㅎ (좋아요 [조아요]), consonants that turn nasal (학년 [항년]), an ㅎ that makes its neighbour stronger (좋다 [조타]), tense sounds (학교 [학꾜]), 같이 [가치] and 신라 [실라]. You see a word and pick how it's said, then hear one and pick its spelling; the wrong options are what learners really say and write (reading it letter by letter, half the rule), each explained. |
| **Practice counts everywhere** | The fast games (Speed Match, Balloon Pop, Particle Lab, Verb Magic, Number Shop) use the words and sentences you've learned: a slip marks that word or sentence as tricky, so Word Cards and the Sentence Builder bring it back soon. |
| **A daily goal that means real practice** | Presets from 250 ⭐ (about 6 minutes) to 1200 ⭐ (about 30), or any amount on a slider in Settings. The 🔥 streak counts the days in a row you reach it. |
| **Grammar in real sentences** | Grammar Cards teaches the endings that join ideas (-고, -지만, -아서/어서, -(으)면, -(으)니까, -(으)러, -(으)려고, -(으)면서, -(으)ㄹ 때, -기 전에, -(으)ㄴ 후에, -는데), the helpers for "can", "must" and "may", and everyday endings: -고 있어요 ("am …-ing"), -아/어 보다 ("try"), -(으)ㄹ게요 ("I'll…"), -(으)ㄴ 적이 있어요 ("have ever…"), the polite -(으)세요 / -(으)셨어요 and -지 마세요 ("please don't"). Each pattern starts with a card (meaning, how to make it with a table of forms, a note, examples), then you fill the blank in real sentences. The wrong options are the same word with another ending (a different meaning: `오면` "if it rains" vs `오니까` "because it's raining") and the slips learners really make (`먹아서`, `듣으면`, `가을 때`), each explained. Every pattern has its own review schedule. |
| **Listening to real conversations** | Dialogues plays short two-person conversations (ordering, asking the way, making plans…) with two different voices and the script hidden, then asks about them. After each answer you see the line that holds it; at the end, the whole script with translations. Reading the script first is allowed, for fewer points. |
| **Speaking in a conversation** | In the role-play, you take one part of a dialogue you've just heard and say its lines out loud: the other part answers you, and the game checks how close you were. Then you swap parts. |
| **Taking part in a conversation** | In Choose Your Reply you're one of the speakers, and you want something (a hot latte to take away, an appointment for tomorrow…). They speak; you pick your reply from three, or say it with the 🎤. A wrong reply isn't just marked wrong: they react the way a real person would (`네? 제가요?`), you see why, and you try again. |
| **Reading real texts** | Reading gives you short texts of the kinds you'd really meet (a diary entry, a text message, a note, a menu, a notice, a receipt, a review) built from the words you know, with questions that need careful reading: the wrong options are usually in the text too (another price, another day). The text stays on screen, and after each answer the sentence that holds it lights up. |
| **Polite, casual or formal?** | Speech Levels shows the same sentence in 합니다체 (formal), 해요체 (polite) and 반말 (casual), with who each one is for and what else changes (저 → 나, 네 → 응, 이에요 → 이야). Then: which level is this sentence, which one fits the person you're talking to, and say it in 반말 or 합니다체, next to the slips learners really make (`저는 학생이야`, `학생야`, `갑습니다`), each explained. |
| **Shadowing** | Hear a sentence you know and say it straight back, three times, a little faster each time (🐢 0.75× → 🚶 0.9× → 🐇 1.05×). In Chrome and Edge the 🎤 listens as soon as the voice stops and tells you how close you were. |
| **Showing respect** | Honorifics is the next step after the speech levels: they're about who you talk *to*, honorifics about who you talk *about*. Each sentence comes twice: about someone you respect (할머니께서 지금 **주무세요**) and about someone else (동생이 지금 **자요**). First: which plain word is this the respectful form of; then fill the blank in each, next to the slips learners really make (`자세요`, `있으세요` for being somewhere, `저는 가세요`), each explained. |
| **Longer listening** | Stories are short stories and podcast-style talks in two or three parts, read by one narrator, with questions after each part, so you follow something longer than a dialogue without losing the thread. |
| **Going over your mistakes** | Every wrong answer is remembered (for two weeks). The Weekly Review gathers the words and sentences you missed most in the last seven days, in any game, and goes over them in one round; the home screen suggests it once a week. |
| **Checking your level** | The TOPIK I practice test is a short mock test in the style of the real one: listening, reading or both, with the real test's kinds of questions in its order. As on the day, nothing is marked until you hand it in; then you see your score, the TOPIK I level it stands for, and every question again with the script and the English. |

### The minigames

- **🎴 단어 카드 · Word Cards**: the main loop. New words get an introduction card (audio, pronunciation notes like `[감사함니다]`, dictionary form, an example sentence), then they're quizzed a few cards later. Keys: `1`–`4` pick an answer, `Enter` continues, `R` replays audio.
- **🧩 문장 만들기 · Sentence Builder**: tap word tiles in order to build a Korean sentence. The decoy tiles are real traps: wrong particles (`커피을`), 에 vs 에서, 둘 vs 두 before a counter. Well-known sentences switch to listening mode ("build what you hear").
- **⚡️ 번개 짝꿍 · Speed Match**: match Korean words to their meanings against a 60-second clock. Tricky and due words appear first; a mismatch sends that word back to Word Cards for a proper review. It unlocks after you've learned 6 words.
- **🎈 풍선 터뜨리기 · Balloon Pop**: Korean words float across the sky as balloons. Type what they mean in English before they reach the left side; an exact answer pops the balloon by itself, and `Enter` also accepts a small typo. Every 5 pops the wind gets stronger, 3 balloons that get away end the round, and 10 waves clear the sky. **Reverse mode** shows English balloons that you pop by typing the Korean on the built-in keyboard.
- **🧪 조사 실험실 · Particle Lab**: a sentence you know with one particle missing: pour in the right potion (을 or 를? 에 or 에서?). Wrong potions explain themselves, and the right one comes with its rule.
- **🪄 동사 변신 · Verb Magic**: a verb you've learned and a spell: present, past, negative, then later the future, "want to", "shall we?" and "please do it". Pick the right form (or type it, for verbs you know well) and see how it's built step by step, including the irregular verbs (들어요, 추워요, 몰라요…).
- **🏪 숫자 가게 · Number Shop**: run a little shop. Hand over "사과 세 개" or "양말 두 켤레", read a price tag aloud (팔천오백 원), ring up the amount a customer says on the till, and tell the time (세 시 반). Native vs Sino-Korean mix-ups (삼 시, 셋 개) are the wrong answers, each explained.
- **👂 소리 쌍둥이 · Sound Twins**: hear a word and find it among its look-alike twins, from plain / aspirated / tense consonants to vowels and final consonants. Without a Korean voice it becomes a reading warm-up (romanization → Hangul).
- **👄 발음 변화 · Sound Changes**: how words really sound when the letters meet, one rule at a time. A new rule opens with its card (📖 reopens it); then its words, mixed with the rules you've met: see 학년 and pick how it's said ([항년]), and, once you know a word better, hear it and pick its spelling (`1`–`3` pick, `R` replays). After each answer, hear it again and, in Chrome and Edge, say it with 🎤. Every word has its own review schedule. Without a Korean voice, the pronunciation is shown instead.
- **🔗 문법 카드 · Grammar Cards**: one new pattern at a time (two a day at most), each introduced with its card, then practised in fill-the-blank sentences next to the patterns you already know. Sentences whose words you've learned come first, and a missed pattern comes back sooner. The 📖 button in the feedback, the garden and the summary reopen a pattern's card. It opens once you know 15 words.
- **🎧 대화 듣기 · Dialogues**: two conversations a round. ▶ plays the whole dialogue (🐢 slowly), `R` replays it, and every line in the script has its own 🔊. A dialogue opens once you know its key words, and the ones you found hard come back sooner. Without a Korean voice it becomes reading practice. In Chrome and Edge, **🎭 Role-play** on the script screen lets you take one speaker's part: the other part's lines are played for you, and you say yours out loud with 🎤 (`M` starts listening). Then swap parts.
- **💬 대답 고르기 · Choose Your Reply**: two conversations a round, in which you play one part, with a goal that's shown at the start and with every choice. They speak (`R` replays); you pick your reply from three (`1`–`3`), or say it (🎤, `M`). After a wrong reply they react, you see why, and you try again; the right one is read aloud in a second voice and the conversation goes on. At the end, the whole conversation with translations and a 🎤 for each of your lines. A conversation opens once you know its key words, and the ones you slipped in come back sooner.
- **📖 읽기 · Reading**: for when the dialogues feel easy. A short text from one of your topics (a diary entry, a text message, a note on the fridge, a menu, a notice…), then 2–3 questions while the text stays on screen. After each answer the sentence that holds it lights up, with its translation; at the end you get the whole text with translations and a 🔊 for every sentence. ▶ reads the text aloud (🐢 slowly). Showing the English first is allowed, for fewer points. A text opens once you know its key words.
- **🙇 말투 · Speech Levels**: 합니다체, 해요체 or 반말? The very first round opens with the card: the three levels, who each one is for, their endings and a table of what else changes (📖 reopens it any time). Each sentence opens once you know its key words and has its own review schedule, and its questions get harder as it grows: which level is this sentence → who are you talking to (👫 a close friend, 🛍️ a shop assistant, 📺 the news…), pick the sentence that fits → say it in 반말 or in 합니다체. Every wrong option is explained, and the feedback shows the sentence in all three levels with a 🔊 for each.
- **🦜 따라 말하기 · Shadowing**: five sentences you know a round (the ones you've built in the Sentence Builder and your focus topic's first). Each one is played three times, a little faster each time, and you say it straight back. In Chrome and Edge, with speaking practice on, the 🎤 opens as soon as the voice stops and checks you (`M` listens again, `R` replays); elsewhere, say it out loud and press 😊 *I said it*. It needs a Korean voice.
- **👵 높임말 · Honorifics**: -(으)시- (가세요, 가셨어요), the verbs and nouns with a word of their own (주무세요, 드세요, 계세요, 연세, 성함), and the humble words for what you do for someone you respect (드려요, 여쭤봐요). The very first round opens with the card (📖 reopens it); each sentence has its own review schedule and opens once you know its key words. The feedback shows both sentences of a pair, with a 🔊 each.
- **📻 이야기 듣기 · Stories**: one story a round, part by part. ▶ plays the part (🐢 slowly, `R` replays it); its script can be shown for fewer points. After each answer you see the line that holds it; at the end, the whole story with translations and a 🔊 for every line. Without a Korean voice it becomes reading practice.
- **🗓️ 이번 주 복습 · Weekly Review**: the words and sentences you got wrong in the last seven days, most missed first (up to 12), listed before the round starts. Each one is asked the way Word Cards and the Sentence Builder ask it, and one you miss again comes back once more at the end. Once gone over, a word leaves the list (unless you missed it again just then).

### TOPIK I practice

**📝 TOPIK I 모의시험** is under 말랑이 on the home screen (on a phone, in the corner of 말랑이's card), apart from
the games: a check of your level now and then. Choose listening (10 questions, about 13 minutes at the real test's
pace), reading (10 questions, about 15 minutes) or both. Each section has the real test's kinds of questions in its
order: in listening, the right answer to a question, what comes next, where they are, what they're talking about,
what matches a conversation, what someone mainly thinks, and a longer talk with two questions; in reading, what a text
is about, the word for a blank, which statement about a notice or a message is *not* true, what matches a text, its
main idea, the right order of four sentences, and longer texts with two questions. Each listening item plays by
itself and can be heard twice, as on the real test (`R` plays it again); `1`–`4` choose an answer, and the numbers at
the top jump to any question. When you hand it in: your score out of 100 a section, the level it stands for (on the
real test, 80 of 200 is level 1 and 140 is level 2; this one is shorter, so it's a rough guide), and every question
again with the script or text, the English, a 🔊 for each line, and why the answer is right. Each right answer earns
⭐ for your daily goal, and the questions you've seen least recently come first next time. The 56 listening and 57
reading questions are written for this game in the style of the real test, not taken from past papers.

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

Everything (garden, streak, points, badges, TOPIK results, settings) is saved automatically in your browser's
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
`neunde` -는데 / -(으)ㄴ데 · `seyo` -(으)세요 · `si` -(으)셨어요 · `jimaseyo` -지 마세요 · `ryeogo` -(으)려고 ·
`myeonseo` -(으)면서 · `jeogi` / `jeogiNot` -(으)ㄴ 적이 있어요 / 없어요. The tests check that every answer matches the engine
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

**Honorifics** live in `content/honorifics.js`: the card (sections, a table of plain → honorific words, a note, and
why each wrong choice is wrong) and the items, each the same idea about someone you respect and about someone else
(`who`: yourself, a younger brother or sister, a friend, a child, or a thing or an animal), with the slips learners make:

```js
{ id: 'sleep', level: 1, words: ['day:sleep'],   // it opens once these are learned
  honor: { ko: '할머니께서 지금 주무세요.', en: 'Grandma is sleeping now.', answer: '주무세요', dict: '주무시다' },
  plain: { ko: '동생이 지금 자요.', en: 'My little brother is sleeping now.', answer: '자요', dict: '자다', who: 'younger' },
  traps: [{ text: '자세요', why: '자다 has its own honorific verb, 주무시다: 주무세요.' }],
  note: '자다 → 주무시다: a verb with an honorific word of its own.' },
```

**Stories** live in `content/stories.js`: one narrator (`voice: 'high'` or `'low'`), two to four parts, each with its
lines (numbers in Hangul) and questions whose `line` points at a line of that part:

```js
{ id: 'cafe-first-day', topic: 'cafe', level: 2, emoji: '☕', voice: 'high',
  kind: { ko: '이야기', en: 'A story' }, title: { ko: '카페에서 일한 첫날', en: 'My first day at the café' },
  words: ['cafe:cafe', 'cafe:latte'],
  parts: [{ lines: [{ ko: '첫날 아침 일곱 시에 카페에 갔어요.', en: 'On the first day I went to the café at seven.' }, …],
            questions: [{ q: { ko: '몇 시에 갔어요?', en: 'What time did they go?' },
                          options: [{ ko: '7시', en: '7:00' }, …], answer: 0, line: 0, why: '…' }] }, …] },
```

**Choose Your Reply conversations** live in `content/replies.js`: who you are (`role`), what you want (`goal`, which
makes one reply the right one), who you talk to (`them`, with a `voice`), and the steps: their lines, and your turns
of three options, exactly one right. A wrong option has their reaction (`react`, read aloud) and `why`:

```js
{ id: 'cafe-latte-to-go', topic: 'cafe', level: 2, scene: '☕', title: { ko: '카페에서 주문하기', en: 'Ordering at a café' },
  role: { ko: '손님', en: 'Customer' },
  goal: { ko: '따뜻한 라테를 가져가요.', en: 'Get a hot latte to take away.' },
  them: { name: '직원', en: 'Barista', emoji: '🧑‍🍳', voice: 'high' },
  words: ['cafe:latte', 'cafe:please'],   // it opens once these are learned
  steps: [                                 // they speak first and last, with 3–5 turns of yours
    { them: { ko: '드시고 가세요? 가져가세요?', en: 'For here or to go?' } },
    { you: [{ ko: '가져갈게요.', en: 'I’ll take it with me.', right: true },
            { ko: '가져가세요.', en: 'Please take it away.',
              react: { ko: '네? 제가 가져가요?', en: 'Sorry? I take it away?' },
              why: '가져가세요 asks her to take it. About what you’ll do, say 가져갈게요.' },
            …] },
    …] },
```

**Sound changes** live in `content/sound-changes.js`: the rules, in teaching order, each with its card (`text`,
`examples`, an optional `note`), and the words they change, each with its pronunciation in Hangul (`pron`), how
learners might wrongly say it (`wrong`), and how they might wrongly spell it from the sound (`spellings`, never a real
word that sounds the same):

```js
Mallang.content.registerSoundChanges({
  rules: [{ id: 'nasal', order: 3, level: 2, emoji: '👃', title: { ko: '비음화', en: 'Nasal sounds' },
            text: 'Before **ㄴ** or **ㅁ**, a 받침 that sounds like **ㄱ ㄷ ㅂ** becomes …',
            examples: [{ ko: '학년', pron: '항년', en: 'school year, grade' }, …] }, …],
  items: [{ id: 'mangnae', rule: 'nasal', level: 2, ko: '막내', pron: '망내', en: 'the youngest (in a family)',
            wrong: ['막내', '만내'], spellings: ['망내', '맘내'], note: 'ㄱ before ㄴ becomes ㅇ: 막 → 망.' }, …],
});
```

**TOPIK I practice questions** live in `content/topik.js`, in two lists, `listening` and `reading`. Each entry has a
`type` (the kind of question, in the real test's order: listening `reply`, `next`, `place`, `topic`, `match`, `idea`,
`set`; reading `about`, `blank`, `notice`, `match`, `idea`, `order`, `set`), what to hear (`script`, with a man `'m'`
and a woman `'w'`, numbers in Hangul) or read (`text`, or a `notice`), and one question (two for a `set`) with four
options. The test shuffles the options; the checker makes sure each type has the right shape (one blank, four orders
of (가)–(라), the places ㉠–㉣…):

```js
{ id: 'l-place-shoes', type: 'place',
  script: [{ who: 'm', ko: '이 운동화 다른 색도 있어요?', en: 'Do you have these trainers in another colour?' },
           { who: 'w', ko: '네, 흰색하고 검은색이 있어요.', en: 'Yes, in white and black.' }],
  questions: [{ options: [{ ko: '신발 가게', en: 'a shoe shop' }, { ko: '은행', en: 'a bank' },
                          { ko: '식당', en: 'a restaurant' }, { ko: '우체국', en: 'a post office' }],
                answer: 0, why: '운동화 (trainers) in other colours: a shoe shop.' }] },
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
                      speech-levels.js: speech levels; honorifics.js: honorifics; stories.js: stories;
                      topik.js: TOPIK I practice questions; replies.js: Choose Your Reply conversations;
                      sound-changes.js: Sound Changes rules and words
js/core/              no UI: config, Hangul engine, numbers, verb conjugation, grammar endings, particles,
                      answer checking, storage, spaced repetition, progress & badges, distractor picking,
                      TOPIK I practice tests (building and scoring them), speech (and the optional Azure
                      voices), speech recognition, sound effects
js/ui/                components, mascot (and its outfits), Korean keyboard, feedback sheet, 🎤 buttons
js/exercises/         intro · choice · tiles · typing · sentence · dictation
js/games/             word-cards · sentence-builder · speed-match · balloon-pop · particle-lab ·
                      verb-magic · number-shop · sound-twins · sound-changes · grammar-cards · dialogues ·
                      replies · reading · speech-levels · shadowing · honorifics · stories · weekly-review
js/screens/           onboarding · home · garden · stats · settings · play · summary · topik (TOPIK I practice)
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
the minigames' round logic, the TOPIK I practice tests (their order, shuffling and scoring), streaks (and keeping
them when an old save is upgraded), levels, badges, saving, loading and upgrading old saves, and the
offline file list, and the optional Azure voices (against a simulated Azure: the key stays out of the progress and
backups, one request per clip, the browser's voice when Azure refuses). They also check every topic, grammar
pattern, dialogue, reading text, speech-level sentence, honorifics item, story, TOPIK question, conversation and
sound change for authoring mistakes (including that every verb form and every grammar answer matches the engines).

## Why plain JavaScript?

The game should open straight from a file with no setup. Modern JavaScript *modules*
are blocked on `file://` pages in Chrome and Firefox, so the game uses classic `<script>` tags that
each add a piece to one global `Mallang` object. It's still organised into small modules with
registries for content, exercises and games, so it can grow without a framework or a build step.
The only external resource is an optional web font (Jua + Nunito from Google Fonts). Offline, your
system fonts are used and everything still works. Installing and the offline copy use a service worker,
which browsers only allow from a web address, so that part simply switches itself off on `file://`.

## Ideas for next steps

- Word families: words that share a Sino-Korean syllable (학교 · 학생 · 방학 · 대학교), so you can guess new words from the ones you know
- Numbers by ear: phone numbers, prices, dates and times read at natural speed, to write down as you hear them
- Describing things: the forms before a noun (예쁜 꽃, 지금 보는 영화, 내일 갈 곳), with Grammar Cards of their own
