/**
 * Pure function-based factory representing the Order Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createOrderRepository = ({ Order }) =>
{

    /**
     * Commits a new split order document directly into database.
     */
    const createOrder = async (orderData, options = {}) =>
    {
        const [newOrder] = await Order.create([orderData], options);
        return newOrder ? newOrder.toObject() : null;
    };

    /**
     * Pulls customer purchase order history sorted newest first.
     */
    // const findByUser = async ({ userId }, options = {}) =>
    // {
    //     return Order.find({ user: userId }, null, options)
    //         .sort({ orderDate: -1 })
    //         .populate('seller', 'sellerName email mobile businessDetails')
    //         .lean();
    // };

    const findByUser = async ({ userId }, options = {}) =>
    {
        return Order.find({ user: userId }, null, options)
            .sort({ orderDate: -1 })
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color"
            })
            .lean();
    };

    /**
     * Pulls merchant store orders board sorted newest first.
     */
    const findBySeller = async ({ sellerId }, options = {}) =>
    {
        return Order.find({ seller: sellerId }, null, options)
            .sort({ orderDate: -1 })
            .populate("user", "fullName email mobile")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color"
            })
            .lean();
    };

    /**
     * Discovers a single order document by its unique database ObjectId.
     */
    // const findById = async (id, options = {}) =>
    // {
    //     return Order.findById(id, null, options)
    //         .populate('user', 'fullName email mobile')
    //         .populate('seller', 'sellerName email mobile businessDetails')
    //         .lean();
    // };

    const findById = async (id, options = {}) =>
    {
        return Order.findById(id, null, options)
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color variants.sku"
            })
            .lean();
    };

    /**
     * Commits administrative account status changes (e.g., ACTIVE, SUSPENDED, BANNED) into database.
     */
    // const updateStatus = async ({ orderId, orderStatus }, options = {}) =>
    // {
    //     return Order.findByIdAndUpdate(
    //         orderId,
    //         { orderStatus },
    //         { ...options, new: true, runValidators: true }
    //     ).lean();
    // };

    const updateStatus = async ({ orderId, orderStatus }, options = {}) =>
    {
        return Order.findByIdAndUpdate(
            orderId,
            { orderStatus },
            {
                ...options,
                new: true,
                runValidators: true,
            }
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    /**
     * Commits payment status updates into database.
     */
    const updatePaymentStatus = async ({ orderId, paymentStatus }, options = {}) =>
    {
        return Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { ...options, new: true }
        ).lean();
    };

    /**
     * Locates and retrieves a specific embedded ordered product snapshot by its unique subdocument ID.
     * Leverages MongoDB Positional Projection Operator ($) to avoid loading unrelated array elements.
     */
    // const findOrderItemById = async (orderItemId, options = {}) =>
    // {
    //     const order = await Order.findOne(
    //         { 'orderItems._id': orderItemId }, // Locates order containing target subdocument item ID
    //         { 'orderItems.$': 1 }, // Positional Projection: Returns only the matching array element!
    //         options
    //     ).lean();

    //     return order && order.orderItems ? order.orderItems[0] : null;
    // };

    const findOrderItemById = async (orderItemId, options = {}) =>
    {
        const order = await Order.findOne(
            { "orderItems._id": orderItemId },
            { "orderItems.$": 1 },
            options
        )
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color seller",
                populate: {
                    path: "seller",
                    select: "sellerName businessDetails",
                },
            })
            .lean();

        return order?.orderItems?.[0] || null;
    };

    const findOrderForSeller = async ({ orderId, sellerId }, options = {}) =>
    {
        return Order.findOne(
            { _id: orderId, seller: sellerId },
            null,
            options
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    const findOrderForCustomer = async ({ orderId, customerId }, options = {}) =>
    {
        return Order.findOne(
            { _id: orderId, user: customerId },
            null,
            options
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    const updateStatusWithHistory = async ({ orderId, orderStatus, historyEntry }, options = {}) =>
    {
        return Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus,
                $push: { statusHistory: historyEntry },
            },
            {
                ...options,
                new: true,
                runValidators: true,
            }
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    const appendStatusHistory = async ({ orderId, historyEntry }, options = {}) =>
    {
        return Order.findByIdAndUpdate(
            orderId,
            { $push: { statusHistory: historyEntry } },
            {
                ...options,
                new: true,
                runValidators: true,
            }
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    const updateOrder = async (orderId, data, options = {}) =>
    {
        return Order.findByIdAndUpdate(
            orderId,
            { $set: data },
            { ...options, new: true, runValidators: true }
        ).lean();
    };

    const findOrdersByIds = async (orderIds, options = {}) =>
    {
        return Order.find(
            { _id: { $in: orderIds } },
            null,
            options
        ).lean();
    };

    const findExpiredReservations = async ({ beforeDate }, options = {}) =>
    {
        return Order.find(
            {
                orderStatus: { $in: ['PENDING', 'PLACED'] },
                reservationExpiresAt: { $lte: beforeDate, $ne: null },
            },
            null,
            options
        ).lean();
    };

    const updateShipmentTracking = async ({ orderId, trackingNumber, carrier, estimatedDelivery, shipmentHistoryEntry }, options = {}) =>
    {
        const updateOps = {
            trackingNumber,
            $push: { shipmentHistory: shipmentHistoryEntry },
        };

        if (carrier) updateOps.carrier = carrier;
        if (estimatedDelivery) updateOps.estimatedDelivery = estimatedDelivery;

        return Order.findByIdAndUpdate(
            orderId,
            updateOps,
            {
                ...options,
                new: true,
                runValidators: true,
            }
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    const updateShipmentStatus = async ({ orderId, shipmentStatus, shipmentHistoryEntry, shippedAt, deliveredAt }, options = {}) =>
    {
        const updateOps = {
            shipmentStatus,
            $push: { shipmentHistory: shipmentHistoryEntry },
        };

        if (shippedAt) updateOps.shippedAt = shippedAt;
        if (deliveredAt) updateOps.deliveredAt = deliveredAt;

        return Order.findByIdAndUpdate(
            orderId,
            updateOps,
            {
                ...options,
                new: true,
                runValidators: true,
            }
        )
            .populate("user", "fullName email mobile")
            .populate("seller", "sellerName email mobile businessDetails")
            .populate({
                path: "orderItems.product",
                select: "title images sellingPrice color",
            })
            .lean();
    };

    const findOrderByTrackingNumber = async ({ trackingNumber }, options = {}) =>
    {
        return Order.findOne(
            { trackingNumber },
            null,
            options
        ).lean();
    };

    /**
     * Admin-only: Finds all orders with advanced filtering, search, and pagination.
     * Supports search by orderId, customer name/email, seller name.
     * Filters by orderStatus, paymentStatus, paymentMethod, sellerId, customerId.
     */
    const findAllOrders = async ({
        page = 1,
        limit = 20,
        search,
        orderStatus,
        paymentStatus,
        sellerId,
        customerId,
        sortBy = 'orderDate',
        sortOrder = 'desc',
    } = {}) =>
    {
        const filter = {};

        if (orderStatus)
        {
            filter.orderStatus = orderStatus;
        }
        if (paymentStatus)
        {
            filter.paymentStatus = paymentStatus;
        }
        if (sellerId)
        {
            filter.seller = sellerId;
        }
        if (customerId)
        {
            filter.user = customerId;
        }

        if (search && search.trim())
        {
            const regex = new RegExp(search.trim(), 'i');

            const User = (await import('../users/user.model.js')).User;
            const Seller = (await import('../sellers/seller.model.js')).Seller;

            const [matchingUsers, matchingSellers] = await Promise.all([
                User.find({ $or: [{ fullName: regex }, { email: regex }] }, '_id').lean(),
                Seller.find({ $or: [{ sellerName: regex }, { email: regex }] }, '_id').lean(),
            ]);

            const userIds = matchingUsers.map((u) => u._id);
            const sellerIds = matchingSellers.map((s) => s._id);

            filter.$or = [
                { orderId: regex },
                ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
                ...(sellerIds.length > 0 ? [{ seller: { $in: sellerIds } }] : []),
            ];

            if (filter.$or.length === 0)
            {
                filter.$or = [{ orderId: regex }];
            }
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('user', 'fullName email mobile')
                .populate('seller', 'sellerName email businessDetails.businessName')
                .populate({
                    path: 'orderItems.product',
                    select: 'title images sellingPrice color',
                })
                .lean(),
            Order.countDocuments(filter),
        ]);

        return {
            orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    return Object.freeze({
        createOrder,
        findByUser,
        findBySeller,
        findById,
        findOrderForSeller,
        findOrderForCustomer,
        updateStatus,
        updateStatusWithHistory,
        updatePaymentStatus,
        updateOrder,
        findOrderItemById,
        appendStatusHistory,
        findOrdersByIds,
        findExpiredReservations,
        updateShipmentTracking,
        updateShipmentStatus,
        findOrderByTrackingNumber,
        findAllOrders,
    });
};