/**
 * Smart SKU Generator Utility.
 *
 * Generates human-readable, category-aware SKUs for product variants.
 * Format: CATEGORYPREFIX-ATTRIBUTECODE-SEQUENCE
 *
 * Examples:
 *   Fashion:  MTS-BLK-001  (Men > T-Shirts, Black, #1)
 *   Bags:     MBB-GRY-001  (Men > Bags > Backpacks, Grey, #1)
 *   Mobiles:  MOB-128-BLK-001  (Electronics > Mobiles, 128GB, Black, #1)
 *   Books:    BK-ENG-001  (Books, English, #1)
 */

// ==========================================
// COLOR CODE MAPPINGS
// ==========================================

const COLOR_CODES = {
    // Blacks & Darks
    black: 'BLK', charcoal: 'CHR', dark: 'DRK', darkgrey: 'DGY',
    navy: 'NVY', midnight: 'MID', onyx: 'ONX', jet: 'JET',

    // Whites & Lights
    white: 'WHT', ivory: 'IVR', cream: 'CRM', pearl: 'PRL',
    offwhite: 'OFW', snow: 'SNW', linen: 'LIN', alabaster: 'ALB',

    // Greys
    grey: 'GRY', gray: 'GRY', silver: 'SLV', ash: 'ASH',
    slate: 'SLT', pewter: 'PWT', dove: 'DV',

    // Blues
    blue: 'BLU', navyblue: 'NVY', skyblue: 'SKB', royalblue: 'RYB',
    lightblue: 'LTB', darkblue: 'DKB', cobalt: 'COB', cerulean: 'CRL',
    turquoise: 'TRQ', teal: 'TL', cyan: 'CYN', steelblue: 'STB',
    babyblue: 'BAB', powderblue: 'PDB', indigo: 'IND',

    // Reds
    red: 'RED', crimson: 'CRM', scarlet: 'SCL', maroon: 'MRN',
    burgundy: 'BGD', wine: 'WIN', cherry: 'CHY', ruby: 'RBY',
    vermilion: 'VRL', brick: 'BRK', cardinal: 'CRD',

    // Greens
    green: 'GRN', olive: 'OLV', sage: 'SG', emerald: 'EMD',
    forest: 'FRT', mint: 'MNT', lime: 'LM', jade: 'JD',
    tealgreen: 'TLG', hunter: 'HNT', moss: 'MSS', kelly: 'KLY',
    pistachio: 'PST', fern: 'FRN',

    // Yellows
    yellow: 'YEL', gold: 'GLD', mustard: 'MST', amber: 'AMB',
    lemon: 'LMN', canary: 'CNY', butter: 'BTR', saffron: 'SFR',
    maize: 'MZ', primrose: 'PRM',

    // Oranges
    orange: 'ORG', coral: 'CRL', peach: 'PC', tangerine: 'TNG',
    apricot: 'APR', salmon: 'SLM', burntorange: 'BOR', rust: 'RST',
    terracotta: 'TRC',

    // Pinks
    pink: 'PNK', rose: 'RS', blush: 'BLH', fuchsia: 'FCS',
    magenta: 'MGT', hotpink: 'HPK', millennialpink: 'MLP',
    dustyrose: 'DSR', flamingo: 'FLM',

    // Purples & Violets
    purple: 'PUR', violet: 'VLT', lavender: 'LAV', plum: 'PLM',
    mauve: 'MV', lilac: 'LLC', amethyst: 'AMT', orchid: 'ORC',
    grape: 'GRP',

    // Browns & Earth Tones
    brown: 'BRN', tan: 'TAN', beige: 'BEG', khaki: 'KHK',
    camel: 'CML', taupe: 'TP', mocha: 'MCH', cocoa: 'COC',
    chocolate: 'CHC', espresso: 'ESP', caramel: 'CRL',
    sand: 'SND', sienna: 'SNA', umber: 'UMB',

    // Metallics & Special
    copper: 'CPR', bronze: 'BRZ', rose_gold: 'RSG', gold: 'GLD',
    silver: 'SLV', rose_gold: 'RSG', neon: 'NEO', pastel: 'PST',
    transparent: 'TRN', multicolor: 'MLT', rainbow: 'RBW',
    beige: 'BEG', ecru: 'ECR', fawn: 'FWN',
};

// ==========================================
// COMMON WORD SHORT CODES (non-color attributes)
// ==========================================

const WORD_CODES = {
    // Sizes
    small: 'S', medium: 'M', large: 'L', 'extra large': 'XL',
    'double extra large': 'XXL', 'extra extra large': 'XXL',
    xs: 'XS', xxl: 'XXL', xxxl: 'XXXL',

    // Materials
    leather: 'LTH', cotton: 'CTN', silk: 'SLK', wool: 'WL',
    linen: 'LN', denim: 'DNM', polyester: 'PLY', nylon: 'NYL',
    suede: 'SWD', velvet: 'VLT', cashmere: 'CSM', acrylic: 'ACR',
    spandex: 'SPX', rubber: 'RBR', canvas: 'CVS', mesh: 'MSH',
    satin: 'STN', chiffon: 'CFN', tweed: 'TWD', corduroy: 'CDY',
    bamboo: 'BMB', organic: 'ORG', faux: 'FX', vegan: 'VGN',

    // Languages
    english: 'ENG', hindi: 'HIN', spanish: 'SPN', french: 'FRH',
    german: 'GRM', chinese: 'CHN', japanese: 'JPN', korean: 'KOR',
    arabic: 'ARB', portuguese: 'POR', italian: 'ITN', russian: 'RUS',
    bengali: 'BNG', tamil: 'TML', telugu: 'TLG', marathi: 'MRT',
    kannada: 'KND', malayalam: 'MLY', gujarati: 'GJR', punjabi: 'PNJ',
    urdu: 'URD', sanskrit: 'SNK',

    // Types / Categories
    men: 'M', women: 'W', kids: 'K', boys: 'BY', girls: 'GL',
    baby: 'BB', unisex: 'UN', formal: 'FRM', casual: 'CSL',
    sports: 'SPT', running: 'RUN', walking: 'WLK', hiking: 'HIK',
    gym: 'GYM', outdoor: 'ODR', indoor: 'IND', premium: 'PRM',
    regular: 'REG', slim: 'SLM', loose: 'LSE', slim_fit: 'SLF',
    regular_fit: 'RGF', oversized: 'OSZ', cropped: 'CRP',

    // Electronics
    '128': '128', '256': '256', '512': '512', '1': '1TB',
    '2': '2TB', '4': '4TB', '64': '64', '32': '32', '16': '16',
    gb: 'GB', mb: 'TB', ram: 'RAM', rom: 'ROM',

    // Book formats
    paperback: 'PPB', hardcover: 'HDC', Hardcover: 'HDC',
    ebook: 'EBK', audiobook: 'AUD',
};

// ==========================================
// CATEGORY PREFIX BUILDER
// ==========================================

/**
 * Generates a 2-3 character category prefix from the category hierarchy chain.
 *
 * Strategy:
 * - Level 1 (root): first 1-2 chars of name
 * - Level 2: first char of name
 * - Level 3 (leaf): first char of name
 *
 * Combined and uppercased to form the prefix.
 *
 * Examples:
 *   Men > T-Shirts           → M + TS = MTS
 *   Men > Bags > Backpacks   → M + B + B = MBB (deduped: MBB → MBB is fine)
 *   Women > Dresses          → W + DR = WDR
 *   Electronics > Mobiles    → E + MO = EMO → MOB (special rule)
 *   Books                    → BK
 *   Home > Furniture         → H + F = HF
 *
 * @param {string[]} hierarchy - Array of category names from root to leaf
 * @returns {string} 2-4 character uppercase prefix
 */
const buildCategoryPrefix = (hierarchy) =>
{
    if (!hierarchy || hierarchy.length === 0) return 'GEN';

    const words = hierarchy.map((name) => (name || '').trim().toUpperCase());
    const parts = [];

    if (words.length === 1)
    {
        // Single level: take first 2 consonants or first 2 letters
        const w = words[0];
        const consonants = w.replace(/[AEIOU\s]/g, '');
        if (consonants.length >= 2)
        {
            parts.push(consonants.substring(0, 2));
        } else if (w.length >= 2)
        {
            parts.push(w.substring(0, 2));
        } else
        {
            parts.push(w);
        }
    } else
    {
        // Multi-level: first letter(s) from each level
        for (let i = 0; i < words.length; i++)
        {
            const w = words[i];
            if (i === 0)
            {
                // Root: first character (or 2 for single-syllable words)
                parts.push(w.substring(0, 1));
            } else if (i === words.length - 1)
            {
                // Leaf: take first 2 chars (the most specific level)
                parts.push(w.substring(0, 2));
            } else
            {
                // Middle levels: first character
                parts.push(w.substring(0, 1));
            }
        }
    }

    const prefix = parts.join('');

    // Enforce max 4 characters, min 2 characters
    if (prefix.length > 4) return prefix.substring(0, 4);
    if (prefix.length < 2) return (prefix + 'X').substring(0, 2);

    return prefix;
};

// ==========================================
// ATTRIBUTE CODE GENERATOR
// ==========================================

/**
 * Converts an attribute value into a short, readable SKU code.
 *
 * Rules:
 * 1. If the value is purely numeric, return as-is (e.g., "128" → "128")
 * 2. If the value is a known color, return the color code (e.g., "Black" → "BLK")
 * 3. If the value is a known word, return the word code (e.g., "Cotton" → "CTN")
 * 4. Otherwise, take initials of each word, max 3 chars (e.g., "Extra Large" → "XL")
 *
 * @param {string} value - The attribute value to convert
 * @returns {string} 1-4 character uppercase code
 */
const buildAttributeCode = (value) =>
{
    if (!value || typeof value !== 'string') return 'NA';

    const trimmed = value.trim();

    // Pure numeric values stay as-is
    if (/^\d+(\.\d+)?\s*(GB|MB|TB|gb|mb|tb)?$/i.test(trimmed))
    {
        const num = trimmed.replace(/\s*(GB|MB|TB)/gi, '');
        return num.toUpperCase();
    }

    const lower = trimmed.toLowerCase().replace(/[\s_-]+/g, '_');

    // Check color lookup
    if (COLOR_CODES[lower])
    {
        return COLOR_CODES[lower];
    }

    // Check word code lookup
    if (WORD_CODES[lower])
    {
        return WORD_CODES[lower];
    }

    // Handle multi-word values: take first letter of each word
    const words = trimmed.split(/[\s_-]+/).filter(Boolean);
    if (words.length > 1)
    {
        const initials = words.map((w) => w.charAt(0).toUpperCase()).join('');
        if (initials.length <= 3) return initials;
        return initials.substring(0, 3);
    }

    // Single word: take first 3 characters
    const clean = trimmed.replace(/[^a-zA-Z0-9]/g, '');
    if (clean.length <= 3) return clean.toUpperCase();
    return clean.substring(0, 3).toUpperCase();
};

// ==========================================
// SEQUENCE FORMATTER
// ==========================================

/**
 * Formats a sequence number as a zero-padded 3-digit string.
 * @param {number} num - Sequence number (1-based)
 * @returns {string} e.g., "001", "012", "999"
 */
const formatSequence = (num) =>
{
    const n = Math.max(1, Math.floor(num));
    return String(n).padStart(3, '0');
};

// ==========================================
// SKU ASSEMBLY
// ==========================================

/**
 * Assembles the final SKU from prefix, attribute codes, and sequence.
 *
 * @param {string} prefix - Category prefix (e.g., "MTS")
 * @param {string[]} attrCodes - Attribute codes (e.g., ["BLK"] or ["128", "BLK"])
 * @param {number} sequence - Sequence number
 * @returns {string} The assembled SKU (e.g., "MTS-BLK-001")
 */
const assembleSku = (prefix, attrCodes, sequence) =>
{
    const parts = [prefix];
    if (attrCodes && attrCodes.length > 0)
    {
        attrCodes.forEach((code) =>
        {
            if (code) parts.push(code);
        });
    }
    parts.push(formatSequence(sequence));
    return parts.join('-');
};

// ==========================================
// PUBLIC API
// ==========================================

/**
 * Generates a smart SKU for a product variant.
 *
 * @param {Object} params
 * @param {string[]} params.categoryHierarchy - Category names from root to leaf, e.g., ["Men", "T-Shirts"]
 * @param {Object} params.attributes - Variant attributes (legacy or dynamic)
 * @param {string} [params.attributes.color] - Color value (legacy)
 * @param {string} [params.attributes.size] - Size value (legacy)
 * @param {string} [params.attributes.storage] - Storage value (legacy)
 * @param {string} [params.attributes.ram] - RAM value (legacy)
 * @param {Array<{name: string, value: string}>} [params.attributes.dynamic] - Dynamic attributes
 * @param {number} params.sequence - Sequence number for this prefix combination
 *
 * @returns {string} Generated SKU, e.g., "MTS-BLK-001"
 */
export const generateSku = ({
    categoryHierarchy = [],
    attributes = {},
    sequence = 1,
} = {}) =>
{
    // 1. Build category prefix
    const prefix = buildCategoryPrefix(categoryHierarchy);

    // 2. Build attribute codes from the most specific attributes
    const attrCodes = [];

    // Dynamic attributes take priority (they represent the category's supported variant attributes)
    if (Array.isArray(attributes.dynamic) && attributes.dynamic.length > 0)
    {
        attributes.dynamic.forEach((attr) =>
        {
            if (attr.value && attr.value.trim())
            {
                attrCodes.push(buildAttributeCode(attr.value));
            }
        });
    }

    // If no dynamic attributes, fall back to legacy fields
    if (attrCodes.length === 0)
    {
        if (attributes.color)
        {
            attrCodes.push(buildAttributeCode(attributes.color));
        }
        if (attributes.size)
        {
            attrCodes.push(buildAttributeCode(attributes.size));
        }
        if (attributes.storage)
        {
            attrCodes.push(buildAttributeCode(attributes.storage));
        }
        if (attributes.ram)
        {
            attrCodes.push(buildAttributeCode(attributes.ram));
        }
    }

    // If still no attribute codes, use "DEF" for default
    if (attrCodes.length === 0)
    {
        attrCodes.push('DEF');
    }

    // Cap attribute codes at 2 to keep SKU readable
    const cappedCodes = attrCodes.slice(0, 2);

    // 3. Assemble final SKU
    return assembleSku(prefix, cappedCodes, sequence);
};

/**
 * Extracts all unique attribute values from a variant for SKU generation.
 * Prioritizes dynamic attributes, falls back to legacy fields.
 *
 * @param {Object} attributes - Variant attributes object
 * @returns {Array<{name: string, value: string}>} List of non-empty attribute pairs
 */
export const extractAttributePairs = (attributes = {}) =>
{
    const pairs = [];

    if (Array.isArray(attributes.dynamic) && attributes.dynamic.length > 0)
    {
        attributes.dynamic.forEach((attr) =>
        {
            if (attr.name && attr.value && attr.value.trim())
            {
                pairs.push({ name: attr.name, value: attr.value.trim() });
            }
        });
    }

    if (pairs.length === 0)
    {
        if (attributes.color) pairs.push({ name: 'color', value: attributes.color });
        if (attributes.size) pairs.push({ name: 'size', value: attributes.size });
        if (attributes.storage) pairs.push({ name: 'storage', value: attributes.storage });
        if (attributes.ram) pairs.push({ name: 'ram', value: attributes.ram });
    }

    return pairs;
};

/**
 * Builds a unique key string for a variant's attribute combination.
 * Used for deduplication when finding the next available sequence.
 *
 * @param {string} prefix - Category prefix
 * @param {string[]} attrCodes - Attribute codes
 * @returns {string} Unique key, e.g., "MTS-BLK"
 */
export const buildSkuPrefix = (prefix, attrCodes = []) =>
{
    const parts = [prefix];
    attrCodes.forEach((code) =>
    {
        if (code) parts.push(code);
    });
    return parts.join('-');
};
