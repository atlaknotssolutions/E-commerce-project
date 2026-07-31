export const renderSellerInvoice = ({ doc, layout, order, config, commission, barcodeBuffer, fmtAmount, fmtDate }) => {
  const pay = order._payment || {};
  const shipping = order.shippingAddress || {};
  const seller = order.seller || {};
  const user = order.user || {};

  /* ── Header ── */
  const metaLines = [
    `Ref No: ${config.invoicePrefix || 'STL-'}${order.orderId}`,
    `Date: ${fmtDate(new Date(), config.dateFormat)}`,
    `Order No: ${order.orderId}`,
    `Order Date: ${fmtDate(order.createdAt || order.orderDate, config.dateFormat)}`,
    `Status: ${order.orderStatus || '-'}`,
  ];
  layout.drawHeader('SELLER SETTLEMENT', metaLines);

  /* ── Seller & Customer Info ── */
  const sellerAddr = seller.pickupAddress || {};
  const sellerLines = [
    seller.sellerName || seller.businessDetails?.businessName || 'Seller',
    `Email: ${seller.email || '-'}`,
    `Phone: ${seller.mobile || '-'}`,
    sellerAddr.streetAddress || sellerAddr.address || '',
    [sellerAddr.city, sellerAddr.state, sellerAddr.pincode || sellerAddr.pinCode].filter(Boolean).join(' '),
    seller.businessDetails?.GSTIN ? `GST: ${seller.businessDetails.GSTIN}` : '',
  ].filter(Boolean);

  const customerName = shipping.name || user.fullName || '-';
  const customerLines = [
    `Name: ${customerName}`,
    `Email: ${user.email || '-'}`,
    `Phone: ${shipping.mobile || '-'}`,
  ];

  layout.drawTwoColumnAddresses('Seller:', sellerLines, 'Customer:', customerLines);

  /* ── Order Summary ── */
  layout.drawSectionTitle('Order Summary', { divider: true });
  layout.drawKeyValue('Order Amount (Total Selling Price):', fmtAmount(order.totalSellingPrice || 0, config.currency), { valueBold: true });

  const couponAmount = Number(order.couponPrice) || 0;
  if (couponAmount > 0) {
    const couponOwner = order.couponSnapshot?.ownerType || order.couponOwnerType || 'SELLER';
    let bearerLabel = 'Seller';
    if (couponOwner === 'PLATFORM') bearerLabel = 'Platform';
    else if (couponOwner === 'SHARED') bearerLabel = 'Shared (50/50)';
    layout.drawKeyValue('Coupon Discount:', `-${fmtAmount(couponAmount, config.currency)}`, { valueColor: '#D32F2F' });
    layout.drawKeyValue('Coupon Bearer:', bearerLabel, { valueColor: '#6B7280', extra: 2 });
  }

  /* ── Settlement Breakdown ── */
  layout.ensureSpace(20);
  layout.drawSectionTitle('Settlement Breakdown', { divider: true });

  if (commission) {
    const commPct = commission.commissionPercentage || config.commissionConfig?.commissionPercentage || 0;
    const gstPct = commission.gstPercentage || config.commissionConfig?.gstPercentage || 0;
    const commissionAmount = Number(commission.commissionAmount) || 0;
    const gstAmount = Number(commission.gstAmount) || 0;
    const sellerAmount = Number(commission.sellerAmount) || 0;

    const summaryLines = [
      { label: 'Order Amount:', value: fmtAmount(order.totalSellingPrice || 0, config.currency) },
    ];

    if (couponAmount > 0) {
      let bearerLabel = '';
      const couponOwner = order.couponSnapshot?.ownerType || order.couponOwnerType || 'SELLER';
      if (couponOwner === 'PLATFORM') bearerLabel = '(borne by Platform)';
      else if (couponOwner === 'SHARED') bearerLabel = '(borne by Seller 50%)';
      else bearerLabel = '(borne by Seller)';
      summaryLines.push({ label: `Coupon Discount ${bearerLabel}:`, value: `-${fmtAmount(couponAmount, config.currency)}`, color: '#D32F2F' });
    }

    summaryLines.push(
      { divider: true },
      { label: `Platform Commission (${commPct}%):`, value: `-${fmtAmount(commissionAmount, config.currency)}`, color: '#D32F2F' },
    );

    if (gstAmount > 0) {
      summaryLines.push({ label: `GST on Commission (${gstPct}%):`, value: `-${fmtAmount(gstAmount, config.currency)}`, color: '#D32F2F' });
    }

    summaryLines.push(
      { label: 'Shipping Charges:', value: 'FREE', color: '#1B5E20' },
      { divider: true },
      { label: 'Net Seller Receivable:', value: fmtAmount(sellerAmount, config.currency), bold: true, color: '#1B5E20', extra: 22 },
    );

    layout.drawSummary(summaryLines);

    /* Settlement status */
    layout.ensureSpace(16);
    layout.doc.fontSize(9).font('Helvetica').fillColor(layout.textMuted);
    layout.doc.text(`Settlement Status: ${commission.status || 'PENDING'}`, layout.margin, layout.y);
    layout.y = layout.doc.y + 14;
    if (commission.settledAt) {
      layout.doc.text(`Settled On: ${fmtDate(commission.settledAt, config.dateFormat)}`, layout.margin, layout.y);
      layout.y = layout.doc.y + 14;
    }
    if (commission.calculatedAt) {
      layout.doc.text(`Calculated On: ${fmtDate(commission.calculatedAt, config.dateFormat)}`, layout.margin, layout.y);
      layout.y = layout.doc.y + 14;
    }
    layout.doc.fillColor('#000000');
  } else {
    layout.ensureSpace(30);
    layout.doc.fontSize(10).font('Helvetica-Bold').fillColor(layout.textDark);
    layout.doc.text('Commission Not Yet Calculated', layout.margin, layout.y);
    layout.y = layout.doc.y + 4;
    layout.doc.fontSize(9).font('Helvetica').fillColor(layout.textMuted);
    layout.doc.text('Commission details will appear once the settlement engine processes this order.', layout.margin, layout.y);
    layout.y = layout.doc.y + 16;
    layout.doc.fillColor('#000000');
  }

  /* ── Payments ── */
  layout.ensureSpace(16);
  layout.drawSectionTitle('Payment Details', { divider: true });
  layout.drawPaymentInfo('Payment Method:', pay.method || '-');
  layout.drawPaymentInfo('Payment Status:', pay.status || '-');
  if (pay.transactionId) layout.drawPaymentInfo('Transaction ID:', pay.transactionId);

  /* Footer added by layout.finalize() in service */
};

export default renderSellerInvoice;
