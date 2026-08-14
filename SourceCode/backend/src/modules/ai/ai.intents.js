/**
 * Pure intent-detection and relevance-scoring utilities for the AI chatbot's
 * local mock engine.
 *
 * Everything in this module is a deterministic pure function over strings and
 * plain product documents — no I/O, so it can be reasoned about and tested in
 * isolation. It is shared by the mock response pipeline and the Groq
 * source-enrichment path.
 *
 * Phase 5: Indic-script queries are transliterated to English search terms
 * BEFORE tokenization, otherwise normalizeText would strip the Devanagari
 * characters and a query like "मुझे टी-शर्ट चाहिए" would be classified as
 * fallback instead of product search.
 *
 * Phase 4 adds deterministic ACTION recognition ("add to my cart",
 * "show my cart", "remove the first item", "make it 2") with entity
 * extraction (ordinal reference, product keyword, quantity). It is not an
 * NLP/ML system — just explicit, testable patterns.
 */

import { transliterateCommerceTerms } from "./ai.language.js";

// ------------------------------------------------------------
// Text normalization
// ------------------------------------------------------------

/**
 * Lowercases, trims and collapses punctuation/whitespace to single spaces.
 * Keeps letters and digits only, so "Men's T-Shirt" becomes "mens t shirt".
 */
export const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Splits normalized text into search tokens. Single-character tokens are
 * dropped ("t" from "t-shirt", "s" from "nike s") because they carry no
 * retrieval value and would only create noise. Hyphens are folded to spaces
 * so "t-shirt" yields the same search token as the catalog title "T Shirt".
 */
export const tokenize = (value = "") =>
  normalizeText(value)
    .split(/[\s-]+/)
    .filter((token) => token && token.length > 1);

// ------------------------------------------------------------
// Vocabulary
// ------------------------------------------------------------

/**
 * High-frequency English filler with no product relevance. Also covers the
 * common shop verbs ("show", "want", "find", "buy") so a query like
 * "show me some nike sneakers" reduces cleanly to ["nike", "sneakers"].
 */
export const STOP_WORDS = new Set([
  "about", "after", "again", "all", "also", "am", "an", "and", "any", "are",
  "as", "at", "be", "because", "been", "before", "being", "between", "both",
  "best", "but", "buy", "by", "can", "cheap", "cost", "could", "deal",
  "deals", "did", "do", "does", "doing", "down", "discount", "during",
  "each", "expensive", "find", "few", "for", "from", "further", "get",
  "give", "got", "had", "has", "have", "having", "he", "help", "her",
  "here", "hers", "herself", "him", "himself", "his", "how", "i", "if",
  "in", "into", "is", "it", "its", "itself", "just", "like", "list",
  "looking", "me", "more", "most", "much", "my", "myself", "need", "no",
  "nor", "not", "now", "of", "off", "offer", "offers", "on", "once", "one",
  "ones", "only",
  "or", "other", "our", "ours", "ourselves", "out", "over", "own", "please",
  "price", "rate", "rates", "recommend", "quite", "same", "say", "search",
  "see", "she", "should", "show", "so", "some", "such", "tell", "than",
  "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "top", "under",
  "until", "up", "upon", "us", "very", "want", "was", "we", "were", "what",
  "when", "where", "which", "while", "who", "whom", "why", "will", "with",
  "worth", "would", "you", "your", "yours", "yourself", "yourselves",
]);

/**
 * Bare greetings that map to a simple welcome reply instead of a product
 * search. A phrase is only treated as a greeting when it is short (<= 3
 * tokens) and every token is greeting/social/stop filler.
 */
export const GREETING_WORDS = new Set([
  "hi", "hello", "hey", "hola", "namaste", "namaskar", "namaskaram",
  "greetings", "heya", "howdy", "yo", "wassup", "sup", "good", "morning",
  "afternoon", "evening", "sat", "sri", "akal", "salaam", "salam",
  "adab", "sasriyakal", "bhai", "bhaiji", "arey", "arre",
]);

/**
 * Small-talk words. When every token of a short phrase is filler (stop,
 * social or greeting) the query is treated as conversation rather than a
 * product request. "how are you" must never become a product search.
 */
export const SOCIAL_WORDS = new Set([
  "how", "are", "doing", "thanks", "thank", "welcome", "bye", "goodbye",
  "okay", "ok", "sure", "great", "cool", "nice", "fine", "awesome", "amazing",
  "perfect", "whats", "up", "today", "name", "human", "real", "bot",
  "work", "works", "working", "made", "created",
  "shukriya", "sukriya", "shukria", "shukar", "dhanyavad", "dhanyavaad",
  "sasriyakal", "alvida",
  // Conversational address/recipient filler. These carry zero product-identity
  // value, so stripping them keeps multi-token AND-semantics from zeroing out a
  // valid search ("jeans bro" => ["jeans"], "hi bro" => greeting, "a shirt for
  // my brother" => ["shirt"]). Deliberately excludes shopping attributes like
  // black/men/women/kids.
  "bro", "broo", "brooo", "dude", "brother", "buddy", "friend", "bhaiyya",
  // "matlab" = "meaning/what do you mean" — conversational, never a product.
  "matlab", "matlb", "mtlb", "mean", "meant",
  // Romanized question words — conversational fillers, never product terms.
  "kya", "kaise", "kese", "kis", "kiski", "kiska", "kiske", "kyun", "kab",
  "kaun", "kahan", "kahaan", "kitna", "kitni", "kitne", "kyaa", "q",
  // Hinglish copulas (is/are/am) — pure conversation glue, never product terms.
  "hai", "hain", "ho", "hoon", "hona", "hoga", "haan", "nahi", "bhi", "bhiye",
  // Romanized honorific / second-person particles.
  "aap", "aapko", "aapke", "aapki", "tum", "tumko", "tu", "tere", "teri",
]);

/** Words that route a query to the cart intent. */
export const CART_KEYWORDS = new Set(["cart", "basket", "bag"]);

/** Words that route a query to the order/tracking intent. */
export const ORDER_KEYWORDS = new Set([
  "order", "orders", "purchase", "purchases", "delivery",
  "deliveries", "shipped", "shipping", "return", "returns", "refund",
  "refunds", "cancel", "cancellation",
]);

/**
 * "track"/"tracking" only signal an order request when the query also
 * mentions order context. A bare "track pants" must stay a product search
 * (real catalog category: "Men Track Pants & Joggers"), not a tracking reply.
 */
const ORDER_TRACK_WORDS = new Set(["track", "tracking"]);
const ORDER_CONTEXT_WORDS = new Set([
  "order", "orders", "package", "shipment", "shipments", "parcel",
  "delivery", "deliveries", "status", "my",
]);

/** Words that route a query to the category browser intent. */
export const CATEGORY_LIST_KEYWORDS = new Set([
  "category", "categories", "browse", "collection", "collections", "type",
  "shop", "explore", "products",
]);

const CATEGORY_INDEX_MAP = {
  "1": 0, "one": 0, "first": 0,
  "2": 1, "two": 1, "second": 1,
  "3": 2, "three": 2, "third": 2,
};

/**
 * Parses a category-selection reply such as "1", "category two", "show me
 * category 3" or "select first". Returns { index, label } or null.
 */
export const parseCategorySelector = (query) =>
{
  const normalized = normalizeText(query);
  if (!normalized)
  {
    return null;
  }

  const anchored =
    normalized.match(/^(1|2|3|one|two|three|first|second|third)$/);
  if (anchored)
  {
    return { index: CATEGORY_INDEX_MAP[anchored[1]], label: anchored[1] };
  }

  const prefixed =
    normalized.match(/(?:category|select|number|option)\s*(1|2|3|one|two|three|first|second|third)/);
  if (prefixed)
  {
    return { index: CATEGORY_INDEX_MAP[prefixed[1]], label: prefixed[1] };
  }

  return null;
};

/**
 * Classifies a user prompt into a single intent. Priority order:
 * greeting -> cart -> order -> detail (productId) -> category-select ->
 * category-list -> general small-talk -> search.
 */
export const detectIntent = (query, { productId = null } = {}) =>
{
  const normalized = normalizeText(transliterateCommerceTerms(query));
  const tokens = tokenize(normalized);

  if (!normalized)
  {
    return { type: "fallback" };
  }

  const isFiller = (token) =>
    STOP_WORDS.has(token) || SOCIAL_WORDS.has(token) || GREETING_WORDS.has(token);

  // A clicked product card always wins over keyword guessing.
  if (productId)
  {
    return { type: "detail" };
  }

  const significantTokens = tokens.filter((token) => !isFiller(token));

  // Greeting / small talk — only for very short all-filler phrases.
  if (
    tokens.length <= 3 &&
    tokens.some((token) => GREETING_WORDS.has(token)) &&
    tokens.every((token) => isFiller(token))
  )
  {
    return { type: "greeting" };
  }

  if (tokens.some((token) => CART_KEYWORDS.has(token)))
  {
    return { type: "cart" };
  }

  if (tokens.some((token) => ORDER_KEYWORDS.has(token)))
  {
    return { type: "order" };
  }

  if (
    tokens.some((token) => ORDER_TRACK_WORDS.has(token)) &&
    tokens.some((token) => ORDER_CONTEXT_WORDS.has(token))
  )
  {
    return { type: "order" };
  }

  const categorySelector = parseCategorySelector(normalized);
  if (categorySelector)
  {
    return { type: "category-select", ...categorySelector };
  }

  if (
    tokens.some((token) => CATEGORY_LIST_KEYWORDS.has(token)) ||
    normalized.includes("what do you have")
  )
  {
    return { type: "category-list" };
  }

  // "how are you", "thanks", "bye" and friends are conversation, not search.
  if (significantTokens.length === 0)
  {
    return { type: "general" };
  }

  return { type: "search" };
};

// ------------------------------------------------------------
// Relevance scoring
// ------------------------------------------------------------

/**
 * Reduces a prompt to the tokens that should actually drive a product search:
 * everything left after dropping stop/social/greeting filler.
 */
export const getSearchTokens = (query = "") =>
  tokenize(transliterateCommerceTerms(query)).filter(
    (token) =>
      !STOP_WORDS.has(token) &&
      !SOCIAL_WORDS.has(token) &&
      !GREETING_WORDS.has(token),
  );

const SCORE_TITLE_EXACT = 6;
const SCORE_TITLE_PARTIAL = 4;
const SCORE_BRAND_EXACT = 5;
const SCORE_BRAND_PARTIAL = 3;
const SCORE_CATEGORY_EXACT = 4;
const SCORE_CATEGORY_PARTIAL = 3;
const SCORE_COLOR_EXACT = 3;
const SCORE_COLOR_PARTIAL = 2;
const SCORE_SIZE_EXACT = 3;
const SCORE_SIZE_PARTIAL = 2;
const SCORE_VARIANT_EXACT = 3;
const SCORE_VARIANT_PARTIAL = 2;

/** Minimum cumulative score a product needs to be surfaced as a match. */
export const MIN_RELEVANCE_SCORE = 4;

/**
 * Minimal curated noun-synonym clusters. Used ONLY to broaden a single token's
 * field variants (via the same per-token fold rule as singular/plural), never
 * to add new AND-semantics tokens. Without this, "pant"/"pants" would match
 * nothing when a catalog entry is titled "Trousers" — a pure vocabulary gap,
 * not a relevance one. Deliberately tiny: expanding a whole dictionary would
 * blur distinct products (jeans vs trousers must stay separate).
 */
const TOKEN_SYNONYMS = {
  pant: ["trouser", "trousers"],
  pants: ["trouser", "trousers"],
  trouser: ["pant", "pants"],
  trousers: ["pant", "pants"],
};

/**
 * Scores a single token against one text field.
 * Returns the exact weight when the token is a whole word of the field and
 * the partial weight when the token is a prefix/substring of length >= 3.
 */
const matchField = (token, field, exactScore, partialScore) =>
{
  if (!field)
  {
    return 0;
  }

  // Basic English singular/plural folding so "headphones" still matches the
  // title "Gaming Headphone" (and vice versa). Safe under AND semantics: a
  // fold can only raise ONE token's contribution, never bypass the
  // every-token-must-hit filter.
  const variants = [token, ...(TOKEN_SYNONYMS[token] || [])];
  if (token.length > 3 && token.endsWith("s"))
  {
    variants.push(token.slice(0, -1));
  }
  else if (token.length > 3 && !token.endsWith("s"))
  {
    variants.push(`${token}s`);
  }

  const words = field.split(" ");
  let best = 0;

  for (const variant of variants)
  {
    let score = 0;

    if (field === variant || words.includes(variant))
    {
      score = exactScore;
    }
    else if (
      variant.length >= 3 &&
      words.some((word) => word.startsWith(variant))
    )
    {
      // Word-prefix partial match ONLY. A raw substring test (`field.includes`)
      // would let "men" match "women" and bleed one gender's products into the
      // other's results, so partials are anchored to whole-word prefixes.
      score = partialScore;
    }

    if (score > best)
    {
      best = score;
    }
  }

  return best;
};

/**
 * Collects normalized per-variant attribute values (color, size, storage,
 * ram, custom + dynamic attribute values) for attribute-level matching.
 */
const collectVariantTokens = (product) =>
{
  const tokens = [];
  const variants = Array.isArray(product.variants) ? product.variants : [];

  for (const variant of variants)
  {
    const attrs = variant?.attributes || {};
    const values = [
      attrs.color,
      attrs.size,
      attrs.storage,
      attrs.ram,
      ...(Array.isArray(attrs.custom) ? attrs.custom.map((a) => a?.value) : []),
      ...(Array.isArray(attrs.dynamic) ? attrs.dynamic.map((a) => a?.value) : []),
    ].filter(Boolean);

    for (const value of values)
    {
      const normalized = normalizeText(value);
      if (normalized)
      {
        tokens.push(normalized);
      }
    }
  }

  return [...new Set(tokens)];
};

/**
 * Computes a weighted relevance score for a product against a set of tokens.
 * Weights: title > brand > category > color/size/variant.
 *
 * Description text is intentionally excluded: descriptions are long, free-form
 * seller copy that cross-matches unrelated queries (e.g. a T-shirt whose
 * description happens to mention "jeans"), which destroys precision.
 * A per-token variant contribution is capped at the exact-variant weight so a
 * token that repeats across every variant cannot dominate.
 */
export const scoreProduct = (product, tokens) =>
{
  if (!product || !Array.isArray(tokens) || tokens.length === 0)
  {
    return 0;
  }

  const title = normalizeText(product.title);
  const brand = normalizeText(product.brand);
  const categoryName = normalizeText(product.category?.name);
  const categoryId = normalizeText(product.category?.categoryId);
  const color = normalizeText(
    Array.isArray(product.color) ? product.color.join(" ") : product.color,
  );
  const sizes = normalizeText(product.sizes);
  const variantTokens = collectVariantTokens(product);

  let score = 0;

  for (const token of tokens)
  {
    score += matchField(token, title, SCORE_TITLE_EXACT, SCORE_TITLE_PARTIAL);
    score += matchField(token, brand, SCORE_BRAND_EXACT, SCORE_BRAND_PARTIAL);
    score += matchField(token, categoryName, SCORE_CATEGORY_EXACT, SCORE_CATEGORY_PARTIAL);
    score += matchField(token, categoryId, SCORE_CATEGORY_EXACT, SCORE_CATEGORY_PARTIAL);
    score += matchField(token, color, SCORE_COLOR_EXACT, SCORE_COLOR_PARTIAL);
    score += matchField(token, sizes, SCORE_SIZE_EXACT, SCORE_SIZE_PARTIAL);

    let bestVariantScore = 0;
    for (const variantToken of variantTokens)
    {
      const variantScore = matchField(
        token,
        variantToken,
        SCORE_VARIANT_EXACT,
        SCORE_VARIANT_PARTIAL,
      );
      if (variantScore > bestVariantScore)
      {
        bestVariantScore = variantScore;
      }
    }
    score += bestVariantScore;
  }

  return score;
};

/**
 * Sorts a public-catalog array by relevance to the given search tokens and
 * keeps only products that clear MIN_RELEVANCE_SCORE.
 *
 * Multi-token queries use AND semantics: every search token must individually
 * contribute to a product's score. This keeps a generic qualifier like "men"
 * from pulling in unrelated categories ("men jeans" must return jeans, not
 * every "Men ..." category product). Ties break by title.
 */
export const rankProducts = (products = [], searchTokens = []) =>
{
  if (!Array.isArray(products) || searchTokens.length === 0)
  {
    return [];
  }

  return products
    .map((product) => {
      const perToken = searchTokens.map((token) =>
        scoreProduct(product, [token]),
      );
      const total = perToken.reduce((sum, score) => sum + score, 0);

      return { product, total, perToken };
    })
    .filter(
      ({ total, perToken }) =>
        total >= MIN_RELEVANCE_SCORE &&
        perToken.every((score) => score > 0),
    )
    .sort(
      (a, b) =>
        b.total - a.total ||
        String(a.product.title || "").localeCompare(
          String(b.product.title || ""),
        ),
    )
    .map(({ product }) => product);
};

// ------------------------------------------------------------
// ACTION recognition (Phase 4)
// ------------------------------------------------------------

/** Words/phrases that must never be treated as shopping actions. */
const DESTRUCTIVE_PATTERNS = [
  /\b(delete|drop|remove|erase|wipe|clear)\b.*\b(database|account|everything|all|every)\b/,
  /\b(delete|drop)\b.*\b(marketplace|server|system|data)\b/,
];

const CART_WORD = /\b(cart|basket|bag)\b/;

const ORDINAL_MAP = {
  first: 0, "1st": 0, "1": 0,
  second: 1, "2nd": 1, "2": 1,
  third: 2, "3rd": 2, "3": 2,
  fourth: 3, "4th": 3, "4": 3,
  fifth: 4, "5th": 4, "5": 4,
  // Romanized Indic ordinals (Task 7)
  pehla: 0, pahla: 0, pehle: 0, pehli: 0, pehliyaan: 0,
  doosra: 1, dooja: 1, dusra: 1, doosri: 1, duja: 1,
  teesra: 2, tisra: 2, teesri: 2, tisri: 2,
};

/**
 * Extracts an explicit ordinal reference ("first", "2", "the second one").
 * Plain words like "one"/"two" are deliberately NOT matched so that "the
 * nike one" is treated as a product keyword, not the first search result.
 * Returns { index, label } or null.
 */
export const extractOrdinalIndex = (value = "") =>
{
  const match = String(value)
    .toLowerCase()
    .match(
      /\b(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|pehla|pahla|pehle|pehli|pehliyaan|doosra|dooja|dusra|doosri|duja|teesra|tisra|teesri|tisri|\d{1,2})\b/,
    );

  if (!match)
  {
    return null;
  }

  const index = ORDINAL_MAP[match[1]];
  if (index === undefined)
  {
    return null;
  }

  return { index, label: match[1] };
};

/**
 * Extracts a requested numeric quantity. Supports:
 *   "quantity to 3", "make it 2", "set it to 5", "change to 3",
 *   "increase this to 5", "reduce to 2", "add 3"
 * Returns an integer or null.
 */
export const extractQuantityNumber = (value = "") =>
{
  const text = String(value).toLowerCase();

  const direct = text.match(
    /(?:quantity|make\s+(?:it|that)|set\s+it|set|change\s+it|change|update|increase|decrease|reduce)\b[^.]*?\b(\d{1,2})\b/
  );
  if (direct)
  {
    return parseInt(direct[1], 10);
  }

  const add = text.match(/\badd\b[^.]*?\b(\d{1,2})\b/);
  if (add)
  {
    return parseInt(add[1], 10);
  }

  return null;
};

/** Words that carry no product-identity value for keyword extraction. */
const PRODUCT_REF_STOP = new Set([
  "add", "put", "remove", "delete", "update", "change", "increase",
  "decrease", "reduce", "set", "make", "quantity", "cart", "basket",
  "bag", "item", "product", "one", "two", "three", "four", "five",
  "to", "my", "the", "this", "that", "from", "of", "in", "into", "on",
  "for", "please", "do", "can", "you", "me", "it", "them", "would",
  "like", "want", "with", "at", "a", "an", "is", "are",
  // Romanized Indic (Task 7): action verbs + particles that must never
  // become the product keyword when a reference is resolved.
  "daal", "daalo", "daale", "rakh", "rakho", "rakhe", "rakhna",
  "paa", "pao", "pa", "karo", "kar", "kijiye", "kare", "karne", "karke",
  "hatao", "hata", "nikalo", "nikal", "kaddo", "kado", "kad",
  "dikhao", "dikha", "dekh", "dekho", "vekho", "vekh", "batao", "bata",
  "mein", "me", "kya", "mujhe", "mainu", "menu", "wala", "wali", "wale",
  "ye", "yeh", "eh", "oh", "is", "us", "wo", "woh", "de", "da", "di",
  "ne", "nu", "vich", "order", "orders",
  // Demonstrative pronouns that point at the selected/last product.
  "isko", "isse", "usko", "usse", "usee", "ehnu", "esnu", "eh", "isnu",
  "usanu", "inun", "ehna", "ehda",
]);

/**
 * Words that make "this one" references without mentioning a product noun.
 */
const DEMONSTRATIVE_REF_WORDS = new Set([
  "isko", "isse", "usko", "usse", "usee", "ehnu", "esnu", "isnu",
  "usanu", "inun", "ehna", "ehda",
]);

/**
 * Extracts a product reference from an action phrase:
 *   { kind: "index", index }   -> "the first one"
 *   { kind: "keyword", text }  -> "the nike one"
 *   { kind: "last" }           -> "this product" / "that product"
 * Returns null when nothing resolvable is present.
 */
export const extractProductRef = (value = "") =>
{
  const normalized = normalizeText(value);

  const ordinal = extractOrdinalIndex(normalized);
  if (ordinal)
  {
    return { kind: "index", index: ordinal.index };
  }

  if (/\b(this|that|it)\b/.test(normalized) || DEMONSTRATIVE_REF_WORDS.has(normalized) || normalized.split(" ").some((token) => DEMONSTRATIVE_REF_WORDS.has(token)))
  {
    return { kind: "last" };
  }

  const keyword = normalized
    .split(" ")
    .filter((token) => token && !PRODUCT_REF_STOP.has(token))
    .find((token) => token.length > 2);

  if (keyword)
  {
    return { kind: "keyword", text: keyword };
  }

  return null;
};

/**
 * Classifies a free-text prompt into a shopping ACTION or null.
 *
 * Priority: destructive/unsupported guard -> ADD -> REMOVE -> UPDATE -> VIEW.
 * Questions ("what is in my cart?") are still interpreted, but meta-questions
 * about the assistant ("how do I add to cart") are left to normal chat.
 */
export const extractActionRequest = (query) =>
{
  const raw = String(query || "");
  const text = transliterateCommerceTerms(raw).toLowerCase().trim();

  if (!text)
  {
    return null;
  }

  // Prompt-injection / destructive attempts -> explicit unsupported marker.
  if (DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(text)))
  {
    return { type: "UNSUPPORTED" };
  }

  // Meta questions ("how do I add to cart?") are conversation, not commands.
  if (/\bhow\s+(do|can|would)\s+(i|you)\b/.test(text))
  {
    return null;
  }

  const hasCartWord = CART_WORD.test(text);

  // --- ADD_TO_CART ---
  const addVerb = /\b(add|put|include|place|drop|daal|daalo|daale|rakh|rakho|rakhe|paa|pao|pa)\b/.test(text);
  const addThis = /\badd\s+(this|that|it|them|the)\b/.test(text);
  const addCount = /\badd\b[^.]*\b\d+\b/.test(text);

  if (
    (addVerb && hasCartWord) ||
    addThis ||
    addCount
  )
  {
    const quantity = extractQuantityNumber(text);
    const ref = extractProductRef(normalizeText(text));

    return { type: "ADD_TO_CART", ref, quantity };
  }

  // --- REMOVE_FROM_CART ---
  const removeVerb = /\b(remove|delete|take\s+out|clear|hatao|hata|nikalo|nikal|kaddo|kado|kad)\b/.test(text);
  const removeTarget = hasCartWord || /\b(item|one|product|this|that|it|first|second|third|pehla|pahla|pehle|doosra|dooja|teesra)\b/.test(text);

  if (removeVerb && removeTarget)
  {
    const ref = extractProductRef(normalizeText(text));
    return { type: "REMOVE_FROM_CART", ref };
  }

  // --- UPDATE_CART_QUANTITY ---
  const quantity = extractQuantityNumber(text);
  const quantityVerb = /\b(quantity|change|update|set|increase|decrease|reduce|make|karo|kar|kijiye|rakho)\b/.test(text);

  if (quantity !== null && quantityVerb)
  {
    const ref = extractProductRef(normalizeText(text));
    return { type: "UPDATE_CART_QUANTITY", quantity, ref };
  }

  // --- VIEW_CART ---
  const viewVerb = /\b(show|view|see|open|check|display|list|items|what|my|read|dikhao|dikha|dekh|dekho|vekho|vekh|batao|bata)\b/.test(text);
  if (hasCartWord && viewVerb)
  {
    return { type: "VIEW_CART" };
  }

  return null;
};
