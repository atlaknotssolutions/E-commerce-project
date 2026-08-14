import { scoreProduct, MIN_RELEVANCE_SCORE } from "./ai.intents.js";
import { normalizeText } from "./ai.intents.js";

const BUDGET_FIT = 20;
const COLOR_MATCH = 12;
const BRAND_MATCH = 15;
const CATEGORY_MATCH = 10;
const OCCASION_BONUS = 8;

const normalizeCategoryName = (product) =>
  normalizeText(
    product?.category?.name ||
    product?.category?.categoryId ||
    "",
  );

const productIdOf = (product) =>
  product?._id?.toString?.() ||
  product?.id ||
  null;

const priceOf = (product) => Number(product?.sellingPrice || 0);

const matchesToken = (product, token) =>
  scoreProduct(product, [token]) > 0;

const colorOf = (product) => {
  const value = Array.isArray(product?.color)
    ? product.color.join(" ")
    : product.color;
  return normalizeText(value || "");
};

const brandOf = (product) => normalizeText(product?.brand || "");

/**
 * Deterministically ranks public-catalog products for a shopping request.
 * Combines the existing relevance model (scoreProduct / MIN_RELEVANCE_SCORE)
 * with explicit constraint bonuses so the ordering is stable, explainable and
 * testable: keyword relevance first, then constraint fit (budget, color,
 * brand, category, occasion), then lower price as a final tie-breaker.
 */
export const scoreShoppingProduct = (product, constraints = {}, tokens = []) => {
  if (!product) return { product: null, score: 0, reasons: [], relevance: 0 };

  const base = tokens.length > 0
    ? scoreProduct(product, tokens)
    : MIN_RELEVANCE_SCORE;

  const reasons = [];
  let score = base;

  const budget = constraints?.budget;
  if (budget?.maxPrice && priceOf(product) > 0) {
    if (priceOf(product) <= budget.maxPrice) {
      score += BUDGET_FIT;
      reasons.push("budget");
    }
  }

  const color = constraints?.color;
  if (color) {
    const productColor = colorOf(product);
    if (
      productColor &&
      (productColor.includes(color) || color.includes(productColor))
    ) {
      score += COLOR_MATCH;
      reasons.push("color");
    }
  }

  const brand = constraints?.brand;
  if (brand) {
    if (
      brandOf(product) === brand ||
      brandOf(product).includes(brand) ||
      brand.includes(brandOf(product))
    ) {
      score += BRAND_MATCH;
      reasons.push("brand");
    }
  }

  const useCase = constraints?.useCase;
  if (useCase && tokens.length > 0) {
    const categoryName = normalizeCategoryName(product);
    if (categoryName && tokens.some((token) => matchesToken(product, token))) {
      score += CATEGORY_MATCH;
      reasons.push("category");
    }
  }

  if (constraints?.occasion) {
    score += OCCASION_BONUS;
    reasons.push("occasion");
  }

  return { product, score, reasons, relevance: base };
};

export const rankShoppingProducts = (products = [], constraints = {}, tokens = []) => {
  if (!Array.isArray(products)) return [];

  const exclude = constraints?.exclude;
  const rankings = products
    .map((product) => scoreShoppingProduct(product, constraints, tokens))
    .filter((ranking) => {
      if (!ranking.product || ranking.score < MIN_RELEVANCE_SCORE) {
        return false;
      }
      // With explicit keyword tokens, a product must also be relevant to the
      // search itself; a budget/color bonus alone must not surface unrelated
      // products ("recommend sneakers" must never return t-shirts).
      if (tokens.length > 0 && ranking.relevance < MIN_RELEVANCE_SCORE) {
        return false;
      }
      if (!exclude) return true;
      const productColor = colorOf(ranking.product);
      const productBrand = brandOf(ranking.product);
      if (exclude.type === "color" && productColor === exclude.value) return false;
      if (exclude.type === "brand" && productBrand === exclude.value) return false;
      return true;
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        priceOf(a.product) - priceOf(b.product) ||
        String(a.product.title || "").localeCompare(String(b.product.title || "")),
    );

  return rankings;
};

/**
 * Picks the strongest, data-grounded reason string for a ranked product so
 * recommendations stay explainable without ever inventing attributes.
 */
export const buildReasonPhrase = (ranking, constraints, t, lang) => {
  const product = ranking?.product;
  if (!product) return "";

  const reasons = ranking.reasons || [];
  const budget = constraints?.budget;
  const color = constraints?.color;
  const brand = constraints?.brand;

  if (budget?.mode === "around" && reasons.includes("budget")) {
    return t(lang, "reasonAroundBudget", { price: budget.anchor });
  }
  if (budget?.maxPrice && reasons.includes("budget")) {
    return t(lang, "reasonWithinBudget", { price: budget.maxPrice });
  }
  if (color && reasons.includes("color")) {
    return t(lang, "reasonColorMatches", { color });
  }
  if (brand && reasons.includes("brand")) {
    return t(lang, "reasonBrandMatches", { brand });
  }

  const discount = Number(product.discountPercent);
  if (Number.isFinite(discount) && discount >= 20) {
    return t(lang, "reasonBigDiscount", { discount });
  }

  return t(lang, "reasonTopMatch");
};

export const pickComparableProducts = (ranked = [], want = 2) => {
  if (!Array.isArray(ranked)) return [];
  const unique = [];
  const seen = new Set();
  for (const item of ranked) {
    const id = productIdOf(item.product);
    if (id && !seen.has(id)) {
      seen.add(id);
      unique.push(item);
    }
    if (unique.length >= want) break;
  }
  return unique;
};

export const buildComparisonText = ({ items = [], constraints = {}, t = null, lang = "en" }) => {
  if (!Array.isArray(items) || items.length < 2) return null;

  const [first, second] = items;
  const firstPrice = priceOf(first.product);
  const secondPrice = priceOf(second.product);

  const priceLine =
    firstPrice > 0 && secondPrice > 0
      ? t(lang, "comparePrice", { first: firstPrice, second: secondPrice })
      : null;

  const categoryLine = (() => {
    const a = normalizeCategoryName(first.product);
    const b = normalizeCategoryName(second.product);
    return a && b ? t(lang, "compareCategory", { first: a, second: b }) : null;
  })();

  const verdict = (() => {
    if (firstPrice > 0 && secondPrice > 0 && firstPrice !== secondPrice) {
      const cheaper = firstPrice < secondPrice ? first : second;
      return t(lang, "compareVerdict", {
        title: cheaper.product.title,
        price: priceOf(cheaper.product),
      });
    }
    return null;
  })();

  const lines = [t(lang, "compareIntroAlt")];
  if (priceLine) lines.push(priceLine);
  if (categoryLine) lines.push(categoryLine);
  if (verdict) lines.push(verdict);

  return lines.join("\n");
};

/**
 * Builds a human, honest explanation for why a product was ranked first.
 */
export const buildTopPickExplanation = (ranked = [], constraints = {}, t = null, lang = "en") => {
  const top = Array.isArray(ranked) ? ranked[0] : null;
  if (!top?.product) return "";

  const reason = buildReasonPhrase(top, constraints, t, lang);
  return t(lang, "topPick", {
    title: top.product.title,
    reason,
  });
};