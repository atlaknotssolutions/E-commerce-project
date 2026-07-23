/**
 * Centralized inventory operations for the order lifecycle.
 *
 * Every inventory mutation across the entire system MUST route through this module.
 * This eliminates duplication and ensures a single source of truth for:
 *   - Stock reservation (checkout)
 *   - Stock commit (seller confirmation)
 *   - Stock release (cancellation / payment failure / expiry)
 */

export const createInventoryHelper = ({ productRepository, createApiError }) =>
{
    const reserveOrderInventory = async (orderItems) =>
    {
        const reserved = [];

        for (const item of orderItems)
        {
            let result;
            if (item.variantId)
            {
                result = await productRepository.reserveVariantStock({
                    productId: item.product,
                    variantId: item.variantId,
                    quantity: item.quantity,
                });
            }
            else
            {
                result = await productRepository.reserveProductStock({
                    productId: item.product,
                    quantity: item.quantity,
                });
            }

            if (!result)
            {
                for (const r of reserved)
                {
                    if (r.variantId)
                    {
                        await productRepository.releaseVariantStock(r);
                    }
                    else
                    {
                        await productRepository.releaseProductStock(r);
                    }
                }

                throw createApiError({
                    statusCode: 400,
                    code: 'INSUFFICIENT_STOCK',
                    message: `Insufficient stock for product "${item.title}".`,
                });
            }

            reserved.push({
                productId: item.product,
                variantId: item.variantId || null,
                quantity: item.quantity,
            });
        }
    };

    const commitOrderInventory = async (orderItems) =>
    {
        for (const item of orderItems)
        {
            if (item.variantId)
            {
                await productRepository.commitVariantStock({
                    productId: item.product,
                    variantId: item.variantId,
                    quantity: item.quantity,
                });
            }
            else
            {
                await productRepository.commitProductStock({
                    productId: item.product,
                    quantity: item.quantity,
                });
            }
        }
    };

    const releaseOrderInventory = async (orderItems) =>
    {
        for (const item of orderItems)
        {
            if (item.variantId)
            {
                await productRepository.releaseVariantStock({
                    productId: item.product,
                    variantId: item.variantId,
                    quantity: item.quantity,
                });
            }
            else
            {
                await productRepository.releaseProductStock({
                    productId: item.product,
                    quantity: item.quantity,
                });
            }
        }
    };

    const restockOrderInventory = async (orderItems) =>
    {
        for (const item of orderItems)
        {
            if (item.variantId)
            {
                await productRepository.restockVariantStock({
                    productId: item.product,
                    variantId: item.variantId,
                    quantity: item.quantity,
                });
            }
            else
            {
                await productRepository.restockProductStock({
                    productId: item.product,
                    quantity: item.quantity,
                });
            }
        }
    };

    return Object.freeze({
        reserveOrderInventory,
        commitOrderInventory,
        releaseOrderInventory,
        restockOrderInventory,
    });
};
