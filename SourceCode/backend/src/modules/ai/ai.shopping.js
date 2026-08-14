import { normalizeText, tokenize } from "./ai.intents.js";
import { normalizeCommerceQuery } from "./ai.language.js";

export const SHOPPING_INTENTS = Object.freeze({
  GIFT: "gift",
  COMPARISON: "comparison",
  RECOMMENDATION: "recommendation",
  REFINE: "refine",
  SHOW_MORE: "show-more",
  ALTERNATIVES: "alternatives",
  SELECT: "select",
  DETAIL: "detail",
  SEARCH: "search",
});

const BUDGET_LEAD =
  /(?:under|below|within|less\s+than|up\s+to|budget|max|around|approx|aas\s+paas|tak|se\s+kam|ke\s+under|ke\s+andar|de\s+andar|de\s+under)\b[^₹\d]*₹?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(k|k\b|thousand|hazaar|हज़ार|हजार)?/i;

const BUDGET_TRAIL =
  /₹?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:ke\s+under|ke\s+andar|de\s+andar|de\s+under|se\s+kam|under\s*price|tak|के\s+अंदर|के\s+भीतर|तक|के\s+भीतर)(?=\s|$|[.,;:!?।])/i;

const PRICE_RANGE =
  /(?:between|from)\s*₹?\s*(\d+(?:,\d{3})*)\s*(?:to|and|-)\s*₹?\s*(\d+(?:,\d{3})*)/i;

const COLOR_WORDS = new Set([
  "black", "white", "blue", "red", "green", "yellow", "brown", "grey",
  "gray", "pink", "purple", "orange", "maroon", "navy", "teal", "beige",
  "cream", "gold", "silver", "olive", "khaki", "multicolor", "multicolour",
  "black", "safed", "kala", "neela", "laal", "hara", "peela", "bhoora",
]);

const COLOR_MAP = {
  kala: "black", safed: "white", saphed: "white", neela: "blue",
  laal: "red", lal: "red", hara: "green", hari: "green", peela: "yellow",
  bhoora: "brown", bhoore: "brown", grey: "grey", gray: "grey",
};

const BRAND_WORDS = new Set([
  "nike", "boat", "adidas", "puma", "jbl", "samsung", "apple", "mi",
  "xiaomi", "realme", "noise", "kittu", "kittus", "urban", "levi", "levis",
  "denim", "hush", "puppies", "allen", "solly", "solomon", "van", "heusen",
]);

const USE_CASE_MAP = {
  gaming: ["electronics", "headphones", "speaker", "accessories"],
  office: ["bags", "backpacks", "electronics", "laptop"],
  college: ["bags", "backpacks", "tshirts", "jeans"],
  travel: ["bags", "backpacks"],
  running: ["sneakers", "shoes", "sports"],
  gym: ["sneakers", "shoes", "sports"],
  casual: ["tshirts", "jeans", "sneakers"],
  party: ["kurtas", "suits", "accessories"],
  wedding: ["kurtas", "suits", "gift"],
  festive: ["kurtas", "suits", "gift"],
  premium: ["kurtas", "suits", "sneakers"],
  bluetooth: ["electronics", "speakers"],
  wireless: ["electronics", "speakers", "headphones"],
  headphones: ["headphones", "electronics"],
  earphones: ["headphones", "electronics"],
  headset: ["headphones", "electronics"],
  earbuds: ["headphones", "electronics"],
  speaker: ["speakers", "electronics"],
  sound: ["speakers", "electronics"],
  sneakers: ["sneakers"],
  shoes: ["sneakers"],
  jeans: ["jeans"],
  denim: ["jeans"],
  tshirt: ["tshirts"],
  kurta: ["kurtas"],
  suit: ["suits"],
  backpack: ["backpacks", "bags"],
  bag: ["bags", "backpacks"],
  laptop: ["backpacks", "bags", "electronics"],
  bed: ["home", "bed"],
  bedsheet: ["home", "bed"],
  watch: ["accessories"],
  gift: ["gift", "accessories"],
};

const OCCASION_WORDS = new Set([
  "birthday", "anniversary", "wedding", "shadi", "party", "festival",
  "festive", "diwali", "rakhi", "holi", "christmas", "newyear",
  "valentine", "gift", "tohfa", "tohfe", "shagun", "celebration",
]);

const RECIPIENT_WORDS = new Set([
  "sister", "behen", "bhen", "bahan", "brother", "bhai", "bhaji",
  "wife", "patni", "husband", "pati", "mother", "mummy", "mumma", "maa",
  "father", "papa", "dad", "friend", "dost", "girlfriend", "boyfriend",
  "girl", "boy", "kid", "bhabhi", "sali", "saali", "nephew", "niece",
]);

const PREFERENCE_WORDS = {
  cheap: ["sasta", "cheap", "affordable", "budget", "kam", "kam daam"],
  premium: ["premium", "luxury", "best", "top", "high", "expensive"],
  value: ["value", "worth", "vfm", "good deal", "accha"],
  comfortable: ["comfortable", "soft", "aram", "comfy"],
  useful: ["useful", "practical", "daily", "everyday"],
};

const COMPARISON_WORDS = new Set([
  "compare", "comparison", "vs", "versus", "better", "kaunsa", "kaunsi",
  "which", "ya", "ke beech", "difference", "dono", "compare", "compare.",
]);

const SHOW_MORE_PATTERNS = [
  /show\s+more/i, /more\s+options?/i, /aur\s+(?:dikhao|dikha|options?)/i,
  /aur\s+dikhayei?o/i, /kuch\s+aur\s+dikhao/i, /more\s+products/i,
];

const ALTERNATIVES_PATTERNS = [
  /alternatives?/i, /other\s+options?/i, /kuch\s+aur\s+(?:options?|chahiye)/i,
  /cheaper\s+options?/i, /similar\s+products?/i, /kuch\s+aur/i,
];

const REFINE_SIGNALS = [
  /\b(wireless|bluetooth|gaming|premium|comfortable|casual|formal|slim|oversized)\b/i,
  /\b(black|white|blue|red|green|yellow|brown|pink|purple|grey|gray)\b/i,
  /\b(sasta|cheap|affordable|under|below|within|budget|max|around)\b/i,
  /\b(best|top|good|nice|better|accha|ache|best)\b/i,
];

const ORDINAL_REFERENCE = /(pehla|pahla|pehle|pehli|doosra|dooja|dusra|doosri|teesra|teesri|first|second|third|this|that|is|ye|wo|woh)\b/i;

const toNumeric = (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(num) ? num : null;
};

const applyThousandSuffix = (num, suffix) => {
  if (!suffix) return num;
  if (/^k$/i.test(suffix) || /^thousand$/i.test(suffix)) return num * 1000;
  if (/^hazaar/i.test(suffix)) return num * 1000;
  return num;
};

export const extractBudgetConstraint = (text = "") => {
  const raw = String(text);

  const range = raw.match(PRICE_RANGE);
  if (range) {
    const min = toNumeric(range[1]);
    const max = toNumeric(range[2]);
    if (min !== null && max !== null) {
      return { minPrice: min, maxPrice: max, mode: "range", anchor: max };
    }
  }

  const lead = raw.match(BUDGET_LEAD);
  if (lead) {
    const suffix = lead[2];
    let amount = toNumeric(lead[1]);
    if (amount !== null) amount = applyThousandSuffix(amount, suffix);
    if (amount === null) return null;

    const marker = lead[0].toLowerCase();
    if (/around|approx|aas\s+paas/.test(marker)) {
      return {
        minPrice: Math.floor(amount * 0.8),
        maxPrice: Math.ceil(amount * 1.2),
        mode: "around",
        anchor: amount,
      };
    }
    return { minPrice: null, maxPrice: amount, mode: "under", anchor: amount };
  }

  const trail = raw.match(BUDGET_TRAIL);
  if (trail) {
    const amount = toNumeric(trail[1]);
    if (amount !== null) {
      return { minPrice: null, maxPrice: amount, mode: "under", anchor: amount };
    }
  }

  return null;
};

export const extractColorConstraint = (text = "") => {
  const normalized = normalizeCommerceQuery(String(text));
  const tokens = normalized.split(" ");

  for (const token of tokens) {
    if (COLOR_WORDS.has(token)) {
      return COLOR_MAP[token] || token;
    }
  }
  return null;
};

export const extractBrandConstraint = (text = "") => {
  const normalized = normalizeText(transliterateBrands(String(text)));
  const tokens = tokenize(normalized);

  // "mujhe Nike nahi, Adidas chahiye" / "black nahi" -> the excluded brand is
  // the positive replacement request, not the earlier keyword.
  const negatorIndex = tokens.findIndex((token) => /^(nahi|nahin|nahi|mat|not|no)$/.test(token));
  if (negatorIndex >= 0) {
    const before = tokens[negatorIndex - 1];
    if (BRAND_WORDS.has(before)) {
      const after = tokens.slice(negatorIndex + 1).find((token) => BRAND_WORDS.has(token));
      return after === "kittus" ? "kittu" : after || null;
    }
  }

  for (const token of tokens) {
    if (BRAND_WORDS.has(token)) {
      return token === "kittus" ? "kittu" : token;
    }
  }
  return null;
};

const transliterateBrands = (text) => String(text);

export const extractOccasion = (text = "") => {
  const normalized = normalizeText(String(text));
  for (const word of OCCASION_WORDS) {
    if (normalized.includes(word)) return word;
  }
  return null;
};

export const extractRecipient = (text = "") => {
  const normalized = normalizeText(String(text));
  for (const word of RECIPIENT_WORDS) {
    if (normalized.includes(word)) return word;
  }
  return null;
};

export const extractPreference = (text = "") => {
  const normalized = normalizeText(String(text));
  for (const [key, words] of Object.entries(PREFERENCE_WORDS)) {
    if (words.some((word) => normalized.includes(word))) return key;
  }
  return null;
};

export const extractUseCase = (text = "") => {
  const normalized = normalizeText(String(text));
  for (const [word] of Object.entries(USE_CASE_MAP)) {
    if (normalized.includes(word)) return word;
  }
  return null;
};

export const extractNegativePreference = (text = "") => {
  const normalized = normalizeText(String(text));

  const classify = (value) => {
    if (COLOR_WORDS.has(value)) return { type: "color", value: COLOR_MAP[value] || value };
    if (BRAND_WORDS.has(value)) return { type: "brand", value: value === "kittus" ? "kittu" : value };
    return null;
  };

  // "black nahi chahiye", "red mat dikhana", "Nike nahi",
  // "mujhe Nike nahi, Adidas chahiye" -> the term before the negator is excluded.
  const before = normalized.match(/(?:^|\s)([a-z0-9]+)\s+(?:nahi|nahin|mat|not|no|bina|without)\b/);
  if (before) {
    const excluded = classify(before[1]);
    if (excluded) return excluded;
  }

  // "nahi black chahiye", "mat red dikhana", "no nike wala" -> a negator-led
  // term followed by an explicit sentiment/display verb is also excluded.
  const after = normalized.match(
    /\b(?:nahi|nahin|mat|not|no|without)\s+(?:chahiye\s+)?([a-z0-9]+)\s+(?:chahiye|dikhana|dikha|dikhao|wala|wale|wali|bhi|do|de)\b/,
  );
  if (after) {
    const excluded = classify(after[1]);
    if (excluded) return excluded;
  }

  return null;
};

export const extractShoppingConstraints = (text = "") => {
  const budget = extractBudgetConstraint(text);
  const useCase = extractUseCase(text);

  return {
    budget,
    color: extractColorConstraint(text),
    brand: extractBrandConstraint(text),
    useCase,
    occasion: extractOccasion(text),
    recipient: extractRecipient(text),
    preference: extractPreference(text),
    exclude: extractNegativePreference(text),
  };
};

export const mergeShoppingConstraints = (previous = {}, next = {}) => {
  if (!previous || Object.keys(previous).length === 0) return next;
  if (!next || Object.keys(next).length === 0) return previous;

  return {
    budget: next.budget || previous.budget,
    color: next.color || previous.color,
    brand: next.brand || previous.brand,
    useCase: next.useCase || previous.useCase,
    occasion: next.occasion || previous.occasion,
    recipient: next.recipient || previous.recipient,
    preference: next.preference || previous.preference,
    exclude: next.exclude || previous.exclude,
  };
};

const isShowMoreRequest = (text) => {
  const raw = String(text);
  return SHOW_MORE_PATTERNS.some((pattern) => pattern.test(raw));
};

const isAlternativesRequest = (text) => {
  const raw = String(text);
  return ALTERNATIVES_PATTERNS.some((pattern) => pattern.test(raw));
};

const isComparisonRequest = (text) => {
  const normalized = normalizeText(String(text));
  const tokens = tokenize(normalized);
  return tokens.some((token) => COMPARISON_WORDS.has(token)) ||
    /(?:vs|versus)\b/.test(String(text)) ||
    /kaunsa|kaunsi/.test(String(text));
};

const isRefinementRequest = (text, hasContext) => {
  if (!hasContext) return false;
  const raw = String(text);
  const normalized = normalizeText(raw);
  const tokens = tokenize(normalized);

  // Budget-trailing refinements ("2000 ke andar", "3000 tak", "se kam")
  // and attribute modifiers ("wireless wale") keep the last category.
  const hasBudgetTrail = BUDGET_TRAIL.test(raw);
  const hasModifierPhrase = /\b(wireless|bluetooth|gaming|premium|comfortable|formal)\s+(?:wala|wale|wali)\b/.test(normalized);

  if (hasBudgetTrail || hasModifierPhrase) {
    return tokens.length > 0 && tokens.length <= 4;
  }

  const hasCategoryWord = Object.keys(USE_CASE_MAP).some((word) =>
    normalized.includes(word),
  );

  if (hasCategoryWord) return false;

  const isConstraint = REFINE_SIGNALS.some((pattern) => pattern.test(raw));
  return isConstraint && tokens.length <= 4 && tokens.length > 0;
};

export const detectShoppingIntent = ({ raw = "", normalized = "", hasContext = false, context = null } = {}) => {
  const text = String(raw);

  if (isShowMoreRequest(text)) return { type: SHOPPING_INTENTS.SHOW_MORE };
  if (isAlternativesRequest(text)) return { type: SHOPPING_INTENTS.ALTERNATIVES };
  if (isComparisonRequest(text)) return { type: SHOPPING_INTENTS.COMPARISON };

  const occasion = extractOccasion(text);
  const recipient = extractRecipient(text);
  const hasGiftWord = /(gift|tohfa|shagun)\b/i.test(text);
  if (occasion || (hasGiftWord && recipient)) {
    return { type: SHOPPING_INTENTS.GIFT };
  }

  const selection = extractSelectionReference(text, context);
  if (selection) {
    return { type: SHOPPING_INTENTS.SELECT, reference: selection };
  }

  // "iska price kya hai" / "iske baare mein batao" / "this product detail"
  // after a product was chosen -> detail of the selected product.
  const asksDetail =
    /(price|cost|rate|kitna|kitne|kitni|daam|kimaat|ke baare|ke baray|baare mein|bare mein|about|detail|info|detail)/i.test(text) &&
    /\b(iska|iski|iske|isse|isko|uska|uski|uske|usse|usko|ye|wo|woh|this|that|ehnu|esnu)\b/i.test(text);
  if (context?.selectedProductId && asksDetail) {
    return { type: SHOPPING_INTENTS.DETAIL, reference: { kind: "last" } };
  }

  if (isRefinementRequest(text, hasContext)) {
    return { type: SHOPPING_INTENTS.REFINE };
  }

  const isRecommendation =
    /(recommend|suggest|suggestion|best|top|accha|ache|achha|sabse\s+(?:accha|ache|achha)|kya\s+(?:lu|lo|leu)|batao)/i.test(text);

  if (isRecommendation) {
    return { type: SHOPPING_INTENTS.RECOMMENDATION };
  }

  return { type: SHOPPING_INTENTS.SEARCH };
};

export const extractSelectionReference = (text = "", context = null) => {
  const raw = String(text);
  const normalized = normalizeText(raw);

  // Devanagari ordinals survive translation to romanized form so a scripted
  // "दूसरा वाला" resolves to the same ranked index as "doosra wala".
  const devanagariOrdinal = raw.match(
    /(पहला|पहली|पहले|दूसरा|दूसरी|तीसरा|तीसरी|चौथा|चौथी|पांचवा|पाँचवा|पांचवां)/,
  );
  if (devanagariOrdinal) {
    const indexMap = {
      पहला: 0, पहली: 0, पहले: 0, पहले: 0,
      दूसरा: 1, दूसरी: 1,
      तीसरा: 2, तीसरी: 2,
      चौथा: 3, चौथी: 3,
      पांचवा: 4, पाँचवा: 4, पांचवां: 4,
    };
    const index = indexMap[devanagariOrdinal[1]];
    if (index !== undefined) {
      const inRange = Array.isArray(context?.resultIds) && context.resultIds.length > index;
      return { kind: "index", index, outOfRange: !inRange };
    }
  }

  const ordinalMatch = normalized.match(
    /\b(pehla|pahla|pehle|pehli|doosra|dooja|dusra|doosri|teesra|teesri|first|second|third)\b/,
  );
  if (ordinalMatch) {
    const indexMap = {
      pehla: 0, pahla: 0, pehle: 0, pehli: 0, first: 0,
      doosra: 1, dooja: 1, dusra: 1, doosri: 1, second: 1,
      teesra: 2, teesri: 2, third: 2,
    };
    const index = indexMap[ordinalMatch[1]];
    const inRange = Array.isArray(context?.resultIds) && context.resultIds.length > index;
    return { kind: "index", index, outOfRange: !inRange };
  }

  if (/\b(this|that|is|ye|wo|woh)\b/.test(normalized) && Array.isArray(context?.resultIds) && context.resultIds.length > 0) {
    return { kind: "index", index: 0 };
  }

  const useCase = extractUseCase(raw);
  if (useCase && Array.isArray(context?.resultIds) && context.resultIds.length > 0) {
    return null;
  }

  return null;
};

export const extractComparisonTargets = (text = "", context = null) => {
  const normalized = normalizeText(String(text));

  const ordinalMatches = [...normalized.matchAll(
    /\b(pehla|pahla|pehle|pehli|doosra|dooja|dusra|doosri|teesra|teesri|first|second|third)\b/g,
  )];
  if (ordinalMatches.length >= 2) {
    const indexMap = {
      pehla: 0, pahla: 0, pehle: 0, pehli: 0, first: 0,
      doosra: 1, dooja: 1, dusra: 1, doosri: 1, second: 1,
      teesra: 2, teesri: 2, third: 2,
    };
    return ordinalMatches
      .slice(0, 2)
      .map((m) => ({ kind: "index", index: indexMap[m[1]] }));
  }

  if (context && Array.isArray(context.resultIds) && context.resultIds.length >= 2) {
    return [{ kind: "index", index: 0 }, { kind: "index", index: 1 }];
  }

  return null;
};

export const buildClarificationCandidates = (constraints = {}) => {
  const candidates = [];
  if (!constraints.budget) candidates.push("budget");
  if (!constraints.useCase && !constraints.brand) candidates.push("category");
  if (!constraints.color) candidates.push("color");
  return candidates;
};

export const shoppingConstraintsSummary = (constraints = {}) => {
  const parts = [];
  if (constraints.budget?.maxPrice) parts.push(`₹${constraints.budget.maxPrice}`);
  if (constraints.color) parts.push(constraints.color);
  if (constraints.brand) parts.push(constraints.brand);
  if (constraints.useCase) parts.push(constraints.useCase);
  if (constraints.occasion) parts.push(constraints.occasion);
  if (constraints.recipient) parts.push(constraints.recipient);
  return parts.join(", ");
};
