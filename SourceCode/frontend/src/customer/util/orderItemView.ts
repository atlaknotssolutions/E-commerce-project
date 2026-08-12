import { OrderItem } from '../../types/orderTypes';

/** Placeholder image used across the project when no product image is available. */
export const PRODUCT_IMAGE_FALLBACK = '/logo192.png';

/** Meaningful fallback name shown only when no historical product name exists. */
export const PRODUCT_UNAVAILABLE_NAME = 'Product no longer available';

/**
 * Normalized read-only view of an order item.
 * Guarantees safe display values even when the live product reference is
 * null (deleted product) or partially missing (empty images, missing seller).
 */
export interface OrderItemView {
    id: string;
    /** Live product id, or null when the product no longer exists. */
    productId: string | null;
    /** True when a live, populated product is available. */
    productAvailable: boolean;
    /** True when the order item stores a historical product name snapshot. */
    hasHistoricalName: boolean;
    /** Safe image URL (falls back to the project placeholder). */
    image: string;
    /** Best available display name: live title -> historical snapshot title -> fallback. */
    name: string;
    /** Seller business name when available, otherwise empty string. */
    sellerName: string;
    /** Human-readable variant/size label. */
    variantLabel: string;
    quantity: number;
    mrpPrice: number;
    sellingPrice: number;
}

const buildVariantLabel = (item: OrderItem): string =>
{
    if (item.variantAttributes)
    {
        const parts: string[] = [];
        if (item.variantAttributes.color) parts.push(item.variantAttributes.color);
        if (item.variantAttributes.size) parts.push(item.variantAttributes.size);
        if (item.variantAttributes.storage) parts.push(item.variantAttributes.storage);
        if (item.variantAttributes.ram) parts.push(item.variantAttributes.ram);
        return parts.length > 0 ? parts.join(' / ') : item.size || 'FREE';
    }
    return item.size || 'FREE';
};

/**
 * Builds a safe display view for an order item.
 * Never throws on null product / missing product fields / missing image data.
 */
export const toOrderItemView = (item: OrderItem | null | undefined): OrderItemView =>
{
    if (!item)
    {
        return {
            id: '',
            productId: null,
            productAvailable: false,
            hasHistoricalName: false,
            image: PRODUCT_IMAGE_FALLBACK,
            name: PRODUCT_UNAVAILABLE_NAME,
            sellerName: '',
            variantLabel: 'FREE',
            quantity: 0,
            mrpPrice: 0,
            sellingPrice: 0,
        };
    }

    const product = item.product;
    const productAvailable = Boolean(product);
    const historicalName = (item.title || '').trim();
    const liveName = product?.title?.trim() || '';
    const name = liveName || historicalName || PRODUCT_UNAVAILABLE_NAME;

    return {
        id: item.id || '',
        productId: product?.id || null,
        productAvailable,
        hasHistoricalName: historicalName.length > 0,
        image: product?.images?.[0]?.url || PRODUCT_IMAGE_FALLBACK,
        name,
        sellerName: product?.seller?.businessDetails?.businessName || '',
        variantLabel: buildVariantLabel(item),
        quantity: Number(item.quantity) || 0,
        mrpPrice: Number(item.mrpPrice) || 0,
        sellingPrice: Number(item.sellingPrice) || 0,
    };
};
