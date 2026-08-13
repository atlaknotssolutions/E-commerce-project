/**
 * Strict server-side public product serializer for the AI chatbot.
 *
 * The chatbot `sources` payload must ONLY ever contain the public fields the
 * frontend product cards actually need. Raw MongoDB product documents embed
 * private data (seller email/mobile/GSTIN/business address, moderation
 * history, reserved quantity, internal admin ids, publication status) and
 * must NEVER reach a chat client.
 *
 * Public whitelist (mirrors frontend `ResponseMessage` usage):
 *   id
 *   title
 *   sellingPrice
 *   mrpPrice
 *   category: { categoryId, name }
 *   images: [{ url }]
 *
 * No field spread (`...product`) is used — the output object is built from
 * an explicit allow-list only.
 */

const getImageUrl = (images) =>
{
    if (!Array.isArray(images) || images.length === 0)
    {
        return undefined;
    }

    const primary = images.find(
        (img) => img && typeof img === 'object' && img.isPrimary
    );
    const first = primary || images[0];

    if (typeof first === 'string')
    {
        return first;
    }

    if (first && typeof first.url === 'string')
    {
        return first.url;
    }

    return undefined;
};

const getCategoryId = (category) =>
{
    if (!category || typeof category !== 'object')
    {
        return undefined;
    }

    return typeof category.categoryId === 'string'
        ? category.categoryId
        : undefined;
};

const getCategoryName = (category) =>
{
    if (!category || typeof category !== 'object')
    {
        return undefined;
    }

    return typeof category.name === 'string' ? category.name : undefined;
};

/**
 * Maps a single public product document to its public source shape.
 * Returns null when the input is unusable.
 */
export const toPublicProductSource = (product) =>
{
    if (!product)
    {
        return null;
    }

    const source = {};

    if (product._id)
    {
        source.id = product._id.toString();
    }
    else if (product.id)
    {
        source.id = String(product.id);
    }

    if (product.title)
    {
        source.title = product.title;
    }

    if (product.sellingPrice !== undefined && product.sellingPrice !== null)
    {
        source.sellingPrice = product.sellingPrice;
    }

    if (product.mrpPrice !== undefined && product.mrpPrice !== null)
    {
        source.mrpPrice = product.mrpPrice;
    }

    const categoryId = getCategoryId(product.category);
    const categoryName = getCategoryName(product.category);
    if (categoryId || categoryName)
    {
        source.category = {};
        if (categoryId)
        {
            source.category.categoryId = categoryId;
        }
        if (categoryName)
        {
            source.category.name = categoryName;
        }
    }

    const imageUrl = getImageUrl(product.images);
    if (imageUrl)
    {
        source.images = [{ url: imageUrl }];
    }

    return source;
};

/**
 * Maps an array of public product documents to public source objects.
 * Filters out unusable entries (no public id).
 */
export const mapPublicProductSources = (products = []) =>
{
    if (!Array.isArray(products))
    {
        return [];
    }

    return products
        .map(toPublicProductSource)
        .filter((source) => source && source.id);
};
