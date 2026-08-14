/**
 * Phase 5 — Conversational Intelligence: automatic language detection and
 * multilingual response templates.
 *
 * Design goals:
 *  - No language selector, no forced choice: the user's message decides.
 *  - Script detection (Unicode ranges) covers Hindi/Marathi (Devanagari),
 *    Punjabi (Gurmukhi), Bengali, Gujarati, Tamil, Telugu, Kannada,
 *    Malayalam and Urdu (Arabic).
 *  - A curated romanized-marker classifier recognizes Hinglish and other
 *    romanized Indian languages that Unicode ranges cannot see.
 *  - Language is PURELY presentation/conversation logic. It never touches
 *    authorization or business rules (see ai.service.js).
 *  - Templates are a plain keyed table so new languages can be added by
 *    appending one object — no framework, no dependencies.
 */

export const LANG = Object.freeze({
  EN: "en",
  HI: "hi",         // Hindi (Devanagari script)
  HILATN: "hi-latn", // Hinglish (romanized Hindi)
  PA: "pa",          // Punjabi (Gurmukhi script)
  PALATN: "pa-latn", // romanized Punjabi
  MR: "mr",          // Marathi
  BN: "bn",          // Bengali
  GU: "gu",          // Gujarati
  TA: "ta",          // Tamil
  TE: "te",          // Telugu
  KN: "kn",          // Kannada
  ML: "ml",          // Malayalam
  UR: "ur",          // Urdu
});

// ------------------------------------------------------------
// Script detection
// ------------------------------------------------------------

const SCRIPT_RANGES = [
  { lang: LANG.HI, regex: /[\u0900-\u097F]/g }, // Devanagari
  { lang: LANG.PA, regex: /[\u0A00-\u0A7F]/g }, // Gurmukhi
  { lang: LANG.BN, regex: /[\u0980-\u09FF]/g }, // Bengali
  { lang: LANG.GU, regex: /[\u0A80-\u0AFF]/g }, // Gujarati
  { lang: LANG.TA, regex: /[\u0B80-\u0BFF]/g }, // Tamil
  { lang: LANG.TE, regex: /[\u0C00-\u0C7F]/g }, // Telugu
  { lang: LANG.KN, regex: /[\u0C80-\u0CFF]/g }, // Kannada
  { lang: LANG.ML, regex: /[\u0D00-\u0D7F]/g }, // Malayalam
  { lang: LANG.UR, regex: /[\u0600-\u06FF]/g }, // Arabic (Urdu)
];

/** Marathi vs Hindi both use Devanagari; these markers disambiguate. */
const MARATHI_SCRIPT_MARKERS = [
  "पाहिजे", "आहे", "आहेत", "काय", "मला", "तुला", "नको", "मी", "आम्ही",
];

/** Punjabi can also be written in Devanagari; these markers disambiguate. */
const PUNJABI_SCRIPT_MARKERS = [
  "ਪਾਉ", "ਹਟਾਓ", "ਕੀ ਹੈ", "ਦੇ", "ਚਾਹੀਦਾ", "ਚਾਹੀਦੇ", "ਵਧੀਆ",
];

const countOccurrences = (text, terms) => {
  let count = 0;
  for (const term of terms) {
    if (text.includes(term)) count += 1;
  }
  return count;
};

// ------------------------------------------------------------
// Romanized (Latin script) Indian language markers
// ------------------------------------------------------------

/** { lang: [marker, ...] } — matched as whole words on lowercase text. */
const ROMAN_MARKERS = {
  [LANG.HILATN]: [
    "chahiye", "chahie", "mujhe", "tumhe", "aapko", "hain", "kya", "kaise",
    "wala", "wali", "wale", "daal", "rakh", "karo", "kare", "kijiye", "bhai",
    "bahut", "achha", "accha", "dikhao", "dikha", "batao", "bata", "mile",
    "mila", "mili", "chahta", "chahti", "chahte", "nahi", "hai", "mein",
    "dikhao", "isko", "usko", "apna", "apni", "koi", "aur", "andar",
  ],
  [LANG.PALATN]: [
    "mainu", "tenu", "tainu", "saanu", "chahide", "chahida", "vadhiya",
    "vadia", "sohna", "lagda", "gall", "hona", "pehla", "dooja", "teesra",
    "jutte", "jutti", "kade", "haan", "nu",
  ],
  [LANG.MR]: [
    "pahije", "aahe", "ahe", "kaay", "mala", "tula", "apan", "ani", "tar",
    "astat", "havay", "kashala",
  ],
  [LANG.BN]: [
    "ami", "amake", "tomake", "tomar", "chai", "dorkar", "ache", "nei",
    "bhalo", "kintu", "ekta", "kichu", "kemon", "bolun",
  ],
  [LANG.GU]: [
    "joiye", "joie", "mane", "tamne", "ane", "che", "saru", "kem", "ghano",
    "ghana",
  ],
  [LANG.TA]: [
    "venum", "vendum", "naan", "enakku", "unakku", "irukku", "illa", "enna",
    "epdi", "konjam", "vaang", "kaatu",
  ],
  [LANG.TE]: [
    "kaavali", "kavali", "naaku", "niku", "undi", "ledu", "emiti", "entha",
    "koncham", "cheppandi",
  ],
  [LANG.KN]: [
    "beku", "nanage", "ninage", "ide", "illa", "enu", "esthu", "swalpa",
    "hege", "torsu",
  ],
  [LANG.ML]: [
    "venam", "enikku", "ninakku", "undu", "illa", "entha", "kurachu",
    "aalu", "ithu", "kanikku",
  ],
  [LANG.UR]: [
    "shukriya", "kripya", "aapka", "aapki", "isliye", "magar", "lekin",
    "zara", "chaahiye", "karain", "jayega",
  ],
};

const LOW_CONFIDENCE_LATN = new Set([LANG.EN]);

/**
 * Function words that mark a clearly English sentence. Only consulted AFTER
 * romanized markers score below the confident threshold, so genuine Hinglish
 * ("bhai 2000 ke under headphones bata") is never downgraded. A plain short
 * message like "2000" or "yes" contains none of these and therefore inherits
 * the previous conversation language instead of flipping to English.
 */
const ENGLISH_SIGNAL_WORDS = new Set([
  "i", "the", "a", "an", "need", "please", "show", "me", "my", "it",
  "with", "for", "you", "would", "can", "which", "this", "that",
  "these", "those", "and", "some", "looking", "want", "do", "is", "are",
  "your", "help", "we",
]);

/**
 * Detects the language of a user message.
 *
 * Priority: Unicode script (highest) -> romanized markers -> English.
 * When detection is weak (English fallback) the previous conversation
 * language is inherited so a conversation does not randomly flip to
 * English (Task 5 — language persistence).
 *
 * @returns {{ code: string, scripted: boolean, confident: boolean }}
 */
export const detectLanguage = (text = "", previousLang = null) => {
  const sample = String(text).slice(0, 400);

  // 1. Unicode script detection.
  let bestScript = null;
  let bestCount = 0;
  for (const { lang, regex } of SCRIPT_RANGES) {
    const matches = sample.match(regex);
    const count = matches ? matches.length : 0;
    if (count > bestCount) {
      bestCount = count;
      bestScript = lang;
    }
  }

  if (bestScript && bestCount > 0) {
    // Disambiguate Devanagari (Hindi vs Marathi vs Punjabi).
    if (bestScript === LANG.HI) {
      if (countOccurrences(sample, MARATHI_SCRIPT_MARKERS) > 0) {
        return { code: LANG.MR, scripted: true, confident: true };
      }
      if (countOccurrences(sample, PUNJABI_SCRIPT_MARKERS) > 0) {
        return { code: LANG.PA, scripted: true, confident: true };
      }
    }
    return { code: bestScript, scripted: true, confident: true };
  }

  // 2. Romanized marker classification.
  const lower = sample.toLowerCase();
  const scores = {};
  for (const [lang, markers] of Object.entries(ROMAN_MARKERS)) {
    let score = 0;
    for (const marker of markers) {
      if (marker.includes(" ")) {
        if (lower.includes(marker)) score += 2;
      } else {
        const re = new RegExp(`\\b${marker}\\b`, "i");
        if (re.test(lower)) score += 1;
      }
    }
    scores[lang] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  // "bhai 2000 ke under good headphones bata" -> strong Hinglish signal.
  if (best && best[1] >= 2) {
    return { code: best[0], scripted: false, confident: true };
  }

  // 3. English-sentence signal. A clearly English request can deliberately
  //    switch the conversation back to English (Task 4), e.g. "I need
  //    wireless ones" after a Hinglish search. Requires at least two English
  //    function words so Hinglish phrases with one shared word stay put.
  const words = lower.split(/[^a-z]+/).filter(Boolean);
  const englishHits = words.filter((word) => ENGLISH_SIGNAL_WORDS.has(word)).length;

  // A romanized marker ("daal", "wala") outranks the shared English function
  // words ("me", "do"), so "cart me daal do" keeps its Hinglish (Task 8).
  // Genuinely English requests carry no romanized markers and still flip the
  // conversation back to English (Task 4).
  const hasRomanMarker = Boolean(best && best[1] >= 1 && best[0] !== LANG.EN);

  if (englishHits >= 2 && !hasRomanMarker) {
    return { code: LANG.EN, scripted: false, confident: true };
  }

  // 4. A single strong indicator ("mainu", "wala", "kaavali") with no
  //    competing signal still decides a fresh conversation, so a first
  //    romanized message is not silently treated as English.
  if (best && best[1] === 1 && !previousLang) {
    return { code: best[0], scripted: false, confident: false };
  }

  // 5. Weak/English. Inherit the previous language to stay consistent.
  if (previousLang && !LOW_CONFIDENCE_LATN.has(previousLang)) {
    return { code: previousLang, scripted: false, confident: false };
  }

  return { code: LANG.EN, scripted: false, confident: false };
};

// ------------------------------------------------------------
// Commerce transliteration (non-Latin script -> Latin search terms)
// ------------------------------------------------------------

/**
 * Small curated dictionary so common Devanagari/Gurmukhi product terms can
 * drive the existing English-token product search. Product titles are stored
 * in English and are never translated — only the search terms are mapped.
 */
const TRANSLITERATION_MAP = {
  // Product nouns
  "हेडफोन": "headphones", "हेडफोन्स": "headphones",
  "जूते": "shoes", "जूता": "shoes", "ਸਨੀਕਰ": "sneakers", "ਸਨੀਕਰਜ਼": "sneakers",
  "स्नीकर्स": "sneakers", "जुत्ते": "shoes",
  "कमीज़": "shirt", "कमीज": "shirt", "शर्ट": "shirt", "ਕੁੜਤਾ": "kurta",
  "कुर्ता": "kurta", "कुर्ते": "kurta", "साड़ी": "saree", "साडी": "saree",
  "लैपटॉप": "laptop", "लैपटाप": "laptop", "ਫ਼ੋਨ": "phone", "फोन": "phone",
  "स्पीकर": "speaker", "ਬੈਕਪੈਕ": "backpack", "बैकपैक": "backpack",
  "बैग": "bag", "ਬੈਗ": "bag", "कैमरा": "camera", "ਘੜੀ": "watch", "घड़ी": "watch",
  "जीन्स": "jeans", "जींस": "jeans", "ਜੀਨਸ": "jeans",
  "टीशर्ट": "t shirt", "ਟੀਸ਼ਰਟ": "t shirt", "टी-शर्ट": "t shirt",
  "टी-शर्ट्स": "t shirt", "ਟੀ-ਸ਼ਰਟ": "t shirt",
  "स्वेटर": "sweater", "ਟਰਾਊਜ਼ਰ": "trousers", "पैंट": "pants", "ਪਜਾਮਾ": "pajama",
  "चप्पल": "slippers", "ਜੁੱਤੀਆਂ": "shoes",
  "बेड": "bed", "ਗੱਦਾ": "mattress", "तकिया": "pillow",
  "ब्लूटूथ": "bluetooth", "ਬਲੂਟੁੱਥ": "bluetooth",
  // Colors
  "काला": "black", "ਕਾਲਾ": "black", "सफ़ेद": "white", "सफेद": "white",
  "ਸਫੇਦ": "white", "नीला": "blue", "ਨੀਲਾ": "blue", "लाल": "red", "ਲਾਲ": "red",
  "हरा": "green", "ਹਰਾ": "green", "पीला": "yellow", "ਸਲੇਟੀ": "grey",
  "भूरा": "brown", "ਭੂਰਾ": "brown", "गुलाबी": "pink",
  // Qualifiers / shopping verbs
  "गेमिंग": "gaming", "ਗੇਮਿੰਗ": "gaming", "वायरलेस": "wireless",
  "ਵਾਇਰਲੈੱਸ": "wireless", "अंदर": "under", "ਅੰਦਰ": "under",
  "के": "", "ਚਾਹੀਦਾ": "", "ਚਾਹੀਦੇ": "", "ਚਾਹੁੰਦਾ": "",
  "चाहिए": "", "दिखाओ": "", "दिखाइए": "", "ਕੀ": "", "ਕੁਝ": "",
  "बताओ": "", "ਬਤਾਓ": "", "करो": "", "ਕਰੋ": "", "मुझे": "", "ਮੈਨੂੰ": "",
  "के_अंदर": "under", "ਵਿਚ": "",
  // Ordinals (selection flows)
  "पहला": "pehla", "पहली": "pehli", "पहले": "pehle",
  "दूसरा": "doosra", "दूसरी": "doosri",
  "तीसरा": "teesra", "तीसरी": "teesri",
  "चौथा": "chautha", "चौथी": "chauthi",
  "वाला": "wala", "વાલા": "wala", "वाली": "wali", "वाले": "wale",
  // Demonstrative pronouns (references resolve to the selected/last product)
  "इसे": "isse", "इसको": "isko", "उसे": "usse", "उसको": "usko",
  "इसका": "iska", "इसकी": "iski", "इसके": "iske",
  // Cart / add verbs so scripted actions can be detected after transliteration
  "कार्ट": "cart", "डाल": "daal", "डालो": "daalo", "डालें": "daale",
};

const sortTransliterations = () => {
  const keys = Object.keys(TRANSLITERATION_MAP);
  return keys.sort((a, b) => b.length - a.length);
};

const SORTED_TERMS = sortTransliterations();

/**
 * Converts a non-Latin message into English search tokens where a mapping
 * exists. Unmapped script characters are dropped. Returns [] when nothing
 * usable is found.
 */
export const transliterateCommerceTerms = (text = "") => {
  let out = String(text);
  for (const term of SORTED_TERMS) {
    const replacement = TRANSLITERATION_MAP[term];
    if (replacement) {
      out = out.split(term).join(` ${replacement} `);
    } else {
      out = out.split(term).join(" ");
    }
  }
  return out
    .replace(/[^\p{L}\p{N}\s₹]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ------------------------------------------------------------
// Commerce query normalization (romanized Indic -> search terms)
// ------------------------------------------------------------

/**
 * High-frequency Indic particles that carry no product-relevance value in a
 * romanized (Latin script) shopping query. Stripping them lets the existing
 * English-token AND-semantics search work ("mujhe nike sneakers chahiye"
 * reduces cleanly to ["nike", "sneakers"]).
 */
const ROMAN_PARTICLES = new Set([
  "mujhe", "mujhko", "mujko", "mainu", "menu", "mera", "meri", "mere",
  "chahiye", "chahie", "chahida", "chahide", "chahta", "chahti", "chahte",
  "chaho", "ka", "ki", "ke", "ko", "se", "me", "mein", "main",
  "hai", "hain", "haan", "ho", "wala", "wali", "wale", "waley", "bhai",
  "bahut", "koi", "aur", "bhi", "de", "da", "di", "ne", "nu", "vich",
  "dekh", "dikhao", "dikha", "batao", "bata", "lao", "lo", "kuch", "kuchh",
  "andar", "under", "kar", "karo", "kare", "kijiye", "karne", "karke",
  "kaise", "kya", "ye", "yeh", "wo", "woh", "sab", "saare", "accha",
  "achha", "theek", "thik", "kripya", "please", "apni", "apna",
  "is", "us", "eh", "oh", "yehi",
  // Conversational fillers for romanized Indic queries. These carry no
  // product-identity value, so stripping them keeps AND-semantics intact:
  // "jeans hai tumhare pss" => "jeans", "mujhe ek achhi jeans chahiye" =>
  // "jeans", "mainu jeans chahidi" => "jeans". "pass" is listed here for the
  // Hinglish path, but "pass" is excluded from the English-safe variant so a
  // genuine English token is never dropped.
  "tumhare", "tumhari", "tumhara", "tumhe", "tumko", "tujhe", "tujko",
  "aapke", "aapki", "aapka", "apne", "unke", "unki", "unka", "inke",
  "inki", "inka", "paas", "pass", "pss", "ke_paas", "ke_pss",
  "ek", "acha", "achi", "achhi", "acchi", "achhe", "acche", "waise",
  "chahidi", "chahindi", "chahinda", "chahinde", "chahinden",
  "puchna", "pooch", "poocha", "liye", "ke_liye",
]);

/**
 * Particle set applied when the query is detected as ENGLISH. Ambiguous words
 * that are valid English tokens ("me", "is", "us", "please", "under") are
 * kept so an English sentence is not mangled; the English stop-word filter
 * downstream already removes the same words from the final search tokens.
 */
const ROMAN_PARTICLES_EN_SAFE = new Set(
  [...ROMAN_PARTICLES].filter(
    (word) =>
      !["me", "is", "us", "please", "under", "pass"].includes(word),
  ),
);

/**
 * Curated romanized-Indic -> English word map so romanized queries can drive
 * the English-token product search without a translator. Product titles are
 * stored in English and are never translated — only the search terms are
 * mapped, exactly like the scripted TRANSLITERATION_MAP.
 */
const ROMAN_COMMERCE_MAP = {
  jute: "shoes", jutte: "shoes", joote: "shoes", jootey: "shoes",
  jutti: "shoes", joode: "shoes",
  chappal: "slippers", chappalein: "slippers", chappale: "slippers",
  ghadi: "watch", ghari: "watch", ghadio: "watch",
  kamera: "camera", kamere: "camera", camra: "camera",
  kamiz: "shirt", kameez: "shirt", kamij: "shirt", kurta: "kurta",
  kapde: "clothes", kapade: "clothes", kapray: "clothes",
  kala: "black", kale: "black", kali: "black",
  safed: "white", saphed: "white", safaid: "white",
  neela: "blue", neeli: "blue", neele: "blue", nila: "blue",
  laal: "red", lal: "red",
  hara: "green", hare: "green", hari: "green",
  peela: "yellow", peele: "yellow", peeli: "yellow",
  bhoora: "brown", bhoore: "brown",
};

/**
 * Reduces any user query to the English search tokens that should drive the
 * product matcher. Scripted input goes through the transliteration map;
 * romanized input gets the commerce word-map + particle stripping. The
 * result is still English/romanized text that getSearchTokens() can consume.
 */
export const normalizeCommerceQuery = (text = "") => {
  const detection = detectLanguage(text);

  if (detection.scripted) {
    return transliterateCommerceTerms(text);
  }

  const lower = String(text).toLowerCase();

  let out = lower;
  for (const [word, replacement] of Object.entries(ROMAN_COMMERCE_MAP)) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "g"), ` ${replacement} `);
  }

  const cleaned = out.replace(/[^a-z0-9₹\s]/g, " ").replace(/\s+/g, " ");

  const particles =
    detection.code === LANG.EN ? ROMAN_PARTICLES_EN_SAFE : ROMAN_PARTICLES;

  return cleaned
    .split(" ")
    .filter((token) => token && !particles.has(token))
    .join(" ");
};

// ------------------------------------------------------------
// Response templates
// ------------------------------------------------------------

/** `{count}`, `{title}`, `{price}`, `{query}`, `{quantity}`, `{topic}` */
const RESPONSES = {
  [LANG.EN]: {
    greeting: "Hello! How can I help you today?",
    thanks: "You're welcome! Anything else I can help with?",
    bye: "Bye! Happy shopping.",
    capability:
      "I can help you find products, compare options, check your cart, and add or remove items when you're logged in.",
    identity: "I'm the AI Knots Marketplace Assistant. I can help you find products, compare options, and manage your cart.",
    offTopic:
      "I can't check {topic} right now, but I can help you with products, recommendations, and your cart.",
    budgetQuestion: "Sure. What is your budget?",
    searchFound: 'I found {count} matching option{s} for "{query}".',
    searchEmpty:
      "I couldn't find any products matching that. Try a different search, or ask me to show categories.",
    recommendIntro: "I'd recommend the first option — it best matches what you asked for.",
    compareIntro:
      "Between these two, the first is the better match for your request; the second is the better budget pick.",
    compareIntroAlt: "Here is the difference between the two options.",
    reasonAroundBudget: "around ₹{price}",
    reasonWithinBudget: "within your ₹{price} budget",
    reasonColorMatches: "matches the {color} you asked for",
    reasonBrandMatches: "matches the {brand} brand you wanted",
    reasonBigDiscount: "{discount}% off MRP",
    reasonTopMatch: "best match for your request",
    comparePrice: "Price: ₹{first} vs ₹{second}",
    compareCategory: "Category: {first} vs {second}",
    compareVerdict: "The cheaper pick is **{title}** at ₹{price}.",
    topPick: "I'd recommend **{title}** — {reason}.",
    recommendList: "Here are the best matches for you:",
    giftIntro: "Here are some thoughtful gift ideas:",
    shoppingNoResult: "I couldn't find anything for \"{query}\" right now. {suggestion}",
    noMoreOptions: "That's all the options I have. {suggestion}",
    cartAddDone: "Done! **{title}** has been added to your cart.",
    cartAddFailedNotFound: "I couldn't find that product.",
    cartAddFailedStock: "Sorry, **{title}** is currently out of stock.",
    cartAddFailedQuantity: "Please choose a valid quantity.",
    cartUpdateDone: "Done! The quantity has been updated to {quantity}.",
    cartRemoveDone: "Done! The product has been removed from your cart.",
    cartView: "Here are the items in your cart.",
    cartEmpty: "Your cart is currently empty.",
    loginRequiredAdd: "Please log in before adding products to your cart.",
    loginRequiredView: "Please log in before I can show you your cart.",
    clarifyProduct: "Which product do you mean — the first one or the second one?",
    invalidAction: "Sorry, I can't perform that action.",
    unsupported: "Sorry, I can't do that. I can help you search products and manage your cart.",
    notFound: "I couldn't find that product.",
    detail: "Here are the details for **{title}**: price ₹{price}, {stock} units in stock.",
    detailShort: "**{title}** is priced at ₹{price}.",
    quantityInvalid: "Please choose a valid quantity.",
    noBudgetRefine: "Got it. Here are options within ₹{price}.",
    ackRefine: "Got it.",
    orderLoginRequired: "Authorization needed: Please authenticate into your account to securely track your order history.",
    orderEmpty: "I checked your account history and found no orders registered under your profile. Start shopping and I will help you track them!",
    orderFound: "Here are your {count} most recent order{s}:",
    noCategories: "I'm sorry, we currently don't have any categories available in our system. Please check back later!",
    categoryPrompt: "Great! Here are some popular shopping categories to explore:",
    categoryPickHint: "Please reply with the category number (1, 2, or 3), like \"1\" or \"category 2\".",
    categoryProducts: "Here are the top products in the **{name}** category:",
    categoryEmpty: "I found the **{name}** category, but unfortunately there are no products available in it at the moment. Would you like to explore another category?",
    categoryOutOfRange: "That category number is out of range. Please select from 1 to {max}.",
    cartEmptySuggest: "Would you like some product recommendations from our latest catalog?",
    searchActions: "Let me know if you want to view one in detail or add it to your cart.",
    selectionOutOfRange: "I only found {count} option{s}. Try the ones listed, or search again.",
    askWhichProduct: "Which product would you like me to add? You can tell me, like \"the first one\" or its name.",
    detailNotFound: "I couldn't find that product in our current public catalog. It may have been removed or is not yet available for sale.",
    detailAddPrompt: "Would you like me to add this verified catalog item to your cart?",
    quantityTooLarge: "Quantity cannot exceed {max}.",
    stockLimit: "Only {count} unit{s} available in stock right now.",
    cartItemNotFound: "I couldn't find that item in your cart.",
    cartError: "I couldn't perform that cart action. Please try again.",
    providerUnavailable:
      "I'm currently unable to connect to the AI service. Please try again in a moment.",
  },
  [LANG.HILATN]: {
    greeting: "Hello! Aaj main aapki kaise madad kar sakta hoon?",
    thanks: "Koi baat nahi! Aur kuch help chahiye?",
    bye: "Alvida! Happy shopping.",
    capability:
      "Main aapko products dhundhne, options compare karne, cart check karne, aur login hone par items add/remove karne mein help kar sakta hoon.",
    identity: "Main AI Knots Marketplace Assistant hoon. Main products dhundhne, options compare karne aur cart manage karne mein help kar sakta hoon.",
    offTopic:
      "Main abhi {topic} check nahi kar sakta, lekin main products, recommendations aur aapke cart mein help kar sakta hoon.",
    budgetQuestion: "Bilkul. Aapka budget kya hai?",
    searchFound: '"{query}" ke liye mujhe {count} matching option{s} mile hain.',
    searchEmpty:
      "Mujhe is query ke liye koi product nahi mila. Koi aur search try karein, ya categories dekhne ke liye poochein.",
    recommendIntro: "Main pehla option recommend karunga — ye aapki requirement se sabse achha match karta hai.",
    compareIntro:
      "In dono mein se pehla aapke request ke liye behtar hai; doosra budget ke liye behtar option hai.",
    compareIntroAlt: "Dono options ke beech ye difference hai.",
    reasonAroundBudget: "{price} ke aas-paas",
    reasonWithinBudget: "aapke ₹{price} budget ke andar",
    reasonColorMatches: "aapke bataye {color} se match karta hai",
    reasonBrandMatches: "aapke maange hue {brand} brand se match",
    reasonBigDiscount: "{discount}% MRP par discount",
    reasonTopMatch: "aapki request ke liye best match",
    comparePrice: "Price: ₹{first} aur ₹{second}",
    compareCategory: "Category: {first} aur {second}",
    compareVerdict: "Budget option **{title}** hai — ₹{price} mein.",
    topPick: "Main **{title}** recommend karunga — {reason}.",
    recommendList: "Aapke liye ye best matches hain:",
    giftIntro: "Kuch acchi gift suggestions hain:",
    shoppingNoResult: "\"{query}\" ke liye abhi koi product nahi mila. {suggestion}",
    noMoreOptions: "Bas itne hi options hain. {suggestion}",
    cartAddDone: "Ho gaya! **{title}** aapke cart mein add ho gaya.",
    cartAddFailedNotFound: "Mujhe wo product nahi mila.",
    cartAddFailedStock: "Maaf kijiye, **{title}** abhi stock mein nahi hai.",
    cartAddFailedQuantity: "Kripya ek valid quantity choose karein.",
    cartUpdateDone: "Ho gaya! Quantity update karke {quantity} kar di gayi hai.",
    cartRemoveDone: "Ho gaya! Product cart se remove ho gaya.",
    cartView: "Aapke cart mein ye items hain.",
    cartEmpty: "Aapka cart abhi khali hai.",
    loginRequiredAdd: "Cart mein product add karne ke liye pehle login karein.",
    loginRequiredView: "Cart dikhane ke liye pehle login karein.",
    clarifyProduct: "Aapka matlab kaunsa product hai — pehla ya doosra?",
    invalidAction: "Sorry, main ye action perform nahi kar sakta.",
    unsupported: "Sorry, main ye nahi kar sakta. Main products search karne aur cart manage karne mein help kar sakta hoon.",
    notFound: "Mujhe wo product nahi mila.",
    detail: "**{title}** ki details: price ₹{price}, {stock} units stock mein hain.",
    detailShort: "**{title}** ki price ₹{price} hai.",
    quantityInvalid: "Kripya ek valid quantity choose karein.",
    noBudgetRefine: "Samajh gaya. ₹{price} ke andar ye options hain.",
    ackRefine: "Samajh gaya.",
    orderLoginRequired: "Pehle login karein — apne order history ko securely track karne ke liye account authenticate karna zaroori hai.",
    orderEmpty: "Maine aapke account history check ki aur koi order register nahi mila. Shopping shuru karein, main tracking mein help karunga!",
    orderFound: "Ye rahe aapke sabse recent {count} order{s}:",
    noCategories: "Maaf kijiye, abhi hamare system mein koi category available nahi hai. Kripya thodi der baad check karein!",
    categoryPrompt: "Bahut badhiya! Explore karne ke liye ye kuch popular shopping categories hain:",
    categoryPickHint: "Kripya us category ka number reply karein (1, 2, ya 3), jaise \"1\" ya \"category 2\".",
    categoryProducts: "**{name}** category ke top products ye hain:",
    categoryEmpty: "Maine **{name}** category dhundh li, lekin abhi usme koi product available nahi hai. Kya aap koi aur category explore karna chahenge?",
    categoryOutOfRange: "Ye category number out of range hai. 1 se {max} tak select karein.",
    cartEmptySuggest: "Kya aapko latest catalog se kuch product recommendations chahiye?",
    searchActions: "Bata dein agar aap kisi ko detail mein dekhna chahte hain ya cart mein add karna chahte hain.",
    selectionOutOfRange: "Mujhe sirf {count} option{s} mile. Listed options mein se koi ek chunein, ya dobara search karein.",
    askWhichProduct: "Aap kaunsa product add karna chahenge? Aap \"pehla wala\" ya uske naam se bata sakte hain.",
    detailNotFound: "Mujhe ye product current public catalog mein nahi mila. Ho sakta hai ye remove ho gaya ho ya abhi sale ke liye available na ho.",
    detailAddPrompt: "Kya main is verified catalog item ko aapke cart mein add kar doon?",
    quantityTooLarge: "Quantity {max} se zyada nahi ho sakti.",
    stockLimit: "Abhi stock mein sirf {count} unit{s} available hain.",
    cartItemNotFound: "Mujhe wo item aapke cart mein nahi mila.",
    cartError: "Main ye cart action perform nahi kar saka. Kripya dobara try karein.",
    providerUnavailable:
      "Main abhi AI service se connect nahi kar sakta. Kripya ek minute baad dobara try karein.",
  },
  [LANG.HI]: {
    greeting: "नमस्ते! आज मैं आपकी कैसे मदद कर सकता हूँ?",
    thanks: "आपका स्वागत है! और कुछ मदद चाहिए?",
    bye: "अलविदा! शुभ खरीदारी।",
    capability:
      "मैं उत्पाद खोजने, विकल्पों की तुलना करने, कार्ट देखने और लॉगिन होने पर आइटम जोड़ने/हटाने में मदद कर सकता हूँ।",
    identity: "मैं AI Knots Marketplace असिस्टेंट हूँ। मैं उत्पाद खोजने, तुलना करने और कार्ट प्रबंधित करने में मदद कर सकता हूँ।",
    offTopic:
      "मैं अभी {topic} नहीं देख सकता, लेकिन मैं उत्पादों, सुझावों और आपके कार्ट में मदद कर सकता हूँ।",
    budgetQuestion: "बिल्कुल। आपका बजट क्या है?",
    searchFound: '"{query}" के लिए मुझे {count} मिलान विकल्प{s} मिले।',
    searchEmpty:
      "मुझे इस खोज के लिए कोई उत्पाद नहीं मिला। कोई और खोज आज़माएँ, या श्रेणियाँ देखने के लिए पूछें।",
    recommendIntro: "मैं पहला विकल्प सुझाऊँगा — यह आपकी ज़रूरत से सबसे अच्छा मेल खाता है।",
    compareIntro:
      "इन दोनों में से पहला आपकी माँग के लिए बेहतर है; दूसरा बजट के लिए बेहतर विकल्प है।",
    compareIntroAlt: "दोनों विकल्पों में यह अंतर है।",
    reasonAroundBudget: "{price} के आस-पास",
    reasonWithinBudget: "आपके ₹{price} बजट के अंदर",
    reasonColorMatches: "आपके बताए {color} से मेल खाता है",
    reasonBrandMatches: "आपके मांगे हुए {brand} ब्रांड से मेल",
    reasonBigDiscount: "MRP पर {discount}% छूट",
    reasonTopMatch: "आपकी मांग के लिए सबसे अच्छा मेल",
    comparePrice: "कीमत: ₹{first} और ₹{second}",
    compareCategory: "श्रेणी: {first} और {second}",
    compareVerdict: "बजट विकल्प **{title}** है — ₹{price} में।",
    topPick: "मैं **{title}** सुझाऊँगा — {reason}।",
    recommendList: "आपके लिए ये सबसे अच्छे मैच हैं:",
    giftIntro: "कुछ अच्छे गिफ्ट सुझाव हैं:",
    shoppingNoResult: "\"{query}\" के लिए अभी कोई उत्पाद नहीं मिला। {suggestion}",
    noMoreOptions: "बस इतने ही विकल्प हैं। {suggestion}",
    cartAddDone: "हो गया! **{title}** आपके कार्ट में जोड़ दिया गया।",
    cartAddFailedNotFound: "मुझे वह उत्पाद नहीं मिला।",
    cartAddFailedStock: "क्षमा करें, **{title}** अभी स्टॉक में नहीं है।",
    cartAddFailedQuantity: "कृपया एक मान्य मात्रा चुनें।",
    cartUpdateDone: "हो गया! मात्रा {quantity} कर दी गई है।",
    cartRemoveDone: "हो गया! उत्पाद कार्ट से हटा दिया गया।",
    cartView: "आपके कार्ट में ये आइटम हैं।",
    cartEmpty: "आपका कार्ट अभी खाली है।",
    loginRequiredAdd: "कार्ट में उत्पाद जोड़ने के लिए पहले लॉगिन करें।",
    loginRequiredView: "कार्ट दिखाने के लिए पहले लॉगिन करें।",
    clarifyProduct: "आपका मतलब कौन सा उत्पाद है — पहला या दूसरा?",
    invalidAction: "क्षमा करें, मैं यह कार्य नहीं कर सकता।",
    unsupported: "क्षमा करें, मैं यह नहीं कर सकता। मैं उत्पाद खोजने और कार्ट प्रबंधित करने में मदद कर सकता हूँ।",
    notFound: "मुझे वह उत्पाद नहीं मिला।",
    detail: "**{title}** की जानकारी: कीमत ₹{price}, {stock} इकाइयाँ स्टॉक में हैं।",
    detailShort: "**{title}** की कीमत ₹{price} है।",
    quantityInvalid: "कृपया एक मान्य मात्रा चुनें।",
    noBudgetRefine: "ठीक है। ₹{price} के अंदर ये विकल्प हैं।",
    ackRefine: "ठीक है।",
    orderLoginRequired: "प्राधिकरण आवश्यक: अपने ऑर्डर इतिहास को सुरक्षित रूप से ट्रैक करने के लिए पहले अपने खाते में प्रमाणित करें।",
    orderEmpty: "मैंने आपके खाते का इतिहास जाँचा और आपकी प्रोफ़ाइल पर कोई ऑर्डर नहीं मिला। खरीदारी शुरू करें, मैं उन्हें ट्रैक करने में मदद करूँगा!",
    orderFound: "ये रहे आपके सबसे हाल के {count} ऑर्डर:",
    noCategories: "क्षमा करें, हमारे सिस्टम में अभी कोई श्रेणी उपलब्ध नहीं है। कृपया बाद में देखें!",
    categoryPrompt: "बढ़िया! खोजने के लिए ये कुछ लोकप्रिय शॉपिंग श्रेणियाँ हैं:",
    categoryPickHint: "कृपया उस श्रेणी का नंबर उत्तर में दें (1, 2, या 3), जैसे \"1\" या \"category 2\"।",
    categoryProducts: "**{name}** श्रेणी के शीर्ष उत्पाद ये हैं:",
    categoryEmpty: "मुझे **{name}** श्रेणी मिली, लेकिन दुर्भाग्य से अभी उसमें कोई उत्पाद उपलब्ध नहीं है। क्या आप कोई और श्रेणी देखना चाहेंगे?",
    categoryOutOfRange: "यह श्रेणी संख्या सीमा से बाहर है। कृपया 1 से {max} तक चुनें।",
    cartEmptySuggest: "क्या आप हमारे नवीनतम कैटलॉग से कुछ उत्पाद सुझाव चाहेंगे?",
    searchActions: "बताइए अगर आप किसी को विस्तार से देखना चाहते हैं या उसे कार्ट में जोड़ना चाहते हैं।",
    selectionOutOfRange: "मुझे केवल {count} विकल्प{male} मिले। सूचीबद्ध में से कोई एक चुनें, या फिर से खोजें।",
    askWhichProduct: "आप कौन सा उत्पाद जोड़ना चाहेंगे? आप \"पहला वाला\" या उसका नाम बता सकते हैं।",
    detailNotFound: "मुझे यह उत्पाद वर्तमान सार्वजनिक कैटलॉग में नहीं मिला। हो सकता है इसे हटा दिया गया हो या यह अभी बिक्री के लिए उपलब्ध न हो।",
    detailAddPrompt: "क्या मैं इस सत्यापित कैटलॉग आइटम को आपके कार्ट में जोड़ दूँ?",
    quantityTooLarge: "मात्रा {max} से अधिक नहीं हो सकती।",
    stockLimit: "अभी स्टॉक में केवल {count} इकाइयाँ उपलब्ध हैं।",
    cartItemNotFound: "मुझे वह आइटम आपके कार्ट में नहीं मिला।",
    cartError: "मैं यह कार्ट कार्रवाई नहीं कर सका। कृपया पुनः प्रयास करें।",
    providerUnavailable:
      "मैं अभी AI सेवा से कनेक्ट नहीं कर पा रहा हूँ। कृपया एक क्षण बाद फिर से प्रयास करें।",
  },
  [LANG.PA]: {
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    thanks: "ਜੀ ਆਇਆਂ ਨੂੰ! ਹੋਰ ਕੁਝ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
    bye: "ਅਲਵਿਦਾ! ਖੁਸ਼ ਖਰੀਦਦਾਰੀ।",
    capability:
      "ਮੈਂ ਉਤਪਾਦ ਲੱਭਣ, ਵਿਕਲਪਾਂ ਦੀ ਤੁਲਨਾ ਕਰਨ, ਕਾਰਟ ਵੇਖਣ ਅਤੇ ਲੌਗਇਨ ਹੋਣ 'ਤੇ ਆਈਟਮਾਂ ਜੋੜਨ/ਹਟਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
    identity: "ਮੈਂ AI Knots Marketplace ਅਸਿਸਟੈਂਟ ਹਾਂ। ਮੈਂ ਉਤਪਾਦ ਲੱਭਣ ਅਤੇ ਕਾਰਟ ਪ੍ਰਬੰਧ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
    offTopic:
      "ਮੈਂ ਹੁਣ {topic} ਨਹੀਂ ਵੇਖ ਸਕਦਾ, ਪਰ ਮੈਂ ਉਤਪਾਦਾਂ, ਸੁਝਾਵਾਂ ਅਤੇ ਤੁਹਾਡੇ ਕਾਰਟ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
    budgetQuestion: "ਬਿਲਕੁਲ। ਤੁਹਾਡਾ ਬਜਟ ਕਿੰਨਾ ਹੈ?",
    searchFound: '"{query}" ਲਈ ਮੈਨੂੰ {count} ਮਿਲਦੇ ਵਿਕਲਪ{s} ਮਿਲੇ।',
    searchEmpty:
      "ਮੈਨੂੰ ਇਸ ਖੋਜ ਲਈ ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ। ਕੋਈ ਹੋਰ ਖੋਜ ਕਰੋ, ਜਾਂ ਸ਼੍ਰੇਣੀਆਂ ਦੇਖਣ ਲਈ ਪੁੱਛੋ।",
    recommendIntro: "ਮੈਂ ਪਹਿਲਾ ਵਿਕਲਪ ਸੁਝਾਵਾਂਗਾ — ਇਹ ਤੁਹਾਡੀ ਲੋੜ ਨਾਲ ਸਭ ਤੋਂ ਚੰਗਾ ਮੇਲ ਖਾਂਦਾ ਹੈ।",
    compareIntro:
      "ਇਨ੍ਹਾਂ ਦੋਵਾਂ ਵਿੱਚੋਂ ਪਹਿਲਾ ਤੁਹਾਡੀ ਮੰਗ ਲਈ ਬਿਹਤਰ ਹੈ; ਦੂਜਾ ਬਜਟ ਲਈ ਵਧੀਆ ਵਿਕਲਪ ਹੈ।",
    compareIntroAlt: "ਦੋਵਾਂ ਵਿਕਲਪਾਂ ਵਿੱਚ ਇਹ ਫ਼ਰਕ ਹੈ।",
    reasonAroundBudget: "{price} ਦੇ ਆਸ-ਪਾਸ",
    reasonWithinBudget: "ਤੁਹਾਡੇ ₹{price} ਬਜਟ ਦੇ ਅੰਦਰ",
    reasonColorMatches: "ਤੁਹਾਡੇ ਦੱਸੇ {color} ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਹੈ",
    reasonBrandMatches: "ਤੁਹਾਡੇ ਮੰਗੇ {brand} ਬ੍ਰਾਂਡ ਨਾਲ ਮੇਲ",
    reasonBigDiscount: "MRP ਉੱਤੇ {discount}% ਛੋਟ",
    reasonTopMatch: "ਤੁਹਾਡੀ ਮੰਗ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਮੇਲ",
    comparePrice: "ਕੀਮਤ: ₹{first} ਅਤੇ ₹{second}",
    compareCategory: "ਸ਼੍ਰੇਣੀ: {first} ਅਤੇ {second}",
    compareVerdict: "ਬਜਟ ਵਿਕਲਪ **{title}** ਹੈ — ₹{price} ਵਿੱਚ।",
    topPick: "ਮੈਂ **{title}** ਸੁਝਾਵਾਂਗਾ — {reason}।",
    recommendList: "ਤੁਹਾਡੇ ਲਈ ਇਹ ਸਭ ਤੋਂ ਵਧੀਆ ਮੇਲ ਹਨ:",
    giftIntro: "ਕੁਝ ਚੰਗੇ ਗਿਫਟ ਸੁਝਾਅ ਹਨ:",
    shoppingNoResult: "\"{query}\" ਲਈ ਫਿਲਹਾਲ ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ। {suggestion}",
    noMoreOptions: "Bas inne options ne. {suggestion}",
    cartAddDone: "ਹੋ ਗਿਆ! **{title}** ਤੁਹਾਡੇ ਕਾਰਟ ਵਿੱਚ ਜੋੜ ਦਿੱਤਾ ਗਿਆ।",
    cartAddFailedNotFound: "ਮੈਨੂੰ ਉਹ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ।",
    cartAddFailedStock: "ਮਾਫ ਕਰੋ, **{title}** ਹੁਣ ਸਟਾਕ ਵਿੱਚ ਨਹੀਂ ਹੈ।",
    cartAddFailedQuantity: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਮੰਨਯੋਗ ਮਾਤਰਾ ਚੁਣੋ।",
    cartUpdateDone: "ਹੋ ਗਿਆ! ਮਾਤਰਾ {quantity} ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।",
    cartRemoveDone: "ਹੋ ਗਿਆ! ਉਤਪਾਦ ਕਾਰਟ ਤੋਂ ਹਟਾ ਦਿੱਤਾ ਗਿਆ।",
    cartView: "ਤੁਹਾਡੇ ਕਾਰਟ ਵਿੱਚ ਇਹ ਆਈਟਮਾਂ ਹਨ।",
    cartEmpty: "ਤੁਹਾਡਾ ਕਾਰਟ ਹੁਣ ਖਾਲੀ ਹੈ।",
    loginRequiredAdd: "ਕਾਰਟ ਵਿੱਚ ਉਤਪਾਦ ਜੋੜਨ ਲਈ ਪਹਿਲਾਂ ਲੌਗਇਨ ਕਰੋ।",
    loginRequiredView: "ਕਾਰਟ ਵੇਖਾਉਣ ਲਈ ਪਹਿਲਾਂ ਲੌਗਇਨ ਕਰੋ।",
    clarifyProduct: "ਤੁਹਾਡਾ ਮਤਲਬ ਕਿਹੜਾ ਉਤਪਾਦ ਹੈ — ਪਹਿਲਾ ਜਾਂ ਦੂਜਾ?",
    invalidAction: "ਮਾਫ ਕਰੋ, ਮੈਂ ਇਹ ਕਾਰਵਾਈ ਨਹੀਂ ਕਰ ਸਕਦਾ।",
    unsupported: "ਮਾਫ ਕਰੋ, ਮੈਂ ਇਹ ਨਹੀਂ ਕਰ ਸਕਦਾ। ਮੈਂ ਉਤਪਾਦ ਲੱਭਣ ਅਤੇ ਕਾਰਟ ਪ੍ਰਬੰਧ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
    notFound: "ਮੈਨੂੰ ਉਹ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ।",
    detail: "**{title}** ਦੀ ਜਾਣਕਾਰੀ: ਕੀਮਤ ₹{price}, {stock} ਇਕਾਈਆਂ ਸਟਾਕ ਵਿੱਚ।",
    detailShort: "**{title}** ਦੀ ਕੀਮਤ ₹{price} ਹੈ।",
    quantityInvalid: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਮੰਨਯੋਗ ਮਾਤਰਾ ਚੁਣੋ।",
    noBudgetRefine: "ਸਮਝ ਗਿਆ। ₹{price} ਦੇ ਅੰਦਰ ਇਹ ਵਿਕਲਪ ਹਨ।",
    ackRefine: "ਸਮਝ ਗਿਆ।",
    orderLoginRequired: "ਲੌਗਇਨ ਲੋੜੀਂਦਾ: ਆਪਣੇ ਆਰਡਰ ਇਤਿਹਾਸ ਨੂੰ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਟਰੈਕ ਕਰਨ ਲਈ ਪਹਿਲਾਂ ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਪ੍ਰਮਾਣਿਤ ਕਰੋ।",
    orderEmpty: "ਮੈਂ ਤੁਹਾਡਾ ਖਾਤਾ ਇਤਿਹਾਸ ਚੈੱਕ ਕੀਤਾ ਅਤੇ ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ 'ਤੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਮਿਲਿਆ। ਖਰੀਦਦਾਰੀ ਸ਼ੁਰੂ ਕਰੋ, ਮੈਂ ਉਨ੍ਹਾਂ ਨੂੰ ਟਰੈਕ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ!",
    orderFound: "ਇਹ ਰਹੇ ਤੁਹਾਡੇ ਸਭ ਤੋਂ ਹਾਲੀਆ {count} ਆਰਡਰ:",
    noCategories: "ਮਾਫ ਕਰੋ, ਸਾਡੇ ਸਿਸਟਮ ਵਿੱਚ ਹੁਣ ਕੋਈ ਸ਼੍ਰੇਣੀ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੇਖੋ!",
    categoryPrompt: "ਵਧੀਆ! ਖੋਜਣ ਲਈ ਇਹ ਕੁਝ ਮਸ਼ਹੂਰ ਸ਼ਾਪਿੰਗ ਸ਼੍ਰੇਣੀਆਂ ਹਨ:",
    categoryPickHint: "ਕਿਰਪਾ ਕਰਕੇ ਉਸ ਸ਼੍ਰੇਣੀ ਦਾ ਨੰਬਰ ਜਵਾਬ ਵਿੱਚ ਦਿਓ (1, 2, ਜਾਂ 3), ਜਿਵੇਂ \"1\" ਜਾਂ \"category 2\"।",
    categoryProducts: "**{name}** ਸ਼੍ਰੇਣੀ ਦੇ ਚੋਟੀ ਦੇ ਉਤਪਾਦ ਇਹ ਹਨ:",
    categoryEmpty: "ਮੈਨੂੰ **{name}** ਸ਼੍ਰੇਣੀ ਮਿਲੀ, ਪਰ ਬਦਕਿਸਮਤੀ ਨਾਲ ਇਸ ਵਿੱਚ ਹੁਣ ਕੋਈ ਉਤਪਾਦ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕੀ ਤੁਸੀਂ ਕੋਈ ਹੋਰ ਸ਼੍ਰੇਣੀ ਦੇਖਣਾ ਚਾਹੋਗੇ?",
    categoryOutOfRange: "ਇਹ ਸ਼੍ਰੇਣੀ ਨੰਬਰ ਸੀਮਾ ਤੋਂ ਬਾਹਰ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ 1 ਤੋਂ {max} ਤੱਕ ਚੁਣੋ।",
    cartEmptySuggest: "ਕੀ ਤੁਸੀਂ ਸਾਡੇ ਨਵੀਨਤਮ ਕੈਟਾਲਾਗ ਤੋਂ ਕੁਝ ਉਤਪਾਦ ਸੁਝਾਅ ਚਾਹੋਗੇ?",
    searchActions: "ਦੱਸੋ ਜੇ ਤੁਸੀਂ ਕਿਸੇ ਨੂੰ ਵੇਰਵੇ ਨਾਲ ਦੇਖਣਾ ਚਾਹੁੰਦੇ ਹੋ ਜਾਂ ਉਸਨੂੰ ਕਾਰਟ ਵਿੱਚ ਜੋੜਨਾ ਚਾਹੁੰਦੇ ਹੋ।",
    selectionOutOfRange: "Menu sirf {count} option{s} mile. Listed options chon, ya dobara search karo.",
    askWhichProduct: "ਤੁਸੀਂ ਕਿਹੜਾ ਉਤਪਾਦ ਜੋੜਨਾ ਚਾਹੋਗੇ? ਤੁਸੀਂ \"ਪਹਿਲਾ ਵਾਲਾ\" ਜਾਂ ਉਸਦਾ ਨਾਮ ਦੱਸ ਸਕਦੇ ਹੋ।",
    detailNotFound: "ਮੈਨੂੰ ਇਹ ਉਤਪਾਦ ਮੌਜੂਦਾ ਜਨਤਕ ਕੈਟਾਲਾਗ ਵਿੱਚ ਨਹੀਂ ਮਿਲਿਆ। ਹੋ ਸਕਦਾ ਹੈ ਇਹ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੋਵੇ ਜਾਂ ਅਜੇ ਵਿਕਰੀ ਲਈ ਉਪਲਬਧ ਨਾ ਹੋਵੇ।",
    detailAddPrompt: "ਕੀ ਮੈਂ ਇਸ ਪ੍ਰਮਾਣਿਤ ਕੈਟਾਲਾਗ ਆਈਟਮ ਨੂੰ ਤੁਹਾਡੇ ਕਾਰਟ ਵਿੱਚ ਜੋੜ ਦੇਵਾਂ?",
    quantityTooLarge: "ਮਾਤਰਾ {max} ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋ ਸਕਦੀ।",
    stockLimit: "ਹੁਣ ਸਟਾਕ ਵਿੱਚ ਸਿਰਫ਼ {count} ਇਕਾਈਆਂ ਉਪਲਬਧ ਹਨ।",
    cartItemNotFound: "ਮੈਨੂੰ ਉਹ ਆਈਟਮ ਤੁਹਾਡੇ ਕਾਰਟ ਵਿੱਚ ਨਹੀਂ ਮਿਲੀ।",
    cartError: "ਮੈਂ ਇਹ ਕਾਰਟ ਕਾਰਵਾਈ ਨਹੀਂ ਕਰ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  },
  [LANG.PALATN]: {
    greeting: "Sat sri akal! Aaj main tuhadi ki madad kar sakda haan?",
    thanks: "Koi gal nahi! Hor kuj chahida?",
    bye: "Alvida! Khush shopping.",
    capability:
      "Main tuhanu products labhan, options compare karan, cart vekhan te login hon to baad items add/remove karan vich madad kar sakda haan.",
    identity: "Main AI Knots Marketplace assistant haan. Main products labhan te cart manage karan vich madad kar sakda haan.",
    offTopic:
      "Main hun {topic} check nahi kar sakda, par main products, suggestions te tuhade cart vich madad kar sakda haan.",
    budgetQuestion: "Bilkul. Tuhada budget kitna hai?",
    searchFound: '"{query}" lai mainu {count} match hunde option{s} mile ne.',
    searchEmpty:
      "Menu is search lai koi product nahi milia. Hor search karo, ya categories vekhan lai puchho.",
    recommendIntro: "Main pehla option suggest karanga — eh tuhadi lod naal sab ton changa match karda hai.",
    compareIntro:
      "Ina dovana vicho pehla tuhadi mang lai behtar hai; dooja budget lai changa option hai.",
    compareIntroAlt: "Dovana options vich eh farak hai.",
    reasonAroundBudget: "{price} de aas-paas",
    reasonWithinBudget: "tuhade ₹{price} budget de andar",
    reasonColorMatches: "tuhade dasse {color} naal match karda hai",
    reasonBrandMatches: "tuhade mange {brand} brand naal match",
    reasonBigDiscount: "MRP te {discount}% chhot",
    reasonTopMatch: "tuhadi mang lai sab ton vadhiya match",
    comparePrice: "Qeemat: ₹{first} ate ₹{second}",
    compareCategory: "Category: {first} ate {second}",
    compareVerdict: "Budget option **{title}** hai — ₹{price} vich.",
    topPick: "Main **{title}** suggest kardanga — {reason}.",
    recommendList: "Tuhade lai eh sab ton vadhiya matches ne:",
    giftIntro: "Kuj changiya gift suggestions ne:",
    shoppingNoResult: "\"{query}\" lai filhal koi product nahi milia. {suggestion}",
    noMoreOptions: "ਬੱਸ ਇੰਨੇ ਵਿਕਲਪ ਹਨ। {suggestion}",
    cartAddDone: "Ho gaya! **{title}** tuhade cart vich add ho gaya.",
    cartAddFailedNotFound: "Menu oha product nahi milia.",
    cartAddFailedStock: "Maaf karo, **{title}** hun stock vich nahi hai.",
    cartAddFailedQuantity: "Kirpa karke ik mann-yog matra chuno.",
    cartUpdateDone: "Ho gaya! Matra {quantity} kar diti hai.",
    cartRemoveDone: "Ho gaya! Product cart ton remove ho gaya.",
    cartView: "Tuhade cart vich eh items ne.",
    cartEmpty: "Tuhada cart hun khali hai.",
    loginRequiredAdd: "Cart vich product add karan lai pehla login karo.",
    loginRequiredView: "Cart dikhaun lai pehla login karo.",
    clarifyProduct: "Tuhada matlab kehda product hai — pehla ya dooja?",
    invalidAction: "Maaf karo, main eh action nahi kar sakda.",
    unsupported: "Maaf karo, main eh nahi kar sakda. Main products labhan te cart manage karan vich madad kar sakda haan.",
    notFound: "Menu oha product nahi milia.",
    detail: "**{title}** di jaankari: keemat ₹{price}, {stock} ikaiyan stock vich.",
    detailShort: "**{title}** di keemat ₹{price} hai.",
    quantityInvalid: "Kirpa karke ik mann-yog matra chuno.",
    noBudgetRefine: "Samajh gaya. ₹{price} de andar eh options ne.",
    ackRefine: "Samajh gaya.",
    orderLoginRequired: "Login zaroori: tuhade order history nu secure tarike naal track karan lai pehla apne account vich authenticate karo.",
    orderEmpty: "Mai tuhada account history check kita te tuhadi profile te koi order nahi milia. Shopping shuru karo, mai tracking vich madad karanga!",
    orderFound: "Eh rahe tuhade sab ton recent {count} order:",
    noCategories: "Maaf karo, sade system vich hun koi category available nahi hai. Kirpa baad vich check karo!",
    categoryPrompt: "Vadhiya! Explore karan lai eh kuj popular shopping categories ne:",
    categoryPickHint: "Kirpa karke oh category da number reply karo (1, 2, ya 3), je \"1\" ya \"category 2\".",
    categoryProducts: "**{name}** category de top products eh ne:",
    categoryEmpty: "Menu **{name}** category mili, par badkismati naal ehde vich hun koi product available nahi hai. Koi hor category vekhni chaoge?",
    categoryOutOfRange: "Eh category number range ton bahar hai. Kirpa 1 ton {max} tak chuno.",
    cartEmptySuggest: "Ki tusi sade latest catalog ton kuj product suggestions chahoge?",
    searchActions: "Daso ji je tusi kise nu detail naal vekhna chahunde ho ya cart vich add karna chahunde ho.",
    selectionOutOfRange: "మీకు ਸਿਰਫ {count} ਵਿਕਲਪ {s} ਮਿਲੇ। ਸੂਚੀਬੱਧ ਵਿੱਚੋਂ ਕੋਈ ਇੱਕ ਚੁਣੋ, ਜਾਂ ਦੁਬਾਰਾ ਖੋਜੋ।",
    askWhichProduct: "Tusi kehda product add karna chahoge? Tusi \"pehla wala\" ya ohnu de naam naal das sakde ho.",
    detailNotFound: "Menu eh product current public catalog vich nahi milia. Ho sakda eh remove ho gaya hove ya hun sale lai available na hove.",
    detailAddPrompt: "Ki main eh verified catalog item tuhade cart vich add kar devan?",
    quantityTooLarge: "Matra {max} ton vad nahi ho sakdi.",
    stockLimit: "Hun stock vich sirf {count} ikaiyan available ne.",
    cartItemNotFound: "Menu oh item tuhade cart vich nahi milia.",
    cartError: "Main eh cart action nahi kar sakda. Kirpa karke dobara koshish karo.",
  },
  [LANG.MR]: {
    greeting: "नमस्कार! आज मी तुमची कशी मदत करू?",
    thanks: "आपले स्वागत आहे! आणखी काही मदत हवी?",
    bye: "आता निघतो! आनंदी खरेदी.",
    capability:
      "मी उत्पादने शोधणे, पर्यायांची तुलना करणे, कार्ट पाहणे आणि लॉगिन झाल्यावर वस्तू जोडणे/काढणे यात मदत करू शकतो.",
    identity: "मी AI Knots Marketplace असिस्टंट आहे. मी उत्पादने शोधण्यात आणि कार्ट व्यवस्थापित करण्यात मदत करू शकतो.",
    offTopic:
      "मी आत्ता {topic} तपासू शकत नाही, पण मी उत्पादने, सूचना आणि तुमच्या कार्टमध्ये मदत करू शकतो.",
    budgetQuestion: "ठीक आहे. तुमचा बजेट किती आहे?",
    searchFound: '"{query}" साठी मला {count} जुळणारे पर्याय{s} मिळाले.',
    searchEmpty:
      "मला या शोधासाठी कोणतेही उत्पादन मिळाले नाही. वेगळा शोध करा किंवा श्रेणी पाहण्यासाठी विचारा.",
    recommendIntro: "मी पहिला पर्याय सुचवेन — तो तुमच्या गरजेशी सर्वात चांगला जुळतो.",
    compareIntro:
      "यांपैकी पहिला तुमच्या मागणीसाठी चांगला आहे; दुसरा बजेटसाठी चांगला पर्याय आहे.",
    compareIntroAlt: "दोन्ही पर्यायांमध्ये हा फरक आहे.",
    reasonAroundBudget: "{price} च्या आसपास",
    reasonWithinBudget: "तुमच्या ₹{price} बजेटच्या आत",
    reasonColorMatches: "तुम्ही सांगितलेल्या {color} शी जुळते",
    reasonBrandMatches: "तुम्ही मागितलेल्या {brand} ब्रँडशी जुळते",
    reasonBigDiscount: "MRP वर {discount}% सूट",
    reasonTopMatch: "तुमच्या मागणीसाठी सर्वोत्तम जुळणी",
    comparePrice: "किंमत: ₹{first} आणि ₹{second}",
    compareCategory: "श्रेणी: {first} आणि {second}",
    compareVerdict: "बजेट पर्याय **{title}** आहे — ₹{price} मध्ये.",
    topPick: "मी **{title}** सुचवतो — {reason}.",
    recommendList: "तुमच्यासाठी या सर्वोत्तम जुळण्या आहेत:",
    giftIntro: "काही चांगल्या भेटवस्तू सूचना आहेत:",
    shoppingNoResult: "\"{query}\" साठी सध्या कोणतेही उत्पादन सापडले नाही. {suggestion}",
    noMoreOptions: "फक्त एवढेच पर्याय आहेत. {suggestion}",
    cartAddDone: "झाले! **{title}** तुमच्या कार्टमध्ये जोडले.",
    cartAddFailedNotFound: "मला ते उत्पादन सापडले नाही.",
    cartAddFailedStock: "क्षमस्व, **{title}** आत्ता स्टॉकमध्ये नाही.",
    cartAddFailedQuantity: "कृपया एक वैध संख्या निवडा.",
    cartUpdateDone: "झाले! संख्या {quantity} केली आहे.",
    cartRemoveDone: "झाले! उत्पादन कार्टमधून काढले.",
    cartView: "तुमच्या कार्टमध्ये या वस्तू आहेत.",
    cartEmpty: "तुमचे कार्ट आत्ता रिकामे आहे.",
    loginRequiredAdd: "कार्टमध्ये उत्पादन जोडण्यासाठी आधी लॉगिन करा.",
    loginRequiredView: "कार्ट दाखवण्यासाठी आधी लॉगिन करा.",
    clarifyProduct: "तुमचा अर्थ कोणता उत्पादन आहे — पहिला की दुसरा?",
    invalidAction: "क्षमस्व, मी ही क्रिया करू शकत नाही.",
    unsupported: "क्षमस्व, मी हे करू शकत नाही. मी उत्पादने शोधण्यात आणि कार्ट व्यवस्थापित करण्यात मदत करू शकतो.",
    notFound: "मला ते उत्पादन सापडले नाही.",
    detail: "**{title}** ची माहिती: किंमत ₹{price}, {stock} युनिट्स स्टॉकमध्ये.",
    detailShort: "**{title}** ची किंमत ₹{price} आहे.",
    quantityInvalid: "कृपया एक वैध संख्या निवडा.",
    noBudgetRefine: "समजले. ₹{price} च्या आत हे पर्याय आहेत.",
    ackRefine: "समजले.",
    orderLoginRequired: "लॉगिन आवश्यक: तुमच्या ऑर्डर इतिहासाचा सुरक्षित मागोवा घेण्यासाठी प्रथम खात्यात प्रमाणित करा.",
    orderEmpty: "मी तुमचा खाते इतिहास तपासला आणि प्रोफाइलवर कोणताही ऑर्डर आढळला नाही. खरेदी सुरू करा, मी मागोवा घेण्यास मदत करेन!",
    orderFound: "तुमचे सर्वात अलीकडील {count} ऑर्डर हे आहेत:",
    noCategories: "क्षमस्व, आमच्या सिस्टीममध्ये आत्ता कोणतीही श्रेणी उपलब्ध नाही. कृपया नंतर तपासा!",
    categoryPrompt: "छान! एक्सप्लोर करण्यासाठी या काही लोकप्रिय शॉपिंग श्रेणी आहेत:",
    categoryPickHint: "कृपया त्या श्रेणीचा क्रमांक उत्तर द्या (1, 2, किंवा 3), जसे \"1\" किंवा \"category 2\".",
    categoryProducts: "**{name}** श्रेणीतील सर्वोत्तम उत्पादने ही आहेत:",
    categoryEmpty: "मला **{name}** श्रेणी सापडली, पण दुर्दैवाने आत्ता त्यात कोणतेही उत्पादन उपलब्ध नाही. तुम्ही दुसरी श्रेणी पाहू इच्छिता का?",
    categoryOutOfRange: "ही श्रेणी संख्या मर्यादेबाहेर आहे. कृपया 1 ते {max} निवडा.",
    cartEmptySuggest: "तुम्हाला आमच्या नवीनतम कॅटलॉगमधून काही उत्पादन सूचना हव्यात का?",
    searchActions: "एखादे उत्पादन तपशिलात पाहायचे असेल किंवा कार्टमध्ये जोडायचे असेल तर सांगा.",
    selectionOutOfRange: "मला फक्त {count} पर्याय {s} मिळाले. सूचीबद्ध पर्यायांपैकी एक निवडा, किंवा पुन्हा शोधा.",
    askWhichProduct: "तुम्ही कोणते उत्पादन जोडू इच्छिता? \"पहिले\" किंवा त्याचे नाव सांगू शकता.",
    detailNotFound: "हे उत्पादन मला सध्याच्या सार्वजनिक कॅटलॉगमध्ये सापडले नाही. कदाचित ते काढले गेले असेल किंवा अद्याप विक्रीसाठी उपलब्ध नसेल.",
    detailAddPrompt: "ही प्रमाणित कॅटलॉग वस्तू तुमच्या कार्टमध्ये जोडू का?",
    quantityTooLarge: "संख्या {max} पेक्षा जास्त असू शकत नाही.",
    stockLimit: "आत्ता स्टॉकमध्ये फक्त {count} युनिट्स उपलब्ध आहेत.",
    cartItemNotFound: "ती वस्तू मला तुमच्या कार्टमध्ये सापडली नाही.",
    cartError: "मी ही कार्ट क्रिया करू शकलो नाही. कृपया पुन्हा प्रयत्न करा.",
  },
  [LANG.BN]: {
    greeting: "নমস্কার! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    thanks: "স্বাগতম! আর কিছু সাহায্য চাই?",
    bye: "বিদায়! শুভ কেনাকাটা।",
    capability:
      "আমি পণ্য খুঁজতে, বিকল্প তুলনা করতে, কার্ট দেখতে এবং লগইন করলে আইটেম যোগ/মুছে ফেলতে সাহায্য করতে পারি।",
    identity: "আমি AI Knots Marketplace সহায়ক। আমি পণ্য খোঁজা এবং কার্ট পরিচালনায় সাহায্য করতে পারি।",
    offTopic:
      "আমি এখন {topic} দেখতে পারছি না, তবে আমি পণ্য, পরামর্শ এবং আপনার কার্টে সাহায্য করতে পারি।",
    budgetQuestion: "ঠিক আছে। আপনার বাজেট কত?",
    searchFound: '"{query}" এর জন্য আমি {count}টি মিলে যাওয়া বিকল্প{s} পেয়েছি।',
    searchEmpty:
      "আমি এই অনুসন্ধানের জন্য কোনো পণ্য পাইনি। অন্য কিছু খুঁজুন, বা বিভাগ দেখতে বলুন।",
    recommendIntro: "আমি প্রথম বিকল্পটি সুপারিশ করব — এটি আপনার চাহিদার সঙ্গে সবচেয়ে ভালো মেলে।",
    compareIntro:
      "এই দুটির মধ্যে প্রথমটি আপনার জন্য ভালো; দ্বিতীয়টি বাজেটের জন্য ভালো বিকল্প।",
    compareIntroAlt: "দুটির মধ্যে এই পার্থক্য।",
    reasonAroundBudget: "{price} এর কাছাকাছি",
    reasonWithinBudget: "আপনার ₹{price} বাজেটের মধ্যে",
    reasonColorMatches: "আপনার বলা {color} এর সাথে মেলে",
    reasonBrandMatches: "আপনার চাওয়া {brand} ব্র্যান্ডের সাথে মেলে",
    reasonBigDiscount: "MRP-তে {discount}% ছাড়",
    reasonTopMatch: "আপনার অনুরোধের জন্য সবচেয়ে ভালো মিল",
    comparePrice: "দাম: ₹{first} এবং ₹{second}",
    compareCategory: "বিভাগ: {first} এবং {second}",
    compareVerdict: "বাজেট অপশন **{title}** — ₹{price} এ।",
    topPick: "আমি **{title}** সুপারিশ করব — {reason}।",
    recommendList: "আপনার জন্য এই সেরা ম্যাচগুলো:",
    giftIntro: "কিছু ভালো উপহারের পরামর্শ:",
    shoppingNoResult: "\"{query}\" এর জন্য এখন কোনো পণ্য পাওয়া যায়নি। {suggestion}",
    noMoreOptions: "এতগুলোই শেষ বিকল্প। {suggestion}",
    cartAddDone: "হয়ে গেছে! **{title}** আপনার কার্টে যোগ হয়েছে।",
    cartAddFailedNotFound: "আমি সেই পণ্যটি পাইনি।",
    cartAddFailedStock: "দুঃখিত, **{title}** এখন স্টকে নেই।",
    cartAddFailedQuantity: "অনুগ্রহ করে একটি সঠিক সংখ্যা বেছে নিন।",
    cartUpdateDone: "হয়ে গেছে! সংখ্যা {quantity} করা হয়েছে।",
    cartRemoveDone: "হয়ে গেছে! পণ্যটি কার্ট থেকে সরানো হয়েছে।",
    cartView: "আপনার কার্টে এই আইটেমগুলো আছে।",
    cartEmpty: "আপনার কার্ট এখন খালি।",
    loginRequiredAdd: "কার্টে পণ্য যোগ করতে প্রথমে লগইন করুন।",
    loginRequiredView: "কার্ট দেখাতে প্রথমে লগইন করুন।",
    clarifyProduct: "আপনার মানে কোন পণ্য — প্রথমটি না দ্বিতীয়টি?",
    invalidAction: "দুঃখিত, আমি এই কাজটি করতে পারছি না।",
    unsupported: "দুঃখিত, আমি এটি করতে পারছি না। আমি পণ্য খোঁজা এবং কার্ট পরিচালনায় সাহায্য করতে পারি।",
    notFound: "আমি সেই পণ্যটি পাইনি।",
    detail: "**{title}** এর তথ্য: দাম ₹{price}, {stock} ইউনিট স্টকে।",
    detailShort: "**{title}** এর দাম ₹{price}।",
    quantityInvalid: "অনুগ্রহ করে একটি সঠিক সংখ্যা বেছে নিন।",
    noBudgetRefine: "বুঝেছি। ₹{price} এর মধ্যে এই বিকল্পগুলো।",
    ackRefine: "বুঝেছি।",
    orderLoginRequired: "লগইন প্রয়োজন: আপনার অর্ডার ইতিহাস নিরাপদে ট্র্যাক করতে প্রথমে আপনার অ্যাকাউন্টে প্রমাণীকরণ করুন।",
    orderEmpty: "আমি আপনার অ্যাকাউন্টের ইতিহাস পরীক্ষা করেছি এবং আপনার প্রোফাইলে কোনো অর্ডার পাইনি। শপিং শুরু করুন, আমি ট্র্যাক করতে সাহায্য করব!",
    orderFound: "আপনার সাম্প্রতিক {count}টি অর্ডার নিচে দেওয়া হল:",
    noCategories: "দুঃখিত, আমাদের সিস্টেমে এখন কোনো বিভাগ নেই। অনুগ্রহ করে পরে দেখুন!",
    categoryPrompt: "দারুণ! দেখার জন্য এই কিছু জনপ্রিয় শপিং বিভাগ:",
    categoryPickHint: "অনুগ্রহ করে সেই বিভাগের নম্বর উত্তর দিন (1, 2, বা 3), যেমন \"1\" বা \"category 2\"।",
    categoryProducts: "**{name}** বিভাগের সেরা পণ্যগুলি এই:",
    categoryEmpty: "আমি **{name}** বিভাগ পেয়েছি, কিন্তু দুর্ভাগ্যবশত এতে আপাতত কোনো পণ্য নেই। আপনি কি অন্য বিভাগ দেখতে চান?",
    categoryOutOfRange: "বিভাগ নম্বরটি সীমার বাইরে। অনুগ্রহ করে 1 থেকে {max} পর্যন্ত বেছে নিন।",
    cartEmptySuggest: "আপনি কি আমাদের সর্বশেষ ক্যাটালগ থেকে কিছু পণ্য পরামর্শ চান?",
    searchActions: "আমাকে জানান যদি আপনি একটি বিস্তারিত দেখতে চান বা কার্টে যোগ করতে চান।",
    selectionOutOfRange: "আমি শুধু {count}টি বিকল্প {s} পেয়েছি। তালিকাভুক্ত যেকোনো একটি বেছে নিন, অথবা আবার খুঁজুন।",
    askWhichProduct: "আপনি কোন পণ্যটি যোগ করতে চান? \"প্রথমটি\" বা তার নাম বলতে পারেন।",
    detailNotFound: "আমি বর্তমান পাবলিক ক্যাটালগে এই পণ্যটি পাইনি। সম্ভবত এটি সরিয়ে দেওয়া হয়েছে বা এখনও বিক্রির জন্য প্রস্তুত নয়।",
    detailAddPrompt: "আমি কি এই যাচাইকৃত ক্যাটালগ আইটেমটি আপনার কার্টে যোগ করব?",
    quantityTooLarge: "সংখ্যা {max} এর বেশি হতে পারে না।",
    stockLimit: "এখন স্টকে শুধুমাত্র {count} ইউনিট রয়েছে।",
    cartItemNotFound: "আমি আপনার কার্টে সেই আইটেমটি পাইনি।",
    cartError: "আমি এই কার্ট কাজটি করতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
  },
  [LANG.GU]: {
    greeting: "નમસ્તે! આજે હું તમારી કેવી રીતે મદદ કરી શકું?",
    thanks: "સ્વાગત છે! બીજું કંઈ જોઈએ છે?",
    bye: "આવજો! ખુશ ખરીદી.",
    capability:
      "હું ઉત્પાદનો શોધવા, વિકલ્પો સરખાવવા, કાર્ટ જોવા અને લોગિન થયા પછી આઇટમ ઉમેરવા/કાઢવામાં મદદ કરી શકું છું.",
    identity: "હું AI Knots Marketplace સહાયક છું. હું ઉત્પાદનો શોધવા અને કાર્ટ સંચાલનમાં મદદ કરી શકું છું.",
    offTopic:
      "હું હમણાં {topic} ચકાસી શકતો નથી, પણ હું ઉત્પાદનો, સૂચનો અને તમારા કાર્ટમાં મદદ કરી શકું છું.",
    budgetQuestion: "ઠીક છે. તમારું બજેટ કેટલું છે?",
    searchFound: '"{query}" માટે મને {count} મળતા વિકલ્પ{s} મળ્યા.',
    searchEmpty:
      "મને આ શોધ માટે કોઈ ઉત્પાદન નથી મળ્યું. બીજી શોધ કરો, અથવા શ્રેણીઓ જોવા માટે પૂછો.",
    recommendIntro: "હું પહેલો વિકલ્પ સૂચવીશ — તે તમારી જરૂરિયાત સાથે સૌથી સારો મેળ ખાય છે.",
    compareIntro:
      "આ બંનેમાંથી પહેલો તમારી માંગ માટે સારો છે; બીજો બજેટ માટે સારો વિકલ્પ છે.",
    compareIntroAlt: "બંને વિકલ્પોમાં આ ફરક છે.",
    reasonAroundBudget: "{price} ની આસપાસ",
    reasonWithinBudget: "તમારા ₹{price} બજેટની અંદર",
    reasonColorMatches: "તમે કહ્યું તે {color} સાથે મેળ ખાય છે",
    reasonBrandMatches: "તમે માંગેલા {brand} બ્રાંડ સાથે મેળ",
    reasonBigDiscount: "MRP પર {discount}% છૂટ",
    reasonTopMatch: "તમારી માંગણી માટે શ્રેષ્ઠ મેચ",
    comparePrice: "કિંમત: ₹{first} અને ₹{second}",
    compareCategory: "શ્રેણી: {first} અને {second}",
    compareVerdict: "બજેટ વિકલ્પ **{title}** છે — ₹{price} માં.",
    topPick: "હું **{title}** સૂચવીશ — {reason}.",
    recommendList: "તમારા માટે આ શ્રેષ્ઠ મેચો છે:",
    giftIntro: "કેટલાં સરસ ગિફ્ટ સૂચનો:",
    shoppingNoResult: "\"{query}\" માટે હાલ કોઈ ઉત્પાદન મળ્યું નથી. {suggestion}",
    noMoreOptions: "ફક્ત આટલા વિકલ્પો છે. {suggestion}",
    cartAddDone: "થઈ ગયું! **{title}** તમારા કાર્ટમાં ઉમેરાયું.",
    cartAddFailedNotFound: "મને તે ઉત્પાદન નથી મળ્યું.",
    cartAddFailedStock: "માફ કરશો, **{title}** હમણાં સ્ટોકમાં નથી.",
    cartAddFailedQuantity: "કૃપા કરીને માન્ય સંખ્યા પસંદ કરો.",
    cartUpdateDone: "થઈ ગયું! સંખ્યા {quantity} કરી દીધી.",
    cartRemoveDone: "થઈ ગયું! ઉત્પાદન કાર્ટમાંથી કાઢી નાખ્યું.",
    cartView: "તમારા કાર્ટમાં આ આઇટમ છે.",
    cartEmpty: "તમારું કાર્ટ હમણાં ખાલી છે.",
    loginRequiredAdd: "કાર્ટમાં ઉત્પાદન ઉમેરવા પહેલા લોગિન કરો.",
    loginRequiredView: "કાર્ટ બતાવવા પહેલા લોગિન કરો.",
    clarifyProduct: "તમારો મતલબ કયું ઉત્પાદન છે — પહેલું કે બીજું?",
    invalidAction: "માફ કરશો, હું આ ક્રિયા કરી શકતો નથી.",
    unsupported: "માફ કરશો, હું આ કરી શકતો નથી. હું ઉત્પાદનો શોધવા અને કાર્ટ સંચાલનમાં મદદ કરી શકું છું.",
    notFound: "મને તે ઉત્પાદન નથી મળ્યું.",
    detail: "**{title}** ની માહિતી: કિંમત ₹{price}, {stock} એકમ સ્ટોકમાં.",
    detailShort: "**{title}** ની કિંમત ₹{price} છે.",
    quantityInvalid: "કૃપા કરીને માન્ય સંખ્યા પસંદ કરો.",
    noBudgetRefine: "સમજાયું. ₹{price} ની અંદર આ વિકલ્પો છે.",
    ackRefine: "સમજાયું.",
    orderLoginRequired: "લોગિન જરૂરી: તમારા ઓર્ડર ઇતિહાસને સુરક્ષિત રીતે ટ્રેક કરવા પહેલા તમારા એકાઉન્ટમાં પ્રમાણિત કરો.",
    orderEmpty: "મેં તમારો એકાઉન્ટ ઇતિહાસ તપાસ્યો અને તમારી પ્રોફાઇલ પર કોઈ ઓર્ડર ન મળ્યો. ખરીદી શરૂ કરો, હું ટ્રેક કરવામાં મદદ કરીશ!",
    orderFound: "તમારા સૌથી તાજેતરના {count} ઓર્ડર આ છે:",
    noCategories: "માફ કરશો, અમારી સિસ્ટમમાં હાલ કોઈ શ્રેણી ઉપલબ્ધ નથી. કૃપા કરીને પછી જુઓ!",
    categoryPrompt: "સરસ! જોવા માટે આ કેટલીક લોકપ્રિય શોપિંગ શ્રેણીઓ છે:",
    categoryPickHint: "કૃપા કરીને તે શ્રેણીનો નંબર જવાબ આપો (1, 2, અથવા 3), જેમ કે \"1\" અથવા \"category 2\".",
    categoryProducts: "**{name}** શ્રેણીના ટોચના ઉત્પાદનો આ છે:",
    categoryEmpty: "મને **{name}** શ્રેણી મળી, પણ કમનસીબે હાલ તેમાં કોઈ ઉત્પાદન ઉપલબ્ધ નથી. શું તમે બીજી શ્રેણી જોવા માંગો છો?",
    categoryOutOfRange: "આ શ્રેણી નંબર મર્યાદાની બહાર છે. કૃપા કરીને 1 થી {max} સુધી પસંદ કરો.",
    cartEmptySuggest: "શું તમે અમારા નવીનતમ કેટલોગમાંથી કેટલાક ઉત્પાદન સૂચનો ઇચ્છો છો?",
    searchActions: "જો તમે કોઈને વિગતવાર જોવા માંગતા હો અથવા કાર્ટમાં ઉમેરવા માંગતા હો તો મને જણાવો.",
    selectionOutOfRange: "મને ફક્ત {count} વિકલ્પ {s} મળ્યા. સૂચિબદ્ધમાંથી કોઈ એક પસંદ કરો, અથવા ફરીથી શોધો.",
    askWhichProduct: "તમે કયું ઉત્પાદન ઉમેરવા માંગો છો? તમે \"પહેલું\" અથવા તેનું નામ કહી શકો છો.",
    detailNotFound: "મને આ ઉત્પાદન વર્તમાન જાહેર કેટલોગમાં મળ્યું નથી. કદાચ તે કાઢી નાખવામાં આવ્યું હશે અથવા હજી વેચાણ માટે ઉપલબ્ધ નથી.",
    detailAddPrompt: "શું હું આ ચકાસાયેલ કેટલોગ આઇટમ તમારા કાર્ટમાં ઉમેરું?",
    quantityTooLarge: "સંખ્યા {max} કરતાં વધારે ન હોઈ શકે.",
    stockLimit: "હાલ સ્ટોકમાં ફક્ત {count} એકમ ઉપલબ્ધ છે.",
    cartItemNotFound: "મને તે આઇટમ તમારા કાર્ટમાં મળી નથી.",
    cartError: "હું આ કાર્ટ ક્રિયા કરી શક્યો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
  },
  [LANG.TA]: {
    greeting: "வணக்கம்! இன்று உங்களுக்கு எப்படி உதவ முடியும்?",
    thanks: "வரவேற்கிறேன்! வேறு ஏதாவது உதவி வேண்டுமா?",
    bye: "போய் வருகிறேன்! மகிழ்ச்சியான ஷாப்பிங்.",
    capability:
      "நான் பொருட்களைக் கண்டுபிடிக்க, விருப்பங்களை ஒப்பிட, கார்ட்டைப் பார்க்க, லாகின் ஆகியிருக்கும் போது பொருட்களைச் சேர்க்க/நீக்க உதவ முடியும்.",
    identity: "நான் AI Knots Marketplace உதவியாளர். நான் பொருட்களைத் தேடி கார்ட்டை நிர்வகிக்க உதவ முடியும்.",
    offTopic:
      "நான் இப்போது {topic} சரிபார்க்க முடியாது, ஆனால் பொருட்கள், பரிந்துரைகள் மற்றும் உங்கள் கார்ட்டில் உதவ முடியும்.",
    budgetQuestion: "சரி. உங்கள் பட்ஜெட் என்ன?",
    searchFound: '"{query}"க்கு {count} பொருந்தும் விருப்ப{s} கிடைத்தன.',
    searchEmpty:
      "இந்தத் தேடலுக்கு எந்தப் பொருளும் கிடைக்கவில்லை. வேறு தேடலை முயற்சிக்கவும், அல்லது பிரிவுகளைப் பார்க்கக் கேளுங்கள்.",
    recommendIntro: "நான் முதல் விருப்பத்தைப் பரிந்துரைக்கிறேன் — இது உங்கள் தேவைக்கு மிகவும் பொருந்துகிறது.",
    compareIntro:
      "இவற்றில் முதலாவது உங்கள் கோரிக்கைக்கு சிறந்தது; இரண்டாவது பட்ஜெட்டுக்கு நல்ல விருப்பம்.",
    compareIntroAlt: "இரண்டிற்கும் இடையே இந்த வேறுபாடு.",
    reasonAroundBudget: "{price}க்கு அருகில்",
    reasonWithinBudget: "உங்கள் ₹{price} பட்ஜெட்டுக்குள்",
    reasonColorMatches: "நீங்கள் சொன்ன {color} உடன் பொருந்துகிறது",
    reasonBrandMatches: "நீங்கள் கேட்ட {brand} பிராண்டுடன் பொருந்துகிறது",
    reasonBigDiscount: "MRP-இல் {discount}% தள்ளுபடி",
    reasonTopMatch: "உங்கள் கோரிக்கைக்கு சிறந்த பொருத்தம்",
    comparePrice: "விலை: ₹{first} மற்றும் ₹{second}",
    compareCategory: "வகை: {first} மற்றும் {second}",
    compareVerdict: "பட்ஜெட் விருப்பம் **{title}** — ₹{price}க்கு.",
    topPick: "நான் **{title}** பரிந்துரைக்கிறேன் — {reason}.",
    recommendList: "உங்களுக்கான சிறந்த பொருத்தங்கள் இவை:",
    giftIntro: "சில நல்ல பரிசு பரிந்துரைகள்:",
    shoppingNoResult: "\"{query}\"க்கு இப்போது எந்த தயாரிப்பும் கிடைக்கவில்லை. {suggestion}",
    noMoreOptions: "இவ்வளவுதான் விருப்பங்கள். {suggestion}",
    cartAddDone: "முடிந்தது! **{title}** உங்கள் கார்ட்டில் சேர்க்கப்பட்டது.",
    cartAddFailedNotFound: "அந்தப் பொருளை என்னால் கண்டுபிடிக்க முடியவில்லை.",
    cartAddFailedStock: "மன்னிக்கவும், **{title}** இப்போது ஸ்டாக்கில் இல்லை.",
    cartAddFailedQuantity: "தயவுசெய்து சரியான எண்ணிக்கையைத் தேர்ந்தெடுக்கவும்.",
    cartUpdateDone: "முடிந்தது! எண்ணிக்கை {quantity} ஆக மாற்றப்பட்டது.",
    cartRemoveDone: "முடிந்தது! பொருள் கார்ட்டில் இருந்து நீக்கப்பட்டது.",
    cartView: "உங்கள் கார்ட்டில் இந்தப் பொருட்கள் உள்ளன.",
    cartEmpty: "உங்கள் கார்ட் இப்போது காலியாக உள்ளது.",
    loginRequiredAdd: "கார்ட்டில் சேர்க்க முதலில் லாகின் செய்யவும்.",
    loginRequiredView: "கார்ட் காட்ட முதலில் லாகின் செய்யவும்.",
    clarifyProduct: "உங்கள் கருத்துப்படி எந்தப் பொருள் — முதலாவதா அல்லது இரண்டாவதா?",
    invalidAction: "மன்னிக்கவும், இந்த செயலை என்னால் செய்ய முடியாது.",
    unsupported: "மன்னிக்கவும், இதை என்னால் செய்ய முடியாது. நான் பொருட்களைத் தேடி கார்ட்டை நிர்வகிக்க உதவ முடியும்.",
    notFound: "அந்தப் பொருளை என்னால் கண்டுபிடிக்க முடியவில்லை.",
    detail: "**{title}** தகவல்: விலை ₹{price}, {stock} யூனிட்கள் ஸ்டாக்கில்.",
    detailShort: "**{title}** விலை ₹{price}.",
    quantityInvalid: "தயவுசெய்து சரியான எண்ணிக்கையைத் தேர்ந்தெடுக்கவும்.",
    noBudgetRefine: "புரிந்தது. ₹{price}க்குள் இந்த விருப்பங்கள் உள்ளன.",
    ackRefine: "புரிந்தது.",
    orderLoginRequired: "உள்நுழைவு தேவை: உங்கள் ஆர்டர் வரலாற்றைப் பாதுகாப்பாகக் கண்காணிக்க முதலில் உங்கள் கணக்கில் அங்கீகரிக்கவும்.",
    orderEmpty: "உங்கள் கணக்கு வரலாற்றைச் சரிபார்த்தேன், உங்கள் சுயவிவரத்தில் எந்த ஆர்டரும் இல்லை. ஷாப்பிங் தொடங்குங்கள், நான் கண்காணிக்க உதவுவேன்!",
    orderFound: "உங்கள் சமீபத்திய {count} ஆர்டர்கள் இவை:",
    noCategories: "மன்னிக்கவும், எங்கள் அமைப்பில் தற்போது எந்த வகையும் இல்லை. தயவுசெய்து பின்னர் பார்க்கவும்!",
    categoryPrompt: "அருமை! பார்ப்பதற்கான சில பிரபலமான ஷாப்பிங் வகைகள் இவை:",
    categoryPickHint: "அந்த வகை எண்ணை பதிலளிக்கவும் (1, 2, அல்லது 3), எடுத்துக்காட்டாக \"1\" அல்லது \"category 2\".",
    categoryProducts: "**{name}** வகையின் சிறந்த தயாரிப்புகள் இவை:",
    categoryEmpty: "**{name}** வகையைக் கண்டேன், ஆனால் தற்போது அதில் எந்த தயாரிப்பும் இல்லை. வேறு வகையைப் பார்க்க விரும்புகிறீர்களா?",
    categoryOutOfRange: "இந்த வகை எண் வரம்பிற்கு வெளியே உள்ளது. 1 முதல் {max} வரை தேர்ந்தெடுக்கவும்.",
    cartEmptySuggest: "எங்கள் சமீபத்திய பட்டியலில் இருந்து சில தயாரிப்பு பரிந்துரைகள் வேண்டுமா?",
    searchActions: "ஒன்றை விவரமாகப் பார்க்க அல்லது கார்ட்டில் சேர்க்க விரும்பினால் எனக்குத் தெரியப்படுத்துங்கள்.",
    selectionOutOfRange: "எனக்கு {count} விருப்பங்கள் {s} மட்டுமே கிடைத்தன. பட்டியலில் உள்ளவற்றில் ஒன்றைத் தேர்ந்தெடுக்கவும், அல்லது மீண்டும் தேடவும்.",
    askWhichProduct: "எந்த தயாரிப்பைச் சேர்க்க விரும்புகிறீர்கள்? \"முதலாவது\" அல்லது அதன் பெயரைச் சொல்லலாம்.",
    detailNotFound: "தற்போதைய பொது பட்டியலில் இந்த தயாரிப்பை என்னால் கண்டுபிடிக்க முடியவில்லை. அது நீக்கப்பட்டிருக்கலாம் அல்லது இன்னும் விற்பனைக்கு இல்லை.",
    detailAddPrompt: "இந்த சரிபார்க்கப்பட்ட பட்டியல் பொருளை உங்கள் கார்ட்டில் சேர்க்கட்டுமா?",
    quantityTooLarge: "எண்ணிக்கை {max} ஐ விட அதிகமாக இருக்க முடியாது.",
    stockLimit: "இப்போது ஸ்டாக்கில் {count} யூனிட்கள் மட்டுமே உள்ளன.",
    cartItemNotFound: "உங்கள் கார்ட்டில் அந்த பொருளை என்னால் கண்டுபிடிக்க முடியவில்லை.",
    cartError: "இந்த கார்ட் செயலை என்னால் செய்ய முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
  },
  [LANG.TE]: {
    greeting: "నమస్కారం! ఈరోజు మీకు ఎలా సహాయం చేయగలను?",
    thanks: "స్వాగతం! ఇంకేమైనా సహాయం కావాలా?",
    bye: "వెళ్ళి వస్తాను! ఆనందకరమైన షాపింగ్.",
    capability:
      "నేను ఉత్పత్తులను కనుగొనడం, ఎంపికలను పోల్చడం, కార్ట్ చూడడం మరియు లాగిన్ అయినప్పుడు వస్తువులను జోడించడం/తొలగించడంలో సహాయం చేయగలను.",
    identity: "నేను AI Knots Marketplace అసిస్టెంట్. నేను ఉత్పత్తులను వెతకడానికి మరియు కార్ట్ నిర్వహణకు సహాయం చేయగలను.",
    offTopic:
      "నేను ప్రస్తుతం {topic} తనిఖీ చేయలేను, కానీ ఉత్పత్తులు, సూచనలు మరియు మీ కార్ట్లో సహాయం చేయగలను.",
    budgetQuestion: "సరే. మీ బడ్జెట్ ఎంత?",
    searchFound: '"{query}" కోసం {count} సరిపోయే ఎంపిక{s} దొరికాయి.',
    searchEmpty:
      "ఈ శోధనకు ఎలాంటి ఉత్పత్తి దొరకలేదు. వేరే శోధన ప్రయత్నించండి, లేదా వర్గాలను చూడమని అడగండి.",
    recommendIntro: "నేను మొదటి ఎంపికను సిఫార్సు చేస్తాను — ఇది మీ అవసరానికి బాగా సరిపోతుంది.",
    compareIntro:
      "వీటిలో మొదటిది మీ అభ్యర్థనకు మంచిది; రెండవది బడ్జెట్ కోసం మంచి ఎంపిక.",
    compareIntroAlt: "ఈ రెండింటి మధ్య ఈ తేడా ఉంది.",
    reasonAroundBudget: "{price} దగ్గర",
    reasonWithinBudget: "మీ ₹{price} బడ్జెట్ లోపల",
    reasonColorMatches: "మీరు చెప్పిన {color}తో సరిపోతుంది",
    reasonBrandMatches: "మీరు కోరిన {brand} బ్రాండ్తో సరిపోతుంది",
    reasonBigDiscount: "MRPపై {discount}% తగ్గింపు",
    reasonTopMatch: "మీ అభ్యర్థనకు ఉత్తమ మ్యాచ్",
    comparePrice: "ధర: ₹{first} మరియు ₹{second}",
    compareCategory: "వర్గం: {first} మరియు {second}",
    compareVerdict: "బడ్జెట్ ఎంపిక **{title}** — ₹{price}కి.",
    topPick: "నేను **{title}** సిఫార్సు చేస్తున్నాను — {reason}.",
    recommendList: "మీ కోసం ఈ ఉత్తమ మ్యాచ్లు ఉన్నాయి:",
    giftIntro: "కొన్ని మంచి బహుమతి సూచనలు:",
    shoppingNoResult: "\"{query}\" కోసం ప్రస్తుతం ఏ ఉత్పత్తీ లేదు. {suggestion}",
    noMoreOptions: "ఇన్నే ఎంపికలు ఉన్నాయి. {suggestion}",
    cartAddDone: "అయిపోయింది! **{title}** మీ కార్ట్కు జోడించబడింది.",
    cartAddFailedNotFound: "ఆ ఉత్పత్తి నాకు దొరకలేదు.",
    cartAddFailedStock: "క్షమించండి, **{title}** ప్రస్తుతం స్టాక్లో లేదు.",
    cartAddFailedQuantity: "దయచేసి చెల్లుబాటు అయ్యే సంఖ్యను ఎంచుకోండి.",
    cartUpdateDone: "అయిపోయింది! సంఖ్య {quantity}కి మార్చబడింది.",
    cartRemoveDone: "అయిపోయింది! ఉత్పత్తి కార్ట్ నుండి తీసివేయబడింది.",
    cartView: "మీ కార్ట్లో ఈ వస్తువులు ఉన్నాయి.",
    cartEmpty: "మీ కార్ట్ ప్రస్తుతం ఖాళీగా ఉంది.",
    loginRequiredAdd: "కార్ట్కు జోడించడానికి ముందు లాగిన్ చేయండి.",
    loginRequiredView: "కార్ట్ చూపించడానికి ముందు లాగిన్ చేయండి.",
    clarifyProduct: "మీ ఉద్దేశ్యం ఏ ఉత్పత్తి — మొదటిదా లేదా రెండవదా?",
    invalidAction: "క్షమించండి, నేను ఈ చర్య చేయలేను.",
    unsupported: "క్షమించండి, నేను దీన్ని చేయలేను. నేను ఉత్పత్తులను వెతకడానికి మరియు కార్ట్ నిర్వహణకు సహాయం చేయగలను.",
    notFound: "ఆ ఉత్పత్తి నాకు దొరకలేదు.",
    detail: "**{title}** సమాచారం: ధర ₹{price}, {stock} యూనిట్లు స్టాక్లో.",
    detailShort: "**{title}** ధర ₹{price}.",
    quantityInvalid: "దయచేసి చెల్లుబాటు అయ్యే సంఖ్యను ఎంచుకోండి.",
    noBudgetRefine: "అర్థమైంది. ₹{price} లోపు ఈ ఎంపికలు ఉన్నాయి.",
    ackRefine: "అర్థమైంది.",
    orderLoginRequired: "లాగిన్ అవసరం: మీ ఆర్డర్ చరిత్రను సురక్షితంగా ట్రాక్ చేయడానికి ముందుగా మీ ఖాతాలో ధృవీకరించండి.",
    orderEmpty: "మీ ఖాతా చరిత్రను తనిఖీ చేశాను, మీ ప్రొఫైల్లో ఎలాంటి ఆర్డర్ లేదు. షాపింగ్ ప్రారంభించండి, నేను ట్రాక్ చేయడంలో సహాయం చేస్తాను!",
    orderFound: "మీ ఇటీవలి {count} ఆర్డర్లు ఇవి:",
    noCategories: "క్షమించండి, మా సిస్టమ్లో ప్రస్తుతం ఎలాంటి వర్గం లేదు. దయచేసి తర్వాత చూడండి!",
    categoryPrompt: "బాగుంది! చూడడానికి కొన్ని ప్రముఖ షాపింగ్ వర్గాలు ఇవి:",
    categoryPickHint: "దయచేసి ఆ వర్గం సంఖ్యకు సమాధానం ఇవ్వండి (1, 2, లేదా 3), ఉదా \"1\" లేదా \"category 2\".",
    categoryProducts: "**{name}** వర్గంలోని టాప్ ఉత్పత్తులు ఇవి:",
    categoryEmpty: "**{name}** వర్గం దొరికింది, కానీ ప్రస్తుతం అందులో ఎలాంటి ఉత్పత్తి లేదు. మరో వర్గాన్ని చూడాలనుకుంటున్నారా?",
    categoryOutOfRange: "ఈ వర్గం సంఖ్య పరిధికి వెలుపల ఉంది. 1 నుండి {max} వరకు ఎంచుకోండి.",
    cartEmptySuggest: "మా తాజా కేటలాగ్ నుండి కొన్ని ఉత్పత్తి సూచనలు కావాలా?",
    searchActions: "దేనినైనా వివరంగా చూడాలనుకుంటే లేదా కార్ట్కు జోడించాలనుకుంటే నాకు తెలియజేయండి.",
    selectionOutOfRange: "నాకు {count} ఎంపికలు {s} మాత్రమే దొరికాయి. జాబితా చేయబడిన వాటిలో ఒకదాన్ని ఎంచుకోండి, లేదా మళ్లీ శోధించండి.",
    askWhichProduct: "మీరు ఏ ఉత్పత్తిని జోడించాలనుకుంటున్నారు? \"మొదటిది\" లేదా దాని పేరు చెప్పవచ్చు.",
    detailNotFound: "ప్రస్తుత పబ్లిక్ కేటలాగ్లో ఈ ఉత్పత్తి నాకు దొరకలేదు. బహుశా అది తీసివేయబడి ఉండవచ్చు లేదా ఇంకా అమ్మకానికి అందుబాటులో లేదు.",
    detailAddPrompt: "ఈ ధృవీకరించిన కేటలాగ్ వస్తువును మీ కార్ట్కు జోడించాలా?",
    quantityTooLarge: "సంఖ్య {max} కంటే ఎక్కువ ఉండకూడదు.",
    stockLimit: "ప్రస్తుతం స్టాక్లో {count} యూనిట్లు మాత్రమే ఉన్నాయి.",
    cartItemNotFound: "మీ కార్ట్లో ఆ వస్తువు నాకు దొరకలేదు.",
    cartError: "ఈ కార్ట్ చర్య నేను చేయలేకపోయాను. దయచేసి మళ్ళీ ప్రయత్నించండి.",
  },
  [LANG.KN]: {
    greeting: "ನಮಸ್ಕಾರ! ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    thanks: "ಸ್ವಾಗತ! ಬೇರೆ ಏನಾದರೂ ಸಹಾಯ ಬೇಕೇ?",
    bye: "ಹೋಗಿ ಬರುತ್ತೇನೆ! ಸಂತೋಷದ ಶಾಪಿಂಗ್.",
    capability:
      "ನಾನು ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು, ಆಯ್ಕೆಗಳನ್ನು ಹೋಲಿಸಲು, ಕಾರ್ಟ್ ನೋಡಲು ಮತ್ತು ಲಾಗಿನ್ ಆಗಿದ್ದಾಗ ವಸ್ತುಗಳನ್ನು ಸೇರಿಸಲು/ತೆಗೆಯಲು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    identity: "ನಾನು AI Knots Marketplace ಸಹಾಯಕ. ನಾನು ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಮತ್ತು ಕಾರ್ಟ್ ನಿರ್ವಹಣೆಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    offTopic:
      "ನಾನು ಈಗ {topic} ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ, ಆದರೆ ಉತ್ಪನ್ನಗಳು, ಸಲಹೆಗಳು ಮತ್ತು ನಿಮ್ಮ ಕಾರ್ಟ್ನಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    budgetQuestion: "ಸರಿ. ನಿಮ್ಮ ಬಜೆಟ್ ಎಷ್ಟು?",
    searchFound: '"{query}"ಗಾಗಿ {count} ಹೊಂದಾಣಿಕೆಯ ಆಯ್ಕೆ{s} ಸಿಕ್ಕವು.',
    searchEmpty:
      "ಈ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲ. ಬೇರೆ ಹುಡುಕಾಟ ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ವರ್ಗಗಳನ್ನು ನೋಡಲು ಕೇಳಿ.",
    recommendIntro: "ನಾನು ಮೊದಲ ಆಯ್ಕೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ — ಇದು ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ಉತ್ತಮವಾಗಿ ಹೊಂದುತ್ತದೆ.",
    compareIntro:
      "ಇವುಗಳಲ್ಲಿ ಮೊದಲನೆಯದು ನಿಮ್ಮ ವಿನಂತಿಗೆ ಉತ್ತಮ; ಎರಡನೆಯದು ಬಜೆಟ್ಗೆ ಉತ್ತಮ ಆಯ್ಕೆ.",
    compareIntroAlt: "ಎರಡರ ನಡುವಿನ ವ್ಯತ್ಯಾಸ ಇದು.",
    reasonAroundBudget: "{price} ಸುಮಾರಿಗೆ",
    reasonWithinBudget: "ನಿಮ್ಮ ₹{price} ಬಜೆಟ್ ಒಳಗೆ",
    reasonColorMatches: "ನೀವು ಹೇಳಿದ {color} ಜೊತೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ",
    reasonBrandMatches: "ನೀವು ಕೇಳಿದ {brand} ಬ್ರ್ಯಾಂಡ್ ಜೊತೆ ಹೊಂದುತ್ತದೆ",
    reasonBigDiscount: "MRP ಮೇಲೆ {discount}% ರಿಯಾಯಿತಿ",
    reasonTopMatch: "ನಿಮ್ಮ ವಿನಂತಿಗೆ ಉತ್ತಮ ಹೊಂದಾಣಿಕೆ",
    comparePrice: "ಬೆಲೆ: ₹{first} ಮತ್ತು ₹{second}",
    compareCategory: "ವರ್ಗ: {first} ಮತ್ತು {second}",
    compareVerdict: "ಬಜೆಟ್ ಆಯ್ಕೆ **{title}** — ₹{price}ಗೆ.",
    topPick: "ನಾನು **{title}** ಸಿಫಾರಸು ಮಾಡುತ್ತೇನೆ — {reason}.",
    recommendList: "ನಿಮಗಾಗಿ ಈ ಉತ್ತಮ ಹೊಂದಾಣಿಕೆಗಳು ಇವೆ:",
    giftIntro: "ಕೆಲವು ಒಳ್ಳೆಯ ಗಿಫ್ಟ್ ಸೂಚನೆಗಳು:",
    shoppingNoResult: "\"{query}\" ಗಾಗಿ ಇದೀಗ ಯಾವುದೇ ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲ. {suggestion}",
    noMoreOptions: "ಇಷ್ಟೇ ಆಯ್ಕೆಗಳಿವೆ. {suggestion}",
    cartAddDone: "ಆಯಿತು! **{title}** ನಿಮ್ಮ ಕಾರ್ಟ್ಗೆ ಸೇರಿಸಲಾಗಿದೆ.",
    cartAddFailedNotFound: "ಆ ಉತ್ಪನ್ನ ನನಗೆ ಸಿಗಲಿಲ್ಲ.",
    cartAddFailedStock: "ಕ್ಷಮಿಸಿ, **{title}** ಈಗ ಸ್ಟಾಕ್ನಲ್ಲಿ ಇಲ್ಲ.",
    cartAddFailedQuantity: "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಸಂಖ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    cartUpdateDone: "ಆಯಿತು! ಸಂಖ್ಯೆಯನ್ನು {quantity} ಮಾಡಲಾಗಿದೆ.",
    cartRemoveDone: "ಆಯಿತು! ಉತ್ಪನ್ನವನ್ನು ಕಾರ್ಟ್ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.",
    cartView: "ನಿಮ್ಮ ಕಾರ್ಟ್ನಲ್ಲಿ ಈ ವಸ್ತುಗಳಿವೆ.",
    cartEmpty: "ನಿಮ್ಮ ಕಾರ್ಟ್ ಈಗ ಖಾಲಿಯಾಗಿದೆ.",
    loginRequiredAdd: "ಕಾರ್ಟ್ಗೆ ಸೇರಿಸಲು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ.",
    loginRequiredView: "ಕಾರ್ಟ್ ತೋರಿಸಲು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ.",
    clarifyProduct: "ನಿಮ್ಮ ಅಭಿಪ್ರಾಯದಲ್ಲಿ ಯಾವ ಉತ್ಪನ್ನ — ಮೊದಲನೆಯದಾ ಅಥವಾ ಎರಡನೆಯದಾ?",
    invalidAction: "ಕ್ಷಮಿಸಿ, ಈ ಕ್ರಿಯೆಯನ್ನು ನಾನು ಮಾಡಲಾರೆ.",
    unsupported: "ಕ್ಷಮಿಸಿ, ಇದನ್ನು ನಾನು ಮಾಡಲಾರೆ. ನಾನು ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಲು ಮತ್ತು ಕಾರ್ಟ್ ನಿರ್ವಹಣೆಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    notFound: "ಆ ಉತ್ಪನ್ನ ನನಗೆ ಸಿಗಲಿಲ್ಲ.",
    detail: "**{title}** ಮಾಹಿತಿ: ಬೆಲೆ ₹{price}, {stock} ಯೂನಿಟ್ಗಳು ಸ್ಟಾಕ್ನಲ್ಲಿ.",
    detailShort: "**{title}** ಬೆಲೆ ₹{price}.",
    quantityInvalid: "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಸಂಖ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    noBudgetRefine: "ಅರ್ಥವಾಯಿತು. ₹{price} ಒಳಗೆ ಈ ಆಯ್ಕೆಗಳಿವೆ.",
    ackRefine: "ಅರ್ಥವಾಯಿತು.",
    orderLoginRequired: "ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ: ನಿಮ್ಮ ಆರ್ಡರ್ ಇತಿಹಾಸವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮೊದಲು ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ದೃಢೀಕರಿಸಿ.",
    orderEmpty: "ನಿಮ್ಮ ಖಾತೆ ಇತಿಹಾಸವನ್ನು ಪರಿಶೀಲಿಸಿದೆ, ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ನಲ್ಲಿ ಯಾವುದೇ ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ. ಶಾಪಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ, ನಾನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ!",
    orderFound: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ {count} ಆರ್ಡರ್ಗಳು ಇವು:",
    noCategories: "ಕ್ಷಮಿಸಿ, ನಮ್ಮ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ಈಗ ಯಾವುದೇ ವರ್ಗ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ನೋಡಿ!",
    categoryPrompt: "ಉತ್ತಮ! ನೋಡಲು ಕೆಲವು ಜನಪ್ರಿಯ ಶಾಪಿಂಗ್ ವರ್ಗಗಳು ಇವು:",
    categoryPickHint: "ದಯವಿಟ್ಟು ಆ ವರ್ಗದ ಸಂಖ್ಯೆಗೆ ಉತ್ತರಿಸಿ (1, 2, ಅಥವಾ 3), ಉದಾ \"1\" ಅಥವಾ \"category 2\".",
    categoryProducts: "**{name}** ವರ್ಗದ ಅಗ್ರ ಉತ್ಪನ್ನಗಳು ಇವು:",
    categoryEmpty: "**{name}** ವರ್ಗ ಸಿಕ್ಕಿತು, ಆದರೆ ದುರದೃಷ್ಟವಶಾತ್ ಈಗ ಅದರಲ್ಲಿ ಯಾವುದೇ ಉತ್ಪನ್ನ ಲಭ್ಯವಿಲ್ಲ. ಮತ್ತೊಂದು ವರ್ಗ ನೋಡಲು ಬಯಸುತ್ತೀರಾ?",
    categoryOutOfRange: "ಈ ವರ್ಗ ಸಂಖ್ಯೆ ವ್ಯಾಪ್ತಿಯಿಂದ ಹೊರಗಿದೆ. ದಯವಿಟ್ಟು 1 ರಿಂದ {max} ವರೆಗೆ ಆಯ್ಕೆಮಾಡಿ.",
    cartEmptySuggest: "ನಮ್ಮ ಇತ್ತೀಚಿನ ಕ್ಯಾಟಲಾಗ್ನಿಂದ ಕೆಲವು ಉತ್ಪನ್ನ ಸಲಹೆಗಳನ್ನು ಬಯಸುತ್ತೀರಾ?",
    searchActions: "ಯಾವುದನ್ನಾದರೂ ವಿವರವಾಗಿ ನೋಡಲು ಅಥವಾ ಕಾರ್ಟ್ಗೆ ಸೇರಿಸಲು ಬಯಸಿದರೆ ನನಗೆ ತಿಳಿಸಿ.",
    selectionOutOfRange: "ನನಗೆ {count} ಆಯ್ಕೆಗಳು {s} ಮಾತ್ರ ಸಿಕ್ಕವು. ಪಟ್ಟಿ ಮಾಡಿದವುಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ, ಅಥವಾ ಮತ್ತೆ ಹುಡುಕಿ.",
    askWhichProduct: "ಯಾವ ಉತ್ಪನ್ನವನ್ನು ಸೇರಿಸಲು ಬಯಸುತ್ತೀರಿ? \"ಮೊದಲನೆಯದು\" ಅಥವಾ ಅದರ ಹೆಸರನ್ನು ಹೇಳಬಹುದು.",
    detailNotFound: "ಪ್ರಸ್ತುತ ಸಾರ್ವಜನಿಕ ಕ್ಯಾಟಲಾಗ್ನಲ್ಲಿ ಈ ಉತ್ಪನ್ನ ನನಗೆ ಸಿಗಲಿಲ್ಲ. ಅದನ್ನು ತೆಗೆದುಹಾಕಿರಬಹುದು ಅಥವಾ ಇನ್ನೂ ಮಾರಾಟಕ್ಕೆ ಲಭ್ಯವಿಲ್ಲ.",
    detailAddPrompt: "ಈ ಪರಿಶೀಲಿಸಿದ ಕ್ಯಾಟಲಾಗ್ ವಸ್ತುವನ್ನು ನಿಮ್ಮ ಕಾರ್ಟ್ಗೆ ಸೇರಿಸಲೇ?",
    quantityTooLarge: "ಸಂಖ್ಯೆ {max} ಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬಾರದು.",
    stockLimit: "ಈಗ ಸ್ಟಾಕ್ನಲ್ಲಿ {count} ಯೂನಿಟ್ಗಳು ಮಾತ್ರ ಲಭ್ಯವಿದೆ.",
    cartItemNotFound: "ನಿಮ್ಮ ಕಾರ್ಟ್ನಲ್ಲಿ ಆ ವಸ್ತು ನನಗೆ ಸಿಗಲಿಲ್ಲ.",
    cartError: "ನಾನು ಈ ಕಾರ್ಟ್ ಕ್ರಿಯೆಯನ್ನು ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  },
  [LANG.ML]: {
    greeting: "നമസ്കാരം! ഇന്ന് എങ്ങനെ സഹായിക്കാം?",
    thanks: "സ്വാഗതം! മറ്റെന്തെങ്കിലും സഹായം വേണോ?",
    bye: "വിട! സന്തോഷകരമായ ഷോപ്പിംഗ്.",
    capability:
      "ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താനും ഓപ്ഷനുകൾ താരതമ്യം ചെയ്യാനും കാർട്ട് കാണാനും ലോഗിൻ ചെയ്യുമ്പോൾ ഇനങ്ങൾ ചേർക്കാനും/നീക്കാനും എനിക്ക് സഹായിക്കാനാകും.",
    identity: "ഞാൻ AI Knots Marketplace അസിസ്റ്റന്റാണ്. ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താനും കാർട്ട് കൈകാര്യം ചെയ്യാനും എനിക്ക് സഹായിക്കാനാകും.",
    offTopic:
      "എനിക്ക് ഇപ്പോൾ {topic} പരിശോധിക്കാനാകില്ല, പക്ഷേ ഉൽപ്പന്നങ്ങൾ, നിർദ്ദേശങ്ങൾ, നിങ്ങളുടെ കാർട്ട് എന്നിവയിൽ സഹായിക്കാനാകും.",
    budgetQuestion: "ശരി. നിങ്ങളുടെ ബജറ്റ് എത്രയാണ്?",
    searchFound: '"{query}"ന് {count} യോജിക്കുന്ന ഓപ്ഷൻ{s} ലഭിച്ചു.',
    searchEmpty:
      "ഈ തിരയലിന് ഒരു ഉൽപ്പന്നവും ലഭിച്ചില്ല. മറ്റ് തിരയൽ ശ്രമിക്കുക, അല്ലെങ്കിൽ വിഭാഗങ്ങൾ കാണാൻ ചോദിക്കുക.",
    recommendIntro: "ഞാൻ ആദ്യ ഓപ്ഷൻ ശുപാർശ ചെയ്യുന്നു — ഇത് നിങ്ങളുടെ ആവശ്യത്തിന് ഏറ്റവും അനുയോജ്യമാണ്.",
    compareIntro:
      "ഇവയിൽ ആദ്യത്തേത് നിങ്ങളുടെ അഭ്യർത്ഥനയ്ക്ക് നല്ലതാണ്; രണ്ടാമത്തേത് ബജറ്റിന് നല്ല ഓപ്ഷനാണ്.",
    compareIntroAlt: "ഇവ രണ്ടും തമ്മിലുള്ള വ്യത്യാസം ഇതാണ്.",
    reasonAroundBudget: "{price}ന് അടുത്ത്",
    reasonWithinBudget: "നിങ്ങളുടെ ₹{price} ബജറ്റിനുള്ളിൽ",
    reasonColorMatches: "നിങ്ങൾ പറഞ്ഞ {color} മായി യോജിക്കുന്നു",
    reasonBrandMatches: "നിങ്ങൾ ചോദിച്ച {brand} ബ്രാൻഡുമായി യോജിക്കുന്നു",
    reasonBigDiscount: "MRP-യിൽ {discount}% കിഴിവ്",
    reasonTopMatch: "നിങ്ങളുടെ അഭ്യർത്ഥനയ്ക്ക് ഏറ്റവും നല്ല യോജിപ്പ്",
    comparePrice: "വില: ₹{first} ഒപ്പം ₹{second}",
    compareCategory: "വിഭാഗം: {first} ഒപ്പം {second}",
    compareVerdict: "ബജറ്റ് ഓപ്ഷൻ **{title}** — ₹{price}ന്.",
    topPick: "ഞാൻ **{title}** ശുപാർശ ചെയ്യുന്നു — {reason}.",
    recommendList: "നിങ്ങൾക്കായുള്ള മികച്ച യോജിപ്പുകൾ ഇവയാണ്:",
    giftIntro: "കുറച്ച് നല്ല സമ്മാന നിർദ്ദേശങ്ങൾ:",
    shoppingNoResult: "\"{query}\"നായി ഇപ്പോൾ ഒരു ഉൽപ്പന്നവും കണ്ടെത്താനായില്ല. {suggestion}",
    noMoreOptions: "ഇത്രയും ഓപ്ഷനുകളേ ഉള്ളൂ. {suggestion}",
    cartAddDone: "കഴിഞ്ഞു! **{title}** നിങ്ങളുടെ കാർട്ടിലേക്ക് ചേർത്തു.",
    cartAddFailedNotFound: "ആ ഉൽപ്പന്നം എനിക്ക് കണ്ടെത്താനായില്ല.",
    cartAddFailedStock: "ക്ഷമിക്കണം, **{title}** ഇപ്പോൾ സ്റ്റോക്കിൽ ഇല്ല.",
    cartAddFailedQuantity: "ദയവായി സാധുവായ എണ്ണം തിരഞ്ഞെടുക്കുക.",
    cartUpdateDone: "കഴിഞ്ഞു! എണ്ണം {quantity} ആക്കി.",
    cartRemoveDone: "കഴിഞ്ഞു! ഉൽപ്പന്നം കാർട്ടിൽ നിന്ന് നീക്കി.",
    cartView: "നിങ്ങളുടെ കാർട്ടിൽ ഈ ഇനങ്ങളുണ്ട്.",
    cartEmpty: "നിങ്ങളുടെ കാർട്ട് ഇപ്പോൾ ശൂന്യമാണ്.",
    loginRequiredAdd: "കാർട്ടിൽ ചേർക്കാൻ ആദ്യം ലോഗിൻ ചെയ്യുക.",
    loginRequiredView: "കാർട്ട് കാണിക്കാൻ ആദ്യം ലോഗിൻ ചെയ്യുക.",
    clarifyProduct: "ഏത് ഉൽപ്പന്നം — ആദ്യത്തേതോ രണ്ടാമത്തേതോ?",
    invalidAction: "ക്ഷമിക്കണം, എനിക്ക് ഈ പ്രവർത്തനം ചെയ്യാനാകില്ല.",
    unsupported: "ക്ഷമിക്കണം, എനിക്ക് ഇത് ചെയ്യാനാകില്ല. ഉൽപ്പന്നങ്ങൾ കണ്ടെത്താനും കാർട്ട് കൈകാര്യം ചെയ്യാനും എനിക്ക് സഹായിക്കാനാകും.",
    notFound: "ആ ഉൽപ്പന്നം എനിക്ക് കണ്ടെത്താനായില്ല.",
    detail: "**{title}** വിവരം: വില ₹{price}, {stock} യൂണിറ്റുകൾ സ്റ്റോക്കിൽ.",
    detailShort: "**{title}** വില ₹{price}.",
    quantityInvalid: "ദയവായി സാധുവായ എണ്ണം തിരഞ്ഞെടുക്കുക.",
    noBudgetRefine: "മനസ്സിലായി. ₹{price} നുള്ളിൽ ഈ ഓപ്ഷനുകളുണ്ട്.",
    ackRefine: "മനസ്സിലായി.",
    orderLoginRequired: "ലോഗിൻ ആവശ്യമാണ്: നിങ്ങളുടെ ഓർഡർ ചരിത്രം സുരക്ഷിതമായി ട്രാക്ക് ചെയ്യാൻ ആദ്യം നിങ്ങളുടെ അക്കൗണ്ടിൽ പ്രാമാണീകരിക്കുക.",
    orderEmpty: "ഞാൻ നിങ്ങളുടെ അക്കൗണ്ട് ചരിത്രം പരിശോധിച്ചു, നിങ്ങളുടെ പ്രൊഫൈലിൽ ഓർഡർ കണ്ടെത്താനായില്ല. ഷോപ്പിംഗ് ആരംഭിക്കുക, ട്രാക്ക് ചെയ്യാൻ ഞാൻ സഹായിക്കാം!",
    orderFound: "നിങ്ങളുടെ സമീപകാല {count} ഓർഡറുകൾ ഇവയാണ്:",
    noCategories: "ക്ഷമിക്കണം, ഞങ്ങളുടെ സിസ്റ്റത്തിൽ ഇപ്പോൾ വിഭാഗങ്ങളൊന്നുമില്ല. ദയവായി പിന്നീട് നോക്കുക!",
    categoryPrompt: "കൊള്ളാം! പര്യവേക്ഷണം ചെയ്യാൻ ചില ജനപ്രിയ ഷോപ്പിംഗ് വിഭാഗങ്ങൾ ഇവയാണ്:",
    categoryPickHint: "ആ വിഭാഗത്തിന്റെ നമ്പർ മറുപടിയായി നൽകുക (1, 2, അല്ലെങ്കിൽ 3), ഉദാ \"1\" അല്ലെങ്കിൽ \"category 2\".",
    categoryProducts: "**{name}** വിഭാഗത്തിലെ മികച്ച ഉൽപ്പന്നങ്ങൾ ഇവയാണ്:",
    categoryEmpty: "**{name}** വിഭാഗം കണ്ടെത്തി, പക്ഷേ നിർഭാഗ്യവശാൽ നിലവിൽ അതിൽ ഉൽപ്പന്നമില്ല. മറ്റൊരു വിഭാഗം കാണാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?",
    categoryOutOfRange: "ഈ വിഭാഗ നമ്പർ പരിധിക്ക് പുറത്താണ്. ദയവായി 1 മുതൽ {max} വരെ തിരഞ്ഞെടുക്കുക.",
    cartEmptySuggest: "ഞങ്ങളുടെ പുതിയ കാറ്റലോഗിൽ നിന്ന് കുറച്ച് ഉൽപ്പന്ന നിർദ്ദേശങ്ങൾ വേണോ?",
    searchActions: "ഒന്ന് വിശദമായി കാണാനോ കാർട്ടിലേക്ക് ചേർക്കാനോ ആഗ്രഹിക്കുന്നുവെങ്കിൽ എന്നെ അറിയിക്കുക.",
    selectionOutOfRange: "എനിക്ക് {count} ഓപ്ഷനുകൾ {s} മാത്രമേ ലഭിച്ചുള്ളൂ. ലിസ്റ്റ് ചെയ്തവയിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ വീണ്ടും തിരയുക.",
    askWhichProduct: "ഏത് ഉൽപ്പന്നമാണ് ചേർക്കാൻ ആഗ്രഹിക്കുന്നത്? \"ആദ്യത്തേത്\" അല്ലെങ്കിൽ അതിന്റെ പേര് പറയാം.",
    detailNotFound: "നിലവിലെ പബ്ലിക് കാറ്റലോഗിൽ ഈ ഉൽപ്പന്നം എനിക്ക് കണ്ടെത്താനായില്ല. ഒരുപക്ഷേ അത് നീക്കം ചെയ്തിരിക്കാം അല്ലെങ്കിൽ ഇതുവരെ വിൽപ്പനയ്ക്ക് ലഭ്യമല്ല.",
    detailAddPrompt: "ഈ സ്ഥിരീകരിച്ച കാറ്റലോഗ് ഇനം നിങ്ങളുടെ കാർട്ടിലേക്ക് ചേർക്കട്ടെ?",
    quantityTooLarge: "എണ്ണം {max}-ൽ കൂടുതലാകാൻ കഴിയില്ല.",
    stockLimit: "നിലവിൽ സ്റ്റോക്കിൽ {count} യൂണിറ്റുകൾ മാത്രമേയുള്ളൂ.",
    cartItemNotFound: "നിങ്ങളുടെ കാർട്ടിൽ ആ ഇനം കണ്ടെത്താനായില്ല.",
    cartError: "എനിക്ക് ഈ കാർട്ട് പ്രവർത്തനം നടത്താനായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
  },
  [LANG.UR]: {
    greeting: "السلام علیکم! آج میں آپ کی کیسے مدد کر سکتا ہوں؟",
    thanks: "خوش آمدید! اور کچھ مدد چاہیے؟",
    bye: "الوداع! خوش خریداری۔",
    capability:
      "میں مصنوعات تلاش کرنے، آپشنز کا موازنہ کرنے، کارٹ دیکھنے اور لاگ ان ہونے پر اشیاء شامل/ہٹانے میں مدد کر سکتا ہوں۔",
    identity: "میں AI Knots Marketplace اسسٹنٹ ہوں۔ میں مصنوعات تلاش کرنے اور کارٹ منظم کرنے میں مدد کر سکتا ہوں۔",
    offTopic:
      "میں ابھی {topic} چیک نہیں کر سکتا، لیکن میں مصنوعات، تجاویز اور آپ کے کارٹ میں مدد کر سکتا ہوں۔",
    budgetQuestion: "بالکل۔ آپ کا بجٹ کیا ہے؟",
    searchFound: '"{query}" کے لیے مجھے {count} ملتے جلتے آپشن{s} ملے۔',
    searchEmpty:
      "مجھے اس تلاش کے لیے کوئی مصنوعہ نہیں ملا۔ کوئی اور تلاش آزمائیں، یا کیٹیگریز دیکھنے کے لیے پوچھیں۔",
    recommendIntro: "میں پہلا آپشن تجویز کروں گا — یہ آپ کی ضرورت سے سب سے بہتر میل کھاتا ہے۔",
    compareIntro:
      "ان دونوں میں پہلا آپ کی درخواست کے لیے بہتر ہے؛ دوسرا بجٹ کے لیے اچھا آپشن ہے۔",
    compareIntroAlt: "دونوں آپشنز میں یہ فرق ہے۔",
    reasonAroundBudget: "{price} کے قریب",
    reasonWithinBudget: "آپ کے ₹{price} بجٹ کے اندر",
    reasonColorMatches: "آپ کے بتائے ہوئے {color} سے میل کھاتا ہے",
    reasonBrandMatches: "آپ کے مانگے ہوئے {brand} برانڈ سے میل کھاتا ہے",
    reasonBigDiscount: "MRP پر {discount}% چھوٹ",
    reasonTopMatch: "آپ کی درخواست کے لیے بہترین میل",
    comparePrice: "قیمت: ₹{first} اور ₹{second}",
    compareCategory: "زمرہ: {first} اور {second}",
    compareVerdict: "بجٹ آپشن **{title}** ہے — ₹{price} میں۔",
    topPick: "میں **{title}** تجویز کروں گا — {reason}۔",
    recommendList: "آپ کے لیے یہ بہترین میچز ہیں:",
    giftIntro: "کچھ اچھے گفٹ مشورے:",
    shoppingNoResult: "\"{query}\" کے لیے ابھی کوئی پروڈکٹ نہیں ملا۔ {suggestion}",
    noMoreOptions: "بس اتنے ہی اختیارات ہیں۔ {suggestion}",
    cartAddDone: "ہو گیا! **{title}** آپ کے کارٹ میں شامل ہو گیا۔",
    cartAddFailedNotFound: "مجھے وہ مصنوعہ نہیں ملا۔",
    cartAddFailedStock: "معذرت، **{title}** ابھی اسٹاک میں نہیں ہے۔",
    cartAddFailedQuantity: "براہ کرم ایک درست تعداد منتخب کریں۔",
    cartUpdateDone: "ہو گیا! تعداد {quantity} کر دی گئی ہے۔",
    cartRemoveDone: "ہو گیا! مصنوعہ کارٹ سے ہٹا دیا گیا۔",
    cartView: "آپ کے کارٹ میں یہ اشیاء ہیں۔",
    cartEmpty: "آپ کا کارٹ ابھی خالی ہے۔",
    loginRequiredAdd: "کارٹ میں مصنوعہ شامل کرنے کے لیے پہلے لاگ ان کریں۔",
    loginRequiredView: "کارٹ دکھانے کے لیے پہلے لاگ ان کریں۔",
    clarifyProduct: "آپ کا مطلب کونسی مصنوعہ ہے — پہلی یا دوسری؟",
    invalidAction: "معذرت، میں یہ کارروائی نہیں کر سکتا۔",
    unsupported: "معذرت، میں یہ نہیں کر سکتا۔ میں مصنوعات تلاش کرنے اور کارٹ منظم کرنے میں مدد کر سکتا ہوں۔",
    notFound: "مجھے وہ مصنوعہ نہیں ملا۔",
    detail: "**{title}** کی معلومات: قیمت ₹{price}، {stock} یونٹس اسٹاک میں۔",
    detailShort: "**{title}** کی قیمت ₹{price} ہے۔",
    quantityInvalid: "براہ کرم ایک درست تعداد منتخب کریں۔",
    noBudgetRefine: "سمجھ گیا۔ ₹{price} کے اندر یہ آپشنز ہیں۔",
    ackRefine: "سمجھ گیا۔",
    orderLoginRequired: "لاگ ان درکار: اپنی آرڈر ہسٹری محفوظ طریقے سے ٹریک کرنے کے لیے پہلے اپنے اکاؤنٹ میں تصدیق کریں۔",
    orderEmpty: "میں نے آپ کا اکاؤنٹ ہسٹری چیک کیا اور آپ کی پروفائل پر کوئی آرڈر نہیں ملا۔ خریداری شروع کریں، میں ٹریک کرنے میں مدد کروں گا!",
    orderFound: "آپ کے حالیہ {count} آرڈرز یہ ہیں:",
    noCategories: "معذرت، ہمارے سسٹم میں فی الحال کوئی کیٹیگری دستیاب نہیں ہے۔ براہ کرم بعد میں دیکھیں!",
    categoryPrompt: "بہت خوب! دیکھنے کے لیے یہ کچھ مشہور شاپنگ کیٹیگریز ہیں:",
    categoryPickHint: "براہ کرم اس کیٹیگری کا نمبر جواب میں دیں (1، 2، یا 3)، جیسے \"1\" یا \"category 2\"۔",
    categoryProducts: "**{name}** کیٹیگری کے اعلیٰ مصنوعات یہ ہیں:",
    categoryEmpty: "مجھے **{name}** کیٹیگری مل گئی، لیکن بدقسمتی سے اس وقت اس میں کوئی مصنوعہ دستیاب نہیں ہے۔ کیا آپ کوئی اور کیٹیگری دیکھنا چاہیں گے؟",
    categoryOutOfRange: "یہ کیٹیگری نمبر حد سے باہر ہے۔ براہ کرم 1 سے {max} تک منتخب کریں۔",
    cartEmptySuggest: "کیا آپ ہمارے تازہ ترین کیٹلاگ سے کچھ مصنوعات کی تجاویز چاہیں گے؟",
    searchActions: "بتائیے اگر آپ کسی کو تفصیل سے دیکھنا چاہتے ہیں یا کارٹ میں شامل کرنا چاہتے ہیں۔",
    selectionOutOfRange: "مجھے صرف {count} آپشن {s} ملے۔ درج شدہ میں سے کوئی ایک منتخب کریں، یا دوبارہ تلاش کریں۔",
    askWhichProduct: "آپ کونسی مصنوعہ شامل کرنا چاہیں گے؟ آپ \"پہلی\" یا اس کا نام بتا سکتے ہیں۔",
    detailNotFound: "مجھے یہ مصنوعہ موجودہ عوامی کیٹلاگ میں نہیں ملا۔ ہو سکتا ہے اسے ہٹا دیا گیا ہو یا ابھی فروخت کے لیے دستیاب نہ ہو۔",
    detailAddPrompt: "کیا میں اس تصدیق شدہ کیٹلاگ آئٹم کو آپ کے کارٹ میں شامل کروں؟",
    quantityTooLarge: "تعداد {max} سے زیادہ نہیں ہو سکتی۔",
    stockLimit: "اس وقت اسٹاک میں صرف {count} یونٹس دستیاب ہیں۔",
    cartItemNotFound: "مجھے وہ آئٹم آپ کے کارٹ میں نہیں ملا۔",
    cartError: "میں یہ کارٹ کارروائی نہیں کر سکا۔ براہ کرم دوبارہ کوشش کریں۔",
  },
};

/** Renders a template with {placeholders}. Falls back to English. */
export const t = (lang, key, vars = {}) => {
  const table = RESPONSES[lang] || RESPONSES[LANG.EN];
  let template = table[key] ?? RESPONSES[LANG.EN][key] ?? "";
  if (!template)
  {
    return "";
  }
  for (const [name, value] of Object.entries(vars))
  {
    template = template.replaceAll(`{${name}}`, String(value));
  }
  return template.replaceAll("{s}", "s");
};

/** Returns true when the language table has a real translation. */
export const isSupportedLanguage = (code) => Boolean(RESPONSES[code]);
