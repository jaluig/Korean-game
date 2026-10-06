/**
 * Choose your reply (js/games/replies.js): conversations in which the learner
 * plays one part. They speak; then you pick (or say) your reply from three.
 * After a wrong one they react, as a real person would, and `why` explains it.
 *
 * Fields: id, topic (a topic id), level (1–3), scene (an emoji), title { ko, en },
 *         role { ko, en } (who you are), goal { ko, en } (what you want from the
 *         conversation: it makes one reply the right one),
 *         them { name, en, emoji, voice: 'high' | 'low' } (who you talk to; your lines
 *         are read in the other voice),
 *         words (2–4 key vocabulary refs 'topic:id': it opens once they're learned),
 *         steps: they speak first and last, with 3–5 turns of yours in between:
 *           { them: { ko, en } }  their line (numbers in Hangul: it's read aloud)
 *           { you: [ { ko, en, right: true, note? }, { ko, en, react: { ko, en }, why }, … ] }
 *             three options, exactly one right; a wrong one has their reaction and why.
 */
Mallang.content.registerReplies([
  // ---------- Level 1 ----------
  {
    id: 'cafe-coffee-cookie',
    topic: 'cafe',
    level: 1,
    scene: '🍪',
    title: { ko: '커피하고 쿠키', en: 'A coffee and a cookie' },
    role: { ko: '손님', en: 'Customer' },
    goal: { ko: '커피하고 쿠키만 사요.', en: 'Buy a coffee and a cookie, and nothing else.' },
    them: { name: '직원', en: 'Café staff', emoji: '👨‍🍳', voice: 'low' },
    words: ['cafe:coffee', 'cafe:cookie', 'cafe:please', 'cafe:okay'],
    steps: [
      { them: { ko: '어서 오세요. 뭐 드릴까요?', en: 'Welcome! What can I get you?' } },
      {
        you: [
          { ko: '커피하고 쿠키 주세요.', en: 'A coffee and a cookie, please.', right: true },
          {
            ko: '커피하고 쿠키 원해요.',
            en: 'I want a coffee and a cookie.',
            react: { ko: '아… 네. 커피하고 쿠키요?', en: 'Oh… OK. A coffee and a cookie?' },
            why: '원해요 (“I want, I wish for”) is grammatical, but nobody orders with it: it sounds like a translation. Name what you want and add 주세요.',
          },
          {
            ko: '커피하고 쿠키 좋아해요.',
            en: 'I like coffee and cookies.',
            react: { ko: '아, 그래요? 저도요! 그럼 뭐 드릴까요?', en: 'Oh, really? Me too! So what can I get you?' },
            why: '좋아해요 says what you like in general; it doesn’t order anything. To ask for something, say … 주세요.',
          },
        ],
      },
      { them: { ko: '케이크도 같이 드릴까요?', en: 'Would you like some cake as well?' } },
      {
        you: [
          { ko: '아니요, 괜찮아요.', en: 'No, thanks.', right: true, note: '괜찮아요 (“it’s fine”) is the polite way to say no to an offer.' },
          {
            ko: '아니요, 없어요.',
            en: 'No, there isn’t any.',
            react: { ko: '네? 케이크 있어요. 여기요!', en: 'Sorry? We do have cake: look, here!' },
            why: '없어요 says there isn’t any (or you don’t have any). To turn down an offer politely, say 아니요, 괜찮아요 (“no, thanks”).',
          },
          {
            ko: '네, 주세요.',
            en: 'Yes, please.',
            react: { ko: '네, 케이크도 하나 드릴게요.', en: 'Sure, a slice of cake as well.' },
            why: 'Fine Korean, but you only wanted a coffee and a cookie. To say no politely: 아니요, 괜찮아요.',
          },
        ],
      },
      { them: { ko: '네, 오천 원입니다.', en: 'OK, that’s 5,000 won.' } },
      {
        you: [
          { ko: '여기 있어요.', en: 'Here you are.', right: true },
          {
            ko: '저기 있어요.',
            en: 'It’s over there.',
            react: { ko: '네? 어디요?', en: 'Sorry? Where?' },
            why: '저기 means “over there”. When you hand something over, say 여기 있어요 (“here you are”).',
          },
          {
            ko: '오천 원 주세요.',
            en: 'Give me 5,000 won, please.',
            react: { ko: '네? 제가 오천 원을 드려요?', en: 'Sorry? *I* give *you* 5,000 won?' },
            why: '주세요 asks him to give the money to *you*. When you hand it over, say 여기 있어요 (“here you are”).',
          },
        ],
      },
      { them: { ko: '감사합니다. 맛있게 드세요!', en: 'Thank you. Enjoy!' } },
    ],
  },
  {
    id: 'shopping-bag-price',
    topic: 'shopping',
    level: 1,
    scene: '👜',
    title: { ko: '가방이 얼마예요?', en: 'How much is the bag?' },
    role: { ko: '손님', en: 'Customer' },
    goal: { ko: '가방을 찾아요. 그런데 돈이 많이 없어요.', en: 'You’re looking for a bag, but you don’t have much money.' },
    them: { name: '직원', en: 'Shop assistant', emoji: '👩', voice: 'high' },
    words: ['shopping:bag', 'shopping:pretty', 'shopping:expensive', 'shopping:cheap'],
    steps: [
      { them: { ko: '어서 오세요. 뭐 찾으세요?', en: 'Welcome! What are you looking for?' } },
      {
        you: [
          { ko: '가방 찾아요.', en: 'I’m looking for a bag.', right: true },
          {
            ko: '가방 찾으세요.',
            en: 'You’re looking for a bag.',
            react: { ko: '네? 제가요? 손님이 찾으시죠?', en: 'Sorry? Me? You’re the one looking, right?' },
            why: '찾으세요 is polite for what *someone else* does: that’s why she says it to you. About yourself, it’s 찾아요: 가방 찾아요.',
          },
          {
            ko: '네, 찾아요.',
            en: 'Yes, I’m looking.',
            react: { ko: '네… 뭐 찾으세요?', en: 'Right… and what are you looking for?' },
            why: 'That doesn’t say *what* you’re looking for. Name the thing: 가방 찾아요.',
          },
        ],
      },
      { them: { ko: '이 가방 어때요? 예뻐요.', en: 'How about this bag? It’s pretty.' } },
      {
        you: [
          { ko: '예뻐요! 얼마예요?', en: 'It’s pretty! How much is it?', right: true },
          {
            ko: '예뻐요! 어디예요?',
            en: 'It’s pretty! Where is it?',
            react: { ko: '네? 여기요. 제 손에 있어요.', en: 'Sorry? Here: it’s in my hand.' },
            why: '어디 asks *where*. For the price, ask with 얼마: 얼마예요? (“how much is it?”)',
          },
          {
            ko: '예뻐요! 뭐예요?',
            en: 'It’s pretty! What is it?',
            react: { ko: '음… 가방이에요.', en: 'Um… it’s a bag.' },
            why: '뭐예요? asks “what is it?”. To ask the price, it’s 얼마예요? (“how much is it?”)',
          },
        ],
      },
      { them: { ko: '오만 원이에요.', en: 'It’s 50,000 won.' } },
      {
        you: [
          { ko: '아, 좀 비싸요.', en: 'Oh, it’s a bit expensive.', right: true },
          {
            ko: '아, 좀 싸요.',
            en: 'Oh, it’s rather cheap.',
            react: { ko: '그렇죠? 이걸로 드릴까요?', en: 'Isn’t it? Shall I get you this one, then?' },
            why: '싸요 means “it’s cheap”, so she thinks you’ll buy it! For “expensive”, it’s 비싸요.',
          },
          {
            ko: '아, 좀 커요.',
            en: 'Oh, it’s a bit big.',
            react: { ko: '그럼 작은 가방도 있어요. 보세요!', en: 'We have smaller bags too. Have a look!' },
            why: '커요 means “it’s big”, so she shows you smaller bags. You mean the price: 비싸요 (“it’s expensive”).',
          },
        ],
      },
      { them: { ko: '네, 그럼 천천히 보세요.', en: 'Sure, take your time and have a look around.' } },
    ],
  },
  {
    id: 'health-pharmacy-headache',
    topic: 'health',
    level: 1,
    scene: '💊',
    title: { ko: '약국에서', en: 'At the pharmacy' },
    role: { ko: '손님', en: 'Customer' },
    goal: { ko: '머리가 아파요. 열은 없어요. 약을 사요.', en: 'You have a headache, but no fever. Buy some medicine.' },
    them: { name: '약사', en: 'Pharmacist', emoji: '👨‍⚕️', voice: 'low' },
    words: ['health:medicine', 'health:head', 'feelings:hurts', 'health:fever'],
    steps: [
      { them: { ko: '어서 오세요. 어디가 아프세요?', en: 'Hello. What’s the trouble? (Where does it hurt?)' } },
      {
        you: [
          { ko: '머리가 아파요.', en: 'I have a headache.', right: true },
          {
            ko: '머리가 아프세요.',
            en: 'You have a headache.',
            react: { ko: '네? 제가요? 저는 괜찮아요.', en: 'Sorry? Me? I’m fine.' },
            why: '아프세요 is the polite form for *someone else*: the pharmacist uses it about you. About yourself, say 아파요: 머리가 아파요.',
          },
          {
            ko: '머리가 나빠요.',
            en: 'I’m not very bright.',
            react: { ko: '네? 하하, 머리가 아프세요?', en: 'Sorry? Ha ha, you mean you have a headache?' },
            why: '머리가 나빠요 means “I’m not clever”! For a headache, say 머리가 아파요.',
          },
        ],
      },
      { them: { ko: '열도 나세요?', en: 'Do you have a fever too?' } },
      {
        you: [
          { ko: '아니요, 열은 안 나요.', en: 'No, I don’t have a fever.', right: true },
          {
            ko: '네, 열이 나요.',
            en: 'Yes, I have a fever.',
            react: { ko: '열도요? 그럼 병원에 가 보세요.', en: 'A fever too? Then you should see a doctor.' },
            why: 'Fine Korean, but you don’t have a fever: 아니요, 열은 안 나요.',
          },
          {
            ko: '아니요, 열이 나요.',
            en: 'No, I have a fever.',
            react: { ko: '네? 열이 나요, 안 나요?', en: 'Sorry? Do you have a fever or not?' },
            why: 'That says “no”, then “I have a fever”. To say you don’t, put 안 before the verb: 아니요, 열은 안 나요.',
          },
        ],
      },
      { them: { ko: '이 약 드세요. 삼천 원이에요.', en: 'Take this medicine. That’s 3,000 won.' } },
      {
        you: [
          { ko: '네, 감사합니다.', en: 'OK, thank you.', right: true },
          {
            ko: '아니요, 괜찮아요.',
            en: 'No, thanks.',
            react: { ko: '네? 약 안 사세요?', en: 'Sorry? You don’t want the medicine?' },
            why: '아니요, 괜찮아요 politely turns the medicine down, but you came to buy it! Say 네, 감사합니다.',
          },
          {
            ko: '네, 미안해요.',
            en: 'OK, I’m sorry.',
            react: { ko: '네? 왜요? 괜찮아요.', en: 'Sorry? What for? It’s fine.' },
            why: '미안해요 means “I’m sorry”. To thank him, say 감사합니다.',
          },
        ],
      },
      { them: { ko: '네, 빨리 나으세요!', en: 'You’re welcome. Get well soon!' } },
    ],
  },

  // ---------- Level 2 ----------
  {
    id: 'cafe-bingsu-share',
    topic: 'cafe',
    level: 2,
    scene: '🍧',
    title: { ko: '빙수 같이 먹기', en: 'Sharing a bingsu' },
    role: { ko: '손님', en: 'Customer' },
    goal: { ko: '친구하고 딸기 빙수 하나를 같이 먹어요. 물도 마시고 싶어요.', en: 'Order one strawberry bingsu to share with your friend, and ask for some water too.' },
    them: { name: '직원', en: 'Café staff', emoji: '👩‍🍳', voice: 'high' },
    words: ['cafe:bingsu', 'cafe:strawberry', 'cafe:spoon', 'cafe:water'],
    steps: [
      { them: { ko: '주문하시겠어요?', en: 'Are you ready to order?' } },
      {
        you: [
          { ko: '딸기 빙수 하나 주세요.', en: 'One strawberry bingsu, please.', right: true },
          {
            ko: '딸기 빙수 한 잔 주세요.',
            en: 'A cup of strawberry bingsu, please.',
            react: { ko: '아, 딸기 빙수 하나요?', en: 'Ah, one strawberry bingsu?' },
            why: '잔 counts cups and glasses of drinks. A bingsu comes in a bowl: 빙수 하나 (or 한 개).',
          },
          {
            ko: '딸기 빙수 두 개 주세요.',
            en: 'Two strawberry bingsu, please.',
            react: { ko: '두 개요? 빙수가 좀 커요. 괜찮으세요?', en: 'Two? They’re quite big. Are you sure?' },
            why: 'Fine Korean, but you’re sharing one with your friend: 딸기 빙수 하나 주세요.',
          },
        ],
      },
      { them: { ko: '숟가락은 몇 개 드릴까요?', en: 'How many spoons would you like?' } },
      {
        you: [
          { ko: '두 개 주세요.', en: 'Two, please.', right: true },
          {
            ko: '이 개 주세요.',
            en: 'This dog, please.',
            react: { ko: '네? 이 개요? 아, 두 개요?', en: 'Sorry? “This dog”? Oh, you mean two?' },
            why: '개 counts with native numbers: 두 개. With Sino-Korean 이, 이 개 sounds like “this dog”!',
          },
          {
            ko: '두 개 드릴게요.',
            en: 'I’ll give you two.',
            react: { ko: '하하, 제가 드릴게요. 두 개요?', en: 'Ha ha, I’m the one giving. Two?' },
            why: '드릴게요 means “I’ll give (them to you)”. Answer her 드릴까요? (“shall I give you…?”) with 주세요: 두 개 주세요.',
          },
        ],
      },
      { them: { ko: '네, 앉아 계세요. 갖다 드릴게요.', en: 'Sure, take a seat. I’ll bring it over.' } },
      {
        you: [
          { ko: '물도 좀 주세요.', en: 'Some water too, please.', right: true, note: '도 means “too, as well”; 좀 makes a request softer.' },
          {
            ko: '물 좀 더 주세요.',
            en: 'Some more water, please.',
            react: { ko: '네? 아직 안 드렸는데요?', en: 'Sorry? I haven’t given you any yet.' },
            why: '더 means “more”, but you haven’t had any water yet. For water as well, use 도: 물도 좀 주세요.',
          },
          {
            ko: '물도 좀 드세요.',
            en: 'Have some water too.',
            react: { ko: '하하, 저는 괜찮아요. 물 드릴까요?', en: 'Ha ha, I’m fine, thanks. Would you like some water?' },
            why: '드세요 invites *her* to drink. To ask for something, use 주세요: 물도 좀 주세요.',
          },
        ],
      },
      { them: { ko: '물은 저쪽에 있어요. 맛있게 드세요!', en: 'The water’s over there: help yourself. Enjoy!' } },
    ],
  },
  {
    id: 'directions-bank-bus',
    topic: 'directions',
    level: 2,
    scene: '🏦',
    title: { ko: '은행이 어디에 있어요?', en: 'Where’s the bank?' },
    role: { ko: '관광객', en: 'Tourist' },
    goal: { ko: '은행을 찾아요. 멀면 버스를 타요.', en: 'Find a bank. If it’s far, you’ll take the bus.' },
    them: { name: '행인', en: 'Passer-by', emoji: '👩‍🦰', voice: 'high' },
    words: ['directions:bank', 'directions:far', 'directions:bus', 'directions:where'],
    steps: [
      { them: { ko: '뭐 찾으세요? 도와 드릴까요?', en: 'Are you looking for something? Can I help?' } },
      {
        you: [
          { ko: '네, 은행이 어디에 있어요?', en: 'Yes, where’s the bank?', right: true },
          {
            ko: '네, 은행이 어디에서 있어요?',
            en: 'Yes, where is the bank at?',
            react: { ko: '아, 은행 찾으세요?', en: 'Ah, you’re looking for a bank?' },
            why: 'Where something *is* takes 에: 어디에 있어요? 에서 is for where you *do* something (어디에서 일해요?).',
          },
          {
            ko: '네, 은행 어디 있어?',
            en: 'Yeah, where’s the bank?',
            react: { ko: '어… 은행이요?', en: 'Er… the bank?' },
            why: '있어? without 요 is 반말, for close friends; to a stranger it sounds rude. Say 은행이 어디에 있어요?',
          },
        ],
      },
      { them: { ko: '은행이요? 여기서 좀 멀어요.', en: 'The bank? It’s quite far from here.' } },
      {
        you: [
          { ko: '그럼 버스로 가요?', en: 'Then do I go by bus?', right: true },
          {
            ko: '그럼 버스로 가 주세요.',
            en: 'Then please go by bus.',
            react: { ko: '네? 저요? 하하, 저는 안 가요.', en: 'Sorry? Me? Ha ha, I’m not going anywhere.' },
            why: '가 주세요 asks *her* to go, the way you’d talk to a taxi driver. To ask what you should do: 그럼 버스로 가요?',
          },
          {
            ko: '그럼 걸어서 갈게요.',
            en: 'Then I’ll walk.',
            react: { ko: '음… 걸어서 삼십 분 걸려요. 괜찮으세요?', en: 'Hmm… it’s thirty minutes on foot. Are you sure?' },
            why: 'Fine Korean, but it’s far, so you want the bus: 그럼 버스로 가요? (“then do I go by bus?”)',
          },
        ],
      },
      { them: { ko: '네, 저기서 십오 번 버스 타세요.', en: 'Yes, take the number 15 bus from over there.' } },
      {
        you: [
          { ko: '십오 번이요? 감사합니다!', en: 'Number 15? Thank you!', right: true },
          {
            ko: '오십 번이요? 감사합니다!',
            en: 'Number 50? Thank you!',
            react: { ko: '아니요, 십오 번이요. 일, 오!', en: 'No, fifteen: one, five!' },
            why: '십오 is 15 and 오십 is 50. She said 십오 번, “number 15”.',
          },
          {
            ko: '십오 번이요? 괜찮아요!',
            en: 'Number 15? It’s fine!',
            react: { ko: '네? 버스 안 타세요?', en: 'Sorry? Aren’t you taking the bus?' },
            why: '괜찮아요 isn’t “OK, got it”: here it sounds like “no, thanks”, as if you won’t take the bus after all. To thank her, say 감사합니다.',
          },
        ],
      },
      { them: { ko: '네, 조심히 가세요!', en: 'You’re welcome. Take care!' } },
    ],
  },
  {
    id: 'travel-taxi-ride',
    topic: 'travel',
    level: 2,
    scene: '🚕',
    title: { ko: '택시 타기', en: 'Taking a taxi' },
    role: { ko: '손님', en: 'Passenger' },
    goal: { ko: '명동역에 택시로 가요. 현금은 없고 카드만 있어요.', en: 'Take a taxi to Myeongdong Station. You have no cash, only a card.' },
    them: { name: '기사님', en: 'Taxi driver', emoji: '👨‍🦳', voice: 'low' },
    words: ['travel:takemeto', 'travel:driver', 'travel:stophere', 'shopping:card'],
    steps: [
      { them: { ko: '어서 오세요. 어디로 가세요?', en: 'Hello. Where to?' } },
      {
        you: [
          { ko: '명동역으로 가 주세요.', en: 'Myeongdong Station, please.', right: true },
          {
            ko: '명동역으로 와 주세요.',
            en: 'Please come to Myeongdong Station.',
            react: { ko: '네? 아, 명동역으로 가요?', en: 'Sorry? Oh, you mean *go* to Myeongdong Station?' },
            why: '와 주세요 asks him to *come* to where you are. For where you want to go, say 가 주세요.',
          },
          {
            ko: '명동역으로 갔어요.',
            en: 'I went to Myeongdong Station.',
            react: { ko: '아, 그래요? 그럼 지금은 어디로 가세요?', en: 'Oh, really? So where to now?' },
            why: '갔어요 is past: “I went”. To ask him to take you there now, say 명동역으로 가 주세요.',
          },
        ],
      },
      { them: { ko: '다 왔어요. 어디에 세워 드릴까요?', en: 'Here we are. Where shall I stop?' } },
      {
        you: [
          { ko: '편의점 앞에 세워 주세요.', en: 'Please stop in front of the convenience store.', right: true, note: '세워 주세요 (“please stop the car”) is what you say to a driver.' },
          {
            ko: '편의점 앞에서 그만해 주세요.',
            en: 'Please quit it in front of the convenience store.',
            react: { ko: '네? 뭘 그만해요? 아, 세워 드릴까요?', en: 'Sorry? Stop what? Oh, you want me to pull over?' },
            why: '그만해 주세요 means “stop doing that”, as if he were annoying you! To stop the car, say 세워 주세요.',
          },
          {
            ko: '편의점 안에 세워 주세요.',
            en: 'Please stop inside the convenience store.',
            react: { ko: '하하, 편의점 안에요? 앞에 세울게요.', en: 'Ha ha, *inside* the shop? I’ll stop in front of it.' },
            why: '안 means “inside”. For “in front of”, it’s 앞: 편의점 앞에 세워 주세요.',
          },
        ],
      },
      { them: { ko: '네, 만 이천 원입니다.', en: 'OK, that’s 12,000 won.' } },
      {
        you: [
          { ko: '카드 돼요?', en: 'Can I pay by card?', right: true, note: '카드 돼요? (“does a card work?”) is the everyday way to ask.' },
          {
            ko: '카드 있어요?',
            en: 'Do you have a card?',
            react: { ko: '네? 제 카드요? 하하.', en: 'Sorry? *My* card? Ha ha.' },
            why: '카드 있어요? asks whether *he* has a card. To ask if you can pay by card, say 카드 돼요?',
          },
          {
            ko: '현금 돼요?',
            en: 'Can I pay cash?',
            react: { ko: '현금이요? 네, 돼요.', en: 'Cash? Sure, that’s fine.' },
            why: 'Fine Korean, but you have no cash! Ask 카드 돼요? (“can I pay by card?”)',
          },
        ],
      },
      { them: { ko: '네, 됩니다. 안녕히 가세요!', en: 'Yes, that’s fine. Goodbye!' } },
    ],
  },
  {
    id: 'health-doctor-cold',
    topic: 'health',
    level: 2,
    scene: '🩺',
    title: { ko: '병원에서', en: 'At the doctor’s' },
    role: { ko: '환자', en: 'Patient' },
    goal: { ko: '목이 아프고 기침을 해요. 어제부터 아팠어요. 콧물은 안 나요.', en: 'Your throat hurts and you’re coughing, since yesterday. No runny nose.' },
    them: { name: '의사', en: 'Doctor', emoji: '👩‍⚕️', voice: 'high' },
    words: ['health:throat', 'health:cough', 'health:runnynose', 'health:rest'],
    steps: [
      { them: { ko: '어떻게 오셨어요?', en: 'What brings you in today?' } },
      {
        you: [
          { ko: '목이 아파요. 기침도 해요.', en: 'My throat hurts, and I’m coughing too.', right: true },
          {
            ko: '버스 타고 왔어요.',
            en: 'I came by bus.',
            react: { ko: '하하, 아니요. 어디가 아프세요?', en: 'Ha ha, no: I mean, what’s wrong?' },
            why: 'Here 어떻게 오셨어요? means “what brings you here?”, not how you travelled. Say what’s wrong: 목이 아파요. 기침도 해요.',
          },
          {
            ko: '목이 아파. 기침도 해.',
            en: 'Throat hurts. Coughing, too.',
            react: { ko: '아… 네. 기침도 하시고요?', en: 'Oh… right. And a cough as well?' },
            why: '아파 and 해 are 반말, for close friends; to a doctor they sound rude. Add 요: 목이 아파요. 기침도 해요.',
          },
        ],
      },
      { them: { ko: '언제부터 아프셨어요?', en: 'How long have you been ill?' } },
      {
        you: [
          { ko: '어제부터 아팠어요.', en: 'Since yesterday.', right: true, note: '부터 means “from, since”; 까지 means “until”.' },
          {
            ko: '어제까지 아팠어요.',
            en: 'I was ill until yesterday.',
            react: { ko: '네? 그럼 오늘은 괜찮으세요?', en: 'Sorry? So you’re fine today?' },
            why: '까지 means “until”: it sounds as if you’re better now. For “since”, use 부터: 어제부터 아팠어요.',
          },
          {
            ko: '내일부터 아팠어요.',
            en: 'I’ve been ill since tomorrow.',
            react: { ko: '내일이요? 어제요?', en: 'Tomorrow? You mean yesterday?' },
            why: '내일 is “tomorrow”; “yesterday” is 어제: 어제부터 아팠어요.',
          },
        ],
      },
      { them: { ko: '콧물도 나세요?', en: 'Do you have a runny nose too?' } },
      {
        you: [
          { ko: '아니요, 콧물은 안 나요.', en: 'No, I don’t have a runny nose.', right: true },
          {
            ko: '네, 콧물도 나요.',
            en: 'Yes, I have a runny nose too.',
            react: { ko: '콧물도요? 그럼 콧물 약도 처방해 드릴게요.', en: 'That too? Then I’ll prescribe something for it as well.' },
            why: 'Fine Korean, but you don’t have a runny nose: 아니요, 콧물은 안 나요.',
          },
          {
            ko: '아니요, 콧물은 안 아파요.',
            en: 'No, my runny nose doesn’t hurt.',
            react: { ko: '네? 아, 콧물은 없으세요?', en: 'Sorry? Oh, so no runny nose?' },
            why: 'A runny nose doesn’t “hurt”: it 나요 (“comes out”). Say 아니요, 콧물은 안 나요.',
          },
        ],
      },
      { them: { ko: '감기예요. 약 드시고 푹 쉬세요.', en: 'It’s a cold. Take your medicine and get plenty of rest.' } },
    ],
  },

  // ---------- Level 3 ----------
  {
    id: 'shopping-exchange-tshirt',
    topic: 'shopping',
    level: 3,
    scene: '👕',
    title: { ko: '티셔츠 바꾸기', en: 'Exchanging a T-shirt' },
    role: { ko: '손님', en: 'Customer' },
    goal: { ko: '어제 산 티셔츠가 작아요. 큰 사이즈로 바꿔요. 없으면 환불받아요.', en: 'The T-shirt you bought yesterday is too small. Swap it for a bigger size, or get a refund if they have none.' },
    them: { name: '직원', en: 'Shop assistant', emoji: '🧑‍💼', voice: 'low' },
    words: ['shopping:change', 'shopping:refund', 'shopping:receipt', 'shopping:size'],
    steps: [
      { them: { ko: '어서 오세요. 뭘 도와 드릴까요?', en: 'Hello! How can I help you?' } },
      {
        you: [
          { ko: '이거 좀 큰 사이즈로 바꿔 주세요.', en: 'Could I change this for a bigger size?', right: true },
          {
            ko: '이거 좀 큰 사이즈를 바꿔 주세요.',
            en: 'Could you change the bigger size?',
            react: { ko: '네? 아, 큰 사이즈로요?', en: 'Sorry? Oh, *for* a bigger size?' },
            why: 'With 바꿔요, what you change it *into* takes (으)로: 큰 사이즈로. With 를, the big size sounds like the thing you want to swap away.',
          },
          {
            ko: '이거 좀 환불해 주세요.',
            en: 'Could I get a refund for this?',
            react: { ko: '아, 환불하실 거예요?', en: 'Oh, you’d like a refund?' },
            why: 'Fine Korean, but first you want a bigger size; a refund only if there isn’t one. Say 큰 사이즈로 바꿔 주세요.',
          },
        ],
      },
      { them: { ko: '네, 영수증 있으세요?', en: 'Sure. Do you have the receipt?' } },
      {
        you: [
          { ko: '네, 여기 있어요.', en: 'Yes, here it is.', right: true },
          {
            ko: '네, 여기 계세요.',
            en: 'Yes, here *he* is.',
            react: { ko: '네? 누가요?', en: 'Sorry? Who?' },
            why: '계세요 is the polite 있어요 for *people* (or “please stay”, as in 안녕히 계세요). For a receipt, it’s just 있어요: 네, 여기 있어요.',
          },
          {
            ko: '네, 여기 있었어요.',
            en: 'Yes, it was here.',
            react: { ko: '네? 지금은 없으세요?', en: 'Sorry? You don’t have it now?' },
            why: '있었어요 is past: “it was here”. Handing it over, say 여기 있어요 (“here it is”).',
          },
        ],
      },
      { them: { ko: '죄송해요. 큰 사이즈는 다 팔렸어요.', en: 'I’m sorry, the bigger sizes are sold out.' } },
      {
        you: [
          { ko: '그럼 환불해 주세요.', en: 'Then I’d like a refund, please.', right: true, note: '-아/어 주세요 asks someone to do something for you.' },
          {
            ko: '그럼 환불하세요.',
            en: 'Then refund it.',
            react: { ko: '아… 네, 해 드릴게요.', en: 'Oh… right, I’ll do that.' },
            why: '환불하세요 sounds like an order. To ask someone to do something for you, use -아/어 주세요: 환불해 주세요.',
          },
          {
            ko: '그럼 괜찮아요.',
            en: 'Then never mind.',
            react: { ko: '아, 그럼 그냥 입으실 거예요?', en: 'Oh, so you’ll keep it after all?' },
            why: '괜찮아요 sounds like “never mind”: he thinks you’ll keep the small T-shirt. You want your money back: 그럼 환불해 주세요.',
          },
        ],
      },
      { them: { ko: '네, 카드로 환불해 드릴게요. 죄송해요.', en: 'Of course. I’ll refund it to your card. Sorry about that.' } },
    ],
  },
  {
    id: 'directions-subway-palace',
    topic: 'directions',
    level: 3,
    scene: '🚇',
    title: { ko: '경복궁 가는 길', en: 'The way to Gyeongbokgung' },
    role: { ko: '관광객', en: 'Tourist' },
    goal: { ko: '명동역에 있어요. 경복궁까지 가는 길, 걸리는 시간, 출구를 물어봐요.', en: 'You’re at Myeongdong Station. Ask how to get to Gyeongbokgung Palace, how long it takes and which exit to use.' },
    them: { name: '역무원', en: 'Station staff', emoji: '👨‍💼', voice: 'low' },
    words: ['directions:transfer', 'directions:takes', 'directions:exit', 'directions:subway'],
    steps: [
      { them: { ko: '네, 손님. 말씀하세요.', en: 'Yes? How can I help?' } },
      {
        you: [
          { ko: '경복궁에 어떻게 가요?', en: 'How do I get to Gyeongbokgung?', right: true },
          {
            ko: '경복궁이 어떻게 가요?',
            en: 'How does Gyeongbokgung go?',
            react: { ko: '네? 아, 경복궁에 가세요?', en: 'Sorry? Oh, you’re going to Gyeongbokgung?' },
            why: 'The place you’re going to takes 에: 경복궁에 어떻게 가요? With 이, the palace sounds like the one doing the going.',
          },
          {
            ko: '경복궁에 왜 가요?',
            en: 'Why do I go to Gyeongbokgung?',
            react: { ko: '네? 음… 예뻐서요? 하하.', en: 'Sorry? Um… because it’s beautiful? Ha ha.' },
            why: '왜 asks *why*. To ask the way, use 어떻게 (“how”): 경복궁에 어떻게 가요?',
          },
        ],
      },
      { them: { ko: '충무로역에서 삼 호선으로 갈아타세요.', en: 'Change to Line 3 at Chungmuro.' } },
      {
        you: [
          { ko: '얼마나 걸려요?', en: 'How long does it take?', right: true, note: '걸려요 is for the time something takes; 걸어요 means “walk”.' },
          {
            ko: '얼마나 걸어요?',
            en: 'How much do I walk?',
            react: { ko: '많이 안 걸어요. 지하철 타시면 돼요.', en: 'Not much: you just take the subway.' },
            why: '걸어요 means “walk”. For how long it takes, it’s 걸려요: 얼마나 걸려요?',
          },
          {
            ko: '얼마나 걸렸어요?',
            en: 'How long did it take?',
            react: { ko: '네? 지금 가시는 거죠?', en: 'Sorry? You’re going now, aren’t you?' },
            why: '걸렸어요 is past: “how long did it take?”. For a trip you’re about to make, use the present: 얼마나 걸려요?',
          },
        ],
      },
      { them: { ko: '이십 분쯤 걸려요. 경복궁역에서 내리세요.', en: 'About twenty minutes. Get off at Gyeongbokgung Station.' } },
      {
        you: [
          { ko: '몇 번 출구로 나가요?', en: 'Which exit do I take?', right: true },
          {
            ko: '몇 번 출구로 갈아타요?',
            en: 'Which exit do I change to?',
            react: { ko: '하하, 출구는 나가는 곳이에요!', en: 'Ha ha, an exit is where you go *out*!' },
            why: '갈아타요 is for changing trains. Leaving the station is 나가요: 몇 번 출구로 나가요?',
          },
          {
            ko: '출구가 몇 개예요?',
            en: 'How many exits are there?',
            react: { ko: '음… 많아요. 왜요?', en: 'Um… quite a few. Why?' },
            why: '몇 개 asks how many exits there are. To ask which one to take: 몇 번 출구로 나가요?',
          },
        ],
      },
      { them: { ko: '오 번 출구로 나가세요. 바로 앞이에요.', en: 'Take exit 5. The palace is right there.' } },
      {
        you: [
          { ko: '오 번 출구요? 감사합니다.', en: 'Exit 5? Thank you.', right: true },
          {
            ko: '다섯 번 출구요? 감사합니다.',
            en: 'Exit “five times”? Thank you.',
            react: { ko: '아, 오 번 출구요. 오 번!', en: 'Ah, exit 오 번. Number five!' },
            why: 'Exit numbers use Sino-Korean numbers: 오 번 출구. 다섯 번 means “five times”.',
          },
          {
            ko: '오 번 출구요? 안녕히 가세요.',
            en: 'Exit 5? Goodbye (go well)!',
            react: { ko: '하하, 저는 여기 있어요. 안녕히 가세요!', en: 'Ha ha, I’m staying here. Goodbye to *you*!' },
            why: '안녕히 가세요 is said to someone who’s leaving, but he stays at his post. Just say 감사합니다 (or 안녕히 계세요).',
          },
        ],
      },
      { them: { ko: '네, 구경 잘 하세요!', en: 'You’re welcome. Enjoy the palace!' } },
    ],
  },
  {
    id: 'travel-train-busan',
    topic: 'travel',
    level: 3,
    scene: '🚄',
    title: { ko: '기차표 사기', en: 'Buying a train ticket' },
    role: { ko: '손님', en: 'Passenger' },
    goal: { ko: '부산 가는 편도 표를 사요. 늦게 가도 창가 자리에 앉고 싶어요.', en: 'Buy a one-way ticket to Busan. You want a window seat, even if it means a later train.' },
    them: { name: '직원', en: 'Ticket clerk', emoji: '👩‍💼', voice: 'high' },
    words: ['travel:ticket', 'travel:oneway', 'travel:window', 'travel:sheet'],
    steps: [
      { them: { ko: '어디까지 가세요?', en: 'Where are you travelling to?' } },
      {
        you: [
          { ko: '부산까지 한 장 주세요.', en: 'One ticket to Busan, please.', right: true },
          {
            ko: '부산까지 일 장 주세요.',
            en: 'One (일) ticket to Busan, please.',
            react: { ko: '네? 아, 한 장이요?', en: 'Sorry? Oh, one ticket?' },
            why: '장 counts with native numbers: 한 장, 두 장. 일 is Sino-Korean.',
          },
          {
            ko: '부산에서 한 장 주세요.',
            en: 'One ticket from Busan, please.',
            react: { ko: '부산에서요? 여기는 서울역이에요.', en: 'From Busan? This is Seoul Station.' },
            why: '에서 means “from”. Where you’re going takes 까지 (“as far as”): 부산까지 한 장 주세요.',
          },
        ],
      },
      { them: { ko: '편도요, 왕복이요?', en: 'One-way or return?' } },
      {
        you: [
          { ko: '편도로 주세요.', en: 'One-way, please.', right: true, note: '편도 is one-way; 왕복 is a return (round trip).' },
          {
            ko: '왕복으로 주세요.',
            en: 'A return, please.',
            react: { ko: '네, 왕복이요. 언제 돌아오세요?', en: 'Sure, a return. When are you coming back?' },
            why: 'Fine Korean, but you only need a one-way ticket: 편도로 주세요. 왕복 is a return.',
          },
          {
            ko: '네, 주세요.',
            en: 'Yes, please.',
            react: { ko: '네? 편도요, 왕복이요?', en: 'Sorry? One-way or return?' },
            why: 'She asked “one-way or return?”, so 네 doesn’t answer it. Pick one: 편도로 주세요.',
          },
        ],
      },
      { them: { ko: '창가 자리는 없어요. 통로 쪽만 있어요.', en: 'There are no window seats left, only aisle seats.' } },
      {
        you: [
          { ko: '그럼 다음 기차는요?', en: 'What about the next train, then?', right: true },
          {
            ko: '그럼 지난 기차는요?',
            en: 'What about the previous train, then?',
            react: { ko: '이전 기차요? 벌써 떠났어요.', en: 'The one before? It’s already left.' },
            why: '지난 (as in 지난주, last week) means “previous”, and that train has gone! For the next one, say 다음: 그럼 다음 기차는요?',
          },
          {
            ko: '그럼 통로 쪽으로 주세요.',
            en: 'Then an aisle seat, please.',
            react: { ko: '네, 통로 쪽으로 드릴게요.', en: 'Sure, an aisle seat it is.' },
            why: 'Fine Korean, but you really want a window seat, even on a later train: 그럼 다음 기차는요?',
          },
        ],
      },
      { them: { ko: '세 시 반 기차는 창가 자리가 있어요.', en: 'The 3:30 train has window seats.' } },
      {
        you: [
          { ko: '좋아요. 그걸로 할게요.', en: 'Great. I’ll take that one.', right: true, note: '-(으)ㄹ게요 tells the other person what you’ve decided to do.' },
          {
            ko: '좋아요. 그걸로 할래요?',
            en: 'Great. Do you want to take that one?',
            react: { ko: '네? 저요? 하하, 손님이 고르세요.', en: 'Sorry? Me? Ha ha, you choose!' },
            why: '할래요? asks what *she* wants to do. To say what you’ve decided, use 할게요: 그걸로 할게요 (“I’ll take that one”).',
          },
          {
            ko: '좋아요. 그걸로 했어요.',
            en: 'Great. I took that one.',
            react: { ko: '네? 아, 그걸로 하실 거죠?', en: 'Sorry? Oh, you’ll take that one, right?' },
            why: '했어요 is past: “I took it”. For a decision you’re making now, say 할게요: 그걸로 할게요.',
          },
        ],
      },
      { them: { ko: '네, 여기 있습니다. 잘 다녀오세요!', en: 'Here you are. Have a good trip!' } },
    ],
  },
  {
    id: 'day-homestay-breakfast',
    topic: 'day',
    level: 1,
    scene: '🍳',
    title: { ko: '홈스테이 아침', en: 'Breakfast at the homestay' },
    role: { ko: '홈스테이 학생', en: 'Homestay student' },
    goal: {
      ko: '아침을 먹어요. 오늘은 학교에 가요. 저녁은 밖에서 친구하고 먹어요.',
      en: 'Your host mother has made breakfast: thank her before you eat. Today you’re going to school, and tonight you’re eating out with a friend.',
    },
    them: { name: '아주머니', en: 'Host mother', emoji: '👩‍🍳', voice: 'high' },
    words: ['day:morning', 'day:thanksfood', 'day:eat', 'day:evening'],
    steps: [
      { them: { ko: '아침 다 됐어요. 많이 먹어요!', en: 'Breakfast is ready. Eat up!' } },
      {
        you: [
          {
            ko: '잘 먹겠습니다!',
            en: 'Thank you for the food!',
            right: true,
            note: 'Koreans say 잘 먹겠습니다 just before they start eating, to whoever made (or is paying for) the meal.',
          },
          {
            ko: '잘 먹었습니다!',
            en: 'Thank you for the meal! (said after eating)',
            react: { ko: '네? 벌써 다 먹었어요? 하하.', en: 'Sorry? You’ve finished already? Haha.' },
            why: '잘 먹었습니다 is past: you say it after the meal. Before you start eating, it’s 잘 먹겠습니다.',
          },
          {
            ko: '맛있어요!',
            en: 'It’s delicious!',
            react: { ko: '하하, 먹어 보고 말해요!', en: 'Haha, tell me after you’ve tried it!' },
            why: 'You haven’t tasted it yet, so 맛있어요 (“it’s delicious”) comes too early: before tasting, it’s 맛있겠어요 (“it looks delicious”). To thank her as the food is served, say 잘 먹겠습니다.',
          },
        ],
      },
      { them: { ko: '오늘 뭐 해요?', en: 'What are you doing today?' } },
      {
        you: [
          { ko: '학교에 가요.', en: 'I’m going to school.', right: true },
          {
            ko: '학교에 가세요.',
            en: 'Please go to school.',
            react: { ko: '네? 제가요? 하하, 저는 집에 있어요.', en: 'Sorry? Me? Haha, I’m staying at home.' },
            why: '-(으)세요 is for other people: 가세요 asks *her* to go. About yourself, it’s just 가요: 학교에 가요.',
          },
          {
            ko: '학교에 가고 있어요.',
            en: 'I’m on my way to school.',
            react: { ko: '지금요? 아직 아침 먹고 있잖아요! 하하.', en: 'Right now? You’re still eating breakfast! Haha.' },
            why: '가고 있어요 means you’re on your way there right now. For today’s plan, the plain present is enough: 학교에 가요.',
          },
        ],
      },
      { them: { ko: '저녁은 집에서 먹어요?', en: 'Are you having dinner at home?' } },
      {
        you: [
          { ko: '아니요, 친구하고 먹어요.', en: 'No, I’m eating with a friend.', right: true },
          {
            ko: '네, 친구하고 먹어요.',
            en: 'Yes, I’m eating with a friend.',
            react: { ko: '아, 친구도 여기 와요? 좋아요!', en: 'Oh, your friend’s coming here too? Great!' },
            why: '네 says yes, you’re eating at home, so she thinks your friend is coming over. You’re eating out: 아니요, 친구하고 먹어요.',
          },
          {
            ko: '아니요, 친구를 먹어요.',
            en: 'No, I’m eating my friend.',
            react: { ko: '네? 친구를요? 하하, 친구하고요?', en: 'What? Your friend?! Haha, you mean with your friend?' },
            why: '를 marks what you eat, so you just said you’ll eat your friend! “With” is 하고: 친구하고 먹어요.',
          },
        ],
      },
      { them: { ko: '네, 알겠어요. 잘 다녀와요!', en: 'Okay, got it. Have a good day!' } },
    ],
  },
  {
    id: 'people-party-hello',
    topic: 'people',
    level: 1,
    scene: '🎉',
    title: { ko: '처음 만났어요', en: 'Meeting someone new' },
    role: { ko: '파티 손님', en: 'Guest at a party' },
    goal: {
      ko: '처음 만났어요. 인사해요. 저는 톰, 캐나다 사람이에요. 친구가 되고 싶어요.',
      en: 'You’ve just met Sujin at a party. Say hello: you’re Tom, from Canada. You’d like to be friends.',
    },
    them: { name: '수진', en: 'Sujin', emoji: '🙋‍♀️', voice: 'high' },
    words: ['people:hello', 'people:nicetomeet', 'people:me', 'people:person'],
    steps: [
      { them: { ko: '안녕하세요! 저는 수진이에요.', en: 'Hi! I’m Sujin.' } },
      {
        you: [
          { ko: '안녕하세요. 저는 톰이에요.', en: 'Hello. I’m Tom.', right: true },
          {
            ko: '안녕히 가세요. 저는 톰이에요.',
            en: 'Goodbye. I’m Tom.',
            react: { ko: '네? 제가 가요? 하하, 방금 만났잖아요!', en: 'Sorry? Me, leave? Haha, we’ve only just met!' },
            why: '안녕히 가세요 is “goodbye”, said to someone who is leaving. To say hello, it’s 안녕하세요.',
          },
          {
            ko: '안녕하세요. 저는 톰이세요.',
            en: 'Hello. I am the honourable Tom.',
            react: { ko: '하하, 네. 톰 씨군요.', en: 'Haha, okay. So you’re Tom.' },
            why: '-(이)세요 shows respect to someone else, so never use it about yourself. Say 저는 톰이에요.',
          },
        ],
      },
      { them: { ko: '만나서 반가워요. 어느 나라 사람이에요?', en: 'Nice to meet you. Where are you from?' } },
      {
        you: [
          { ko: '캐나다 사람이에요.', en: 'I’m Canadian.', right: true },
          {
            ko: '캐나다에 가요.',
            en: 'I’m going to Canada.',
            react: { ko: '아, 캐나다에 가요? 언제 가요?', en: 'Oh, you’re going to Canada? When?' },
            why: '가요 means “go”, so you said you’re going to Canada. To say where you’re from: 캐나다 사람이에요 (“I’m a Canada person”).',
          },
          {
            ko: '캐나다 사람이 있어요.',
            en: 'There’s a Canadian here.',
            react: { ko: '네? 어디에 있어요?', en: 'Sorry? Where?' },
            why: '있어요 says that someone or something is there. To say what you are, use 이에요: 캐나다 사람이에요.',
          },
        ],
      },
      { them: { ko: '저는 한국 사람이에요. 우리 친구 해요!', en: 'I’m Korean. Let’s be friends!' } },
      {
        you: [
          { ko: '네, 좋아요!', en: 'Yes, sounds good!', right: true },
          {
            ko: '네, 좋아해요!',
            en: 'Yes, I like you!',
            react: { ko: '네? 하하, 갑자기요?', en: 'Sorry? Haha, all of a sudden?' },
            why: '좋아해요 means “I like (someone)”, so it sounds like a confession! To agree to an idea, say 좋아요 (“sounds good”).',
          },
          {
            ko: '아니요, 괜찮아요.',
            en: 'No, thank you.',
            react: { ko: '아… 네, 알겠어요.', en: 'Oh… okay, I see.' },
            why: '아니요, 괜찮아요 politely says “no thanks”: you just turned her down! To say yes: 네, 좋아요.',
          },
        ],
      },
      { them: { ko: '좋아요! 다음에 또 만나요.', en: 'Great! Let’s meet up again.' } },
    ],
  },
  {
    id: 'weather-sydney-call',
    topic: 'weather',
    level: 1,
    scene: '💻',
    title: { ko: '거기 날씨 어때요?', en: 'How’s the weather there?' },
    role: { ko: '언어 교환 친구', en: 'Language-exchange partner' },
    goal: {
      ko: '저는 시드니에 살아요. 지금 시드니는 겨울이에요. 추워요. 오늘은 비가 와요.',
      en: 'Minjun, your language-exchange partner in Seoul, video-calls you. You live in Sydney, where it’s winter now: it’s cold, and today it’s raining.',
    },
    them: { name: '민준', en: 'Minjun (in Seoul)', emoji: '👨', voice: 'low' },
    words: ['weather:winter', 'weather:cold', 'weather:hot', 'weather:rain'],
    steps: [
      { them: { ko: '한국은 지금 여름이에요. 너무 더워요! 거기는요?', en: 'It’s summer in Korea now. It’s so hot! What about there?' } },
      {
        you: [
          { ko: '여기는 겨울이에요. 추워요.', en: 'It’s winter here. It’s cold.', right: true },
          {
            ko: '여기는 겨울이에요. 더워요.',
            en: 'It’s winter here. It’s hot.',
            react: { ko: '겨울인데 더워요? 하하, 정말요?', en: 'It’s winter, and it’s hot? Haha, really?' },
            why: '더워요 is “it’s hot”. For cold weather, it’s 추워요.',
          },
          {
            ko: '거기는 겨울이에요. 추워요.',
            en: 'It’s winter there (where you are). It’s cold.',
            react: { ko: '네? 여기요? 여기는 여름이에요!', en: 'Sorry? Here? It’s summer here!' },
            why: '거기 is “there”, the place where the listener is: Seoul. Where you are is 여기 (“here”): 여기는 겨울이에요.',
          },
        ],
      },
      { them: { ko: '아, 거기는 겨울이에요? 눈이 와요?', en: 'Oh, it’s winter there? Is it snowing?' } },
      {
        you: [
          { ko: '아니요, 오늘은 비가 와요.', en: 'No, today it’s raining.', right: true },
          {
            ko: '네, 오늘은 비가 와요.',
            en: 'Yes, today it’s raining.',
            react: { ko: '네? 눈이 와요, 비가 와요?', en: 'Sorry? Is it snowing or raining?' },
            why: '네 says “yes, it’s snowing”. It isn’t, so start with 아니요: 아니요, 오늘은 비가 와요.',
          },
          {
            ko: '아니요, 오늘은 비가 오세요.',
            en: 'No, today the honourable rain is coming.',
            react: { ko: '하하, 비님이 오세요?', en: 'Haha, “Mr Rain” is coming?' },
            why: '-(으)세요 shows respect to people, not to the weather. Just say 비가 와요.',
          },
        ],
      },
      { them: { ko: '그래요? 감기 조심하세요!', en: 'Really? Don’t catch a cold!' } },
      {
        you: [
          { ko: '네, 고마워요!', en: 'I won’t. Thanks!', right: true },
          {
            ko: '네, 미안해요!',
            en: 'Okay, I’m sorry!',
            react: { ko: '네? 왜 미안해요? 하하.', en: 'Sorry? Why are you sorry? Haha.' },
            why: '미안해요 is “I’m sorry”. To thank him for caring, say 고마워요 (or 감사합니다).',
          },
          {
            ko: '응, 고마워!',
            en: 'Yeah, thanks! (반말)',
            react: { ko: '어? 하하, 우리 이제 반말해요?', en: 'Oh? Haha, are we using 반말 now?' },
            why: 'You and Minjun talk in polite 해요체; 응, 고마워 is 반말, for close friends. Say 네, 고마워요.',
          },
        ],
      },
      { them: { ko: '네, 다음에 또 얘기해요!', en: 'Okay, let’s talk again soon!' } },
    ],
  },
  {
    id: 'numbers-salon-booking',
    topic: 'numbers',
    level: 2,
    scene: '💇',
    title: { ko: '미용실 예약', en: 'Booking a haircut' },
    role: { ko: '손님', en: 'Customer' },
    goal: {
      ko: '토요일 세 시 반에 머리를 자르고 싶어요. 혼자 가요.',
      en: 'Phone the hair salon to book a haircut for Saturday at 3:30, just for you.',
    },
    them: { name: '직원', en: 'Salon staff', emoji: '💁‍♂️', voice: 'low' },
    words: ['numbers:saturday', 'numbers:oclock', 'numbers:half', 'numbers:people'],
    steps: [
      { them: { ko: '네, 말랑 미용실입니다.', en: 'Hello, Mallang Hair Salon.' } },
      {
        you: [
          { ko: '토요일에 예약하고 싶어요.', en: 'I’d like to book for Saturday.', right: true },
          {
            ko: '토요일에 예약하세요.',
            en: 'Book for Saturday, please.',
            react: { ko: '네? 아… 예약해 드릴까요?', en: 'Sorry? Oh… would you like me to book you in?' },
            why: '예약하세요 tells *him* to book, like an order. To say what you’d like: 예약하고 싶어요.',
          },
          {
            ko: '토요일에 예약했어요.',
            en: 'I booked for Saturday.',
            react: { ko: '예약하셨어요? 음… 예약이 없는데요.', en: 'You’ve booked? Hmm… I can’t find a booking.' },
            why: '예약했어요 is past: “I (already) booked”. To make a new booking: 예약하고 싶어요.',
          },
        ],
      },
      { them: { ko: '토요일 몇 시요?', en: 'What time on Saturday?' } },
      {
        you: [
          { ko: '세 시 반이요.', en: 'Half past three.', right: true },
          {
            ko: '삼 시 반이요.',
            en: 'Half past “sam si”.',
            react: { ko: '삼 시요? 아, 세 시 반이요?', en: '“Sam si”? Oh, half past three?' },
            why: 'Hours use native Korean numbers: 세 시, not 삼 시. (Minutes use Sino-Korean ones: 삼십 분.)',
          },
          {
            ko: '세 시간 반이요.',
            en: 'Three and a half hours.',
            react: { ko: '세 시간이요? 아, 세 시 반이요?', en: 'Three hours? Oh, you mean half past three?' },
            why: '시간 is “hours”, a length of time. For a time of day, it’s 시: 세 시 반.',
          },
        ],
      },
      { them: { ko: '네, 세 시 반이요. 몇 분 예약하세요?', en: 'Sure, half past three. How many people is it for?' } },
      {
        you: [
          { ko: '한 명이에요.', en: 'Just one.', right: true },
          {
            ko: '한 분이에요.',
            en: 'One honoured person.',
            react: { ko: '네, 한 분이요. 알겠습니다.', en: 'Okay, one person. Got it.' },
            why: '분 is the polite counter for people: he uses it for you, but about yourself, say 명: 한 명이에요.',
          },
          {
            ko: '삼십 분이에요.',
            en: 'Thirty minutes.',
            react: { ko: '아, 시간 말고 사람이요. 한 분이세요?', en: 'Oh, not time: people. Is it just you?' },
            why: 'Here 분 is the polite counter for people, not minutes: he’s asking how many people the booking is for. Say 한 명이에요.',
          },
        ],
      },
      { them: { ko: '네, 토요일 세 시 반에 뵙겠습니다.', en: 'Great, see you on Saturday at half past three.' } },
    ],
  },
  {
    id: 'work-teacher-repeat',
    topic: 'work',
    level: 2,
    scene: '🏫',
    title: { ko: '다시 말씀해 주세요', en: 'Could you say that again?' },
    role: { ko: '학생', en: 'Student' },
    goal: {
      ko: '숙제를 잘 못 들었어요. 다시 듣고 싶어요. 다른 질문은 없어요.',
      en: 'You didn’t catch what the homework is: ask the teacher to say it again. After that, you have no more questions.',
    },
    them: { name: '박 선생님', en: 'Mr Park (your teacher)', emoji: '👨‍🏫', voice: 'low' },
    words: ['people:teacher', 'day:homework', 'work:question'],
    steps: [
      { them: { ko: '숙제는 삼십 쪽이에요. 내일까지 해 오세요.', en: 'The homework is page thirty. Have it done for tomorrow.' } },
      {
        you: [
          {
            ko: '죄송해요. 다시 말씀해 주세요.',
            en: 'Sorry. Please say that again.',
            right: true,
            note: '말씀 is the respectful word for what someone says: to a teacher, 말씀해 주세요 sounds more polite than 말해 주세요.',
          },
          {
            ko: '죄송해요. 다시 말할게요.',
            en: 'Sorry. I’ll say it again.',
            react: { ko: '네? 학생이 다시 말해요?', en: 'Sorry? You’re going to say it again?' },
            why: '말할게요 is what *you* will do: “I’ll say it”. To ask him to repeat it: 다시 말씀해 주세요.',
          },
          {
            ko: '죄송해요. 몰라요.',
            en: 'Sorry. I don’t know.',
            react: { ko: '네? 뭘 몰라요?', en: 'Sorry? What don’t you know?' },
            why: '몰라요 means “I don’t know”, not “I didn’t catch that”, so he can’t tell what you need. To have him say it again: 다시 말씀해 주세요.',
          },
        ],
      },
      { them: { ko: '네. 숙제는, 삼십 쪽이에요. 내일까지요.', en: 'Sure. The homework is… page thirty. For tomorrow.' } },
      {
        you: [
          { ko: '네, 알겠습니다.', en: 'Okay, I understand.', right: true },
          {
            ko: '네, 알아요.',
            en: 'Yes, I know.',
            react: { ko: '아, 알아요? 그럼 왜 물어봤어요?', en: 'Oh, you know? Then why did you ask?' },
            why: '알아요 means “I know (it already)”, which sounds odd after asking. To show you’ve understood, say 알겠습니다 (or 알겠어요).',
          },
          {
            ko: '응, 알겠어.',
            en: 'Yeah, got it. (반말)',
            react: { ko: '하하, 반말이요? “알겠습니다” 해야죠.', en: 'Haha, 반말? You should say “알겠습니다”.' },
            why: '알겠어 is 반말, far too casual for a teacher. Say 네, 알겠습니다 (or 알겠어요).',
          },
        ],
      },
      { them: { ko: '다른 질문 있으세요?', en: 'Any other questions?' } },
      {
        you: [
          { ko: '아니요, 없어요.', en: 'No, I don’t have any.', right: true },
          {
            ko: '네, 있어요.',
            en: 'Yes, I have one.',
            react: { ko: '네, 뭐예요?', en: 'Sure, what is it?' },
            why: '있어요 says you do have another question, so he waits for it. You don’t: 아니요, 없어요.',
          },
          {
            ko: '아니요, 없으세요.',
            en: 'No, I don’t have any. (honorific)',
            react: { ko: '하하, “없어요.” 네, 알겠어요.', en: 'Haha, “없어요.” Okay, got it.' },
            why: '-(으)세요 shows respect: he used it for you, but about yourself, it’s just 없어요: 아니요, 없어요.',
          },
        ],
      },
      { them: { ko: '좋아요. 그럼 내일 봐요!', en: 'Good. See you tomorrow, then!' } },
    ],
  },
  {
    id: 'feelings-exam-worries',
    topic: 'feelings',
    level: 2,
    scene: '📚',
    title: { ko: '무슨 일 있어?', en: 'What’s wrong?' },
    role: { ko: '친한 친구', en: 'Close friend' },
    goal: {
      ko: '내일 시험이 있어서 걱정돼요. 공부는 많이 했어요. 친한 친구니까 반말로 말해요.',
      en: 'You’re worried about tomorrow’s exam, even though you’ve studied a lot. Minho is a close friend: talk 반말.',
    },
    them: { name: '민호', en: 'Minho', emoji: '🧑', voice: 'low' },
    words: ['feelings:worried', 'feelings:nervous', 'work:exam', 'feelings:mood'],
    steps: [
      { them: { ko: '너 왜 그래? 무슨 일 있어?', en: 'What’s up with you? Is something wrong?' } },
      {
        you: [
          { ko: '내일 시험이 있어. 너무 걱정돼.', en: 'I’ve got an exam tomorrow. I’m so worried.', right: true },
          {
            ko: '내일 시험이 있어. 너무 걱정 마.',
            en: 'I’ve got an exam tomorrow. Don’t worry too much.',
            react: { ko: '내가 왜 걱정해? 하하, 너 걱정돼?', en: 'Why would I worry? Haha, you mean you’re worried?' },
            why: '걱정 마 means “don’t worry”: it tells *him* not to. To say you’re worried: 걱정돼.',
          },
          {
            ko: '내일 시험이 있습니다. 걱정됩니다.',
            en: 'I have an examination tomorrow. I am worried. (very formal)',
            react: { ko: '하하, 뉴스야? 왜 그렇게 말해?', en: 'Haha, are you reading the news? Why are you talking like that?' },
            why: '합니다체 is for formal settings (the news, speeches, meetings), so with a close friend it sounds funny. Use 반말: 내일 시험이 있어. 너무 걱정돼.',
          },
        ],
      },
      { them: { ko: '시험? 공부 많이 했어?', en: 'An exam? Have you studied a lot?' } },
      {
        you: [
          { ko: '응, 많이 했어. 그래도 떨려.', en: 'Yeah, loads. But I’m still nervous.', right: true },
          {
            ko: '응, 많이 할 거야. 그래도 떨려.',
            en: 'Yeah, I’m going to study loads. But I’m still nervous.',
            react: { ko: '아직 안 했어? 시험 내일이잖아!', en: 'You haven’t yet? The exam’s tomorrow!' },
            why: '할 거야 is future: “I’m going to study”. You already have, so use the past: 응, 많이 했어.',
          },
          {
            ko: '응, 많이 했어. 그래도 떨어져.',
            en: 'Yeah, loads. But I’ll still fail.',
            react: { ko: '떨어져? 아직 시험 안 봤잖아! 떨려?', en: 'Fail? You haven’t even taken it yet! You mean nervous?' },
            why: '떨어져 means “fall” (and “fail an exam”). For “I’m nervous”, the word is 떨려: 그래도 떨려.',
          },
        ],
      },
      { them: { ko: '걱정 마! 너는 잘할 거야. 파이팅!', en: 'Don’t worry! You’ll do great. You’ve got this!' } },
      {
        you: [
          { ko: '고마워! 이제 기분이 좋아.', en: 'Thanks! I feel better now.', right: true },
          {
            ko: '고마워! 너는 잘할 거야.',
            en: 'Thanks! You’ll do great.',
            react: { ko: '나? 시험은 네가 보잖아! 하하.', en: 'Me? You’re the one taking the exam! Haha.' },
            why: 'That repeats his words back about *him*. Say how you feel now: 고마워! 이제 기분이 좋아.',
          },
          {
            ko: '고마워! 이제 기분이 좋아해.',
            en: 'Thanks! Now my mood likes.',
            react: { ko: '기분이 좋아해? 하하, 기분이 좋아?', en: '“Your mood likes”? Haha, you mean you feel good?' },
            why: '좋아해 means “like (something)”: a person likes a thing. For how you feel, it’s 좋아: 기분이 좋아.',
          },
        ],
      },
      { them: { ko: '그래! 시험 끝나고 맛있는 거 먹자!', en: 'That’s it! Let’s eat something nice after your exam!' } },
    ],
  },
  {
    id: 'hobbies-karaoke-sunday',
    topic: 'hobbies',
    level: 2,
    scene: '🎤',
    title: { ko: '노래방 갈래?', en: 'Karaoke this weekend?' },
    role: { ko: '친한 친구', en: 'Close friend' },
    goal: {
      ko: '토요일은 바빠요. 일요일 두 시에 만나고 싶어요. 노래방에서 케이팝을 부를 거예요. 반말로 말해요.',
      en: 'Jisu, a close friend, invites you to karaoke. You’re busy on Saturday: suggest Sunday at 2. You’ll sing K-pop. Talk 반말.',
    },
    them: { name: '지수', en: 'Jisu', emoji: '👧', voice: 'high' },
    words: ['hobbies:karaoke', 'hobbies:sing', 'hobbies:song', 'numbers:sunday'],
    steps: [
      { them: { ko: '토요일에 노래방 갈래?', en: 'Want to go to karaoke on Saturday?' } },
      {
        you: [
          { ko: '미안, 토요일은 바빠. 일요일 어때?', en: 'Sorry, I’m busy on Saturday. How about Sunday?', right: true },
          {
            ko: '미안, 토요일은 바빴어. 일요일 어때?',
            en: 'Sorry, I was busy on Saturday. How about Sunday?',
            react: { ko: '바빴어? 토요일은 아직인데? 하하.', en: 'You were busy? It isn’t even Saturday yet! Haha.' },
            why: '바빴어 is past: “I was busy”. For this coming Saturday, use the present: 토요일은 바빠.',
          },
          {
            ko: '미안, 토요일은 심심해. 일요일 어때?',
            en: 'Sorry, I’m bored on Saturday. How about Sunday?',
            react: { ko: '심심해? 그럼 토요일에 가자!', en: 'You’re bored? Then let’s go on Saturday!' },
            why: '심심해 means “I’m bored”: a reason to go! “I’m busy” is 바빠: 토요일은 바빠.',
          },
        ],
      },
      { them: { ko: '일요일 좋아! 몇 시에 만날까?', en: 'Sunday works! What time shall we meet?' } },
      {
        you: [
          { ko: '두 시에 만나자.', en: 'Let’s meet at two.', right: true },
          {
            ko: '둘 시에 만나자.',
            en: 'Let’s meet at “dul si”.',
            react: { ko: '둘 시? 하하, 두 시?', en: '“Dul si”? Haha, you mean two o’clock?' },
            why: 'Before a counter like 시, 둘 becomes 두 (and 하나 → 한, 셋 → 세, 넷 → 네): 두 시.',
          },
          {
            ko: '노래방에서 만나자.',
            en: 'Let’s meet at the karaoke place.',
            react: { ko: '그래, 노래방 앞에서. 근데 몇 시?', en: 'Sure, outside the karaoke place. But what time?' },
            why: 'That says where, but she asked what time (몇 시): 두 시에 만나자.',
          },
        ],
      },
      { them: { ko: '좋아! 너는 무슨 노래 부를 거야?', en: 'Great! What are you going to sing?' } },
      {
        you: [
          { ko: '나는 케이팝 부를 거야.', en: 'I’m going to sing K-pop.', right: true },
          {
            ko: '나는 케이팝 들을 거야.',
            en: 'I’m going to listen to K-pop.',
            react: { ko: '듣기만 해? 노래방인데? 하하.', en: 'Just listen? At karaoke? Haha.' },
            why: '듣다 (들을 거야) is “listen”. At karaoke you sing, 부르다: 부를 거야.',
          },
          {
            ko: '저는 케이팝 부를 거예요.',
            en: 'I am going to sing K-pop. (polite)',
            react: { ko: '하하, 갑자기 왜 존댓말이야?', en: 'Haha, why so polite all of a sudden?' },
            why: 'Jisu is a close friend, so 저 and 해요체 sound distant. Use 반말: 나는 케이팝 부를 거야.',
          },
        ],
      },
      { them: { ko: '나도! 그럼 일요일에 봐!', en: 'Me too! See you on Sunday, then!' } },
    ],
  },
  {
    id: 'people-brother-photo',
    topic: 'people',
    level: 3,
    scene: '📱',
    title: { ko: '이 사람 누구야?', en: 'Who’s this?' },
    role: { ko: '친한 친구', en: 'Close friend' },
    goal: {
      ko: '사진 속 사람은 남동생이에요. 스무 살 대학생이에요. 친한 친구니까 반말로 말해요.',
      en: 'Your close friend Jieun spots a photo on your phone. It’s your younger brother: he’s twenty and at university. Talk 반말.',
    },
    them: { name: '지은', en: 'Jieun', emoji: '👩', voice: 'high' },
    words: ['people:sibling', 'people:tall', 'numbers:age', 'people:student'],
    steps: [
      { them: { ko: '와, 이 사람 누구야? 친구야?', en: 'Ooh, who’s this? A friend of yours?' } },
      {
        you: [
          { ko: '아니, 내 동생이야.', en: 'No, he’s my little brother.', right: true },
          {
            ko: '아니, 나는 동생이야.',
            en: 'No, I’m the younger one.',
            react: { ko: '응? 네가 동생이야? 그럼 이 사람은?', en: 'Huh? You’re the younger one? So who’s he?' },
            why: '나는 동생이야 says “I am the younger sibling”. For “my brother”, use 내 (“my”): 아니, 내 동생이야.',
          },
          {
            ko: '아니요, 제 동생이에요.',
            en: 'No, he’s my younger brother. (polite)',
            react: { ko: '왜 갑자기 존댓말이야? 하하.', en: 'Why so polite all of a sudden? Haha.' },
            why: 'Jieun is a close friend, so 해요체 and 제 sound oddly distant. Talk 반말: 아니, 내 동생이야.',
          },
        ],
      },
      { them: { ko: '동생? 키 진짜 크다! 몇 살이야?', en: 'Your brother? He’s so tall! How old is he?' } },
      {
        you: [
          { ko: '스무 살이야.', en: 'He’s twenty.', right: true },
          {
            ko: '이십 살이야.',
            en: 'He’s “isip sal”.',
            react: { ko: '이십 살? 아, 스무 살?', en: '“Isip sal”? Oh, twenty?' },
            why: 'Ages use native Korean numbers: 스무 살, not 이십 살.',
          },
          {
            ko: '나보다 어려.',
            en: 'He’s younger than me.',
            react: { ko: '그건 알지! 몇 살이냐고.', en: 'I know that! I mean how old is he?' },
            why: 'She asked his age (몇 살), and 동생 already means he’s younger. Give the number: 스무 살이야.',
          },
        ],
      },
      { them: { ko: '학생이야? 아니면 일해?', en: 'Is he a student? Or does he work?' } },
      {
        you: [
          { ko: '대학생이야.', en: 'He’s a university student.', right: true },
          {
            ko: '대학교야.',
            en: 'He’s a university.',
            react: { ko: '대학교? 아, 대학생이구나!', en: 'A university? Oh, he’s a university student!' },
            why: '대학교 is the university itself; a university student is 대학생: 대학생이야.',
          },
          {
            ko: '대학생이었어.',
            en: 'He was a university student.',
            react: { ko: '대학생이었어? 그럼 지금은 뭐 해?', en: 'He was? So what does he do now?' },
            why: '이었어 is past: “he was a student”. He still is, so use the present: 대학생이야.',
          },
        ],
      },
      { them: { ko: '와, 멋있다! 다음에 셋이 같이 놀자!', en: 'Wow, cool! Let’s all hang out together sometime!' } },
    ],
  },
  {
    id: 'hobbies-piano-signup',
    topic: 'hobbies',
    level: 3,
    scene: '🎹',
    title: { ko: '피아노 학원', en: 'At the music school' },
    role: { ko: '손님', en: 'Visitor' },
    goal: {
      ko: '피아노를 배우고 싶어요. 피아노는 처음이에요. 목요일만 시간이 있어요.',
      en: 'You’d like to learn the piano at a music school. You’ve never played before, and you’re only free on Thursdays.',
    },
    them: { name: '직원', en: 'Receptionist', emoji: '🧑‍💼', voice: 'low' },
    words: ['hobbies:piano', 'hobbies:wanttolearn', 'hobbies:playpiano', 'numbers:thursday'],
    steps: [
      { them: { ko: '안녕하세요. 어떻게 오셨어요?', en: 'Hello. What can I do for you?' } },
      {
        you: [
          {
            ko: '피아노를 배우고 싶어요.',
            en: 'I’d like to learn the piano.',
            right: true,
            note: '어떻게 오셨어요? (literally “how did you come?”) is how staff ask “What brings you here?”',
          },
          {
            ko: '버스 타고 왔어요.',
            en: 'I came by bus.',
            react: { ko: '하하, 아니요. 뭘 도와드릴까요?', en: 'Haha, no, I mean: how can I help you?' },
            why: 'Here 어떻게 오셨어요? means “What brings you here?”, not how you travelled. Say what you want: 피아노를 배우고 싶어요.',
          },
          {
            ko: '피아노를 가르치고 싶어요.',
            en: 'I’d like to teach the piano.',
            react: { ko: '아, 피아노 선생님이세요? 여기서 일하고 싶으세요?', en: 'Oh, you’re a piano teacher? You’d like to work here?' },
            why: '가르치다 is “teach”. To be the one learning: 배우고 싶어요.',
          },
        ],
      },
      { them: { ko: '전에 피아노 쳐 보셨어요?', en: 'Have you played the piano before?' } },
      {
        you: [
          { ko: '아니요, 피아노는 처음이에요.', en: 'No, it’s my first time playing.', right: true },
          {
            ko: '아니요, 피아노를 안 봤어요.',
            en: 'No, I haven’t seen a piano.',
            react: { ko: '피아노를 안 보셨어요? 하하, 안 쳐 보셨어요?', en: 'You’ve never seen a piano? Haha, you mean you’ve never played?' },
            why: 'In 쳐 보셨어요, 보다 means “try”: “have you tried playing?”. 안 봤어요 sounds like you’ve never *seen* one! Say 아니요, 피아노는 처음이에요.',
          },
          {
            ko: '아니요, 피아노를 안 놀았어요.',
            en: 'No, I didn’t have fun with the piano.',
            react: { ko: '하하, 놀았어요? 아, 안 쳐 보셨어요?', en: 'Haha, “had fun”? Oh, you mean you’ve never played?' },
            why: '놀다 is “play” as in have fun or hang out. For instruments, it’s 치다 (피아노를 쳐요). Here, simply: 아니요, 피아노는 처음이에요.',
          },
        ],
      },
      { them: { ko: '화요일 반, 목요일 반이 있어요. 언제가 좋으세요?', en: 'There’s a Tuesday class and a Thursday class. Which suits you?' } },
      {
        you: [
          { ko: '목요일이 좋아요.', en: 'Thursday is good for me.', right: true },
          {
            ko: '목요일도 좋아요.',
            en: 'Thursday is good too.',
            react: { ko: '화요일도요? 그럼 둘 다 하실래요?', en: 'Tuesday too? So would you like to do both?' },
            why: '도 means “too / also”, so you said Tuesday is fine as well. For just Thursday: 목요일이 좋아요.',
          },
          {
            ko: '목요일을 좋아해요.',
            en: 'I like Thursdays.',
            react: { ko: '하하, 그래요? 그럼 목요일 반으로 할까요?', en: 'Haha, do you? So shall I put you in the Thursday class?' },
            why: '좋아해요 says you like Thursdays in general. To say which day suits you, use 좋아요: 목요일이 좋아요.',
          },
        ],
      },
      { them: { ko: '네, 그럼 다음 주 목요일부터 오세요.', en: 'Great. Then you can start next Thursday.' } },
      {
        you: [
          { ko: '네, 감사합니다. 열심히 할게요.', en: 'Great, thank you. I’ll work hard.', right: true },
          {
            ko: '네, 감사합니다. 열심히 하세요.',
            en: 'Great, thank you. Please work hard.',
            react: { ko: '제가요? 하하, 네, 열심히 할게요.', en: 'Me? Haha, okay, I’ll work hard.' },
            why: '하세요 tells *him* to work hard. About yourself: 열심히 할게요 (“I’ll work hard”).',
          },
          {
            ko: '네, 감사합니다. 열심히 했어요.',
            en: 'Great, thank you. I worked hard.',
            react: { ko: '네? 아직 시작도 안 했잖아요! 하하.', en: 'Sorry? You haven’t even started yet! Haha.' },
            why: '했어요 is past: “I worked hard”. For a promise about the future: 열심히 할게요.',
          },
        ],
      },
      { them: { ko: '네, 그럼 목요일에 봬요!', en: 'Okay, see you on Thursday, then!' } },
    ],
  },
  {
    id: 'work-staff-dinner-trip',
    topic: 'work',
    level: 3,
    scene: '🏢',
    title: { ko: '내일 회식', en: 'Tomorrow’s staff dinner' },
    role: { ko: '회사원', en: 'Office worker' },
    goal: {
      ko: '내일 부산에 출장을 가요. 그래서 회식에 갈 수 없어요.',
      en: 'A colleague invites you to tomorrow’s staff dinner, but you can’t go: you’re off to Busan on a business trip.',
    },
    them: { name: '동료', en: 'Colleague', emoji: '👩‍💼', voice: 'high' },
    words: ['work:staffdinner', 'work:businesstrip', 'work:colleague', 'feelings:pity'],
    steps: [
      { them: { ko: '내일 저녁에 회식 있어요. 올 수 있어요?', en: 'There’s a staff dinner tomorrow evening. Can you come?' } },
      {
        you: [
          { ko: '아쉽지만 못 가요.', en: 'Sadly, I can’t.', right: true },
          {
            ko: '아쉽지만 안 가요.',
            en: 'Sadly, I’m not going.',
            react: { ko: '아… 안 와요? 회식 싫어해요?', en: 'Oh… you’re not coming? Don’t you like staff dinners?' },
            why: '안 가요 sounds like you’ve decided not to go. She asked if you *can* (올 수 있어요?): when something stops you, say 못 가요.',
          },
          {
            ko: '아쉽지만 못 와요.',
            en: 'Sadly, (someone) can’t come.',
            react: { ko: '네? 누가 못 와요?', en: 'Sorry? Who can’t come?' },
            why: 'She says 오다 (“come”) because she’ll be there. You aren’t there yet, so for yourself it’s 가다 (“go”): 못 가요.',
          },
        ],
      },
      { them: { ko: '왜요? 무슨 일 있어요?', en: 'Why? Is something up?' } },
      {
        you: [
          { ko: '내일 부산에 출장 가요.', en: 'I’m going to Busan on a business trip tomorrow.', right: true },
          {
            ko: '내일 부산에서 출장 가요.',
            en: 'I’m going on a business trip from Busan tomorrow.',
            react: { ko: '부산에서요? 부산에서 어디로 가요?', en: 'From Busan? And where are you going from there?' },
            why: '에서 means “from” (or where something happens). For where you’re going, use 에: 부산에 출장 가요.',
          },
          {
            ko: '내일 부산에 여행 가요.',
            en: 'I’m going on a trip to Busan tomorrow.',
            react: { ko: '와, 좋겠다! 휴가예요?', en: 'Ooh, lucky you! Are you on holiday?' },
            why: '여행 is a trip for fun, and you’re going for work: that’s 출장. Say 내일 부산에 출장 가요.',
          },
        ],
      },
      { them: { ko: '아, 그래요? 출장 잘 다녀와요!', en: 'Oh, really? Have a good trip!' } },
      {
        you: [
          {
            ko: '고마워요. 잘 다녀올게요.',
            en: 'Thanks. I will.',
            right: true,
            note: '잘 다녀올게요 (“I’ll go and come back safely”) is the natural reply to 잘 다녀와요.',
          },
          {
            ko: '고마워요. 잘 다녀오세요.',
            en: 'Thanks. Have a good trip.',
            react: { ko: '하하, 저는 회사에 있어요!', en: 'Haha, I’m staying here at the office!' },
            why: '다녀오세요 wishes *her* a good trip. About your own trip, say 잘 다녀올게요.',
          },
          {
            ko: '고마워요. 잘 다녀왔어요.',
            en: 'Thanks. I had a good trip.',
            react: { ko: '네? 아직 안 갔잖아요! 하하.', en: 'What? You haven’t even gone yet! Haha.' },
            why: '다녀왔어요 is past: you say it when you’re back. Before you go: 잘 다녀올게요.',
          },
        ],
      },
      { them: { ko: '네, 다음 회식에는 꼭 와요!', en: 'Okay, but come to the next one for sure!' } },
    ],
  },
  {
    id: 'past-monday-weekend',
    topic: 'past',
    level: 2,
    scene: '🏢',
    title: { ko: '주말 잘 보냈어요?', en: 'How was your weekend?' },
    role: { ko: '회사원', en: 'Office worker' },
    goal: {
      ko: '토요일에 고향 친구하고 삼겹살을 먹었어요. 일요일에는 아무것도 안 하고 음악만 들었어요.',
      en: 'On Saturday you had samgyeopsal with a friend from home. On Sunday you did nothing but listen to music.',
    },
    them: { name: '준호', en: 'Junho (a colleague)', emoji: '🧑‍💻', voice: 'low' },
    words: ['past:whatdid', 'past:ate', 'past:did'],
    steps: [
      { them: { ko: '주말 잘 보냈어요? 뭐 했어요?', en: 'Good weekend? What did you get up to?' } },
      {
        you: [
          { ko: '토요일에 삼겹살을 먹었어요.', en: 'On Saturday I had samgyeopsal.', right: true },
          {
            ko: '토요일에 삼겹살을 먹어요.',
            en: 'On Saturday I’m having samgyeopsal.',
            react: { ko: '아, 이번 토요일에요? 좋겠어요!', en: 'Oh, this Saturday? Lucky you!' },
            why: '먹어요 is present: it sounds like a plan for *this* Saturday. For last weekend, use the past: 먹었어요.',
          },
          {
            ko: '토요일에 삼겹살을 먹았어요.',
            en: 'On Saturday I “eated” samgyeopsal.',
            react: { ko: '아, 삼겹살 먹었어요? 맛있었겠네요!', en: 'Oh, you had samgyeopsal? Must have been good!' },
            why: '았 comes only when the last vowel is ㅏ or ㅗ (좋다 → 좋았어요, 받다 → 받았어요). 먹다 has ㅓ, so it takes 었: 먹었어요.',
          },
        ],
      },
      { them: { ko: '오, 누구하고 먹었어요?', en: 'Oh, who did you have it with?' } },
      {
        you: [
          { ko: '고향 친구하고 먹었어요.', en: 'With a friend from home.', right: true },
          {
            ko: '토요일 저녁에 먹었어요.',
            en: 'I had it on Saturday evening.',
            react: { ko: '아, 저녁에요? 근데 누구하고요?', en: 'Oh, in the evening? But who with?' },
            why: '누구하고 asks *who with*, not when. Say who: 고향 친구하고 먹었어요.',
          },
          {
            ko: '회사 사람들하고 먹었어요.',
            en: 'With people from work.',
            react: { ko: '네? 저는 왜 안 불렀어요?', en: 'What? Why wasn’t I invited?' },
            why: 'Fine Korean, but you went with a friend from home, not people from work: 고향 친구하고 먹었어요.',
          },
        ],
      },
      { them: { ko: '좋았겠네요. 일요일에는요?', en: 'That must have been nice. And on Sunday?' } },
      {
        you: [
          { ko: '아무것도 안 했어요. 음악만 들었어요.', en: 'I didn’t do anything. I just listened to music.', right: true, note: '아무것도 (“anything”) always comes with a negative: 아무것도 안 했어요.' },
          {
            ko: '아무것도 했어요. 음악만 들었어요.',
            en: 'I did anything. I just listened to music.',
            react: { ko: '아무것도… 했어요? 안 했어요?', en: 'You did… anything? Or didn’t you?' },
            why: '아무것도 needs a negative verb: 아무것도 안 했어요 (“I didn’t do anything”). Without 안, it doesn’t make sense.',
          },
          {
            ko: '아무것도 안 했어요. 음악만 듣었어요.',
            en: 'I didn’t do anything. I just listened to music. (wrong past form)',
            react: { ko: '아, 음악 들었어요? 무슨 음악이요?', en: 'Oh, you listened to music? What kind?' },
            why: '듣다 is irregular: before a vowel its ㄷ becomes ㄹ (들어요), so the past is 들었어요, not 듣었어요.',
          },
        ],
      },
      { them: { ko: '잘했어요. 일요일엔 쉬어야죠!', en: 'Good call. Sundays are for resting!' } },
    ],
  },
  {
    id: 'past-busan-mishaps',
    topic: 'past',
    level: 3,
    scene: '🌧️',
    title: { ko: '부산 여행 어땠어?', en: 'How was Busan?' },
    role: { ko: '친한 친구', en: 'Close friend' },
    goal: {
      ko: '역을 잘못 가서 기차를 놓쳤고, 부산은 비 오고 추웠어요. 핸드폰도 잃어버렸어요(아직 못 찾았어요). 친한 친구니까 반말로 말해요.',
      en: 'Your Busan trip went wrong: you went to the wrong station and missed the train, it rained and was cold, and you lost your phone (it’s still lost). Jimin is a close friend: talk 반말.',
    },
    them: { name: '지민', en: 'Jimin', emoji: '👩‍🦱', voice: 'high' },
    words: ['travel:missed', 'past:wascold', 'past:lost', 'day:sleepin'],
    steps: [
      { them: { ko: '부산 여행 어땠어? 재미있었어?', en: 'How was your Busan trip? Was it fun?' } },
      {
        you: [
          { ko: '말도 마. 처음부터 기차를 놓쳤어.', en: 'Don’t ask. I missed the train right at the start.', right: true, note: '말도 마 (“don’t even ask”) is how friends start a story about something that went wrong.' },
          {
            ko: '말도 마세요. 처음부터 기차를 놓쳤어요.',
            en: 'Please don’t ask. I missed the train right at the start. (polite)',
            react: { ko: '왜 갑자기 존댓말이야? 하하.', en: 'Why so polite all of a sudden? Ha ha.' },
            why: 'Jimin is a close friend, so 해요체 sounds oddly distant. Use 반말: 말도 마. 처음부터 기차를 놓쳤어.',
          },
          {
            ko: '말도 마. 처음부터 기차가 놓쳤어.',
            en: 'Don’t ask. The train missed me right at the start.',
            react: { ko: '기차가 널 놓쳤어? 반대 아니야?', en: 'The train missed you? Isn’t it the other way round?' },
            why: '기차 is what you missed (the object), so it takes 를: 기차를 놓쳤어. With 가, it sounds as if the train did the missing.',
          },
        ],
      },
      { them: { ko: '진짜? 왜? 늦잠 잤어?', en: 'Really? Why? Did you sleep in?' } },
      {
        you: [
          { ko: '아니, 늦잠은 안 잤어. 역을 잘못 갔어.', en: 'No, I didn’t sleep in. I went to the wrong station.', right: true },
          {
            ko: '아니, 안 늦잠 잤어. 역을 잘못 갔어.',
            en: 'No, I not-slept-in. I went to the wrong station.',
            react: { ko: '뭐? 잤어, 안 잤어? 하하.', en: 'What? Did you or didn’t you? Ha ha.' },
            why: 'With 늦잠(을) 자다, 안 goes right before the verb: 늦잠은 안 잤어. Before the noun (안 늦잠…), it sounds garbled.',
          },
          {
            ko: '응, 늦게 잤어. 두 시에 잤어.',
            en: 'Yeah, I went to bed late. At two.',
            react: { ko: '아, 그래서 늦잠 잤구나.', en: 'Ah, so that’s why you slept in.' },
            why: '늦잠 is “sleeping in” (waking up late), not going to bed late (that’s 늦게 자다). Your 응 says you slept in, and you didn’t: 아니, 늦잠은 안 잤어.',
          },
        ],
      },
      { them: { ko: '아이고. 부산 날씨는 좋았어?', en: 'Oh dear. Was the weather nice in Busan?' } },
      {
        you: [
          { ko: '아니, 비 오고 너무 추웠어.', en: 'No, it rained and it was freezing.', right: true },
          {
            ko: '아니, 비 오고 너무 춥었어.',
            en: 'No, it rained and it was “colded”.',
            react: { ko: '춥었어? 하하, 추웠어?', en: '“Colded”? Ha ha, you mean it was cold?' },
            why: '춥다 is irregular: before a vowel its ㅂ becomes 우 (추워), so the past is 추웠어, not 춥었어.',
          },
          {
            ko: '아니, 비 오고 너무 추워.',
            en: 'No, it’s raining and it’s freezing.',
            react: { ko: '부산은 지금도 추워?', en: 'Is it still cold in Busan?' },
            why: '추워 is present, so it sounds like Busan is still cold now. For the weather on your trip, use the past: 추웠어.',
          },
        ],
      },
      { them: { ko: '그래도 사진은 많이 찍었지?', en: 'But you took lots of photos, right?' } },
      {
        you: [
          { ko: '아니, 핸드폰을 잃어버렸어.', en: 'No, I lost my phone.', right: true, note: '잃어버렸어 (with ㅀ) is “lost”; 잊어버렸어 (with ㅈ) is “forgot”.' },
          {
            ko: '아니, 핸드폰을 잊어버렸어.',
            en: 'No, I forgot my phone.',
            react: { ko: '아, 집에 두고 갔어?', en: 'Oh, you left it at home?' },
            why: '잊어버렸어 (with ㅈ) means “forgot”, as if you left it at home. Lost is 잃어버렸어 (with ㅀ): 아니, 핸드폰을 잃어버렸어.',
          },
          {
            ko: '응, 사진 많이 찍었어.',
            en: 'Yeah, I took loads of photos.',
            react: { ko: '진짜? 보여 줘!', en: 'Really? Show me!' },
            why: 'Fine 반말, but you have no photos: you lost your phone. Say 아니, 핸드폰을 잃어버렸어.',
          },
        ],
      },
      { them: { ko: '아이고, 고생했다! 다음엔 나랑 같이 가자.', en: 'You poor thing! Next time, come with me.' } },
    ],
  },
]);
