/**
 * TOPIK I practice questions (js/screens/topik.js, js/core/topik.js), written
 * for this game in the style of the real Test of Proficiency in Korean, level I
 * (1급–2급). They are not copied from past papers.
 *
 * Two sections, as on the real test: listening (듣기: the script is read aloud by
 * a man 'm' and a woman 'w', and stays hidden until the answers are handed in)
 * and reading (읽기). Each entry is one thing to hear or read, with its question
 * (two for a "set"). The types and their instructions are in js/core/content.js
 * (TOPIK_TYPES), in the real test's order:
 *
 *   listening  reply [1–4] · next [5–6] · place [7–10] · topic [11–14] ·
 *              match [17–21] · idea [22–24] (whose: 'm' | 'w') · set [25–30]
 *   reading    about [31–33] · blank [34–39] · notice [40–42] · match [43–45] ·
 *              idea [46–48] · set [49–56, 59–70] · order [57–58]
 *
 * Fields: id ('l-…' for listening, 'r-…' for reading), type,
 *         script [{ who: 'm' | 'w', ko, en, say? }] (listening; numbers in Hangul, or a "say"),
 *         text [{ ko, en }] (reading; a blank is written (    ), or ( ㉠ ) in a set, and
 *           (㉠)…(㉣) mark the places where a quoted sentence could go),
 *         notice { kind: 'poster' | 'message' | 'ticket' | 'list' | 'sign', emoji, title { ko, en }, lines [{ ko, en }] },
 *         questions [{ q? { ko, en } (a set's own question), quote? { ko, en } (the sentence to place),
 *                      options (4 × { ko, en }; strings for an order like '(나)-(가)-(라)-(다)' and for ㉠–㉣),
 *                      answer (the index of the right option; the test shuffles them, except ㉠–㉣),
 *                      why (shown when going through the answers) }].
 */
Mallang.content.registerTopik({
  listening: [
    // ---------- reply [1–2]: yes/no questions ----------
    {
      id: 'l-reply-sibling',
      type: 'reply',
      script: [{ who: 'w', ko: '동생이 있어요?', en: 'Do you have any younger brothers or sisters?' }],
      questions: [
        {
          options: [
            { ko: '네, 남동생이 있어요.', en: 'Yes, I have a younger brother.' },
            { ko: '네, 동생이 없어요.', en: 'Yes, I don’t have any.' },
            { ko: '아니요, 동생이에요.', en: 'No, it’s my younger sibling.' },
            { ko: '아니요, 동생을 만나요.', en: 'No, I’m meeting my younger sibling.' },
          ],
          answer: 0,
          why: '동생이 있어요? asks whether you have a younger sibling: 네, 남동생이 있어요 (yes, a younger brother). 네 with 없어요 contradicts itself, 동생이에요 answers “is it…?”, and 동생을 만나요 doesn’t answer the question.',
        },
      ],
    },
    {
      id: 'l-reply-wallet',
      type: 'reply',
      script: [{ who: 'm', ko: '이거 리사 씨 지갑이에요?', en: 'Is this your wallet, Lisa?' }],
      questions: [
        {
          options: [
            { ko: '아니요, 언니 지갑이에요.', en: 'No, it’s my older sister’s wallet.' },
            { ko: '아니요, 제 지갑이에요.', en: 'No, it’s my wallet.' },
            { ko: '네, 지갑이 아니에요.', en: 'Yes, it isn’t a wallet.' },
            { ko: '네, 지갑이 없어요.', en: 'Yes, I don’t have a wallet.' },
          ],
          answer: 0,
          why: 'He asks if the wallet is hers: 아니요, 언니 지갑이에요 (no, it’s her older sister’s). 아니요 + 제 지갑이에요 and 네 + 아니에요 contradict themselves, and 지갑이 없어요 answers “do you have…?”.',
        },
      ],
    },
    {
      id: 'l-reply-football',
      type: 'reply',
      script: [{ who: 'w', ko: '축구를 좋아해요?', en: 'Do you like football?' }],
      questions: [
        {
          options: [
            { ko: '네, 축구를 아주 좋아해요.', en: 'Yes, I really like football.' },
            { ko: '네, 축구를 안 좋아해요.', en: 'Yes, I don’t like football.' },
            { ko: '아니요, 축구가 아니에요.', en: 'No, it isn’t football.' },
            { ko: '아니요, 축구공이 없어요.', en: 'No, I don’t have a football.' },
          ],
          answer: 0,
          why: '좋아해요? asks whether you like it: 네, 축구를 아주 좋아해요. 네 with 안 좋아해요 contradicts itself, 축구가 아니에요 answers “is it…?”, and 축구공이 없어요 answers “do you have a ball?”.',
        },
      ],
    },
    {
      id: 'l-reply-cheap',
      type: 'reply',
      script: [{ who: 'm', ko: '학교 앞 식당은 비싸요?', en: 'Is the restaurant in front of the school expensive?' }],
      questions: [
        {
          options: [
            { ko: '아니요, 싸고 맛있어요.', en: 'No, it’s cheap and the food is good.' },
            { ko: '아니요, 아주 비싸요.', en: 'No, it’s very expensive.' },
            { ko: '네, 식당에 가요.', en: 'Yes, I’m going to the restaurant.' },
            { ko: '네, 학교 앞에 있어요.', en: 'Yes, it’s in front of the school.' },
          ],
          answer: 0,
          why: 'He asks about the price (비싸요?): 아니요, 싸고 맛있어요 (no, it’s cheap). 아니요 + 아주 비싸요 contradicts itself, and the 네 options say where you’re going or where it is, not whether it’s expensive.',
        },
      ],
    },
    {
      id: 'l-reply-homework',
      type: 'reply',
      script: [{ who: 'w', ko: '숙제 다 했어요?', en: 'Have you finished your homework?' }],
      questions: [
        {
          options: [
            { ko: '아니요, 아직 못 했어요.', en: 'No, I haven’t been able to yet.' },
            { ko: '아니요, 숙제를 다 했어요.', en: 'No, I’ve finished my homework.' },
            { ko: '네, 숙제를 할 거예요.', en: 'Yes, I’m going to do my homework.' },
            { ko: '네, 숙제가 많아요.', en: 'Yes, I have a lot of homework.' },
          ],
          answer: 0,
          why: '다 했어요? asks whether it’s done: 아니요, 아직 못 했어요 (no, not yet). 아니요 + 다 했어요 contradicts itself, 할 거예요 is about later, and 숙제가 많아요 answers “do you have a lot?”.',
        },
      ],
    },
    // ---------- reply [3–4]: wh-questions ----------
    {
      id: 'l-reply-who',
      type: 'reply',
      script: [{ who: 'w', ko: '누구하고 같이 왔어요?', en: 'Who did you come with?' }],
      questions: [
        {
          options: [
            { ko: '회사 동료하고 왔어요.', en: 'I came with a colleague from work.' },
            { ko: '지하철을 타고 왔어요.', en: 'I came by subway.' },
            { ko: '아침 일찍 왔어요.', en: 'I came early in the morning.' },
            { ko: '서울에서 왔어요.', en: 'I came from Seoul.' },
          ],
          answer: 0,
          why: '누구하고 asks “with whom?”: 회사 동료하고 (with a colleague). The others answer how (지하철을 타고), when (아침 일찍) and where from (서울에서).',
        },
      ],
    },
    {
      id: 'l-reply-when',
      type: 'reply',
      script: [{ who: 'm', ko: '언제 이사했어요?', en: 'When did you move house?' }],
      questions: [
        {
          options: [
            { ko: '지난 주말에 이사했어요.', en: 'I moved last weekend.' },
            { ko: '회사 근처로 이사했어요.', en: 'I moved near my office.' },
            { ko: '친구하고 같이 이사했어요.', en: 'I moved with a friend.' },
            { ko: '트럭을 빌려서 이사했어요.', en: 'I rented a truck for the move.' },
          ],
          answer: 0,
          why: '언제 asks “when?”: 지난 주말에 (last weekend). The others say where to (회사 근처로), with whom (친구하고) and how (트럭을 빌려서).',
        },
      ],
    },
    {
      id: 'l-reply-where',
      type: 'reply',
      script: [{ who: 'm', ko: '어디가 아파요?', en: 'Where does it hurt?' }],
      questions: [
        {
          options: [
            { ko: '배가 아파요.', en: 'My stomach hurts.' },
            { ko: '친구가 아파요.', en: 'My friend is ill.' },
            { ko: '어제부터 아파요.', en: 'It’s been hurting since yesterday.' },
            { ko: '조금 아파요.', en: 'It hurts a little.' },
          ],
          answer: 0,
          why: '어디가 아파요? asks which part of you hurts: 배 (your stomach). The others say who is ill (친구가), since when (어제부터) and how much (조금).',
        },
      ],
    },
    {
      id: 'l-reply-how-many',
      type: 'reply',
      script: [{ who: 'w', ko: '오늘 커피를 몇 잔 마셨어요?', en: 'How many cups of coffee have you had today?' }],
      questions: [
        {
          options: [
            { ko: '세 잔 마셨어요.', en: 'I’ve had three cups.' },
            { ko: '카페에서 마셨어요.', en: 'I had it at a café.' },
            { ko: '아침에 마셨어요.', en: 'I had it in the morning.' },
            { ko: '친구하고 마셨어요.', en: 'I had it with a friend.' },
          ],
          answer: 0,
          why: '몇 잔 asks how many cups: 세 잔 (three). The others say where (카페에서), when (아침에) and with whom (친구하고).',
        },
      ],
    },
    {
      id: 'l-reply-why',
      type: 'reply',
      script: [{ who: 'm', ko: '왜 한국어를 배워요?', en: 'Why are you learning Korean?' }],
      questions: [
        {
          options: [
            { ko: '한국 드라마를 좋아해서요.', en: 'Because I like Korean dramas.' },
            { ko: '대학교에서 배워요.', en: 'I learn it at university.' },
            { ko: '일주일에 두 번 배워요.', en: 'I have lessons twice a week.' },
            { ko: '친구한테 배워요.', en: 'A friend teaches me.' },
          ],
          answer: 0,
          why: '왜 asks for a reason, and 좋아해서요 gives one (because I like Korean dramas). The others say where (대학교에서), how often (일주일에 두 번) and from whom (친구한테).',
        },
      ],
    },
    // ---------- next [5–6]: what comes next ----------
    {
      id: 'l-next-phone',
      type: 'next',
      script: [{ who: 'm', ko: '여보세요. 지영 씨 좀 바꿔 주세요.', en: 'Hello. Could I speak to Jiyoung, please?' }],
      questions: [
        {
          options: [
            { ko: '잠깐만 기다리세요.', en: 'Just a moment, please.' },
            { ko: '맛있게 드세요.', en: 'Enjoy your meal.' },
            { ko: '안녕히 주무세요.', en: 'Good night.' },
            { ko: '반가워요.', en: 'Nice to meet you.' },
          ],
          answer: 0,
          why: 'On the phone, 지영 씨 좀 바꿔 주세요 asks you to put Jiyoung on, so you say 잠깐만 기다리세요 while you fetch her. The others are for a meal, bedtime and meeting someone.',
        },
      ],
    },
    {
      id: 'l-next-passed',
      type: 'next',
      script: [{ who: 'w', ko: '저 한국어 시험에 합격했어요!', en: 'I passed my Korean exam!' }],
      questions: [
        {
          options: [
            { ko: '축하해요.', en: 'Congratulations.' },
            { ko: '고마워요.', en: 'Thank you.' },
            { ko: '괜찮아요.', en: 'That’s all right.' },
            { ko: '시험 잘 보세요.', en: 'Good luck in your exam.' },
          ],
          answer: 0,
          why: 'Good news (합격했어요: she passed) calls for 축하해요. 시험 잘 보세요 is said before an exam, and she has already passed it.',
        },
      ],
    },
    {
      id: 'l-next-meal',
      type: 'next',
      script: [{ who: 'w', ko: '떡볶이를 만들었어요. 많이 드세요.', en: 'I made tteokbokki. Help yourself.' }],
      questions: [
        {
          options: [
            { ko: '잘 먹겠습니다.', en: 'Thank you for the food. (before eating)' },
            { ko: '잘 먹었습니다.', en: 'Thank you, I enjoyed that. (after eating)' },
            { ko: '다녀오겠습니다.', en: 'I’m off. (leaving home)' },
            { ko: '처음 뵙겠습니다.', en: 'How do you do?' },
          ],
          answer: 0,
          why: '많이 드세요 invites you to start eating, and before a meal you say 잘 먹겠습니다. 잘 먹었습니다 is for after the meal, and you haven’t eaten yet.',
        },
      ],
    },
    {
      id: 'l-next-trip',
      type: 'next',
      script: [{ who: 'm', ko: '저 내일 경주로 여행을 가요.', en: 'I’m going on a trip to Gyeongju tomorrow.' }],
      questions: [
        {
          options: [
            { ko: '잘 다녀오세요.', en: 'Have a good trip.' },
            { ko: '다녀왔습니다.', en: 'I’m home. (on coming back)' },
            { ko: '오랜만이에요.', en: 'Long time no see.' },
            { ko: '빨리 나으세요.', en: 'Get well soon.' },
          ],
          answer: 0,
          why: 'He is about to leave on a trip (내일 … 여행을 가요), so you wish him a good one: 잘 다녀오세요. 다녀왔습니다 is what you say when you come back home.',
        },
      ],
    },
    {
      id: 'l-next-pay',
      type: 'next',
      script: [{ who: 'w', ko: '모두 만 이천 원입니다.', en: 'That’s 12,000 won altogether.' }],
      questions: [
        {
          options: [
            { ko: '여기 있어요.', en: 'Here you are.' },
            { ko: '어서 오세요.', en: 'Welcome.' },
            { ko: '천만에요.', en: 'You’re welcome.' },
            { ko: '잘 지내세요.', en: 'Take care.' },
          ],
          answer: 0,
          why: 'The shop assistant tells you the total (모두 만 이천 원), so you pay and say 여기 있어요. 어서 오세요 is what the shop says when you come in, and 천만에요 answers a thank-you.',
        },
      ],
    },
    {
      id: 'l-next-visit',
      type: 'next',
      script: [{ who: 'm', ko: '초대해 줘서 고마워요. 이제 가 볼게요.', en: 'Thank you for inviting me. I’ll be going now.' }],
      questions: [
        {
          options: [
            { ko: '또 놀러 오세요.', en: 'Come again.' },
            { ko: '안녕히 계세요.', en: 'Goodbye. (to someone staying)' },
            { ko: '어서 들어오세요.', en: 'Come on in.' },
            { ko: '잘 부탁드립니다.', en: 'I look forward to working with you.' },
          ],
          answer: 0,
          why: 'A guest is leaving her home (초대해 줘서 고마워요 … 가 볼게요), and the host says 또 놀러 오세요. 안녕히 계세요 is what the one leaving says, and 어서 들어오세요 is for when a guest arrives.',
        },
      ],
    },
    // ---------- place [7–10]: where are they? ----------
    {
      id: 'l-place-parcel',
      type: 'place',
      script: [
        { who: 'm', ko: '이 상자를 일본에 보내고 싶어요.', en: 'I’d like to send this box to Japan.' },
        { who: 'w', ko: '비행기로 보내실 거예요, 배로 보내실 거예요?', en: 'Would you like to send it by air or by sea?' },
      ],
      questions: [
        {
          options: [
            { ko: '우체국', en: 'a post office' },
            { ko: '은행', en: 'a bank' },
            { ko: '카페', en: 'a café' },
            { ko: '약국', en: 'a pharmacy' },
          ],
          answer: 0,
          why: 'He wants to send a box abroad (상자를 일본에 보내고 싶어요), and she asks “by air or by sea?”: a post office. You can send money from a bank, but not a box.',
        },
      ],
    },
    {
      id: 'l-place-comic',
      type: 'place',
      script: [
        { who: 'm', ko: '어제 나온 만화책 있어요?', en: 'Do you have the comic book that came out yesterday?' },
        { who: 'w', ko: '네, 여기 있어요. 팔천 원이에요.', en: 'Yes, here it is. That’s 8,000 won.' },
      ],
      questions: [
        {
          options: [
            { ko: '서점', en: 'a bookshop' },
            { ko: '도서관', en: 'a library' },
            { ko: '꽃집', en: 'a florist' },
            { ko: '세탁소', en: 'a dry cleaner’s' },
          ],
          answer: 0,
          why: 'A comic that came out yesterday (어제 나온 만화책), for a price (팔천 원): a bookshop. A library has books too, but you borrow them for free; you don’t pay for them.',
        },
      ],
    },
    {
      id: 'l-place-haircut',
      type: 'place',
      script: [
        { who: 'w', ko: '오늘은 어떻게 해 드릴까요?', en: 'What can I do for you today?' },
        { who: 'm', ko: '머리를 조금 짧게 잘라 주세요.', en: 'Please cut my hair a little shorter.' },
      ],
      questions: [
        {
          options: [
            { ko: '미용실', en: 'a hair salon' },
            { ko: '병원', en: 'a hospital' },
            { ko: '빵집', en: 'a bakery' },
            { ko: '편의점', en: 'a convenience store' },
          ],
          answer: 0,
          why: 'He asks her to cut his hair (머리를 … 잘라 주세요): a hair salon. 머리 here is hair, not a sore head, so it isn’t a hospital.',
        },
      ],
    },
    {
      id: 'l-place-train',
      type: 'place',
      script: [
        { who: 'm', ko: '부산 가는 표 한 장 주세요.', en: 'One ticket to Busan, please.' },
        { who: 'w', ko: '열 시는 자리가 없어요. 열한 시는 괜찮으세요?', en: 'There are no seats left at ten. Is eleven all right?' },
      ],
      questions: [
        {
          options: [
            { ko: '기차역', en: 'a train station' },
            { ko: '백화점', en: 'a department store' },
            { ko: '극장', en: 'a cinema' },
            { ko: '공원', en: 'a park' },
          ],
          answer: 0,
          why: '부산 가는 표 is a ticket to travel to Busan, and of these places only a train station sells one. A cinema also sells tickets and has seats (자리) at set times, but not tickets to Busan.',
        },
      ],
    },
    {
      id: 'l-place-gallery',
      type: 'place',
      script: [
        { who: 'm', ko: '이 그림 앞에서 사진 찍어도 돼요?', en: 'May I take a photo in front of this painting?' },
        { who: 'w', ko: '아니요, 여기에서는 사진을 찍으면 안 돼요.', en: 'No, you can’t take photos in here.' },
      ],
      questions: [
        {
          options: [
            { ko: '미술관', en: 'an art gallery' },
            { ko: '사진관', en: 'a photo studio' },
            { ko: '시장', en: 'a market' },
            { ko: '서점', en: 'a bookshop' },
          ],
          answer: 0,
          why: 'Paintings on show (이 그림 앞에서) and no photos allowed (찍으면 안 돼요): an art gallery. A photo studio is where you go to have your photo taken.',
        },
      ],
    },
    {
      id: 'l-place-room',
      type: 'place',
      script: [
        { who: 'm', ko: '예약 안 했는데 오늘 방 있어요?', en: 'I didn’t book, but do you have a room for tonight?' },
        { who: 'w', ko: '네, 하룻밤에 구만 원이에요.', en: 'Yes, it’s 90,000 won a night.' },
      ],
      questions: [
        {
          options: [
            { ko: '호텔', en: 'a hotel' },
            { ko: '식당', en: 'a restaurant' },
            { ko: '박물관', en: 'a museum' },
            { ko: '문구점', en: 'a stationery shop' },
          ],
          answer: 0,
          why: 'A room for tonight (오늘 방 있어요?) at a price per night (하룻밤, one night: 하루 + 밤): a hotel. You can book a restaurant too (예약), and some have private rooms (방), but you don’t pay for a night there.',
        },
      ],
    },
    // ---------- topic [11–14]: what are they talking about? ----------
    {
      id: 'l-topic-season',
      type: 'topic',
      script: [
        { who: 'w', ko: '저는 겨울이 제일 좋아요. 스키를 탈 수 있어요.', en: 'I like winter best. I can go skiing.' },
        { who: 'm', ko: '저는 봄이 좋아요. 꽃이 많이 피어요.', en: 'I like spring. Lots of flowers bloom.' },
      ],
      questions: [
        {
          options: [
            { ko: '계절', en: 'seasons' },
            { ko: '날씨', en: 'the weather' },
            { ko: '운동', en: 'exercise' },
            { ko: '여행', en: 'travel' },
          ],
          answer: 0,
          why: 'Each says which season they like (겨울 winter, 봄 spring): seasons. Skiing and flowers are only their reasons, and neither of them describes the weather (cold, warm, rain…).',
        },
      ],
    },
    {
      id: 'l-topic-price',
      type: 'topic',
      script: [
        { who: 'w', ko: '그 운동화 얼마 주고 샀어요?', en: 'How much did you pay for those trainers?' },
        { who: 'm', ko: '오만 원에 샀어요. 정말 쌌어요.', en: 'I got them for 50,000 won. They were really cheap.' },
      ],
      questions: [
        {
          options: [
            { ko: '가격', en: 'prices' },
            { ko: '운동', en: 'exercise' },
            { ko: '선물', en: 'presents' },
            { ko: '시간', en: 'time' },
          ],
          answer: 0,
          why: '얼마 주고 샀어요? asks what he paid, and he gives the price (오만 원) and says it was cheap: prices. 운동화 are trainers, but they don’t talk about exercise.',
        },
      ],
    },
    {
      id: 'l-topic-hometown',
      type: 'topic',
      script: [
        { who: 'w', ko: '어디에서 태어났어요?', en: 'Where were you born?' },
        { who: 'm', ko: '대구에서 태어나서 거기에서 자랐어요.', en: 'I was born in Daegu and grew up there.' },
      ],
      questions: [
        {
          options: [
            { ko: '고향', en: 'hometowns' },
            { ko: '생일', en: 'birthdays' },
            { ko: '나이', en: 'age' },
            { ko: '이름', en: 'names' },
          ],
          answer: 0,
          why: 'Where he was born and grew up (대구에서 태어나서 … 자랐어요): his hometown. 태어나다 (to be born) may suggest a birthday, but they talk about where, not when.',
        },
      ],
    },
    {
      id: 'l-topic-transport',
      type: 'topic',
      script: [
        { who: 'w', ko: '학교에 뭘 타고 와요?', en: 'How do you get to school?' },
        { who: 'm', ko: '보통 자전거를 타요. 비가 오면 버스를 타요.', en: 'I usually ride my bike. When it rains, I take the bus.' },
      ],
      questions: [
        {
          options: [
            { ko: '교통', en: 'transport' },
            { ko: '여행', en: 'travel' },
            { ko: '운동', en: 'exercise' },
            { ko: '시간', en: 'time' },
          ],
          answer: 0,
          why: '뭘 타고 와요? asks how he gets to school, and he answers with a bike and a bus: transport. The bike is how he gets there, not exercise (운동), and going to school every day isn’t a trip (여행).',
        },
      ],
    },
    {
      id: 'l-topic-date',
      type: 'topic',
      script: [
        { who: 'w', ko: '결혼식이 며칠이에요?', en: 'What’s the date of the wedding?' },
        { who: 'm', ko: '시월 이십육 일이에요. 꼭 오세요.', en: 'It’s the 26th of October. Do come.' },
      ],
      questions: [
        {
          options: [
            { ko: '날짜', en: 'dates' },
            { ko: '요일', en: 'days of the week' },
            { ko: '생일', en: 'birthdays' },
            { ko: '계절', en: 'seasons' },
          ],
          answer: 0,
          why: '며칠이에요? asks for the date, and he gives one (시월 이십육 일): dates. He doesn’t say the day of the week (요일), and October (시월) is part of the date, not a season (계절).',
        },
      ],
    },
    {
      id: 'l-topic-taste',
      type: 'topic',
      script: [
        { who: 'w', ko: '이 국 좀 짜지 않아요?', en: 'Isn’t this soup a bit salty?' },
        { who: 'm', ko: '아니요, 저한테는 딱 좋아요.', en: 'No, it’s just right for me.' },
      ],
      questions: [
        {
          options: [
            { ko: '맛', en: 'taste' },
            { ko: '건강', en: 'health' },
            { ko: '가격', en: 'prices' },
            { ko: '기분', en: 'mood' },
          ],
          answer: 0,
          why: 'Whether the soup is salty (짜지 않아요?) or just right (딱 좋아요) is about how it tastes: taste. 좋아요 here is about the soup, not his mood.',
        },
      ],
    },
    /* ---------- match: a conversation → what matches it ---------- */
    {
      id: 'l-match-umbrella',
      type: 'match',
      script: [
        { who: 'w', ko: '저, 아까 여기에 우산을 두고 갔는데요.', en: 'Excuse me, I left my umbrella here a little while ago.' },
        { who: 'm', ko: '무슨 색 우산이에요?', en: 'What colour is it?' },
        { who: 'w', ko: '노란색이에요. 창가 자리에 앉았어요.', en: 'Yellow. I was sitting by the window.' },
        { who: 'm', ko: '아, 이 우산이요? 제가 카운터에 뒀어요.', en: 'Oh, is it this one? I kept it at the counter.' },
        { who: 'w', ko: '네, 맞아요. 감사합니다.', en: 'Yes, that’s it. Thank you.' },
      ],
      questions: [
        {
          options: [
            { ko: '여자의 우산은 파란색입니다.', en: 'The woman’s umbrella is blue.' },
            { ko: '여자는 우산을 찾으러 왔습니다.', en: 'The woman has come to get her umbrella back.' },
            { ko: '남자는 창가 자리에 앉았습니다.', en: 'The man sat by the window.' },
            { ko: '남자는 우산을 찾지 못했습니다.', en: 'The man couldn’t find the umbrella.' },
          ],
          answer: 1,
          why: '아까 여기에 우산을 두고 갔는데요: she left her umbrella earlier and has come back for it (찾으러 왔습니다). It’s yellow (노란색), she’s the one who sat by the window, and he has it (제가 카운터에 뒀어요).',
        },
      ],
    },
    {
      id: 'l-match-moving',
      type: 'match',
      script: [
        { who: 'm', ko: '하은 씨, 저 이번 토요일에 이사해요.', en: 'Ha-eun, I’m moving house this Saturday.' },
        { who: 'w', ko: '그래요? 제가 도와줄까요?', en: 'Oh, are you? Shall I help?' },
        { who: 'm', ko: '정말요? 고마워요. 아침 아홉 시에 시작해요.', en: 'Would you? Thanks! We start at nine in the morning.' },
        { who: 'w', ko: '오전에는 아르바이트가 있어요. 오후에 갈게요.', en: 'I have my part-time job in the morning. I’ll come in the afternoon.' },
      ],
      questions: [
        {
          options: [
            { ko: '남자는 일요일에 이사를 합니다.', en: 'The man is moving on Sunday.' },
            { ko: '두 사람은 토요일 아침에 만날 겁니다.', en: 'The two will meet on Saturday morning.' },
            { ko: '여자는 토요일 오전에 일을 합니다.', en: 'The woman works on Saturday morning.' },
            { ko: '여자는 이번 주에 이사를 합니다.', en: 'The woman is moving this week.' },
          ],
          answer: 2,
          why: '오전에는 아르바이트가 있어요: she has her part-time job on Saturday morning, so she’s working then (일을 합니다). He’s the one moving, on Saturday, and she’ll only come in the afternoon (오후에 갈게요).',
        },
      ],
    },
    {
      id: 'l-match-dentist',
      type: 'match',
      script: [
        { who: 'w', ko: '네, 미소치과입니다.', en: 'Hello, Miso Dental Clinic.' },
        { who: 'm', ko: '오늘 네 시 예약을 내일로 바꾸고 싶은데요.', en: 'I’d like to move today’s four o’clock appointment to tomorrow.' },
        { who: 'w', ko: '내일 오전은 안 돼요. 오후 두 시는 어떠세요?', en: 'Tomorrow morning isn’t possible. How about two in the afternoon?' },
        { who: 'm', ko: '좋아요. 그 시간에 갈게요.', en: 'Fine. I’ll come at that time.' },
      ],
      questions: [
        {
          options: [
            { ko: '남자는 오늘 오후에 치과에 갈 겁니다.', en: 'The man will go to the dentist this afternoon.' },
            { ko: '치과는 내일 문을 열지 않습니다.', en: 'The dental clinic is closed tomorrow.' },
            { ko: '남자는 내일 4시에 치과에 갈 겁니다.', en: 'The man will go to the dentist tomorrow at four.' },
            { ko: '남자는 내일 오후에 치과에 갈 겁니다.', en: 'The man will go to the dentist tomorrow afternoon.' },
          ],
          answer: 3,
          why: 'He moves today’s four o’clock to tomorrow, she offers 오후 두 시, and he takes it (그 시간에 갈게요). Only tomorrow morning is full (내일 오전은 안 돼요), so the clinic is open tomorrow, and four o’clock was today’s time.',
        },
      ],
    },
    {
      id: 'l-match-swimming',
      type: 'match',
      script: [
        { who: 'w', ko: '수영을 배우고 싶은데요. 수업이 언제 있어요?', en: 'I’d like to learn to swim. When are the classes?' },
        { who: 'm', ko: '화요일하고 목요일 아침 일곱 시에 있어요.', en: 'On Tuesdays and Thursdays at seven in the morning.' },
        { who: 'w', ko: '한 달에 얼마예요?', en: 'How much is it a month?' },
        { who: 'm', ko: '칠만 원이에요.', en: 'It’s 70,000 won.' },
      ],
      questions: [
        {
          options: [
            { ko: '수업은 일주일에 두 번 있습니다.', en: 'There are classes twice a week.' },
            { ko: '수업은 저녁 7시에 시작합니다.', en: 'The class starts at 7 in the evening.' },
            { ko: '남자는 수영을 배우고 싶어 합니다.', en: 'The man wants to learn to swim.' },
            { ko: '수업은 주말에만 있습니다.', en: 'There are classes only at the weekend.' },
          ],
          answer: 0,
          why: '화요일하고 목요일: Tuesdays and Thursdays, so twice a week. The class is at seven in the morning (아침 일곱 시), not at the weekend, and it’s the woman who wants to learn.',
        },
      ],
    },
    {
      id: 'l-match-parcel',
      type: 'match',
      script: [
        { who: 'm', ko: '택배입니다. 지금 집에 계세요?', en: 'Hello, I have a delivery for you. Are you at home now?' },
        { who: 'w', ko: '아니요, 회사예요. 일곱 시쯤 집에 가요.', en: 'No, I’m at work. I’ll be home around seven.' },
        { who: 'm', ko: '그럼 문 앞에 놓고 갈까요?', en: 'Then shall I leave it at the door?' },
        { who: 'w', ko: '네, 문 앞에 놔 주세요.', en: 'Yes, please leave it at the door.' },
      ],
      questions: [
        {
          options: [
            { ko: '여자는 7시에 회사에 갑니다.', en: 'The woman goes to work at 7.' },
            { ko: '남자는 택배를 회사로 가지고 갈 겁니다.', en: 'The man will take the parcel to her office.' },
            { ko: '여자는 지금 집에 없습니다.', en: 'The woman isn’t at home now.' },
            { ko: '남자는 7시에 다시 올 겁니다.', en: 'The man will come back at 7.' },
          ],
          answer: 2,
          why: '아니요, 회사예요: she’s at work, so she isn’t at home. Seven is when she gets home (집에 가요), and he’ll leave the parcel at the door (문 앞에 놓고 갈까요? – 네), so he won’t come back.',
        },
      ],
    },
    {
      id: 'l-match-meeting',
      type: 'match',
      script: [
        { who: 'w', ko: '현우 씨, 회의가 두 시에서 세 시로 바뀌었어요.', en: 'Hyeon-u, the meeting has moved from two to three.' },
        { who: 'm', ko: '그래요? 회의실도 바뀌었어요?', en: 'Has it? Has the room changed too?' },
        { who: 'w', ko: '아니요, 회의실은 같아요.', en: 'No, it’s the same room.' },
        { who: 'm', ko: '알겠어요. 그럼 회의 자료는 제가 준비할게요.', en: 'All right. Then I’ll get the papers for the meeting ready.' },
      ],
      questions: [
        {
          options: [
            { ko: '회의 장소가 바뀌었습니다.', en: 'The meeting place has changed.' },
            { ko: '회의는 2시에 시작합니다.', en: 'The meeting starts at 2.' },
            { ko: '회의가 한 시간 늦게 시작합니다.', en: 'The meeting starts an hour later.' },
            { ko: '여자가 회의 자료를 준비할 겁니다.', en: 'The woman will get the papers ready.' },
          ],
          answer: 2,
          why: '두 시에서 세 시로: from two to three, so it starts an hour later. The room is the same (회의실은 같아요), and the man will get the papers ready (제가 준비할게요).',
        },
      ],
    },
    {
      id: 'l-match-dinner',
      type: 'match',
      script: [
        { who: 'w', ko: '다니엘 씨, 금요일 저녁에 우리 집에 올래요?', en: 'Daniel, would you like to come round to my place on Friday evening?' },
        { who: 'm', ko: '좋아요. 제가 뭘 가지고 갈까요?', en: 'I’d love to. What shall I bring?' },
        { who: 'w', ko: '아무것도 필요 없어요. 음식은 제가 할게요.', en: 'You don’t need to bring anything. I’ll do the cooking.' },
        { who: 'm', ko: '그럼 저는 과일을 좀 사 갈게요.', en: 'Then I’ll pick up some fruit on the way.' },
      ],
      questions: [
        {
          options: [
            { ko: '두 사람은 남자의 집에서 저녁을 먹을 겁니다.', en: 'The two will have dinner at the man’s place.' },
            { ko: '남자가 음식을 만들 겁니다.', en: 'The man will do the cooking.' },
            { ko: '여자는 남자에게 과일을 부탁했습니다.', en: 'The woman asked the man to bring fruit.' },
            { ko: '남자는 금요일에 여자의 집에 갈 겁니다.', en: 'The man will go to the woman’s place on Friday.' },
          ],
          answer: 3,
          why: 'She invites him to her place (우리 집에 올래요?) and he accepts (좋아요). She’ll do the cooking (음식은 제가 할게요), and the fruit is his own idea: she said he needn’t bring anything (아무것도 필요 없어요).',
        },
      ],
    },
    {
      id: 'l-match-taxi',
      type: 'match',
      script: [
        { who: 'm', ko: '기사님, 공항까지 얼마나 걸려요?', en: 'Driver, how long will it take to get to the airport?' },
        { who: 'w', ko: '지금은 길이 막혀서 한 시간쯤 걸려요.', en: 'The roads are busy now, so about an hour.' },
        { who: 'm', ko: '비행기가 열두 시에 출발해요. 괜찮을까요?', en: 'My plane leaves at twelve. Will I make it?' },
        { who: 'w', ko: '네, 열한 시 전에는 도착할 거예요.', en: 'Yes, we’ll be there before eleven.' },
      ],
      questions: [
        {
          options: [
            { ko: '남자는 지금 공항에 가고 있습니다.', en: 'The man is on his way to the airport.' },
            { ko: '남자의 비행기는 11시에 출발합니다.', en: 'The man’s plane leaves at 11.' },
            { ko: '지금은 길이 막히지 않습니다.', en: 'The roads aren’t busy now.' },
            { ko: '공항까지 30분쯤 걸립니다.', en: 'It takes about 30 minutes to the airport.' },
          ],
          answer: 0,
          why: 'He asks the driver (기사님) how long it takes to the airport, so he’s on his way there. His plane leaves at twelve (열두 시) and eleven is when they’ll arrive; the roads are busy (길이 막혀서), so it takes about an hour.',
        },
      ],
    },
    {
      id: 'l-match-cat',
      type: 'match',
      script: [
        { who: 'w', ko: '저 다음 주에 일주일 동안 고향에 가요.', en: 'I’m going back to my home town for a week next week.' },
        { who: 'm', ko: '그래요? 그럼 고양이는 어떻게 해요?', en: 'Are you? What about your cat, then?' },
        { who: 'w', ko: '그래서 부탁이 있어요. 하루에 한 번 밥 좀 줄 수 있어요?', en: 'That’s why I have a favour to ask. Could you feed her once a day?' },
        { who: 'm', ko: '네, 걱정 마세요. 매일 아침에 줄게요.', en: 'Sure, don’t worry. I’ll feed her every morning.' },
      ],
      questions: [
        {
          options: [
            { ko: '남자는 저녁마다 고양이에게 밥을 줄 겁니다.', en: 'The man will feed the cat every evening.' },
            { ko: '여자는 이번 주에 고향에 갑니다.', en: 'The woman is going to her home town this week.' },
            { ko: '남자는 아침마다 고양이에게 밥을 줄 겁니다.', en: 'The man will feed the cat every morning.' },
            { ko: '남자는 일주일 동안 고향에 갑니다.', en: 'The man is going to his home town for a week.' },
          ],
          answer: 2,
          why: '매일 아침에 줄게요: he’ll feed the cat every morning (아침마다). She’s the one going to her home town, next week (다음 주에), for a week.',
        },
      ],
    },
    {
      id: 'l-match-notes',
      type: 'match',
      script: [
        { who: 'm', ko: '에밀리 씨, 어제 수업에 왜 안 왔어요?', en: 'Emily, why weren’t you in class yesterday?' },
        { who: 'w', ko: '감기에 걸려서 못 갔어요. 숙제가 있어요?', en: 'I had a cold, so I couldn’t come. Is there any homework?' },
        { who: 'm', ko: '네, 금요일까지 단어 스무 개를 외워야 해요.', en: 'Yes, we have to learn twenty words by Friday.' },
        { who: 'w', ko: '그래요? 공책 좀 빌려줄 수 있어요?', en: 'Really? Could you lend me your notebook?' },
        { who: 'm', ko: '네, 여기 있어요.', en: 'Sure, here you are.' },
      ],
      questions: [
        {
          options: [
            { ko: '남자는 어제 수업에 가지 않았습니다.', en: 'The man didn’t go to class yesterday.' },
            { ko: '여자는 아파서 어제 수업에 못 갔습니다.', en: 'The woman was ill and missed class yesterday.' },
            { ko: '여자는 남자에게 공책을 빌려주었습니다.', en: 'The woman lent the man her notebook.' },
            { ko: '숙제는 단어 15개를 외우는 것입니다.', en: 'The homework is to learn 15 words.' },
          ],
          answer: 1,
          why: '감기에 걸려서 못 갔어요: she had a cold, so she missed class because she was ill (아파서). He was in class, he lends her his notebook (not the other way round), and it’s twenty words (단어 스무 개).',
        },
      ],
    },

    /* ---------- idea: a conversation → what one speaker mainly thinks ---------- */
    {
      id: 'l-idea-stairs',
      type: 'idea',
      whose: 'w',
      script: [
        { who: 'm', ko: '수진 씨, 왜 엘리베이터를 안 타요?', en: 'Sujin, why don’t you take the lift?' },
        { who: 'w', ko: '저는 보통 계단으로 다녀요. 운동이 되니까요.', en: 'I usually take the stairs. It’s good exercise.' },
        { who: 'm', ko: '칠 층까지 걸어서요? 힘들지 않아요?', en: 'All the way up to the seventh floor? Isn’t it hard?' },
        { who: 'w', ko: '처음에는 힘들었어요. 그런데 지금은 몸이 더 건강해졌어요.', en: 'It was hard at first. But now I’m healthier for it.' },
      ],
      questions: [
        {
          options: [
            { ko: '엘리베이터를 타는 것이 더 편합니다.', en: 'Taking the lift is more comfortable.' },
            { ko: '계단을 이용하는 것이 건강에 좋습니다.', en: 'Taking the stairs is good for your health.' },
            { ko: '엘리베이터를 빨리 고쳐야 합니다.', en: 'The lift needs to be fixed soon.' },
            { ko: '운동은 아침에 하는 것이 좋습니다.', en: 'It’s best to exercise in the morning.' },
          ],
          answer: 1,
          why: 'She takes the stairs because it’s exercise (운동이 되니까요) and she’s healthier now (몸이 더 건강해졌어요). The lift is the man’s idea, and nobody says it’s broken.',
        },
      ],
    },
    {
      id: 'l-idea-speaking',
      type: 'idea',
      whose: 'm',
      script: [
        { who: 'w', ko: '토마스 씨는 한국어를 어떻게 공부해요?', en: 'Thomas, how do you study Korean?' },
        { who: 'm', ko: '저는 한국 친구들하고 이야기를 많이 해요.', en: 'I talk a lot with my Korean friends.' },
        { who: 'w', ko: '저는 책으로 공부해요. 문법이 중요하니까요.', en: 'I study from books, because grammar is important.' },
        { who: 'm', ko: '책도 좋아요. 그래도 말을 많이 해 보는 게 제일 좋아요.', en: 'Books are good too. But speaking a lot is the best way.' },
      ],
      questions: [
        {
          options: [
            { ko: '한국어로 많이 말해 보는 것이 좋습니다.', en: 'It’s good to practise speaking Korean a lot.' },
            { ko: '책으로 문법을 공부해야 합니다.', en: 'You should study grammar from books.' },
            { ko: '한국어 문법은 아주 어렵습니다.', en: 'Korean grammar is very difficult.' },
            { ko: '한국 친구를 더 만나고 싶습니다.', en: 'I want to meet more Korean friends.' },
          ],
          answer: 0,
          why: 'He talks with Korean friends a lot and says speaking a lot is best (말을 많이 해 보는 게 제일 좋아요). Studying grammar from books is the woman’s way.',
        },
      ],
    },
    {
      id: 'l-idea-phone-bed',
      type: 'idea',
      whose: 'w',
      script: [
        { who: 'm', ko: '요즘 밤에 잠을 잘 못 자요.', en: 'I can’t sleep well at night these days.' },
        { who: 'w', ko: '자기 전에 핸드폰을 봐요?', en: 'Do you look at your phone before you go to sleep?' },
        { who: 'm', ko: '네, 누워서 한 시간쯤 봐요.', en: 'Yes, I look at it in bed for about an hour.' },
        { who: 'w', ko: '그러면 잠이 잘 안 와요. 잘 때는 핸드폰을 멀리 두세요.', en: 'That keeps you awake. Put your phone away when you go to bed.' },
      ],
      questions: [
        {
          options: [
            { ko: '잠이 안 오면 핸드폰을 보는 것이 좋습니다.', en: 'If you can’t sleep, it helps to look at your phone.' },
            { ko: '핸드폰은 하루에 한 시간만 봐야 합니다.', en: 'You should use your phone for only an hour a day.' },
            { ko: '밤에는 일찍 자고 싶습니다.', en: 'I want to go to bed early at night.' },
            { ko: '자기 전에는 핸드폰을 보지 않는 것이 좋습니다.', en: 'It’s better not to look at your phone before sleeping.' },
          ],
          answer: 3,
          why: 'She says the phone keeps you awake (잠이 잘 안 와요) and tells him to put it away at bedtime (멀리 두세요). The hour is how long he looks at it, not her advice.',
        },
      ],
    },
    {
      id: 'l-idea-booking',
      type: 'idea',
      whose: 'm',
      script: [
        { who: 'w', ko: '이번 여름 휴가에 부산에 가요.', en: 'I’m going to Busan for my summer holiday.' },
        { who: 'm', ko: '좋겠네요. 숙소는 예약했어요?', en: 'Lucky you. Have you booked somewhere to stay?' },
        { who: 'w', ko: '아니요, 가서 찾아보려고요.', en: 'No, I’m going to look for a place when I get there.' },
        { who: 'm', ko: '여름에는 사람이 많아요. 숙소는 미리 예약해야 해요.', en: 'It’s busy in summer. You need to book a place in advance.' },
      ],
      questions: [
        {
          options: [
            { ko: '숙소는 가서 찾는 것이 좋습니다.', en: 'It’s best to find a place to stay when you get there.' },
            { ko: '여름에는 부산에 가야 합니다.', en: 'You should go to Busan in summer.' },
            { ko: '여행 전에 숙소를 예약하는 것이 좋습니다.', en: 'It’s best to book a place to stay before you travel.' },
            { ko: '휴가에는 집에서 쉬고 싶습니다.', en: 'I want to rest at home on my holiday.' },
          ],
          answer: 2,
          why: '숙소는 미리 예약해야 해요: book a place in advance, because summer is busy. Looking for a room on arrival is the woman’s plan, and Busan is just where she’s going.',
        },
      ],
    },
    {
      id: 'l-idea-own-cup',
      type: 'idea',
      whose: 'w',
      script: [
        { who: 'm', ko: '지영 씨, 카페에서 왜 종이컵을 안 써요?', en: 'Jiyeong, why don’t you use paper cups at cafés?' },
        { who: 'w', ko: '저는 항상 제 컵을 가지고 다녀요.', en: 'I always carry my own cup.' },
        { who: 'm', ko: '무겁지 않아요? 씻는 것도 불편하고요.', en: 'Isn’t it heavy? And washing it must be a pain.' },
        { who: 'w', ko: '괜찮아요. 쓰레기를 줄일 수 있어서 좋아요.', en: 'It’s fine. I like that it cuts down on rubbish.' },
      ],
      questions: [
        {
          options: [
            { ko: '종이컵을 쓰는 것이 더 편합니다.', en: 'Paper cups are more convenient.' },
            { ko: '자기 컵을 가지고 다니는 것이 좋습니다.', en: 'It’s good to carry your own cup.' },
            { ko: '무거운 물건은 가지고 다니면 안 됩니다.', en: 'You shouldn’t carry heavy things around.' },
            { ko: '카페에 자주 가지 않는 것이 좋습니다.', en: 'It’s better not to go to cafés often.' },
          ],
          answer: 1,
          why: 'She always carries her own cup (제 컵을 가지고 다녀요) because it cuts down on rubbish (쓰레기를 줄일 수 있어서). The weight and the washing are the man’s worries, and she says they’re fine (괜찮아요).',
        },
      ],
    },
    {
      id: 'l-idea-letter',
      type: 'idea',
      whose: 'm',
      script: [
        { who: 'w', ko: '다음 주가 어머니 생신이에요. 뭘 사면 좋을까요?', en: 'It’s my mother’s birthday next week. What should I buy?' },
        { who: 'm', ko: '선물도 좋지만 편지를 한번 써 보세요.', en: 'A present is nice, but why not write her a letter?' },
        { who: 'w', ko: '편지요? 너무 작은 선물 같아요.', en: 'A letter? That seems like too small a present.' },
        { who: 'm', ko: '아니에요. 부모님은 편지를 받으면 정말 기뻐하세요.', en: 'Not at all. Parents are really happy when they get a letter.' },
      ],
      questions: [
        {
          options: [
            { ko: '생일 선물은 비싼 것을 사야 합니다.', en: 'You should buy an expensive birthday present.' },
            { ko: '편지는 너무 작은 선물입니다.', en: 'A letter is too small a present.' },
            { ko: '부모님께 편지를 쓰는 것이 좋습니다.', en: 'It’s good to write a letter to your parents.' },
            { ko: '어머니와 같이 쇼핑하고 싶습니다.', en: 'I want to go shopping with my mother.' },
          ],
          answer: 2,
          why: 'He suggests a letter (편지를 한번 써 보세요) because parents are really happy to get one (정말 기뻐하세요). That a letter is too small a present is the woman’s worry.',
        },
      ],
    },

    /* ---------- set: a longer talk → two questions ---------- */
    // (a) an announcement at a station
    {
      id: 'l-set-train-delay',
      type: 'set',
      script: [
        { who: 'w', ko: '승객 여러분께 안내 말씀 드리겠습니다.', en: 'Attention, all passengers.' },
        { who: 'w', ko: '열 시에 강릉으로 가는 기차가 삼십 분 늦게 출발합니다.', en: 'The ten o’clock train to Gangneung will leave thirty minutes late.' },
        { who: 'w', ko: '눈이 많이 와서 기차가 아직 도착하지 않았습니다.', en: 'Because of heavy snow, the train hasn’t arrived yet.' },
        { who: 'w', ko: '기다리시는 동안 삼 층 휴게실을 이용해 주십시오.', en: 'While you wait, please use the lounge on the third floor.' },
        { who: 'w', ko: '표를 바꾸실 분은 일 층 매표소로 오시기 바랍니다.', en: 'If you’d like to change your ticket, please come to the ticket office on the first floor.' },
        { who: 'w', ko: '불편을 드려서 죄송합니다.', en: 'We apologise for the inconvenience.' },
      ],
      questions: [
        {
          q: { ko: '여자가 왜 이 이야기를 하고 있는지 고르십시오.', en: 'Why is the woman saying this?' },
          options: [
            { ko: '기차가 늦게 출발하는 것을 알리려고', en: 'to announce that a train will leave late' },
            { ko: '휴게실 이용 시간을 바꾸려고', en: 'to change the lounge’s opening hours' },
            { ko: '기차표를 싸게 팔려고', en: 'to sell train tickets cheaply' },
            { ko: '잃어버린 표를 찾아 주려고', en: 'to return a lost ticket' },
          ],
          answer: 0,
          why: 'The news is that the ten o’clock train will leave thirty minutes late (삼십 분 늦게 출발합니다), and she apologises for it. The lounge and the ticket office only tell people where to wait or change their tickets.',
        },
        {
          q: { ko: '들은 내용과 같은 것을 고르십시오.', en: 'Choose what matches what you heard.' },
          options: [
            { ko: '강릉에 가는 기차는 10시에 출발합니다.', en: 'The train to Gangneung leaves at 10.' },
            { ko: '표는 3층에서 바꿀 수 있습니다.', en: 'You can change tickets on the 3rd floor.' },
            { ko: '휴게실은 3층에 있습니다.', en: 'The lounge is on the 3rd floor.' },
            { ko: '기차는 지금 역에 와 있습니다.', en: 'The train is at the station now.' },
          ],
          answer: 2,
          why: '삼 층 휴게실: the lounge is on the third floor. The train now leaves at 10:30 (삼십 분 늦게), tickets are changed on the first floor (일 층 매표소), and the train hasn’t arrived yet (아직 도착하지 않았습니다).',
        },
      ],
    },
    // (a) a radio guide
    {
      id: 'l-set-food-festival',
      type: 'set',
      script: [
        { who: 'm', ko: '다음은 이번 주말 소식입니다.', en: 'And now, what’s on this weekend.' },
        { who: 'm', ko: '토요일과 일요일에 한강 공원에서 세계 음식 축제를 합니다.', en: 'On Saturday and Sunday there’s a world food festival in Hangang Park.' },
        { who: 'm', ko: '여러 나라의 음식을 먹어 볼 수 있습니다.', en: 'You can try food from many countries.' },
        { who: 'm', ko: '음식은 한 접시에 오천 원입니다.', en: 'Each dish costs 5,000 won.' },
        { who: 'm', ko: '축제는 오후 네 시부터 밤 열 시까지 합니다.', en: 'The festival runs from four in the afternoon until ten at night.' },
        { who: 'm', ko: '공원에는 주차장이 없으니까 지하철을 이용해 주십시오.', en: 'There’s no car park at the park, so please come by subway.' },
      ],
      questions: [
        {
          q: { ko: '남자가 무엇에 대해 이야기하고 있는지 고르십시오.', en: 'What is the man talking about?' },
          options: [
            { ko: '주말 날씨 소식', en: 'the weekend weather' },
            { ko: '음식 축제 안내', en: 'information about a food festival' },
            { ko: '지하철 이용 방법', en: 'how to use the subway' },
            { ko: '새 식당 소개', en: 'a new restaurant' },
          ],
          answer: 1,
          why: 'He says when and where the world food festival is (세계 음식 축제), what you can eat there and what it costs. The subway is only how to get there.',
        },
        {
          q: { ko: '들은 내용과 같은 것을 고르십시오.', en: 'Choose what matches what you heard.' },
          options: [
            { ko: '축제는 아침 일찍 시작합니다.', en: 'The festival starts early in the morning.' },
            { ko: '공원에 차를 세울 수 있습니다.', en: 'You can park your car at the park.' },
            { ko: '음식은 한 접시에 10,000원입니다.', en: 'Each dish costs 10,000 won.' },
            { ko: '축제는 이틀 동안 합니다.', en: 'The festival lasts two days.' },
          ],
          answer: 3,
          why: '토요일과 일요일: Saturday and Sunday, so two days (이틀). It starts at four in the afternoon, there’s no car park (주차장이 없으니까), and a dish costs 5,000 won (오천 원).',
        },
      ],
    },
    // (a) a voicemail
    {
      id: 'l-set-voicemail',
      type: 'set',
      script: [
        { who: 'm', ko: '지수 씨, 저 태민이에요.', en: 'Jisu, it’s Taemin.' },
        { who: 'm', ko: '내일 같이 테니스 치기로 했지요?', en: 'We said we’d play tennis tomorrow, didn’t we?' },
        { who: 'm', ko: '그런데 제가 오늘 아침에 다리를 다쳤어요.', en: 'But I hurt my leg this morning.' },
        { who: 'm', ko: '병원에 가 봤는데 많이 다치지는 않았어요.', en: 'I went to the hospital, and it isn’t a bad injury.' },
        { who: 'm', ko: '그래도 며칠 동안 운동을 하면 안 돼요.', en: 'Still, I can’t do any sport for a few days.' },
        { who: 'm', ko: '정말 미안해요. 다음 주 토요일은 어때요?', en: 'I’m really sorry. How about next Saturday?' },
        { who: 'm', ko: '이 메시지 들으면 전화 주세요.', en: 'Give me a call when you get this message.' },
      ],
      questions: [
        {
          q: { ko: '남자가 왜 전화를 했는지 고르십시오.', en: 'Why did the man call?' },
          options: [
            { ko: '테니스를 가르쳐 주려고', en: 'to teach her tennis' },
            { ko: '좋은 병원을 소개하려고', en: 'to recommend a good hospital' },
            { ko: '약속 날짜를 바꾸려고', en: 'to change the day they meet' },
            { ko: '운동을 같이 시작하려고', en: 'to start doing sport together' },
          ],
          answer: 2,
          why: 'He can’t play tomorrow because of his leg and suggests next Saturday instead (다음 주 토요일은 어때요?): he’s calling to change the day they meet.',
        },
        {
          q: { ko: '들은 내용과 같은 것을 고르십시오.', en: 'Choose what matches what you heard.' },
          options: [
            { ko: '두 사람은 내일 테니스를 칠 겁니다.', en: 'The two will play tennis tomorrow.' },
            { ko: '남자는 다쳐서 병원에 다녀왔습니다.', en: 'The man got hurt and went to the hospital.' },
            { ko: '남자는 다리를 많이 다쳤습니다.', en: 'The man hurt his leg badly.' },
            { ko: '남자는 다음 주 일요일에 만나고 싶어 합니다.', en: 'The man wants to meet next Sunday.' },
          ],
          answer: 1,
          why: '병원에 가 봤는데: he went to the hospital after hurting his leg. It isn’t bad (많이 다치지는 않았어요), tomorrow’s tennis is off, and he suggests Saturday, not Sunday.',
        },
      ],
    },
    // (b) a conversation at a school office
    {
      id: 'l-set-student-card',
      type: 'set',
      script: [
        { who: 'w', ko: '어떻게 오셨어요?', en: 'How can I help you?' },
        { who: 'm', ko: '학생증을 잃어버렸어요. 다시 만들고 싶어요.', en: 'I’ve lost my student card. I’d like a new one.' },
        { who: 'w', ko: '여권하고 사진 한 장이 필요해요.', en: 'You need your passport and one photo.' },
        { who: 'm', ko: '여권은 있는데 사진이 없어요.', en: 'I have my passport, but I don’t have a photo.' },
        { who: 'w', ko: '일 층에서 사진을 찍을 수 있어요. 찍고 다시 오세요.', en: 'You can have one taken on the first floor. Come back once you have it.' },
        { who: 'm', ko: '네. 학생증은 오늘 받을 수 있어요?', en: 'OK. Can I get the card today?' },
        { who: 'w', ko: '아니요, 삼 일 후에 찾으러 오세요.', en: 'No, come and pick it up in three days.' },
      ],
      questions: [
        {
          q: { ko: '남자가 왜 이곳에 왔는지 고르십시오.', en: 'Why did the man come here?' },
          options: [
            { ko: '여권 사진을 찍으려고', en: 'to have a passport photo taken' },
            { ko: '학생증을 새로 만들려고', en: 'to get a new student card' },
            { ko: '잃어버린 여권을 찾으려고', en: 'to find his lost passport' },
            { ko: '학교에 입학 신청을 하려고', en: 'to apply to the school' },
          ],
          answer: 1,
          why: '학생증을 잃어버렸어요. 다시 만들고 싶어요: he lost his student card and wants a new one. The photo is only something he needs for it, and his passport isn’t lost: he has it (여권은 있는데).',
        },
        {
          q: { ko: '들은 내용과 같은 것을 고르십시오.', en: 'Choose what matches what you heard.' },
          options: [
            { ko: '남자는 여권을 잃어버렸습니다.', en: 'The man has lost his passport.' },
            { ko: '남자는 사진을 가지고 왔습니다.', en: 'The man has brought a photo.' },
            { ko: '사진은 3층에서 찍을 수 있습니다.', en: 'You can have photos taken on the 3rd floor.' },
            { ko: '남자는 학생증을 오늘 받을 수 없습니다.', en: 'The man can’t get his student card today.' },
          ],
          answer: 3,
          why: '오늘 받을 수 있어요? – 아니요, 삼 일 후에: not today. He lost his student card, not his passport; he has no photo (사진이 없어요); and photos are taken on the first floor (일 층).',
        },
      ],
    },
    // (b) a conversation between students
    {
      id: 'l-set-hiking-club',
      type: 'set',
      script: [
        { who: 'm', ko: '수아 씨, 학교 동아리에 들어갔어요?', en: 'Sua, have you joined a club at school?' },
        { who: 'w', ko: '네, 지난주에 등산 동아리에 들어갔어요.', en: 'Yes, I joined the hiking club last week.' },
        { who: 'm', ko: '등산 동아리에서는 뭐 해요?', en: 'What do you do in the hiking club?' },
        { who: 'w', ko: '한 달에 두 번 같이 산에 가요.', en: 'We go up a mountain together twice a month.' },
        { who: 'm', ko: '재미있겠네요. 저도 들어갈 수 있어요?', en: 'That sounds fun. Can I join too?' },
        { who: 'w', ko: '그럼요. 다음 주 수요일에 모임이 있어요. 같이 가요.', en: 'Of course. There’s a meeting next Wednesday. Let’s go together.' },
      ],
      questions: [
        {
          q: { ko: '두 사람이 무엇에 대해 이야기하고 있는지 고르십시오.', en: 'What are the two talking about?' },
          options: [
            { ko: '등산할 때 필요한 물건', en: 'things you need for hiking' },
            { ko: '남자의 새 등산화', en: 'the man’s new hiking boots' },
            { ko: '주말 여행 계획', en: 'plans for a weekend trip' },
            { ko: '여자가 들어간 동아리', en: 'the club the woman has joined' },
          ],
          answer: 3,
          why: 'He asks about the club she has joined (등산 동아리), what they do and whether he can join: they’re talking about her club.',
        },
        {
          q: { ko: '들은 내용과 같은 것을 고르십시오.', en: 'Choose what matches what you heard.' },
          options: [
            { ko: '남자는 등산 동아리에 관심이 있습니다.', en: 'The man is interested in the hiking club.' },
            { ko: '여자는 다음 주에 동아리에 들어갈 겁니다.', en: 'The woman will join the club next week.' },
            { ko: '동아리 사람들은 매주 산에 갑니다.', en: 'The club members go up a mountain every week.' },
            { ko: '다음 주 모임은 목요일에 있습니다.', en: 'Next week’s meeting is on Thursday.' },
          ],
          answer: 0,
          why: '재미있겠네요. 저도 들어갈 수 있어요?: he’s interested. She joined last week (지난주에 들어갔어요), they go twice a month (한 달에 두 번), and the meeting is on Wednesday (수요일).',
        },
      ],
    },
    // (b) a phone call
    {
      id: 'l-set-station-exit',
      type: 'set',
      script: [
        { who: 'w', ko: '여보세요, 준수 씨? 저 지금 역에 도착했어요.', en: 'Hello, Junsu? I’ve just arrived at the station.' },
        { who: 'm', ko: '그래요? 그럼 삼 번 출구로 나오세요.', en: 'Have you? Then come out of exit 3.' },
        { who: 'w', ko: '삼 번 출구요? 나와서 어디로 가요?', en: 'Exit 3? Where do I go when I come out?' },
        { who: 'm', ko: '출구 바로 앞에 은행이 있어요.', en: 'There’s a bank right outside the exit.' },
        { who: 'w', ko: '그럼 은행 앞에서 기다릴까요?', en: 'Shall I wait in front of the bank, then?' },
        { who: 'm', ko: '네, 제가 지금 그쪽으로 갈게요.', en: 'Yes, I’ll come over there now.' },
      ],
      questions: [
        {
          q: { ko: '여자가 이어서 할 일을 고르십시오.', en: 'What will the woman do next?' },
          options: [
            { ko: '은행 안으로 들어갑니다.', en: 'She goes into the bank.' },
            { ko: '3번 출구로 나갑니다.', en: 'She goes out of exit 3.' },
            { ko: '지하철을 다시 탑니다.', en: 'She gets back on the subway.' },
            { ko: '남자의 집으로 갑니다.', en: 'She goes to the man’s home.' },
          ],
          answer: 1,
          why: '그럼 삼 번 출구로 나오세요: she has just arrived at the station, so next she goes out of exit 3. Then she’ll wait in front of the bank (은행 앞에서), not inside it.',
        },
        {
          q: { ko: '들은 내용과 같은 것을 고르십시오.', en: 'Choose what matches what you heard.' },
          options: [
            { ko: '여자는 지금 은행 앞에 있습니다.', en: 'The woman is in front of the bank now.' },
            { ko: '은행은 역에서 멉니다.', en: 'The bank is far from the station.' },
            { ko: '남자가 여자를 만나러 올 겁니다.', en: 'The man will come to meet the woman.' },
            { ko: '두 사람은 역 안에서 만날 겁니다.', en: 'The two will meet inside the station.' },
          ],
          answer: 2,
          why: '제가 지금 그쪽으로 갈게요: he’s coming to meet her. She’s still in the station, the bank is right outside the exit (바로 앞), and they’ll meet in front of the bank, not inside the station.',
        },
      ],
    },
  ],
  reading: [
    // ---------- about [31–33]: two short sentences → what are they about? ----------
    {
      id: 'r-about-countries',
      type: 'about',
      text: [
        { ko: '저는 베트남에서 왔습니다.', en: 'I’m from Vietnam.' },
        { ko: '제 친구는 몽골 사람입니다.', en: 'My friend is Mongolian.' },
      ],
      questions: [
        {
          options: [
            { ko: '이름', en: 'names' },
            { ko: '나라', en: 'countries' },
            { ko: '나이', en: 'age' },
            { ko: '취미', en: 'hobbies' },
          ],
          answer: 1,
          why: '베트남 (Vietnam) and 몽골 (Mongolia) are countries, so it’s about 나라. No names, ages or hobbies are mentioned.',
        },
      ],
    },
    {
      id: 'r-about-taste',
      type: 'about',
      text: [
        { ko: '이 커피는 너무 씁니다.', en: 'This coffee is too bitter.' },
        { ko: '이 쿠키는 아주 답니다.', en: 'This cookie is very sweet.' },
      ],
      questions: [
        {
          options: [
            { ko: '가격', en: 'prices' },
            { ko: '색깔', en: 'colours' },
            { ko: '맛', en: 'taste' },
            { ko: '계절', en: 'seasons' },
          ],
          answer: 2,
          why: '씁니다 (it’s bitter, from 쓰다) and 답니다 (it’s sweet, from 달다) say how the coffee and the cookie taste: 맛. Nothing is said about what they cost or what colour they are.',
        },
      ],
    },
    {
      id: 'r-about-floors',
      type: 'about',
      text: [
        { ko: '도서관은 3층에 있습니다.', en: 'The library is on the third floor.' },
        { ko: '식당은 지하 1층에 있습니다.', en: 'The restaurant is on the first basement floor.' },
      ],
      questions: [
        {
          options: [
            { ko: '위치', en: 'location' },
            { ko: '교통', en: 'transport' },
            { ko: '시간', en: 'time' },
            { ko: '날짜', en: 'dates' },
          ],
          answer: 0,
          why: '…층에 있습니다 says which floor each place is on: it’s about 위치, where things are. 3층 and 지하 1층 are floors, not times or dates.',
        },
      ],
    },
    {
      id: 'r-about-sisters',
      type: 'about',
      text: [
        { ko: '저는 언니가 두 명 있습니다.', en: 'I have two older sisters.' },
        { ko: '남동생은 없습니다.', en: 'I don’t have a younger brother.' },
      ],
      questions: [
        {
          options: [
            { ko: '친구', en: 'friends' },
            { ko: '직업', en: 'jobs' },
            { ko: '생일', en: 'birthdays' },
            { ko: '가족', en: 'family' },
          ],
          answer: 3,
          why: '언니 (older sister) and 남동생 (younger brother) are members of the family: 가족. 두 명 (two people) counts the sisters; there are no friends, jobs or birthdays here.',
        },
      ],
    },
    {
      id: 'r-about-weather',
      type: 'about',
      text: [
        { ko: '오늘은 비가 옵니다.', en: 'It’s raining today.' },
        { ko: '바람도 많이 붑니다.', en: 'It’s very windy too.' },
      ],
      questions: [
        {
          options: [
            { ko: '기분', en: 'moods' },
            { ko: '날씨', en: 'the weather' },
            { ko: '장소', en: 'places' },
            { ko: '요일', en: 'days of the week' },
          ],
          answer: 1,
          why: '비가 옵니다 (it’s raining) and 바람이 붑니다 (the wind is blowing) describe the weather: 날씨. Nothing is said about how anyone feels, where they are or what day it is.',
        },
      ],
    },
    {
      id: 'r-about-jobs',
      type: 'about',
      text: [
        { ko: '저는 우체국에서 일합니다.', en: 'I work at a post office.' },
        { ko: '제 친구는 간호사입니다.', en: 'My friend is a nurse.' },
      ],
      questions: [
        {
          options: [
            { ko: '고향', en: 'hometowns' },
            { ko: '나이', en: 'age' },
            { ko: '직업', en: 'jobs' },
            { ko: '취미', en: 'hobbies' },
          ],
          answer: 2,
          why: '우체국에서 일합니다 (I work at a post office) and 간호사 (a nurse) are about the work people do: 직업. No hometowns, ages or hobbies are mentioned.',
        },
      ],
    },

    // ---------- blank [34–39]: one blank (    ) → what fits? ----------
    // Particles
    {
      id: 'r-blank-grandma',
      type: 'blank',
      text: [{ ko: '저는 혼자 살지 않습니다. 할머니(    ) 같이 삽니다.', en: 'I don’t live alone. I live ( ) my grandmother.' }],
      questions: [
        {
          options: [
            { ko: '를', en: 'object marker' },
            { ko: '에', en: 'at, to' },
            { ko: '와', en: 'with, and' },
            { ko: '의', en: '’s (of)' },
          ],
          answer: 2,
          why: '같이 살다 is “to live together with” someone, and the person takes 와 (with): 할머니와 같이 삽니다. 를, 에 and 의 can’t mark the person you live with.',
        },
      ],
    },
    {
      id: 'r-blank-five-years',
      type: 'blank',
      text: [{ ko: '제 여동생은 열 살입니다. 저는 여동생(    ) 다섯 살이 많습니다.', en: 'My younger sister is ten. I am five years older ( ) her.' }],
      questions: [
        {
          options: [
            { ko: '보다', en: 'than' },
            { ko: '을', en: 'object marker' },
            { ko: '에게', en: 'to' },
            { ko: '과', en: 'with, and' },
          ],
          answer: 0,
          why: 'Comparing two people needs 보다 (than): 여동생보다 다섯 살이 많습니다, five years older than my sister. 과 would need 다섯 살 차이가 납니다 (there are five years between us), and 을 and 에게 can’t compare two people.',
        },
      ],
    },
    // Nouns
    {
      id: 'r-blank-stationery',
      type: 'blank',
      text: [{ ko: '공책하고 볼펜이 필요합니다. 그래서 (    )에 갑니다.', en: 'I need a notebook and a pen. So I’m going to the ( ).' }],
      questions: [
        {
          options: [
            { ko: '약국', en: 'pharmacy' },
            { ko: '문구점', en: 'stationery shop' },
            { ko: '꽃집', en: 'flower shop' },
            { ko: '세탁소', en: 'dry cleaner’s' },
          ],
          answer: 1,
          why: '공책 (a notebook) and 볼펜 (a pen) are sold at a stationery shop: 문구점. A pharmacy sells medicine, a flower shop sells flowers, and a dry cleaner’s cleans clothes.',
        },
      ],
    },
    {
      id: 'r-blank-dictionary',
      type: 'blank',
      text: [{ ko: '모르는 단어가 있습니다. 그래서 (    )을 찾아봅니다.', en: 'There’s a word I don’t know. So I look in the ( ).' }],
      questions: [
        {
          options: [
            { ko: '지갑', en: 'wallet' },
            { ko: '우산', en: 'umbrella' },
            { ko: '수건', en: 'towel' },
            { ko: '사전', en: 'dictionary' },
          ],
          answer: 3,
          why: 'To find out what a word you don’t know (모르는 단어) means, you look it up in a dictionary: 사전을 찾아봅니다. A wallet, an umbrella or a towel can’t tell you what a word means.',
        },
      ],
    },
    {
      id: 'r-blank-coat',
      type: 'blank',
      text: [{ ko: '날씨가 많이 춥습니다. 그래서 (    )를 입었습니다.', en: 'It’s very cold. So I put on a ( ).' }],
      questions: [
        {
          options: [
            { ko: '코트', en: 'coat' },
            { ko: '모자', en: 'hat' },
            { ko: '구두', en: 'dress shoes' },
            { ko: '시계', en: 'watch' },
          ],
          answer: 0,
          why: 'In the cold you put on a coat, and 입다 is the verb for clothes: 코트를 입었습니다. A hat takes 쓰다 (모자를 씁니다), shoes take 신다 (구두를 신습니다) and a watch takes 차다 (시계를 찹니다).',
        },
      ],
    },
    // Verbs
    {
      id: 'r-blank-aircon',
      type: 'blank',
      text: [{ ko: '방이 너무 덥습니다. 그래서 에어컨을 (    ).', en: 'The room is too hot. So I ( ) the air conditioner.' }],
      questions: [
        {
          options: [
            { ko: '끕니다', en: 'turn off' },
            { ko: '켭니다', en: 'turn on' },
            { ko: '엽니다', en: 'open' },
            { ko: '닫습니다', en: 'close' },
          ],
          answer: 1,
          why: 'The room is too hot (너무 덥습니다), so you turn the air conditioner on: 에어컨을 켭니다. 끕니다 (turn off) is the opposite, and you open and close a window or a door, not an air conditioner.',
        },
      ],
    },
    {
      id: 'r-blank-library',
      type: 'blank',
      text: [{ ko: '어제 도서관에서 책을 두 권 (    ). 다음 주 월요일까지 돌려줘야 합니다.', en: 'Yesterday I ( ) two books at the library. I have to give them back by next Monday.' }],
      questions: [
        {
          options: [
            { ko: '샀습니다', en: 'bought' },
            { ko: '팔았습니다', en: 'sold' },
            { ko: '빌렸습니다', en: 'borrowed' },
            { ko: '돌려줬습니다', en: 'gave back' },
          ],
          answer: 2,
          why: 'Books you have to give back by Monday (다음 주 월요일까지 돌려줘야 합니다) are borrowed ones: 빌렸습니다. If I had bought or sold them, or already given them back (돌려줬습니다), there would be nothing to return.',
        },
      ],
    },
    // Adjectives
    {
      id: 'r-blank-busy-restaurant',
      type: 'blank',
      text: [{ ko: '이 식당은 음식이 아주 (    ). 그래서 손님이 많습니다.', en: 'The food at this restaurant is very ( ). So it has a lot of customers.' }],
      questions: [
        {
          options: [
            { ko: '맛없습니다', en: 'tastes bad' },
            { ko: '비쌉니다', en: 'expensive' },
            { ko: '짭니다', en: 'salty' },
            { ko: '맛있습니다', en: 'delicious' },
          ],
          answer: 3,
          why: 'It has a lot of customers (그래서 손님이 많습니다) because the food is very good: 맛있습니다. Food that tastes bad, costs a lot or is salty doesn’t bring in more customers.',
        },
      ],
    },
    {
      id: 'r-blank-station',
      type: 'blank',
      text: [{ ko: '지하철역이 우리 집에서 아주 (    ). 걸어서 3분 걸립니다.', en: 'The subway station is very ( ) to my home. It’s a three-minute walk.' }],
      questions: [
        {
          options: [
            { ko: '가깝습니다', en: 'close' },
            { ko: '멉니다', en: 'far' },
            { ko: '넓습니다', en: 'wide, spacious' },
            { ko: '높습니다', en: 'high, tall' },
          ],
          answer: 0,
          why: 'It’s only a three-minute walk (걸어서 3분), so the station is very close: 가깝습니다. 멉니다 (far) contradicts that, and 넓습니다 and 높습니다 don’t go with 우리 집에서 (from my home).',
        },
      ],
    },
    // Adverb
    {
      id: 'r-blank-again',
      type: 'blank',
      text: [{ ko: '어제 본 영화가 정말 재미있었습니다. 그래서 다음 주에 (    ) 볼 겁니다.', en: 'The film I saw yesterday was really fun. So next week I’ll watch it ( ).' }],
      questions: [
        {
          options: [
            { ko: '아직', en: 'still, (not) yet' },
            { ko: '먼저', en: 'first' },
            { ko: '다시', en: 'again' },
            { ko: '벌써', en: 'already' },
          ],
          answer: 2,
          why: 'You saw it yesterday and it was really fun (어제 본 영화가 정말 재미있었습니다), so you want to see it again: 다시 볼 겁니다. 아직 (still, not yet) and 벌써 (already) don’t fit a plan for next week, and 먼저 (first) would need something else to come after.',
        },
      ],
    },

    // ---------- notice [40–42]: a poster, a sign, a message, a ticket, a list → what is NOT true? ----------
    {
      id: 'r-notice-photo-show',
      type: 'notice',
      notice: {
        kind: 'poster',
        emoji: '📷',
        title: { ko: '우리 동네 사진 전시회', en: '“Our Neighbourhood” photo exhibition' },
        lines: [
          { ko: '기간: 11월 2일(월)~8일(일)', en: 'Dates: Monday 2 – Sunday 8 November' },
          { ko: '시간: 오전 10시~오후 6시', en: 'Hours: 10 a.m. – 6 p.m.' },
          { ko: '장소: 행복미술관 1층', en: 'Place: Haengbok Art Gallery, 1st floor' },
          { ko: '입장료: 어른 3,000원, 어린이 무료', en: 'Admission: adults 3,000 won, children free' },
        ],
      },
      questions: [
        {
          options: [
            { ko: '전시회는 일주일 동안 합니다.', en: 'The exhibition runs for a week.' },
            { ko: '어린이는 돈을 내지 않습니다.', en: 'Children don’t pay.' },
            { ko: '전시회는 저녁 8시까지 합니다.', en: 'The exhibition is open until 8 in the evening.' },
            { ko: '미술관 1층에서 사진을 볼 수 있습니다.', en: 'You can see the photos on the gallery’s first floor.' },
          ],
          answer: 2,
          why: 'The hours are 오전 10시~오후 6시, so it closes at 6 p.m., not 저녁 8시. Monday 2 to Sunday 8 November is a week, 어린이 무료 means children get in free, and it’s on the 1층 of 행복미술관.',
        },
      ],
    },
    {
      id: 'r-notice-laundry',
      type: 'notice',
      notice: {
        kind: 'sign',
        emoji: '🧺',
        title: { ko: '기숙사 세탁실 이용 안내', en: 'Dormitory laundry room: information' },
        lines: [
          { ko: '이용 시간: 오전 7시~밤 11시', en: 'Open: 7 a.m. – 11 p.m.' },
          { ko: '요금: 세탁기 한 번에 2,000원', en: 'Price: 2,000 won per wash' },
          { ko: '빨래가 끝나면 바로 가지고 가십시오.', en: 'Please take your laundry out as soon as it’s finished.' },
          { ko: '일요일 오전에는 청소 때문에 이용할 수 없습니다.', en: 'The room can’t be used on Sunday mornings because of cleaning.' },
        ],
      },
      questions: [
        {
          options: [
            { ko: '세탁실은 밤 11시에 문을 닫습니다.', en: 'The laundry room closes at 11 p.m.' },
            { ko: '세탁기를 한 번 쓰면 2,000원을 냅니다.', en: 'One wash costs 2,000 won.' },
            { ko: '빨래가 끝나면 빨리 가지고 가야 합니다.', en: 'You have to take your laundry out quickly when it’s done.' },
            { ko: '일요일 오전에도 세탁실을 쓸 수 있습니다.', en: 'You can use the laundry room on Sunday mornings too.' },
          ],
          answer: 3,
          why: '일요일 오전에는 청소 때문에 이용할 수 없습니다: the room is cleaned on Sunday mornings, so you can’t use it then. It’s open until 밤 11시, a wash costs 2,000원, and you take your laundry out right away (바로 가지고 가십시오).',
        },
      ],
    },
    {
      id: 'r-notice-cake',
      type: 'notice',
      notice: {
        kind: 'message',
        emoji: '🍰',
        title: { ko: '달콤빵집', en: 'Dalkom Bakery' },
        lines: [
          { ko: '이민지 님, 주문하신 딸기 케이크가 나왔습니다.', en: 'Lee Minji, the strawberry cake you ordered is ready.' },
          { ko: '오늘(10월 10일 토요일) 저녁 8시까지 찾으러 오십시오.', en: 'Please come and collect it by 8 p.m. today (Saturday 10 October).' },
          { ko: '내일은 빵집이 쉽니다.', en: 'The bakery is closed tomorrow.' },
          { ko: '케이크 값은 이미 받았습니다.', en: 'We’ve already received payment for the cake.' },
        ],
      },
      questions: [
        {
          options: [
            { ko: '이민지 씨는 딸기 케이크를 주문했습니다.', en: 'Lee Minji ordered a strawberry cake.' },
            { ko: '이민지 씨는 케이크 값을 벌써 냈습니다.', en: 'Lee Minji has already paid for the cake.' },
            { ko: '일요일에도 케이크를 찾을 수 있습니다.', en: 'The cake can be collected on Sunday too.' },
            { ko: '이민지 씨는 오늘 빵집에 가야 합니다.', en: 'Lee Minji has to go to the bakery today.' },
          ],
          answer: 2,
          why: 'Today is Saturday, and the bakery is closed tomorrow (내일은 빵집이 쉽니다), so the cake can’t be collected on Sunday: it has to be today by 8 p.m. She ordered a strawberry cake, and the bakery has already been paid (케이크 값은 이미 받았습니다).',
        },
      ],
    },
    {
      id: 'r-notice-concert',
      type: 'notice',
      notice: {
        kind: 'message',
        emoji: '🎶',
        title: { ko: '성민', en: 'Seongmin' },
        lines: [
          { ko: '유나 씨, 친구가 콘서트 표를 두 장 줬어요.', en: 'Yuna, a friend gave me two concert tickets.' },
          { ko: '이번 금요일 저녁 7시 30분에 시민회관에서 해요.', en: 'It’s this Friday at 7:30 p.m. at the Civic Hall.' },
          { ko: '같이 갈래요? 표 값은 안 내도 돼요.', en: 'Would you like to come with me? You don’t have to pay for the ticket.' },
          { ko: '가고 싶으면 내일까지 연락 주세요.', en: 'If you want to go, let me know by tomorrow.' },
        ],
      },
      questions: [
        {
          options: [
            { ko: '콘서트는 금요일 저녁에 있습니다.', en: 'The concert is on Friday evening.' },
            { ko: '성민 씨에게 콘서트 표가 두 장 있습니다.', en: 'Seongmin has two concert tickets.' },
            { ko: '성민 씨가 콘서트 표를 두 장 샀습니다.', en: 'Seongmin bought two concert tickets.' },
            { ko: '유나 씨는 표 값을 내지 않아도 됩니다.', en: 'Yuna doesn’t have to pay for her ticket.' },
          ],
          answer: 2,
          why: '친구가 콘서트 표를 두 장 줬어요: a friend gave Seongmin the tickets, so he didn’t buy them. The concert is on Friday at 7:30 p.m., he has two tickets, and Yuna doesn’t have to pay (표 값은 안 내도 돼요).',
        },
      ],
    },
    {
      id: 'r-notice-train',
      type: 'notice',
      notice: {
        kind: 'ticket',
        emoji: '🚄',
        title: { ko: '기차표', en: 'Train ticket' },
        lines: [
          { ko: '서울 → 대전', en: 'Seoul → Daejeon' },
          { ko: '11월 7일(토) 09:30 출발', en: 'Departs Saturday 7 November, 09:30' },
          { ko: '10:35 도착', en: 'Arrives 10:35' },
          { ko: '5호차 14번 좌석', en: 'Car 5, seat 14' },
          { ko: '요금: 23,700원', en: 'Fare: 23,700 won' },
        ],
      },
      questions: [
        {
          options: [
            { ko: '토요일 아침에 기차를 탑니다.', en: 'You get on the train on Saturday morning.' },
            { ko: '이 기차는 대전에서 출발합니다.', en: 'This train leaves from Daejeon.' },
            { ko: '기차는 한 시간쯤 걸립니다.', en: 'The journey takes about an hour.' },
            { ko: '기차표는 23,700원입니다.', en: 'The ticket costs 23,700 won.' },
          ],
          answer: 1,
          why: 'The ticket says 서울 → 대전: the train leaves from Seoul and goes to Daejeon, so it doesn’t start in Daejeon. It leaves on Saturday at 09:30 (in the morning), takes about an hour (09:30 to 10:35) and costs 23,700원.',
        },
      ],
    },
    {
      id: 'r-notice-menu',
      type: 'notice',
      notice: {
        kind: 'list',
        emoji: '🍜',
        title: { ko: '맛나분식 메뉴', en: 'Matna Snack Bar menu' },
        lines: [
          { ko: '김밥 3,000원', en: 'Gimbap 3,000 won' },
          { ko: '라면 4,000원', en: 'Ramyeon 4,000 won' },
          { ko: '떡볶이 4,500원', en: 'Tteokbokki 4,500 won' },
          { ko: '만두 5,000원', en: 'Dumplings 5,000 won' },
          { ko: '포장도 됩니다. 일요일은 쉽니다.', en: 'Takeaway available. Closed on Sundays.' },
        ],
      },
      questions: [
        {
          options: [
            { ko: '김밥이 제일 쌉니다.', en: 'Gimbap is the cheapest.' },
            { ko: '라면이 떡볶이보다 비쌉니다.', en: 'Ramyeon costs more than tteokbokki.' },
            { ko: '음식을 집에 가지고 갈 수 있습니다.', en: 'You can take the food home.' },
            { ko: '일요일에는 문을 닫습니다.', en: 'It’s closed on Sundays.' },
          ],
          answer: 1,
          why: '라면 is 4,000원 and 떡볶이 is 4,500원, so ramyeon is cheaper, not dearer. 김밥 (3,000원) is the cheapest, 포장도 됩니다 means you can take food away, and 일요일은 쉽니다 means it’s closed on Sundays.',
        },
      ],
    },
    // ---------- [43–45] match: a short text → what matches it ----------
    {
      id: 'r-match-fruit-shop',
      type: 'match',
      text: [
        { ko: '우리 집 앞에 작은 과일 가게가 하나 있습니다.', en: 'There’s a small fruit shop right in front of my home.' },
        { ko: '이 가게는 밤 11시까지 문을 열어서 저는 퇴근한 후에 자주 과일을 사러 갑니다.', en: 'It’s open until 11 at night, so I often go there for fruit after work.' },
        { ko: '과일이 맛있고 값도 싸서 저녁마다 손님이 많습니다.', en: 'The fruit is good and cheap too, so it’s busy every evening.' },
      ],
      questions: [
        {
          options: [
            { ko: '저는 일이 끝난 후에 그 가게에 자주 갑니다.', en: 'I often go to that shop when I finish work.' },
            { ko: '그 가게는 우리 집에서 멉니다.', en: 'The shop is far from my home.' },
            { ko: '그 가게는 과일값이 비쌉니다.', en: 'The fruit at that shop is expensive.' },
            { ko: '그 가게는 밤 9시에 문을 닫습니다.', en: 'The shop closes at 9 at night.' },
          ],
          answer: 0,
          why: '퇴근한 후에 자주 과일을 사러 갑니다: the writer often goes there after work (일이 끝난 후에). The shop is right outside (집 앞에), the fruit is cheap (값도 싸서), and it’s open until 11, not 9.',
        },
      ],
    },
    {
      id: 'r-match-grandma-phone',
      type: 'match',
      text: [
        { ko: '우리 할머니는 지난달에 처음으로 스마트폰을 사셨습니다.', en: 'Last month my grandmother bought a smartphone for the first time.' },
        { ko: '요즘은 매일 꽃 사진을 찍어서 가족들에게 보내십니다.', en: 'These days she takes photos of flowers every day and sends them to the family.' },
        { ko: '그리고 주말에는 휴대폰으로 얼굴을 보면서 손주들과 이야기하십니다.', en: 'And at weekends she video-chats with her grandchildren on her phone.' },
      ],
      questions: [
        {
          options: [
            { ko: '할머니는 가족들에게 사진을 자주 보내십니다.', en: 'Grandmother often sends photos to the family.' },
            { ko: '할머니는 작년에 스마트폰을 사셨습니다.', en: 'Grandmother bought a smartphone last year.' },
            { ko: '할머니는 꽃 사진을 찍지 않으십니다.', en: 'Grandmother doesn’t take photos of flowers.' },
            { ko: '할머니는 평일에만 손주들과 이야기하십니다.', en: 'Grandmother talks with her grandchildren only on weekdays.' },
          ],
          answer: 0,
          why: '매일 꽃 사진을 찍어서 가족들에게 보내십니다: every day is often (자주). She bought the phone last month (지난달에), not last year, and she talks with the grandchildren at weekends (주말에는).',
        },
      ],
    },
    {
      id: 'r-match-cafe-job',
      type: 'match',
      text: [
        { ko: '투이 씨는 학교 앞 카페에서 아르바이트를 합니다.', en: 'Thuy has a part-time job at a café in front of her school.' },
        { ko: '평일에는 저녁에만 일하고 주말에는 아침부터 일합니다.', en: 'On weekdays she works only in the evening, and at weekends she works from the morning.' },
        { ko: '주말에는 손님이 많아서 바쁘지만 사장님이 친절해서 일하기 편합니다.', en: 'At weekends it’s busy with lots of customers, but the owner is kind, so it’s a comfortable place to work.' },
      ],
      questions: [
        {
          options: [
            { ko: '투이 씨는 주말 아침에도 일합니다.', en: 'Thuy works on weekend mornings too.' },
            { ko: '투이 씨는 평일 아침에 일합니다.', en: 'Thuy works on weekday mornings.' },
            { ko: '주말에는 카페에 손님이 적습니다.', en: 'The café has few customers at weekends.' },
            { ko: '카페 사장님은 친절하지 않습니다.', en: 'The café owner isn’t kind.' },
          ],
          answer: 0,
          why: '주말에는 아침부터 일합니다: at weekends she starts in the morning. On weekdays she works only in the evening (저녁에만), weekends are busy (손님이 많아서), and the owner is kind (친절해서).',
        },
      ],
    },
    {
      id: 'r-match-sister-bank',
      type: 'match',
      text: [
        { ko: '우리 언니는 올해 봄부터 은행에서 일합니다.', en: 'My older sister has been working at a bank since this spring.' },
        { ko: '언니는 아침 8시까지 출근해서 저녁 6시에 퇴근합니다.', en: 'She gets to work by 8 in the morning and leaves at 6 in the evening.' },
        { ko: '평일에는 바빠서 주말에만 친구들을 만납니다.', en: 'She’s busy on weekdays, so she only sees her friends at weekends.' },
      ],
      questions: [
        {
          options: [
            { ko: '언니는 평일에 친구들을 만나지 않습니다.', en: 'My sister doesn’t see her friends on weekdays.' },
            { ko: '언니는 작년부터 은행에서 일했습니다.', en: 'My sister has worked at the bank since last year.' },
            { ko: '언니는 저녁 8시에 퇴근합니다.', en: 'My sister leaves work at 8 in the evening.' },
            { ko: '언니는 오후에 출근합니다.', en: 'My sister starts work in the afternoon.' },
          ],
          answer: 0,
          why: '주말에만 친구들을 만납니다: she sees friends only at weekends, so not on weekdays. She started this spring (올해 봄부터), and she starts at 8 in the morning and leaves at 6, not 8.',
        },
      ],
    },
    {
      id: 'r-match-rainy-day',
      type: 'match',
      text: [
        { ko: '오늘은 친구들과 같이 놀이공원에 가기로 한 날이었습니다.', en: 'Today was the day my friends and I had planned to go to an amusement park.' },
        { ko: '그런데 아침부터 비가 많이 와서 놀이공원에 갈 수 없었습니다.', en: 'But it rained hard from the morning, so we couldn’t go.' },
        { ko: '그래서 우리는 친구 집에 모여서 같이 영화를 봤습니다.', en: 'So we got together at a friend’s place and watched a film.' },
      ],
      questions: [
        {
          options: [
            { ko: '우리는 비 때문에 놀이공원에 못 갔습니다.', en: 'We couldn’t go to the amusement park because of the rain.' },
            { ko: '저는 혼자 집에서 영화를 봤습니다.', en: 'I watched a film at home alone.' },
            { ko: '비는 오후부터 오기 시작했습니다.', en: 'The rain started in the afternoon.' },
            { ko: '우리는 영화관에서 영화를 봤습니다.', en: 'We watched a film at the cinema.' },
          ],
          answer: 0,
          why: '비가 많이 와서 놀이공원에 갈 수 없었습니다: the rain stopped the trip (비 때문에 = because of the rain). It rained from the morning (아침부터), and they watched the film together at a friend’s place, not alone or at a cinema.',
        },
      ],
    },
    {
      id: 'r-match-lost-wallet',
      type: 'match',
      text: [
        { ko: '어제 저녁에 버스에서 지갑을 잃어버렸습니다.', en: 'Yesterday evening I lost my wallet on the bus.' },
        { ko: '그런데 오늘 아침에 버스 회사에서 전화가 왔습니다.', en: 'But this morning the bus company phoned me.' },
        { ko: '버스 기사님이 버스 안에서 제 지갑을 찾았습니다.', en: 'The bus driver had found my wallet on the bus.' },
        { ko: '그래서 오후에 버스 회사에 가서 지갑을 받았습니다.', en: 'So in the afternoon I went to the bus company and got it back.' },
      ],
      questions: [
        {
          options: [
            { ko: '버스 회사가 저에게 연락했습니다.', en: 'The bus company got in touch with me.' },
            { ko: '저는 지하철에서 지갑을 잃어버렸습니다.', en: 'I lost my wallet on the subway.' },
            { ko: '저는 오늘 아침에 지갑을 찾으러 갔습니다.', en: 'I went to get my wallet this morning.' },
            { ko: '지갑은 아직 버스 회사에 있습니다.', en: 'The wallet is still at the bus company.' },
          ],
          answer: 0,
          why: '버스 회사에서 전화가 왔습니다: the company phoned the writer, so it got in touch (연락했습니다). The wallet was lost on a bus, and the writer went for it in the afternoon (오후에) and got it back, so it isn’t at the company any more.',
        },
      ],
    },

    // ---------- [46–48] idea: a short text → the main idea ----------
    {
      id: 'r-idea-todo-list',
      type: 'idea',
      text: [
        { ko: '저는 아침마다 그날 해야 할 일을 공책에 씁니다.', en: 'Every morning I write down in a notebook what I have to do that day.' },
        { ko: '이렇게 하면 중요한 일을 잊어버리지 않습니다.', en: 'That way I don’t forget anything important.' },
        { ko: '그리고 끝난 일을 하나씩 지우면 기분이 아주 좋습니다.', en: 'And crossing things off one by one as I finish them feels great.' },
      ],
      questions: [
        {
          options: [
            { ko: '해야 할 일을 공책에 쓰는 것이 좋습니다.', en: 'It’s good to write down what you have to do.' },
            { ko: '중요한 일은 아침에 먼저 해야 합니다.', en: 'You should do the important things first, in the morning.' },
            { ko: '저는 새 공책을 사고 싶습니다.', en: 'I want to buy a new notebook.' },
            { ko: '할 일이 많으면 잊어버려도 괜찮습니다.', en: 'If you have a lot to do, it’s fine to forget some of it.' },
          ],
          answer: 0,
          why: 'The writer lists the day’s jobs every morning because it stops them forgetting things (잊어버리지 않습니다) and crossing them off feels good (기분이 아주 좋습니다). Doing things first in the morning and a new notebook aren’t mentioned, and forgetting is what the list prevents.',
        },
      ],
    },
    {
      id: 'r-idea-plants',
      type: 'idea',
      text: [
        { ko: '저는 집에서 작은 화분을 몇 개 키웁니다.', en: 'I keep a few small potted plants at home.' },
        { ko: '아침마다 화분에 물을 주면 기분이 좋아집니다.', en: 'Watering them every morning puts me in a good mood.' },
        { ko: '그리고 식물이 있으면 방 안의 공기도 깨끗해집니다.', en: 'And having plants makes the air in the room cleaner too.' },
      ],
      questions: [
        {
          options: [
            { ko: '집에서 식물을 키우면 좋은 점이 많습니다.', en: 'Keeping plants at home has lots of good points.' },
            { ko: '화분에는 물을 자주 주면 안 됩니다.', en: 'You shouldn’t water potted plants often.' },
            { ko: '저는 꽃집에서 일하고 싶습니다.', en: 'I want to work in a flower shop.' },
            { ko: '식물은 집 밖에서 키워야 합니다.', en: 'Plants should be kept outdoors.' },
          ],
          answer: 0,
          why: 'Two good points of plants at home: a better mood (기분이 좋아집니다) and cleaner air (공기도 깨끗해집니다). The writer waters them every morning (아침마다) and keeps them indoors, and a flower shop isn’t mentioned.',
        },
      ],
    },
    {
      id: 'r-idea-study-breaks',
      type: 'idea',
      text: [
        { ko: '저는 예전에는 시험이 있으면 쉬지 않고 몇 시간 동안 공부했습니다.', en: 'When I had an exam, I used to study for hours without a break.' },
        { ko: '그래서 머리가 아프고 공부한 것도 잘 생각나지 않았습니다.', en: 'So I’d get headaches, and I couldn’t remember what I’d studied.' },
        { ko: '요즘은 한 시간 공부하면 10분쯤 쉽니다.', en: 'These days I take a break of about ten minutes after every hour of study.' },
        { ko: '중간에 조금씩 쉬면 머리도 안 아프고 공부도 더 잘됩니다.', en: 'With short breaks along the way, I don’t get headaches and I study better.' },
      ],
      questions: [
        {
          options: [
            { ko: '공부할 때는 중간에 쉬는 것이 좋습니다.', en: 'When you study, it’s good to take breaks along the way.' },
            { ko: '시험 전에는 쉬지 않고 공부해야 합니다.', en: 'Before an exam, you should study without a break.' },
            { ko: '공부는 도서관에서 하는 것이 좋습니다.', en: 'It’s best to study in a library.' },
            { ko: '저는 머리가 아파서 병원에 가고 싶습니다.', en: 'I have a headache, so I want to see a doctor.' },
          ],
          answer: 0,
          why: 'Studying for hours without a break gave the writer headaches; now they rest about ten minutes every hour, and studying goes better (공부도 더 잘됩니다): breaks help. Not resting (쉬지 않고) is what they gave up, their head no longer hurts (머리도 안 아프고), and a library isn’t mentioned.',
        },
      ],
    },
    {
      id: 'r-idea-neighbours',
      type: 'idea',
      text: [
        { ko: '저는 동네에서 이웃을 만나면 먼저 인사를 합니다.', en: 'When I meet my neighbours around the neighbourhood, I’m the first to say hello.' },
        { ko: '처음에는 조금 부끄러웠지만 지금은 이웃들과 이야기도 자주 합니다.', en: 'I felt a bit shy at first, but now I often chat with them too.' },
        { ko: '인사를 하면 이웃과 더 친해질 수 있습니다.', en: 'Saying hello helps you get closer to your neighbours.' },
      ],
      questions: [
        {
          options: [
            { ko: '이웃에게 먼저 인사하는 것이 좋습니다.', en: 'It’s good to be the first to greet your neighbours.' },
            { ko: '모르는 사람과는 이야기하면 안 됩니다.', en: 'You shouldn’t talk to people you don’t know.' },
            { ko: '저는 지금도 이웃과 이야기하는 것이 부끄럽습니다.', en: 'I’m still shy about talking with my neighbours.' },
            { ko: '아파트에서는 조용히 해야 합니다.', en: 'You should keep quiet in an apartment building.' },
          ],
          answer: 0,
          why: 'The writer greets neighbours first (먼저 인사를 합니다) because saying hello brings you closer (더 친해질 수 있습니다). The shyness was only at first (처음에는), and nothing is said about strangers or noise.',
        },
      ],
    },
    {
      id: 'r-idea-puppy',
      type: 'idea',
      text: [
        { ko: '저는 어렸을 때부터 강아지를 키우고 싶었습니다.', en: 'I’ve wanted a puppy ever since I was little.' },
        { ko: '하지만 지금 사는 집은 너무 작고 저는 매일 늦게 퇴근합니다.', en: 'But the place I live in now is too small, and I get home from work late every day.' },
        { ko: '나중에 넓은 집으로 이사하면 꼭 강아지를 키울 겁니다.', en: 'When I move to a bigger place one day, I’m definitely going to get a dog.' },
      ],
      questions: [
        {
          options: [
            { ko: '나중에 꼭 강아지를 키우고 싶습니다.', en: 'I really want to have a dog one day.' },
            { ko: '작은 집에서도 강아지를 키울 수 있습니다.', en: 'You can keep a dog even in a small home.' },
            { ko: '저는 지금 강아지를 키우고 있습니다.', en: 'I have a dog now.' },
            { ko: '일찍 퇴근할 수 있는 회사에 다니고 싶습니다.', en: 'I want to work for a company where I can leave early.' },
          ],
          answer: 0,
          why: 'The writer has always wanted a puppy and will get one after moving (나중에 … 꼭 강아지를 키울 겁니다). Their home is too small now, so they don’t have one yet, and a new job isn’t mentioned.',
        },
      ],
    },

    // ---------- [57–58] order: four scrambled sentences → the right order ----------
    {
      id: 'r-order-open-window',
      type: 'order',
      text: [
        { ko: '그래서 아침에 일어났을 때 목이 아프고 열이 났습니다.', en: 'So when I got up in the morning, I had a sore throat and a fever.' },
        { ko: '그 약을 먹고 하루 종일 집에서 쉬었습니다.', en: 'I took the medicine and rested at home all day.' },
        { ko: '어젯밤에 날씨가 추웠는데 창문을 닫지 않고 잤습니다.', en: 'It was cold last night, but I went to sleep without closing the window.' },
        { ko: '병원에 간 후에 약국에서 감기약을 샀습니다.', en: 'I went to the doctor’s, then bought cold medicine at the pharmacy.' },
      ],
      questions: [
        {
          options: ['(다)-(가)-(라)-(나)', '(다)-(라)-(나)-(가)', '(라)-(가)-(다)-(나)', '(라)-(가)-(나)-(다)'],
          answer: 0,
          why: 'The cause (다), the open window, leads with 그래서 (가) to the sore throat and fever; then comes the medicine (라), which 그 약 (나) points back to. Buying medicine before falling ill (starting with 라) makes no sense.',
        },
      ],
    },
    {
      id: 'r-order-tshirt',
      type: 'order',
      text: [
        { ko: '그래서 어제 친구와 같이 가게에 가서 큰 사이즈로 바꿨습니다.', en: 'So yesterday I went to the shop with my friend and changed it for a bigger size.' },
        { ko: '지난주에 친구 생일 선물로 티셔츠를 하나 샀습니다.', en: 'Last week I bought a T-shirt as a birthday present for a friend.' },
        { ko: '이번에는 사이즈가 잘 맞아서 친구가 아주 좋아했습니다.', en: 'This time the size was right, and my friend was really pleased.' },
        { ko: '그런데 친구가 입어 보니까 조금 작았습니다.', en: 'But when my friend tried it on, it was a little small.' },
      ],
      questions: [
        {
          options: ['(나)-(라)-(가)-(다)', '(나)-(가)-(라)-(다)', '(다)-(나)-(라)-(가)', '(다)-(가)-(나)-(라)'],
          answer: 0,
          why: 'First the present (나); 그런데 (라), it was too small, so (그래서, 가) it was changed. 이번에는 (다), “this time”, needs an earlier try, so it can’t come first.',
        },
      ],
    },
    {
      id: 'r-order-lost-way',
      type: 'order',
      text: [
        { ko: '그래서 서연 씨에게 전화를 했습니다.', en: 'So I called Seoyeon.' },
        { ko: '서연 씨가 정류장까지 나와서 저를 집까지 데리고 갔습니다.', en: 'Seoyeon came out to the bus stop and took me to her place.' },
        { ko: '그런데 버스에서 내린 후에 길을 잃었습니다.', en: 'But after I got off the bus, I got lost.' },
        { ko: '주말에 처음으로 서연 씨 집에 놀러 갔습니다.', en: 'At the weekend I went to visit Seoyeon at her place for the first time.' },
      ],
      questions: [
        {
          options: ['(라)-(다)-(가)-(나)', '(라)-(나)-(다)-(가)', '(나)-(가)-(라)-(다)', '(나)-(다)-(가)-(라)'],
          answer: 0,
          why: 'The visit (라) comes first; 그런데 (다) brings the problem, getting lost; 그래서 (가) the phone call. Seoyeon fetching the writer (나) ends the story: getting lost after that makes no sense.',
        },
      ],
    },
    {
      id: 'r-order-bike',
      type: 'order',
      text: [
        { ko: '그래서 지난달에 형에게 자전거를 배우기 시작했습니다.', en: 'So last month I started learning to ride from my older brother.' },
        { ko: '하지만 매일 연습해서 이제는 혼자서도 잘 탈 수 있습니다.', en: 'But I practised every day, and now I can ride well on my own.' },
        { ko: '처음에는 자꾸 넘어져서 다리를 다쳤습니다.', en: 'At first I kept falling off and hurt my leg.' },
        { ko: '저는 스무 살이 넘었지만 자전거를 탈 줄 몰랐습니다.', en: 'I was over twenty, but I couldn’t ride a bike.' },
      ],
      questions: [
        {
          options: ['(라)-(가)-(다)-(나)', '(라)-(나)-(가)-(다)', '(가)-(라)-(다)-(나)', '(가)-(다)-(나)-(라)'],
          answer: 0,
          why: 'The problem (라) comes first, and 그래서 (가), the lessons, follows from it; 처음에는 (다), the falls, comes before 하지만 이제는 (나), riding alone. The text can’t open with 그래서 (가).',
        },
      ],
    },

    // ---------- [49–70] set: a longer text → two questions ----------
    // A diary · Q1 the blank (a connector) · Q2 what matches
    {
      id: 'r-set-haircut',
      type: 'set',
      text: [
        { ko: '오늘 집 근처에 새로 생긴 미용실에 갔습니다.', en: 'Today I went to a new hair salon that has opened near my home.' },
        { ko: '다음 주에 졸업식이 있어서 머리를 조금만 자르고 싶었습니다.', en: 'My graduation is next week, so I wanted just a little cut off.' },
        { ko: '( ㉠ ) 미용사가 머리를 너무 짧게 잘랐습니다.', en: '( ㉠ ) the hairdresser cut it far too short.' },
        { ko: '거울을 보고 깜짝 놀랐지만 아무 말도 하지 못했습니다.', en: 'I got a shock when I looked in the mirror, but I couldn’t say a thing.' },
        { ko: '하지만 친구들은 “짧은 머리도 잘 어울려요.”라고 말했습니다.', en: 'My friends, though, said, “Short hair suits you too.”' },
        { ko: '다음에는 미용사에게 “조금만 잘라 주세요.”라고 꼭 말할 겁니다.', en: 'Next time I’ll be sure to tell the hairdresser, “Just a little off, please.”' },
      ],
      questions: [
        {
          q: { ko: '㉠에 들어갈 알맞은 것을 고르십시오.', en: 'Choose what fits ㉠.' },
          options: [
            { ko: '그래서', en: 'so' },
            { ko: '그런데', en: 'but' },
            { ko: '그러면', en: 'then, in that case' },
            { ko: '그리고', en: 'and' },
          ],
          answer: 1,
          why: 'The writer wanted only a little off (조금만 자르고 싶었습니다), and the hairdresser did the opposite: 그런데 (“but”). 그래서 would make the short cut the result of that wish, and 그리고 just adds a fact.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '미용사가 머리를 생각보다 많이 잘랐습니다.', en: 'The hairdresser cut off more hair than I expected.' },
            { ko: '저는 머리를 아주 짧게 자르고 싶었습니다.', en: 'I wanted my hair cut very short.' },
            { ko: '저는 미용사에게 “너무 짧아요.”라고 말했습니다.', en: 'I told the hairdresser, “It’s too short.”' },
            { ko: '저는 졸업식이 끝난 후에 미용실에 갔습니다.', en: 'I went to the hair salon after my graduation.' },
          ],
          answer: 0,
          why: 'The writer wanted a little off, but it was cut 너무 짧게: more than expected. They said nothing (아무 말도 하지 못했습니다), and the graduation is still to come (다음 주에).',
        },
      ],
    },
    // A habit · Q1 the blank (a verb with -(으)려고) · Q2 what matches
    {
      id: 'r-set-lunchbox',
      type: 'set',
      text: [
        { ko: '저는 작년부터 회사에 도시락을 가지고 다닙니다.', en: 'Since last year I’ve been taking a packed lunch to work.' },
        { ko: '회사 근처 식당은 맛있지만 음식값이 비쌉니다.', en: 'The restaurants near the office are good, but the food is expensive.' },
        { ko: '그래서 돈을 ( ㉠ ) 도시락을 싸기 시작했습니다.', en: 'So I started packing a lunch to ( ㉠ ) money.' },
        { ko: '보통 전날 밤에 반찬을 만들고 아침에는 밥만 담습니다.', en: 'I usually make the side dishes the night before, and in the morning I just add the rice.' },
        { ko: '요즘은 회사 동료 두 명도 도시락을 가지고 와서 점심시간에 같이 먹습니다.', en: 'These days two colleagues bring a packed lunch too, and we eat together at lunchtime.' },
        { ko: '서로 반찬을 나누어 먹을 수 있어서 더 좋습니다.', en: 'It’s even better, because we can share our side dishes.' },
      ],
      questions: [
        {
          q: { ko: '㉠에 들어갈 알맞은 것을 고르십시오.', en: 'Choose what fits ㉠.' },
          options: [
            { ko: '쓰려고', en: 'to spend' },
            { ko: '빌리려고', en: 'to borrow' },
            { ko: '아끼려고', en: 'to save' },
            { ko: '받으려고', en: 'to receive' },
          ],
          answer: 2,
          why: 'Eating out near the office is expensive (음식값이 비쌉니다), so the packed lunch is to save money: 돈을 아끼려고. Packing a lunch doesn’t spend, borrow or bring in money.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '회사 근처 식당은 음식값이 쌉니다.', en: 'Food at the restaurants near the office is cheap.' },
            { ko: '저는 아침에 반찬을 만듭니다.', en: 'I make the side dishes in the morning.' },
            { ko: '저는 점심을 동료들과 같이 먹습니다.', en: 'I have lunch with my colleagues.' },
            { ko: '저는 올해부터 도시락을 가지고 다닙니다.', en: 'I’ve been taking a packed lunch since this year.' },
          ],
          answer: 2,
          why: '동료 두 명도 … 점심시간에 같이 먹습니다: the writer eats with colleagues. The restaurants are expensive, the side dishes are made the night before (전날 밤에), and it started last year (작년부터).',
        },
      ],
    },
    // A custom · Q1 the blank (an adverb) · Q2 what you can learn
    {
      id: 'r-set-table-manners',
      type: 'set',
      text: [
        { ko: '한국에는 어른과 같이 밥을 먹을 때 지키는 예절이 있습니다.', en: 'In Korea there are manners to follow when you eat with older people.' },
        { ko: '어른이 숟가락을 드신 후에 다른 사람들이 먹기 시작합니다.', en: 'The others start eating after the eldest has picked up their spoon.' },
        { ko: '그리고 밥을 다 먹어도 어른보다 ( ㉠ ) 자리에서 일어나지 않습니다.', en: 'And even when you’ve finished, you don’t get up from the table ( ㉠ ) the elders.' },
        { ko: '어른께 물을 드릴 때는 두 손으로 드립니다.', en: 'When you give an older person water, you hand it over with both hands.' },
        { ko: '한국 아이들은 이런 예절을 어렸을 때부터 집에서 배웁니다.', en: 'Korean children learn these manners at home from an early age.' },
      ],
      questions: [
        {
          q: { ko: '㉠에 들어갈 알맞은 것을 고르십시오.', en: 'Choose what fits ㉠.' },
          options: [
            { ko: '늦게', en: 'later (than)' },
            { ko: '천천히', en: 'more slowly (than)' },
            { ko: '조용히', en: 'more quietly (than)' },
            { ko: '먼저', en: 'before' },
          ],
          answer: 3,
          why: 'The elders go first: the others start eating after them (어른이 숟가락을 드신 후에). So even when you’ve finished (다 먹어도), you don’t leave the table before them: 어른보다 먼저. 늦게 and 천천히 (later, more slowly) would turn the rule upside down, and 조용히 (quietly) has nothing to do with when you leave.',
        },
        {
          q: { ko: '이 글에서 알 수 있는 것을 고르십시오.', en: 'Choose what you can learn from the text.' },
          options: [
            { ko: '밥을 다 먹으면 바로 일어나도 됩니다.', en: 'You can get up as soon as you’ve finished eating.' },
            { ko: '어른이 숟가락을 드시기 전에 먹으면 안 됩니다.', en: 'You mustn’t start eating before the eldest picks up their spoon.' },
            { ko: '어른께 물을 드릴 때는 한 손으로 드립니다.', en: 'You hand an older person water with one hand.' },
            { ko: '이런 예절은 학교에서만 배웁니다.', en: 'These manners are learned only at school.' },
          ],
          answer: 1,
          why: 'The others start only after the eldest has picked up their spoon (어른이 숟가락을 드신 후에), so starting before that is rude. You don’t leave before the elders, water is handed with both hands (두 손으로), and children learn the manners at home (집에서).',
        },
      ],
    },
    // A place · Q1 the blank (a noun) · Q2 what matches
    {
      id: 'r-set-jjimjilbang',
      type: 'set',
      text: [
        { ko: '찜질방은 한국 사람들이 쉬러 많이 가는 곳입니다.', en: 'A jjimjilbang is a place where lots of Koreans go to relax.' },
        { ko: '찜질방에 들어가면 ( ㉠ )과 수건을 줍니다.', en: 'When you go in, they give you ( ㉠ ) and a towel.' },
        { ko: '그래서 찜질방 안에서는 모두 같은 옷을 입고 있습니다.', en: 'So inside, everyone is wearing the same clothes.' },
        { ko: '찜질방에는 아주 뜨거운 방도 있고 시원한 방도 있습니다.', en: 'There are very hot rooms, and there are cool rooms too.' },
        { ko: '사람들은 바닥에 누워서 쉬거나 친구와 이야기를 합니다.', en: 'People lie on the floor and rest, or chat with friends.' },
        { ko: '배가 고프면 찜질방 안에 있는 식당에서 달걀이나 라면을 사 먹을 수 있습니다.', en: 'If you get hungry, you can buy eggs or ramyeon at the restaurant inside.' },
        { ko: '그리고 밤에도 문을 열어서 잠을 자러 오는 사람도 있습니다.', en: 'And it’s open at night too, so some people come to sleep there.' },
      ],
      questions: [
        {
          q: { ko: '㉠에 들어갈 알맞은 것을 고르십시오.', en: 'Choose what fits ㉠.' },
          options: [
            { ko: '신발', en: 'shoes' },
            { ko: '옷', en: 'clothes' },
            { ko: '우산', en: 'an umbrella' },
            { ko: '가방', en: 'a bag' },
          ],
          answer: 1,
          why: 'The next sentence says 그래서 … 모두 같은 옷을 입고 있습니다: everyone wears the same clothes because they’re handed out with the towel. Shoes, umbrellas or bags don’t explain that.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '찜질방에는 뜨거운 방만 있습니다.', en: 'A jjimjilbang has only hot rooms.' },
            { ko: '찜질방은 밤에는 문을 닫습니다.', en: 'A jjimjilbang closes at night.' },
            { ko: '찜질방에서는 자기 옷을 입습니다.', en: 'In a jjimjilbang you wear your own clothes.' },
            { ko: '찜질방 안에서 음식을 사 먹을 수 있습니다.', en: 'You can buy something to eat inside a jjimjilbang.' },
          ],
          answer: 3,
          why: 'There’s a restaurant inside where you can buy eggs or ramyeon (식당에서 … 사 먹을 수 있습니다). There are cool rooms too, it’s open at night, and everyone wears the same clothes they’re given.',
        },
      ],
    },
    // A diary · Q1 where the sentence goes · Q2 what matches
    {
      id: 'r-set-baseball',
      type: 'set',
      text: [
        { ko: '지난 토요일에 한국어 학원 친구들과 처음으로 야구장에 갔습니다. (㉠)', en: 'Last Saturday I went to a baseball stadium for the first time, with friends from my Korean school. (㉠)' },
        { ko: '야구장에는 사람이 정말 많았습니다. (㉡)', en: 'The stadium was really crowded. (㉡)' },
        { ko: '사람들은 모두 같이 노래를 부르면서 선수들을 응원했습니다. (㉢)', en: 'Everyone sang songs together to cheer the players on. (㉢)' },
        { ko: '경기가 끝난 후에 우리는 야구장 앞에서 치킨을 먹었습니다. (㉣)', en: 'After the game we had fried chicken outside the stadium. (㉣)' },
        { ko: '다음에도 친구들과 같이 꼭 다시 가고 싶습니다.', en: 'I’d love to go again with my friends.' },
      ],
      questions: [
        {
          q: { ko: '다음 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.', en: 'Where does this sentence fit best?' },
          quote: { ko: '저는 노래를 잘 몰랐지만 큰 소리로 따라 불렀습니다.', en: 'I didn’t really know the songs, but I sang along at the top of my voice.' },
          options: ['㉠', '㉡', '㉢', '㉣'],
          answer: 2,
          why: 'The sentence is about the songs, so it follows the one where everyone sings to cheer the players on (노래를 부르면서): ㉢. No songs have been mentioned before that, and after it the game is over.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '저는 야구장에 자주 갑니다.', en: 'I often go to baseball games.' },
            { ko: '저는 친구들과 같이 야구 경기를 봤습니다.', en: 'I watched a baseball game with my friends.' },
            { ko: '야구장에는 사람이 별로 없었습니다.', en: 'There weren’t many people at the stadium.' },
            { ko: '우리는 경기가 시작하기 전에 치킨을 먹었습니다.', en: 'We had chicken before the game started.' },
          ],
          answer: 1,
          why: 'The writer went to the stadium with friends from their Korean school and stayed until the game was over (경기가 끝난 후에): they watched it together. It was their first time (처음으로), it was crowded, and the chicken came after the game.',
        },
      ],
    },
    // A place · Q1 where the sentence goes · Q2 what you can learn
    {
      id: 'r-set-gyeongbokgung',
      type: 'set',
      text: [
        { ko: '경복궁은 서울에 있는 아주 오래된 궁궐입니다. (㉠)', en: 'Gyeongbokgung is a very old palace in Seoul. (㉠)' },
        { ko: '경복궁에 가면 한복을 입은 사람들을 많이 볼 수 있습니다. (㉡)', en: 'At Gyeongbokgung you see lots of people wearing hanbok. (㉡)' },
        { ko: '경복궁 안에는 옛날 한국 사람들의 생활을 볼 수 있는 박물관도 있습니다. (㉢)', en: 'Inside the palace there’s also a museum that shows how Koreans lived long ago. (㉢)' },
        { ko: '경복궁은 화요일마다 문을 닫습니다. (㉣)', en: 'Gyeongbokgung is closed every Tuesday. (㉣)' },
        { ko: '그러니까 다른 요일에 가는 것이 좋습니다.', en: 'So it’s best to go on another day.' },
      ],
      questions: [
        {
          q: { ko: '다음 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.', en: 'Where does this sentence fit best?' },
          quote: { ko: '한복을 입고 가면 표를 사지 않고 들어갈 수 있기 때문입니다.', en: 'That’s because if you go in hanbok, you can get in without buying a ticket.' },
          options: ['㉠', '㉡', '㉢', '㉣'],
          answer: 1,
          why: '-기 때문입니다 gives a reason, and this one explains why you see so many people in hanbok there (한복을 입은 사람들을 많이 볼 수 있습니다): ㉡. It explains nothing about the palace’s age, the museum or Tuesdays.',
        },
        {
          q: { ko: '이 글에서 알 수 있는 것을 고르십시오.', en: 'Choose what you can learn from the text.' },
          options: [
            { ko: '경복궁은 매일 문을 엽니다.', en: 'Gyeongbokgung is open every day.' },
            { ko: '경복궁은 요즘 새로 지은 궁궐입니다.', en: 'Gyeongbokgung is a newly built palace.' },
            { ko: '경복궁 안에 박물관이 있습니다.', en: 'There’s a museum inside Gyeongbokgung.' },
            { ko: '경복궁에서는 한복을 입으면 안 됩니다.', en: 'You mustn’t wear hanbok at Gyeongbokgung.' },
          ],
          answer: 2,
          why: '경복궁 안에는 … 박물관도 있습니다: there’s a museum inside. The palace closes on Tuesdays (화요일마다), it’s very old (아주 오래된), and lots of visitors wear hanbok there.',
        },
      ],
    },
    // An email · Q1 why it was written · Q2 what matches
    {
      id: 'r-set-book-club',
      type: 'set',
      text: [
        { ko: '독서 모임 회원 여러분, 안녕하세요.', en: 'Hello, members of the book club.' },
        { ko: '이번 주 토요일 모임은 원래 학교 도서관에서 하려고 했습니다.', en: 'We were planning to hold this Saturday’s meeting in the school library.' },
        { ko: '그런데 그날은 도서관이 문을 열지 않습니다.', en: 'But the library is closed that day.' },
        { ko: '그래서 모임 장소를 도서관 옆에 있는 카페로 바꿨습니다.', en: 'So we’ve moved the meeting to the café next to the library.' },
        { ko: '모임 시간은 바뀌지 않았습니다.', en: 'The time hasn’t changed.' },
        { ko: '오후 2시에 카페 2층에서 만납시다.', en: 'Let’s meet on the second floor of the café at 2 p.m.' },
        { ko: '책을 다 읽지 못한 분도 꼭 오십시오.', en: 'Even if you haven’t finished the book, please do come.' },
      ],
      questions: [
        {
          q: { ko: '왜 윗글을 썼는지 맞는 것을 고르십시오.', en: 'Why was this written?' },
          options: [
            { ko: '모임 시간을 바꾸려고', en: 'to change the time of the meeting' },
            { ko: '도서관에서 책을 빌리려고', en: 'to borrow a book from the library' },
            { ko: '새 회원을 소개하려고', en: 'to introduce a new member' },
            { ko: '장소가 바뀐 것을 알리려고', en: 'to let members know the place has changed' },
          ],
          answer: 3,
          why: 'The email tells the club that the meeting has moved: 모임 장소를 … 카페로 바꿨습니다. The time stays the same (바뀌지 않았습니다), and the library is mentioned only because it’s closed.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '이번 모임은 도서관에서 합니다.', en: 'This meeting is in the library.' },
            { ko: '모임은 오후 2시에 시작합니다.', en: 'The meeting starts at 2 p.m.' },
            { ko: '책을 다 읽은 사람만 모임에 갈 수 있습니다.', en: 'Only people who have finished the book can come.' },
            { ko: '이번 주 토요일에 도서관은 문을 엽니다.', en: 'The library is open this Saturday.' },
          ],
          answer: 1,
          why: '오후 2시에 카페 2층에서 만납시다: the meeting starts at 2. It has moved to the café because the library is closed that day (문을 열지 않습니다), and members who haven’t finished the book should come too.',
        },
      ],
    },
    // A notice · Q1 why it was written · Q2 what matches
    {
      id: 'r-set-water-notice',
      type: 'set',
      text: [
        { ko: '해바라기 아파트 관리사무소에서 알려 드립니다.', en: 'A notice from the Haebaragi Apartments management office.' },
        { ko: '다음 주 수요일에 수도 공사가 있습니다.', en: 'There will be work on the water pipes next Wednesday.' },
        { ko: '공사 시간은 오전 10시부터 오후 3시까지입니다.', en: 'The work will run from 10 a.m. to 3 p.m.' },
        { ko: '이 시간에는 물이 나오지 않으니까 필요한 물을 미리 준비해 주십시오.', en: 'There will be no water during that time, so please keep the water you need ready beforehand.' },
        { ko: '공사가 끝난 후에 처음 나오는 물은 마시지 마십시오.', en: 'Please don’t drink the first water that comes out after the work.' },
        { ko: '불편을 드려서 죄송합니다.', en: 'We’re sorry for the inconvenience.' },
      ],
      questions: [
        {
          q: { ko: '왜 윗글을 썼는지 맞는 것을 고르십시오.', en: 'Why was this written?' },
          options: [
            { ko: '물이 안 나오는 시간을 알리려고', en: 'to tell residents when there will be no water' },
            { ko: '수도 요금을 알려 주려고', en: 'to tell residents the water bill' },
            { ko: '공사할 사람을 찾으려고', en: 'to find people to do the work' },
            { ko: '아파트 청소 날짜를 바꾸려고', en: 'to change the building’s cleaning day' },
          ],
          answer: 0,
          why: 'The office announces the water works and when the water will be off (오전 10시부터 오후 3시까지 … 물이 나오지 않으니까). Nothing is said about bills, hiring workers or cleaning.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '공사는 다음 주 화요일에 합니다.', en: 'The work is next Tuesday.' },
            { ko: '공사하는 동안에도 물을 쓸 수 있습니다.', en: 'You can use water during the work too.' },
            { ko: '공사는 오후에 끝납니다.', en: 'The work finishes in the afternoon.' },
            { ko: '공사가 끝나면 물을 바로 마셔도 됩니다.', en: 'You can drink the water as soon as the work is over.' },
          ],
          answer: 2,
          why: '오전 10시부터 오후 3시까지: the work finishes at 3 p.m., in the afternoon. It’s on Wednesday (수요일), there’s no water while it lasts, and you shouldn’t drink the first water afterwards (마시지 마십시오).',
        },
      ],
    },
    // A habit (how things are done) · Q1 what it is about · Q2 what matches
    {
      id: 'r-set-rubbish',
      type: 'set',
      text: [
        { ko: '한국에서는 쓰레기를 버릴 때 종이, 플라스틱, 병을 따로 나누어서 버립니다.', en: 'In Korea, when you throw rubbish away, you sort paper, plastic and bottles separately.' },
        { ko: '음식물 쓰레기도 다른 쓰레기와 따로 버려야 합니다.', en: 'Food waste also has to go out separately from other rubbish.' },
        { ko: '그리고 일반 쓰레기는 편의점이나 마트에서 파는 쓰레기봉투에 넣어서 버립니다.', en: 'And general rubbish goes out in rubbish bags that are sold at convenience stores and supermarkets.' },
        { ko: '우리 아파트에서는 일요일과 목요일 저녁에만 쓰레기를 버릴 수 있습니다.', en: 'In my apartment building you can put rubbish out only on Sunday and Thursday evenings.' },
        { ko: '처음에는 조금 복잡했지만 지금은 어렵지 않습니다.', en: 'It was a bit confusing at first, but now it isn’t hard.' },
      ],
      questions: [
        {
          q: { ko: '무엇에 대한 이야기인지 맞는 것을 고르십시오.', en: 'What is the text about?' },
          options: [
            { ko: '쓰레기봉투를 만드는 방법', en: 'how rubbish bags are made' },
            { ko: '음식을 남기지 않는 방법', en: 'how not to leave food uneaten' },
            { ko: '쓰레기를 버리는 방법', en: 'how to throw rubbish away' },
            { ko: '아파트를 청소하는 방법', en: 'how to clean an apartment' },
          ],
          answer: 2,
          why: 'Every sentence is about putting rubbish out: sorting it (따로 나누어서), the special bags (쓰레기봉투) and the days for it. The bags are bought, not made, and leftovers and cleaning aren’t mentioned.',
        },
        {
          q: { ko: '이 글의 내용과 같은 것을 고르십시오.', en: 'Choose what matches the text.' },
          options: [
            { ko: '쓰레기봉투는 아파트에서 무료로 줍니다.', en: 'The apartment building gives out rubbish bags for free.' },
            { ko: '음식물 쓰레기는 다른 쓰레기와 같이 버리면 안 됩니다.', en: 'Food waste mustn’t go out with other rubbish.' },
            { ko: '우리 아파트에서는 매일 쓰레기를 버릴 수 있습니다.', en: 'In my building you can put rubbish out every day.' },
            { ko: '종이와 플라스틱은 같이 버려도 됩니다.', en: 'Paper and plastic can go out together.' },
          ],
          answer: 1,
          why: '음식물 쓰레기도 … 따로 버려야 합니다: food waste goes out separately, not with other rubbish. The bags are sold in shops (파는 쓰레기봉투), rubbish goes out only on Sunday and Thursday evenings, and paper and plastic are sorted apart.',
        },
      ],
    },
    // A custom · Q1 what it is about · Q2 what you can learn
    {
      id: 'r-set-seaweed-soup',
      type: 'set',
      text: [
        { ko: '한국 사람들은 생일날 아침에 미역국을 먹습니다.', en: 'Koreans eat seaweed soup on the morning of their birthday.' },
        { ko: '미역국은 아기를 낳은 엄마들이 많이 먹는 음식입니다.', en: 'Seaweed soup is what women eat a lot of after having a baby.' },
        { ko: '미역국을 먹으면 엄마의 몸이 빨리 건강해지기 때문입니다.', en: 'That’s because it helps the mother get her strength back quickly.' },
        { ko: '그래서 생일에 미역국을 먹으면서 어머니께 감사하는 마음을 가집니다.', en: 'So eating seaweed soup on your birthday is a way of feeling grateful to your mother.' },
        { ko: '생일인 친구에게 “미역국 먹었어요?”라고 묻는 사람도 많습니다.', en: 'Many people even ask a friend on their birthday, “Have you had your seaweed soup?”' },
      ],
      questions: [
        {
          q: { ko: '무엇에 대한 이야기인지 맞는 것을 고르십시오.', en: 'What is the text about?' },
          options: [
            { ko: '생일에 미역국을 먹는 이유', en: 'why people eat seaweed soup on their birthday' },
            { ko: '미역국을 맛있게 끓이는 방법', en: 'how to make tasty seaweed soup' },
            { ko: '아기를 건강하게 키우는 방법', en: 'how to bring up a healthy baby' },
            { ko: '생일 선물을 고르는 방법', en: 'how to choose a birthday present' },
          ],
          answer: 0,
          why: 'The text explains why Koreans eat 미역국 on their birthday: new mothers eat it, so it reminds you to be grateful to your mother (어머니께 감사하는 마음). There’s no recipe, and the baby isn’t the point.',
        },
        {
          q: { ko: '이 글에서 알 수 있는 것을 고르십시오.', en: 'Choose what you can learn from the text.' },
          options: [
            { ko: '한국 사람들은 생일날 저녁에 미역국을 먹습니다.', en: 'Koreans eat seaweed soup on the evening of their birthday.' },
            { ko: '미역국은 생일에만 먹는 음식입니다.', en: 'Seaweed soup is eaten only on birthdays.' },
            { ko: '미역국은 아기를 낳은 엄마의 몸에 좋습니다.', en: 'Seaweed soup is good for a woman who has just had a baby.' },
            { ko: '미역국은 아기들이 많이 먹는 음식입니다.', en: 'Seaweed soup is something babies eat a lot.' },
          ],
          answer: 2,
          why: '미역국을 먹으면 엄마의 몸이 빨리 건강해지기 때문입니다: it’s good for a new mother. It’s eaten in the morning (아침에), new mothers eat it too, not only people on their birthday, and it’s the mothers, not the babies, who eat it.',
        },
      ],
    },
  ],
});
