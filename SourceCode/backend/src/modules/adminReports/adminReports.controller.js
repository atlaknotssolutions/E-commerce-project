export const createAdminReportsController = ({ adminReportsService }) => {

  const getDashboard = async (req, res) => {
    const data = await adminReportsService.getDashboardSummary();
    res.status(200).json({ success: true, data });
  };

  const getSales = async (req, res) => {
    const { startDate, endDate, groupBy } = req.query;
    const data = await adminReportsService.getSalesReport({ startDate, endDate, groupBy });
    res.status(200).json({ success: true, ...data });
  };

  const getRevenue = async (req, res) => {
    const { startDate, endDate, groupBy } = req.query;
    const data = await adminReportsService.getRevenueReport({ startDate, endDate, groupBy });
    res.status(200).json({ success: true, ...data });
  };

  const getProducts = async (req, res) => {
    const { startDate, endDate, limit } = req.query;
    const data = await adminReportsService.getProductReport({ startDate, endDate, limit });
    res.status(200).json({ success: true, data });
  };

  const getSellers = async (req, res) => {
    const { startDate, endDate, limit } = req.query;
    const data = await adminReportsService.getSellerReport({ startDate, endDate, limit });
    res.status(200).json({ success: true, data });
  };

  const getCustomers = async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await adminReportsService.getCustomerReport({ startDate, endDate });
    res.status(200).json({ success: true, data });
  };

  const getOrders = async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await adminReportsService.getOrderReport({ startDate, endDate });
    res.status(200).json({ success: true, data });
  };

  const getReturns = async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await adminReportsService.getReturnReport({ startDate, endDate });
    res.status(200).json({ success: true, data });
  };

  const getCoupons = async (req, res) => {
    const { startDate, endDate } = req.query;
    const data = await adminReportsService.getCouponReport({ startDate, endDate });
    res.status(200).json({ success: true, data });
  };

  const exportCsv = async (req, res) => {
    const { type, startDate, endDate, groupBy, status, paymentMethod } = req.query;

    let csv = '';
    let filename = '';

    switch (type) {
      case 'orders': {
        csv = await adminReportsService.exportOrdersCsv({ startDate, endDate, status, paymentMethod });
        filename = `orders-report-${Date.now()}.csv`;
        break;
      }
      case 'sales': {
        csv = await adminReportsService.exportSalesCsv({ startDate, endDate, groupBy });
        filename = `sales-report-${Date.now()}.csv`;
        break;
      }
      case 'revenue': {
        csv = await adminReportsService.exportRevenueCsv({ startDate, endDate, groupBy });
        filename = `revenue-report-${Date.now()}.csv`;
        break;
      }
      case 'products': {
        csv = await adminReportsService.exportProductsCsv({ startDate, endDate });
        filename = `products-report-${Date.now()}.csv`;
        break;
      }
      case 'sellers': {
        csv = await adminReportsService.exportSellersCsv({ startDate, endDate });
        filename = `sellers-report-${Date.now()}.csv`;
        break;
      }
      default:
        createApiError('Invalid export type. Use orders, sales, revenue, products, or sellers', 400);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  };

  const exportExcel = async (req, res) => {
    const { type, startDate, endDate, groupBy, status, paymentMethod } = req.query;

    let csv = '';
    let filename = '';

    switch (type) {
      case 'orders': {
        csv = await adminReportsService.exportOrdersCsv({ startDate, endDate, status, paymentMethod });
        filename = `orders-report-${Date.now()}.csv`;
        break;
      }
      case 'sales': {
        csv = await adminReportsService.exportSalesCsv({ startDate, endDate, groupBy });
        filename = `sales-report-${Date.now()}.csv`;
        break;
      }
      case 'revenue': {
        csv = await adminReportsService.exportRevenueCsv({ startDate, endDate, groupBy });
        filename = `revenue-report-${Date.now()}.csv`;
        break;
      }
      case 'products': {
        csv = await adminReportsService.exportProductsCsv({ startDate, endDate });
        filename = `products-report-${Date.now()}.csv`;
        break;
      }
      case 'sellers': {
        csv = await adminReportsService.exportSellersCsv({ startDate, endDate });
        filename = `sellers-report-${Date.now()}.csv`;
        break;
      }
      default:
        createApiError('Invalid export type. Use orders, sales, revenue, products, or sellers', 400);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  };

  return Object.freeze({
    getDashboard,
    getSales,
    getRevenue,
    getProducts,
    getSellers,
    getCustomers,
    getOrders,
    getReturns,
    getCoupons,
    exportCsv,
    exportExcel,
  });
};


