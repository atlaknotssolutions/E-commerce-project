export const renderPackingSlip = ({ doc, layout, order, config, commission, barcodeBuffer, fmtAmount, fmtDate }) => {
  const pay = order._payment || {};
  const items = order._items || [];
  const shipping = order.shippingAddress || {};
  const customerName = shipping.name || order.user?.fullName || '-';
  const customerPhone = shipping.mobile || '';

  /* ── Header ── */
  const metaLines = [
    `Order ID: ${order.orderId}`,
    `Order Date: ${fmtDate(order.createdAt || order.orderDate, config.dateFormat)}`,
    `Payment: ${pay.method || '-'}`,
  ];
  layout.drawHeader('PACKING SLIP', metaLines);

  /* Subtitle */
  layout.doc.fontSize(8).font('Helvetica').fillColor(layout.textMuted);
  layout.doc.text('This is NOT a Tax Invoice', layout.margin, layout.y, { width: layout.cw, align: 'center' });
  layout.y = layout.doc.y + 6;

  /* ── Ship To Address ── */
  layout.drawSectionTitle('Ship To:', { divider: false });

  layout.doc.fontSize(10).font('Helvetica-Bold').fillColor(layout.textDark);
  layout.doc.text(customerName, layout.margin, layout.y);
  layout.y = layout.doc.y + 3;

  layout.doc.fontSize(9).font('Helvetica').fillColor(layout.textMuted);
  const addrParts = [
    shipping.streetAddress || shipping.address,
    shipping.locality,
    [shipping.city, shipping.state, shipping.pinCode].filter(Boolean).join(' '),
  ].filter(Boolean);
  addrParts.forEach((line) => {
    layout.doc.text(line, layout.margin, layout.y, { width: layout.cw * 0.6 });
    layout.y = layout.doc.y + 1;
  });
  if (customerPhone) {
    layout.doc.fillColor(layout.textDark);
    layout.doc.text(`Phone: ${customerPhone}`, layout.margin, layout.y);
    layout.y = layout.doc.y + 2;
  }
  layout.doc.fillColor('#000000');
  layout.y += 4;
  layout.drawDivider();
  layout.y += 4;

  /* ── Payment Type ── */
  const isCOD = (pay.method === 'COD' || pay.method === 'CASH_ON_DELIVERY');
  layout.doc.fontSize(11).font('Helvetica-Bold').fillColor(isCOD ? '#D32F2F' : '#1B5E20');
  layout.doc.text(`Payment: ${isCOD ? 'COD (Cash on Delivery)' : 'PREPAID'}`, layout.margin, layout.y);
  layout.doc.fillColor('#000000');
  layout.y += 16;

  /* ── Items Table (NO pricing) ── */
  layout.drawSectionTitle('Items to Pack', { divider: true });

  const colW = layout.cw;
  const productColW = colW - 25 - 80 - 85 - 40;

  const columns = [
    { text: '#', width: 25, align: 'center' },
    { text: 'Product', width: productColW },
    { text: 'SKU', width: 80 },
    { text: 'Variant', width: 85 },
    { text: 'Qty', width: 40, align: 'center' },
  ];

  const rows = items.map((item, idx) => {
    const name = item.title || item.product?.title || item.product?.name || `Item #${idx + 1}`;
    const sku = item._sku || item.product?.sku || '-';
    const qty = Number(item.quantity) || 1;
    const variant = item.variantAttributes
      ? Object.entries(item.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(' | ')
      : item.size || '-';

    return [
      { text: String(idx + 1), align: 'center' },
      { text: name },
      { text: sku },
      { text: variant },
      { text: String(qty), align: 'center' },
    ];
  });

  layout.drawTable(columns, rows);

  /* ── Barcode ── */
  layout.ensureSpace(60);
  if (barcodeBuffer) {
    layout.drawBarcode(barcodeBuffer, layout.margin, layout.y, {
      width: 160, height: 28, label: order.orderId,
    });
    layout.y += 46;
  }

  /* ── QR (right side) ── */
  layout.drawQR(
    { orderId: order.orderId },
    layout.rx - 60,
    layout.y - 46 > layout.margin ? layout.y - 46 : layout.margin,
    { size: 50, label: 'Scan for tracking' },
  );

  layout.y = Math.max(layout.y + 10, layout.margin + 70);

  /* ── Packing Notes ── */
  layout.ensureSpace(100);
  layout.drawSectionTitle('Packing Notes', { divider: true });
  layout.doc.fontSize(9).font('Helvetica').fillColor(layout.textMuted);
  const notesLines = [
    '• Handle with care — fragile items may be inside.',
    '• Verify all items match the packing slip before sealing.',
    '• Use appropriate packaging material to prevent damage.',
    '• If applicable, include the return/exchange form inside.',
    '• Seal the package securely and affix the shipping label.',
  ];
  notesLines.forEach((n) => {
    layout.doc.text(n, layout.margin + 8, layout.y, { width: layout.cw - 8 });
    layout.y = layout.doc.y + 3;
  });
  layout.doc.fillColor('#000000');

  /* Footer added by layout.finalize() in service */
};

export default renderPackingSlip;
