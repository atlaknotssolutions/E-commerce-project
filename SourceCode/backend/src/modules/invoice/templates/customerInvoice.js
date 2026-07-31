export const renderCustomerInvoice = ({ doc, layout, order, config, commission, barcodeBuffer, fmtAmount, fmtDate }) => {
  const pay = order._payment || {};
  const items = order._items || [];
  const shipping = order.shippingAddress || {};
  const seller = order.seller || {};
  const user = order.user || {};
  const customerName = shipping.name || user.fullName || '-';
  const customerPhone = shipping.mobile || '';
  const customerEmail = user.email || '';

  /* ── Header ── */
  const metaLines = [
    `Invoice No: ${config.invoicePrefix || 'INV-'}${order.orderId}`,
    `Invoice Date: ${fmtDate(order.createdAt || order.orderDate, config.dateFormat)}`,
    `Order No: ${order.orderId}`,
    `Order Date: ${fmtDate(order.orderDate || order.createdAt, config.dateFormat)}`,
    `Payment: ${pay.method || '-'}`,
    `Payment ID: ${pay.transactionId || '-'}`,
  ];
  layout.drawHeader('TAX INVOICE', metaLines);

  /* ── Two-column: Bill To / Sold By ── */
  const addrLines = [
    shipping.streetAddress || shipping.address || '',
    shipping.locality || '',
    [shipping.city, shipping.state, shipping.pinCode].filter(Boolean).join(' '),
  ].filter(Boolean);

  const sellerAddr = seller.pickupAddress || {};
  const sellerLines = [
    seller.sellerName || seller.businessDetails?.businessName || 'Seller',
    sellerAddr.streetAddress || sellerAddr.address || '',
    [sellerAddr.city, sellerAddr.state, sellerAddr.pincode || sellerAddr.pinCode].filter(Boolean).join(' '),
    seller.businessDetails?.GSTIN ? `GST: ${seller.businessDetails.GSTIN}` : '',
  ].filter(Boolean);

  layout.drawTwoColumnAddresses(
    'Bill To:',
    [customerName, ...addrLines, `Phone: ${customerPhone}`, `Email: ${customerEmail}`],
    'Sold By:',
    sellerLines,
  );

  /* ── Coupon info if applicable ── */
  const couponAmount = Number(order.couponPrice) || 0;
  if (couponAmount > 0) {
    layout.drawKeyValue(
      `Coupon Applied (${order.couponSnapshot?.couponCode || '-'}):`,
      `-${fmtAmount(couponAmount, config.currency)}`,
      { labelWidth: 220, valueWidth: 130, valueColor: '#D32F2F' },
    );
  }

  /* ── Product Table ── */
  layout.ensureSpace(30);
  layout.drawSectionTitle('Order Items', { divider: true });

  const colW = layout.cw;
  const productColW = colW - 25 - 22 - 70 - 35 - 65 - 60 - 65;

  const columns = [
    { text: '#', width: 25, align: 'center' },
    { text: 'Product', width: productColW },
    { text: 'SKU', width: 70 },
    { text: 'Qty', width: 22, align: 'center' },
    { text: 'MRP', width: 65, align: 'right' },
    { text: 'Price', width: 60, align: 'right' },
    { text: 'Disc', width: 65, align: 'right' },
    { text: 'Total', width: 65, align: 'right' },
  ];

  const totalSelling = items.reduce((s, i) => s + (Number(i.sellingPrice) || 0), 0);

  const rows = items.map((item, idx) => {
    const name = item.title || item.product?.title || item.product?.name || `Item #${idx + 1}`;
    const sku = item._sku || '-';
    const qty = Number(item.quantity) || 1;
    const mrp = Number(item.mrpPrice) || 0;
    const selling = Number(item.sellingPrice) || 0;
    const propCoupon = couponAmount > 0 && totalSelling > 0 ? (selling / totalSelling) * couponAmount : 0;
    const itemTotal = selling - propCoupon;

    return [
      { text: String(idx + 1), align: 'center' },
      { text: name },
      { text: sku },
      { text: String(qty), align: 'center' },
      { text: fmtAmount(mrp, config.currency), align: 'right' },
      { text: fmtAmount(selling, config.currency), align: 'right' },
      { text: propCoupon > 0 ? fmtAmount(propCoupon, config.currency) : '-', align: 'right' },
      { text: fmtAmount(itemTotal, config.currency), align: 'right' },
    ];
  });

  layout.drawTable(columns, rows);

  /* ── Financial Summary ── */
  layout.drawSectionTitle('Payment Summary', { divider: true });
  const productDiscount = Number(order.discount) || 0;
  const summaryLines = [
    { label: 'Total MRP:', value: fmtAmount(order.totalMrpPrice || 0, config.currency) },
  ];
  if (productDiscount > 0) {
    summaryLines.push({ label: 'Product Discount:', value: `-${fmtAmount(productDiscount, config.currency)}`, color: '#D32F2F' });
  }
  if (couponAmount > 0) {
    summaryLines.push({ label: 'Coupon Discount:', value: `-${fmtAmount(couponAmount, config.currency)}`, color: '#D32F2F' });
  }
  summaryLines.push(
    { label: 'Shipping:', value: 'FREE', color: '#1B5E20' },
    { divider: true },
    { label: 'Grand Total:', value: fmtAmount(pay.amount || (order.totalSellingPrice || 0) - couponAmount, config.currency), bold: true, color: '#1A1A2E', extra: 20 },
  );
  layout.drawSummary(summaryLines);

  /* ── Payment Details ── */
  layout.drawSectionTitle('Payment Details', { divider: true });
  layout.drawPaymentInfo('Payment Method:', pay.method || '-');
  layout.drawPaymentInfo('Payment Status:', pay.status || '-');
  if (pay.transactionId) layout.drawPaymentInfo('Transaction ID:', pay.transactionId);

  /* ── QR Code (bottom-right of page) ── */
  layout.drawQR(
    {
      inv: `${config.invoicePrefix || 'INV-'}${order.orderId}`,
      amt: pay.amount || (order.totalSellingPrice || 0) - couponAmount,
      dt: fmtDate(new Date(), config.dateFormat),
    },
    layout.rx - 65,
    layout.ph - layout.margin - layout.footerHeight - 85,
    { size: 55, label: 'Scan to verify' },
  );

  /* Footer added by layout.finalize() in service */
};

export default renderCustomerInvoice;
