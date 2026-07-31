export const createAdminReportsRepository = ({
  Order,
  Product,
  User,
  Seller,
  PaymentOrder,
  ReturnRequest,
  Refund,
  Coupon,
}) => {

  const getSalesData = async ({ startDate, endDate, groupBy }) => {
    let groupId;
    const dateFormat = groupBy === 'daily' ? '%Y-%m-%d'
      : groupBy === 'weekly' ? '%Y-W%V'
      : groupBy === 'monthly' ? '%Y-%m'
      : '%Y';

    groupId = {
      date: { $dateToString: { format: dateFormat, date: '$orderDate' } },
    };

    const match = { orderDate: {} };
    if (startDate) match.orderDate.$gte = new Date(startDate);
    if (endDate) match.orderDate.$lte = new Date(endDate);
    if (!startDate && !endDate) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      match.orderDate.$gte = oneYearAgo;
    }

    return Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: '$totalSellingPrice' },
          totalMrp: { $sum: '$totalMrpPrice' },
          totalDiscount: { $sum: '$discount' },
          orderCount: { $sum: 1 },
          totalItems: { $sum: '$totalItem' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);
  };

  const getRevenueData = async ({ startDate, endDate, groupBy }) => {
    const dateFormat = groupBy === 'daily' ? '%Y-%m-%d'
      : groupBy === 'weekly' ? '%Y-W%V'
      : groupBy === 'monthly' ? '%Y-%m'
      : '%Y';

    const match = { orderDate: {} };
    if (startDate) match.orderDate.$gte = new Date(startDate);
    if (endDate) match.orderDate.$lte = new Date(endDate);
    if (!startDate && !endDate) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      match.orderDate.$gte = oneYearAgo;
    }

    const revenueData = await Order.aggregate([
      { $match: { ...match, orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$orderDate' } },
          },
          grossRevenue: { $sum: '$totalSellingPrice' },
          totalDiscount: { $sum: '$discount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    const refundData = await Refund.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            },
          } : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: '$amount' },
        },
      },
    ]);

    const couponData = await Order.aggregate([
      { $match: { ...match, couponPrice: { $gt: 0 } } },
      {
        $addFields: {
          effectiveCouponDiscount: {
            $ifNull: ['$couponSnapshot.couponDiscountApplied', '$couponPrice'],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCouponDiscount: { $sum: '$effectiveCouponDiscount' },
        },
      },
    ]);

    const totalRefunds = refundData.length > 0 ? refundData[0].totalRefunds : 0;
    const totalCouponDiscount = couponData.length > 0 ? couponData[0].totalCouponDiscount : 0;

    return {
      trend: revenueData,
      summary: {
        grossRevenue: revenueData.reduce((sum, r) => sum + r.grossRevenue, 0),
        totalRefunds,
        totalCouponDiscount,
        netRevenue: revenueData.reduce((sum, r) => sum + r.grossRevenue, 0) - totalRefunds - totalCouponDiscount,
      },
    };
  };

  const getProductReport = async ({ startDate, endDate, limit = 20 }) => {
    const match = { orderStatus: 'DELIVERED' };
    if (startDate || endDate) {
      match.orderDate = {};
      if (startDate) match.orderDate.$gte = new Date(startDate);
      if (endDate) match.orderDate.$lte = new Date(endDate);
    }

    const bestSelling = await Order.aggregate([
      { $match: match },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          title: { $first: '$orderItems.title' },
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.sellingPrice', '$orderItems.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetail',
        },
      },
      { $unwind: { path: '$productDetail', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          sellingPrice: '$productDetail.sellingPrice',
          quantity: '$productDetail.quantity',
          category: '$productDetail.category',
          seller: '$productDetail.seller',
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    const outOfStock = await Product.countDocuments({
      quantity: { $lte: 0 },
      isDeleted: { $ne: true },
    });

    const lowStock = await Product.find({
      quantity: { $gt: 0, $lte: 5 },
      isDeleted: { $ne: true },
    })
      .select('title quantity sellingPrice seller category')
      .lean();

    const worstSelling = await Order.aggregate([
      { $match: match },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          title: { $first: '$orderItems.title' },
          totalQuantity: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.sellingPrice', '$orderItems.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetail',
        },
      },
      { $unwind: { path: '$productDetail', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          sellingPrice: '$productDetail.sellingPrice',
          quantity: '$productDetail.quantity',
        },
      },
      { $sort: { totalQuantity: 1 } },
      { $limit: limit },
    ]);

    return { bestSelling, worstSelling, outOfStock, lowStock };
  };

  const getSellerReport = async ({ startDate, endDate, limit = 20 }) => {
    const match = { orderStatus: 'DELIVERED' };
    if (startDate || endDate) {
      match.orderDate = {};
      if (startDate) match.orderDate.$gte = new Date(startDate);
      if (endDate) match.orderDate.$lte = new Date(endDate);
    }

    const topSellers = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$seller',
          totalRevenue: { $sum: '$totalSellingPrice' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$totalItem' },
          averageOrderValue: { $avg: '$totalSellingPrice' },
        },
      },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerDetail',
        },
      },
      { $unwind: { path: '$sellerDetail', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          sellerName: '$sellerDetail.sellerName',
          email: '$sellerDetail.email',
          businessName: '$sellerDetail.businessDetails.businessName',
          totalRevenue: 1,
          totalOrders: 1,
          totalItems: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ]);

    const lowestPerforming = [...topSellers].reverse().slice(0, limit);

    const sellerCount = await Seller.countDocuments({ accountStatus: 'ACTIVE' });

    return { topSellers, lowestPerforming, sellerCount };
  };

  const getCustomerReport = async ({ startDate, endDate }) => {
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const newCustomers = await User.countDocuments({
      ...match,
      role: 'ROLE_CUSTOMER',
    });

    const totalCustomers = await User.countDocuments({ role: 'ROLE_CUSTOMER' });

    const activeCustomers = await Order.aggregate([
      ...(startDate || endDate ? [{
        $match: {
          orderDate: {
            ...(startDate ? { $gte: new Date(startDate) } : {}),
            ...(endDate ? { $lte: new Date(endDate) } : {}),
          },
        },
      }] : []),
      {
        $group: {
          _id: '$user',
        },
      },
      { $count: 'total' },
    ]);

    const returningCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
        },
      },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'total' },
    ]);

    return {
      newCustomers,
      totalCustomers,
      activeCustomers: activeCustomers.length > 0 ? activeCustomers[0].total : 0,
      returningCustomers: returningCustomers.length > 0 ? returningCustomers[0].total : 0,
    };
  };

  const getOrderReport = async ({ startDate, endDate }) => {
    const match = {};
    if (startDate || endDate) {
      match.orderDate = {};
      if (startDate) match.orderDate.$gte = new Date(startDate);
      if (endDate) match.orderDate.$lte = new Date(endDate);
    }

    const byStatus = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSellingPrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byPaymentMethod = await Order.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'paymentorders',
          localField: 'paymentOrderId',
          foreignField: '_id',
          as: 'payment',
        },
      },
      { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$payment.paymentMethod', 'UNKNOWN'] },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSellingPrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byCity = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$shippingAddress.city',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSellingPrice' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const dateFormat = '%Y-%m-%d';
    const byDate = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$orderDate' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalSellingPrice' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    const totalOrders = await Order.countDocuments(match);

    return { byStatus, byPaymentMethod, byCity, byDate, totalOrders };
  };

  const getReturnReport = async ({ startDate, endDate }) => {
    const match = {};
    if (startDate || endDate) {
      match.requestedAt = {};
      if (startDate) match.requestedAt.$gte = new Date(startDate);
      if (endDate) match.requestedAt.$lte = new Date(endDate);
    }

    const totalReturns = await ReturnRequest.countDocuments(match);

    const byReason = await ReturnRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byStatus = await ReturnRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$returnStatus',
          count: { $sum: 1 },
          totalRefundAmount: { $sum: '$refundAmount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topReturnedProducts = await ReturnRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$productId',
          returnCount: { $sum: 1 },
          totalRefundAmount: { $sum: '$refundAmount' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetail',
        },
      },
      { $unwind: { path: '$productDetail', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: '$productDetail.title',
          returnCount: 1,
          totalRefundAmount: 1,
        },
      },
      { $sort: { returnCount: -1 } },
      { $limit: 10 },
    ]);

    const totalOrders = await Order.countDocuments(
      startDate || endDate
        ? {
            orderDate: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            },
          }
        : {}
    );

    const refundAgg = await Refund.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          ...(startDate || endDate ? {
            createdAt: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            },
          } : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalRefundAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalRefundAmount = refundAgg.length > 0 ? refundAgg[0].totalRefundAmount : 0;

    return {
      totalReturns,
      returnRate: totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(2) : '0',
      totalRefundAmount,
      byReason,
      byStatus,
      topReturnedProducts,
    };
  };

  const getCouponReport = async ({ startDate, endDate }) => {
    const coupons = await Coupon.find({}).lean();

    const orderMatch = { discount: { $gt: 0 } };
    if (startDate || endDate) {
      orderMatch.orderDate = {};
      if (startDate) orderMatch.orderDate.$gte = new Date(startDate);
      if (endDate) orderMatch.orderDate.$lte = new Date(endDate);
    }

    const usageStats = await Coupon.aggregate([
      {
        $project: {
          code: 1,
          usageCount: 1,
          discountPercentage: 1,
          discountValue: 1,
          discountType: 1,
          isActive: 1,
          usageLimit: 1,
        },
      },
      { $sort: { usageCount: -1 } },
    ]);

    const couponRevenue = await Order.aggregate([
      { $match: orderMatch },
      {
        $addFields: {
          effectiveCouponDiscount: {
            $ifNull: ['$couponSnapshot.couponDiscountApplied', '$couponPrice'],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCouponDiscount: { $sum: '$effectiveCouponDiscount' },
          ordersWithCoupon: { $sum: 1 },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments(
      startDate || endDate
        ? {
            orderDate: {
              ...(startDate ? { $gte: new Date(startDate) } : {}),
              ...(endDate ? { $lte: new Date(endDate) } : {}),
            },
          }
        : {}
    );

    const totalCouponsUsed = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    const activeCoupons = coupons.filter((c) => c.isActive).length;

    return {
      usageStats,
      summary: {
        totalCoupons: coupons.length,
        activeCoupons,
        totalCouponsUsed,
        totalCouponDiscount: couponRevenue.length > 0 ? couponRevenue[0].totalCouponDiscount : 0,
        ordersWithCoupon: couponRevenue.length > 0 ? couponRevenue[0].ordersWithCoupon : 0,
        successRate: totalOrders > 0
          ? ((couponRevenue.length > 0 ? couponRevenue[0].ordersWithCoupon : 0) / totalOrders * 100).toFixed(2)
          : '0',
      },
    };
  };

  const getDashboardSummary = async () => {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
    const totalCustomers = await User.countDocuments({ role: 'ROLE_CUSTOMER' });
    const totalSellers = await Seller.countDocuments({ accountStatus: 'ACTIVE' });
    const totalCoupons = await Coupon.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$totalSellingPrice' },
          totalDiscount: { $sum: '$discount' },
        },
      },
    ]);

    const refundAgg = await Refund.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: '$amount' },
        },
      },
    ]);

    const returnCount = await ReturnRequest.countDocuments();
    const totalReturnedOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });

    const grossRevenue = revenueAgg.length > 0 ? revenueAgg[0].grossRevenue : 0;
    const totalDiscount = revenueAgg.length > 0 ? revenueAgg[0].totalDiscount : 0;
    const totalRefunds = refundAgg.length > 0 ? refundAgg[0].totalRefunds : 0;
    const netRevenue = grossRevenue - totalRefunds - totalDiscount;

    const couponsUsed = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } },
    ]);

    return {
      totalOrders,
      totalProducts,
      totalCustomers,
      totalSellers,
      totalCoupons,
      grossRevenue,
      totalDiscount,
      totalRefunds,
      netRevenue,
      totalReturns: returnCount,
      returnRate: totalOrders > 0 ? ((returnCount / totalOrders) * 100).toFixed(2) : '0',
      couponsUsed: couponsUsed.length > 0 ? couponsUsed[0].total : 0,
    };
  };

  const getExportOrders = async ({ startDate, endDate, status, paymentMethod }) => {
    const match = {};
    if (startDate || endDate) {
      match.orderDate = {};
      if (startDate) match.orderDate.$gte = new Date(startDate);
      if (endDate) match.orderDate.$lte = new Date(endDate);
    }
    if (status) match.orderStatus = status;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetail',
        },
      },
      { $unwind: { path: '$userDetail', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sellers',
          localField: 'seller',
          foreignField: '_id',
          as: 'sellerDetail',
        },
      },
      { $unwind: { path: '$sellerDetail', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          orderId: 1,
          customerName: '$userDetail.fullName',
          customerEmail: '$userDetail.email',
          sellerName: '$sellerDetail.sellerName',
          totalMrpPrice: 1,
          totalSellingPrice: 1,
          discount: 1,
          orderStatus: 1,
          paymentStatus: 1,
          totalItem: 1,
          orderDate: 1,
          city: '$shippingAddress.city',
          state: '$shippingAddress.state',
        },
      },
      { $sort: { orderDate: -1 } },
    ];

    if (paymentMethod) {
      pipeline.splice(1, 0, {
        $lookup: {
          from: 'paymentorders',
          localField: 'paymentOrderId',
          foreignField: '_id',
          as: 'payment',
        },
      });
      pipeline.splice(2, 0, { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } });
      pipeline.splice(3, 0, { $match: { 'payment.paymentMethod': paymentMethod } });
    }

    return Order.aggregate(pipeline);
  };

  return Object.freeze({
    getSalesData,
    getRevenueData,
    getProductReport,
    getSellerReport,
    getCustomerReport,
    getOrderReport,
    getReturnReport,
    getCouponReport,
    getDashboardSummary,
    getExportOrders,
  });
};
