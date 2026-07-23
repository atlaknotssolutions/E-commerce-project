export const createAdminReportsService = ({
  adminReportsRepository,
  createApiError,
}) => {

  const getDashboardSummary = async () => {
    const summary = await adminReportsRepository.getDashboardSummary();
    return summary;
  };

  const getSalesReport = async ({ startDate, endDate, groupBy = 'daily' }) => {
    const validGroupBy = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validGroupBy.includes(groupBy)) {
      createApiError('Invalid groupBy parameter. Use daily, weekly, monthly, or yearly', 400);
    }

    const data = await adminReportsRepository.getSalesData({ startDate, endDate, groupBy });
    return { data, groupBy };
  };

  const getRevenueReport = async ({ startDate, endDate, groupBy = 'daily' }) => {
    const validGroupBy = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validGroupBy.includes(groupBy)) {
      createApiError('Invalid groupBy parameter. Use daily, weekly, monthly, or yearly', 400);
    }

    const result = await adminReportsRepository.getRevenueData({ startDate, endDate, groupBy });
    return result;
  };

  const getProductReport = async ({ startDate, endDate, limit }) => {
    const data = await adminReportsRepository.getProductReport({
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return data;
  };

  const getSellerReport = async ({ startDate, endDate, limit }) => {
    const data = await adminReportsRepository.getSellerReport({
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return data;
  };

  const getCustomerReport = async ({ startDate, endDate }) => {
    const data = await adminReportsRepository.getCustomerReport({ startDate, endDate });
    return data;
  };

  const getOrderReport = async ({ startDate, endDate }) => {
    const data = await adminReportsRepository.getOrderReport({ startDate, endDate });
    return data;
  };

  const getReturnReport = async ({ startDate, endDate }) => {
    const data = await adminReportsRepository.getReturnReport({ startDate, endDate });
    return data;
  };

  const getCouponReport = async ({ startDate, endDate }) => {
    const data = await adminReportsRepository.getCouponReport({ startDate, endDate });
    return data;
  };

  const generateCsv = (data, columns) => {
    if (!data || data.length === 0) return '';

    const headers = columns.map((col) => col.label).join(',');
    const rows = data.map((row) =>
      columns.map((col) => {
        let value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
        if (value === null || value === undefined) value = '';
        value = String(value).replace(/"/g, '""');
        if (String(value).includes(',') || String(value).includes('"') || String(value).includes('\n')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  const exportOrdersCsv = async ({ startDate, endDate, status, paymentMethod }) => {
    const data = await adminReportsRepository.getExportOrders({ startDate, endDate, status, paymentMethod });
    const columns = [
      { label: 'Order ID', accessor: 'orderId' },
      { label: 'Customer', accessor: 'customerName' },
      { label: 'Email', accessor: 'customerEmail' },
      { label: 'Seller', accessor: 'sellerName' },
      { label: 'City', accessor: 'city' },
      { label: 'State', accessor: 'state' },
      { label: 'Items', accessor: 'totalItem' },
      { label: 'MRP', accessor: 'totalMrpPrice' },
      { label: 'Selling Price', accessor: 'totalSellingPrice' },
      { label: 'Discount', accessor: 'discount' },
      { label: 'Status', accessor: 'orderStatus' },
      { label: 'Payment Status', accessor: 'paymentStatus' },
      { label: 'Order Date', accessor: (row) => row.orderDate ? new Date(row.orderDate).toISOString().split('T')[0] : '' },
    ];
    return generateCsv(data, columns);
  };

  const exportSalesCsv = async ({ startDate, endDate, groupBy }) => {
    const result = await adminReportsRepository.getSalesData({ startDate, endDate, groupBy });
    const columns = [
      { label: 'Period', accessor: (row) => row._id?.date || '' },
      { label: 'Total Sales', accessor: 'totalSales' },
      { label: 'Total MRP', accessor: 'totalMrp' },
      { label: 'Total Discount', accessor: 'totalDiscount' },
      { label: 'Order Count', accessor: 'orderCount' },
      { label: 'Total Items', accessor: 'totalItems' },
    ];
    return generateCsv(result, columns);
  };

  const exportRevenueCsv = async ({ startDate, endDate, groupBy }) => {
    const result = await adminReportsRepository.getRevenueData({ startDate, endDate, groupBy });
    const columns = [
      { label: 'Period', accessor: (row) => row._id?.date || '' },
      { label: 'Gross Revenue', accessor: 'grossRevenue' },
      { label: 'Total Discount', accessor: 'totalDiscount' },
      { label: 'Order Count', accessor: 'orderCount' },
    ];
    return generateCsv(result.trend, columns);
  };

  const exportProductsCsv = async ({ startDate, endDate }) => {
    const data = await adminReportsRepository.getProductReport({ startDate, endDate, limit: 100 });
    const columns = [
      { label: 'Product', accessor: 'title' },
      { label: 'Quantity Sold', accessor: 'totalQuantity' },
      { label: 'Revenue', accessor: 'totalRevenue' },
      { label: 'Order Count', accessor: 'orderCount' },
      { label: 'Current Stock', accessor: 'quantity' },
      { label: 'Selling Price', accessor: 'sellingPrice' },
    ];
    return generateCsv(data.bestSelling, columns);
  };

  const exportSellersCsv = async ({ startDate, endDate }) => {
    const data = await adminReportsRepository.getSellerReport({ startDate, endDate, limit: 100 });
    const columns = [
      { label: 'Seller', accessor: 'sellerName' },
      { label: 'Email', accessor: 'email' },
      { label: 'Business', accessor: 'businessName' },
      { label: 'Revenue', accessor: 'totalRevenue' },
      { label: 'Orders', accessor: 'totalOrders' },
      { label: 'Items', accessor: 'totalItems' },
      { label: 'Avg Order Value', accessor: 'averageOrderValue' },
    ];
    return generateCsv(data.topSellers, columns);
  };

  const generateExcelBuffer = (data, columns, sheetName) => {
    const rows = data.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col.label] = typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] ?? '');
      });
      return obj;
    });

    const headers = columns.map((col) => col.label);
    const csvContent = generateCsv(rows, columns.map((col) => ({ label: col.label, accessor: col.label })));

    return { csvContent, headers, sheetName };
  };

  const exportExcel = async (data, columns, sheetName = 'Report') => {
    if (!data || data.length === 0) {
      return generateCsv([], columns.map((col) => ({ label: col.label, accessor: col.label })));
    }
    return generateCsv(data, columns);
  };

  return Object.freeze({
    getDashboardSummary,
    getSalesReport,
    getRevenueReport,
    getProductReport,
    getSellerReport,
    getCustomerReport,
    getOrderReport,
    getReturnReport,
    getCouponReport,
    exportOrdersCsv,
    exportSalesCsv,
    exportRevenueCsv,
    exportProductsCsv,
    exportSellersCsv,
  });
};


