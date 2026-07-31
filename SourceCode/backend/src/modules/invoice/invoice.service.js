import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import renderCustomerInvoice from './templates/customerInvoice.js';
import renderSellerInvoice from './templates/sellerInvoice.js';
import renderPackingSlip from './templates/packingSlip.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_INVOICE_DIR = path.resolve(__dirname, '../../../uploads/invoices');
const TEMP_DIR = path.resolve(__dirname, '../../../uploads/temp');
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const getSymbol = (currency = 'INR') => CURRENCY_SYMBOLS[currency] || '₹';

const fmtAmount = (amount, currency = 'INR') => {
  const val = Number(amount) || 0;
  return `${getSymbol(currency)}${val.toFixed(2)}`;
};

const fmtDate = (date, dateFormat = 'DD/MM/YYYY') => {
  if (!date) return '-';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (dateFormat === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
  if (dateFormat === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  return `${dd}/${mm}/${yyyy}`;
};

/* ── Fetch remote image to temp directory ── */
const fetchImageToTemp = async (url) => {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (fs.existsSync(url)) return url;
    return null;
  }
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'png';
  const safeName = `${Buffer.from(url).toString('base64').slice(0, 40).replace(/[/+=]/g, '_')}.${ext}`;
  const localPath = path.join(TEMP_DIR, safeName);
  if (fs.existsSync(localPath)) return localPath;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return null;
    const buffer = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    return localPath;
  } catch { return null; }
};

/* ── LayoutEngine: Professional PDF layout manager ── */
class LayoutEngine {
  constructor(doc, config) {
    this.doc = doc;
    this.config = config;
    this.margin = 50;
    this.pw = doc.page.width;
    this.ph = doc.page.height;
    this.cw = this.pw - this.margin * 2;
    this.rx = this.pw - this.margin;
    this.y = this.margin;
    this.footerHeight = 55;
    this.brandColor = '#1A1A2E';
    this.accentColor = '#4F46E5';
    this.textDark = '#1F2937';
    this.textMuted = '#6B7280';
    this.borderColor = '#E5E7EB';
    this.bgLight = '#F9FAFB';
    this.bgAlt = '#F3F4F6';
  }

  /* Track Y position */
  getY() { return this.y; }
  setY(val) { this.y = val; this.doc.y = val; }
  moveY(delta) { this.y += delta; }

  /* Page break guard */
  ensureSpace(needed) {
    if (this.y + needed > this.ph - this.margin - this.footerHeight) {
      this.addFooter();
      this.doc.addPage();
      this.y = this.margin + 10;
      return true;
    }
    return false;
  }

  /* ── Logo ── */
  drawLogo(x, y, maxW = 100, maxH = 50) {
    const logo = this.config.logoPath || this.config.logo;
    if (!logo) return null;
    try {
      this.doc.image(logo, x, y, { width: maxW, height: maxH, align: 'left', valign: 'top' });
      return { w: maxW, h: maxH };
    } catch {
      return null;
    }
  }

  /* ── Professional two-column header ── */
  drawHeader(invoiceType, metaLines) {
    const leftX = this.margin;
    const rightX = this.rx;
    const colMid = this.margin + this.cw / 2;

    /* Left column: logo + company info */
    let logoHeight = 0;
    const logoResult = this.drawLogo(leftX, this.y, 90, 45);
    if (logoResult) {
      logoHeight = logoResult.h + 6;
    } else {
      /* Fallback: platform name as text logo */
      this.doc.fontSize(18).font('Helvetica-Bold').fillColor(this.brandColor);
      this.doc.text(this.config.platformName || 'AI Knots Marketplace', leftX, this.y);
      logoHeight = 22;
    }

    const infoY = this.y + Math.max(logoHeight, 10);
    this.doc.fontSize(8).font('Helvetica').fillColor(this.textMuted);
    const companyName = this.config.companyLegalName || this.config.platformName || '';
    if (companyName) {
      this.doc.text(companyName, leftX, infoY);
    }
    let iy = this.doc.y + 2;
    if (this.config.address) {
      this.doc.text(this.config.address, leftX, iy);
      iy = this.doc.y + 2;
    }
    if (this.config.GSTIN) {
      this.doc.text(`GST: ${this.config.GSTIN}`, leftX, iy);
      iy = this.doc.y + 2;
    }
    if (this.config.supportEmail) {
      this.doc.text(`E: ${this.config.supportEmail}`, leftX, iy);
      iy = this.doc.y + 2;
    }
    if (this.config.website) {
      this.doc.text(this.config.website, leftX, iy);
      iy = this.doc.y + 2;
    }
    this.doc.fillColor('#000000');

    /* Right column: invoice type + meta */
    this.doc.fontSize(16).font('Helvetica-Bold').fillColor(this.brandColor);
    this.doc.text(invoiceType, colMid, this.y, { width: this.cw / 2, align: 'right' });
    let ry = this.doc.y + 6;

    this.doc.fontSize(9).font('Helvetica').fillColor(this.textDark);
    metaLines.forEach((line) => {
      this.doc.text(line, colMid, ry, { width: this.cw / 2, align: 'right' });
      ry = this.doc.y + 1;
    });
    this.doc.fillColor('#000000');

    /* Set Y below both columns */
    const leftBottom = infoY + 60;
    const rightBottom = ry + 4;
    this.y = Math.max(leftBottom, rightBottom);

    /* Divider */
    this.drawDivider();
    this.y += 6;
  }

  /* ── Section title ── */
  drawSectionTitle(text, opts = {}) {
    this.ensureSpace(24);
    const size = opts.size || 11;
    this.doc.fontSize(size).font('Helvetica-Bold').fillColor(this.brandColor);
    this.doc.text(text, this.margin, this.y);
    this.doc.fillColor('#000000');
    this.y = this.doc.y + 4;
    if (opts.divider !== false) {
      this.drawDivider();
      this.y += 4;
    }
  }

  /* ── Divider line ── */
  drawDivider(y) {
    const targetY = y || this.y;
    this.doc.moveTo(this.margin, targetY)
      .lineTo(this.rx, targetY)
      .strokeColor(this.borderColor)
      .lineWidth(0.5)
      .stroke();
    this.y = targetY + 1;
  }

  /* ── Address block ── */
  drawAddressBlock(title, lines, opts = {}) {
    this.ensureSpace(60);
    const x = opts.x || this.margin;
    const w = opts.width || this.cw / 2 - 10;

    this.doc.fontSize(9).font('Helvetica-Bold').fillColor(this.textDark);
    this.doc.text(title, x, this.y);
    let ay = this.doc.y + 3;

    this.doc.fontSize(8.5).font('Helvetica').fillColor(this.textMuted);
    lines.forEach((line) => {
      if (!line) return;
      this.doc.text(line, x, ay, { width: w });
      ay = this.doc.y + 1;
    });
    this.doc.fillColor('#000000');
    this.y = ay + 2;
  }

  /* ── Two-column address blocks ── */
  drawTwoColumnAddresses(leftTitle, leftLines, rightTitle, rightLines) {
    const leftX = this.margin;
    const rightX = this.margin + this.cw / 2 + 10;
    const colW = this.cw / 2 - 15;

    this.ensureSpace(80);

    this.doc.fontSize(9).font('Helvetica-Bold').fillColor(this.textDark);
    this.doc.text(leftTitle, leftX, this.y);
    this.doc.text(rightTitle, rightX, this.y);
    let leftY = this.doc.y + 3;
    let rightY = leftY;

    this.doc.fontSize(8.5).font('Helvetica').fillColor(this.textMuted);
    leftLines.forEach((line) => {
      if (!line) return;
      this.doc.text(line, leftX, leftY, { width: colW });
      leftY = this.doc.y + 1;
    });
    rightLines.forEach((line) => {
      if (!line) return;
      this.doc.text(line, rightX, rightY, { width: colW });
      rightY = this.doc.y + 1;
    });
    this.doc.fillColor('#000000');

    this.y = Math.max(leftY, rightY) + 3;
  }

  /* ── Product table ── */
  drawTable(columns, rows) {
    if (rows.length === 0) return;
    const colDefs = columns.map((c) => ({
      ...c,
      align: c.align || 'left',
    }));
    const headerH = 24;
    const minRowH = 22;
    let drawnHeader = false;

    const drawHeaderRow = () => {
      const hx = this.margin;
      this.doc.rect(hx, this.y, this.cw, headerH).fill(this.bgLight).stroke(this.borderColor);
      this.doc.fontSize(8.5).font('Helvetica-Bold').fillColor(this.textDark);
      let cx = hx;
      colDefs.forEach((col) => {
        const cellText = String(col.text || '');
        this.doc.text(cellText, cx + 3, this.y + 7, { width: col.width - 4, align: col.align });
        cx += col.width;
      });
      this.doc.fillColor('#000000');
      this.y += headerH;
    };

    const calcRowHeight = (row) => {
      let maxH = minRowH;
      colDefs.forEach((col, i) => {
        const cellText = String((row[i] && row[i].text !== undefined ? row[i].text : ''));
        if (cellText && col.width > 20) {
          try {
            const textH = this.doc.heightOfString(cellText, {
              width: col.width - 4,
              fontSize: 8,
            });
            maxH = Math.max(maxH, textH + 10);
          } catch { /* fallback */ }
        }
      });
      return Math.max(minRowH, maxH);
    };

    const drawDataRow = (row, h, idx) => {
      const hx = this.margin;
      if (idx % 2 === 1) {
        this.doc.rect(hx, this.y, this.cw, h).fill(this.bgAlt).stroke(this.borderColor);
      } else {
        this.doc.rect(hx, this.y, this.cw, h).fill('#FFFFFF').stroke(this.borderColor);
      }
      this.doc.fontSize(8).font('Helvetica');
      let cx = hx;
      colDefs.forEach((col, i) => {
        const cell = row[i] || {};
        const cellText = String(cell.text !== undefined ? cell.text : '');
        this.doc.text(cellText, cx + 3, this.y + 5, {
          width: col.width - 4,
          align: cell.align || col.align,
        });
        cx += col.width;
      });
      this.y += h;
    };

    /* Draw header */
    drawHeaderRow();
    drawnHeader = true;

    /* Draw rows */
    for (let idx = 0; idx < rows.length; idx++) {
      const rowH = calcRowHeight(rows[idx]);

      if (this.y + rowH + this.footerHeight > this.ph - this.margin) {
        this.addFooter();
        this.doc.addPage();
        this.y = this.margin + 10;
        drawHeaderRow();
      }

      drawDataRow(rows[idx], rowH, idx);
    }

    this.y += 2;
  }

  /* ── Financial summary (right-aligned) ── */
  drawSummary(lines) {
    this.ensureSpace(40 + lines.length * 18);
    const colW = 200;
    const colX = this.rx - colW;
    const labelW = colW * 0.6;
    const valW = colW * 0.38;

    lines.forEach((line) => {
      if (line.divider) {
        this.doc.moveTo(colX, this.y).lineTo(this.rx, this.y).strokeColor(this.borderColor).lineWidth(0.5).stroke();
        this.y += 6;
        return;
      }
      if (line.empty) {
        this.y += 4;
        return;
      }
      if (line.bold) {
        this.doc.fontSize(9.5).font('Helvetica-Bold');
      } else {
        this.doc.fontSize(9).font('Helvetica');
      }
      if (line.color) this.doc.fillColor(line.color);
      this.doc.text(String(line.label || ''), colX, this.y, { width: labelW });
      this.doc.text(String(line.value || ''), colX + labelW, this.y, { width: valW, align: 'right' });
      this.doc.fillColor('#000000');
      this.y += line.extra || 17;
    });
    this.y += 4;
  }

  /* ── Payment info line ── */
  drawPaymentInfo(label, value) {
    this.ensureSpace(18);
    this.doc.fontSize(9).font('Helvetica');
    this.doc.text(label, this.margin, this.y, { width: 160 });
    this.doc.fontSize(9).font('Helvetica-Bold');
    this.doc.text(value, this.margin + 165, this.y, { width: this.cw - 165 });
    this.doc.fillColor('#000000');
    this.y = this.doc.y + 4;
  }

  /* ── Key-value line ── */
  drawKeyValue(label, value, opts = {}) {
    this.ensureSpace(16);
    this.doc.fontSize(9).font(opts.valueBold ? 'Helvetica-Bold' : 'Helvetica');
    if (opts.labelColor) this.doc.fillColor(opts.labelColor);
    this.doc.text(label, opts.x || this.margin, this.y, { width: opts.labelWidth || 220 });
    this.doc.fillColor('#000000');
    if (opts.valueColor) this.doc.fillColor(opts.valueColor);
    this.doc.fontSize(9).font(opts.valueBold ? 'Helvetica-Bold' : 'Helvetica');
    this.doc.text(value, (opts.x || this.margin) + (opts.labelWidth || 220), this.y, {
      width: (opts.valueWidth || 200),
      align: 'right',
    });
    this.doc.fillColor('#000000');
    this.y = this.doc.y + (opts.extra || 3);
  }

  /* ── Body text block ── */
  drawBodyText(lines, opts = {}) {
    this.ensureSpace(16 * lines.length);
    const x = opts.x || this.margin;
    const w = opts.width || this.cw;
    if (opts.fontSize) this.doc.fontSize(opts.fontSize);
    if (opts.bold) this.doc.font('Helvetica-Bold');
    if (opts.color) this.doc.fillColor(opts.color);
    lines.forEach((line) => {
      this.doc.text(line, x, this.y, { width: w });
      this.y = this.doc.y + (opts.lineGap || 2);
    });
    this.doc.font('Helvetica').fillColor('#000000').fontSize(9);
  }

  /* ── Barcode ── */
  drawBarcode(buffer, x, y, opts = {}) {
    if (!buffer) return;
    const w = opts.width || 160;
    const h = opts.height || 28;
    this.doc.image(buffer, x, y, { width: w, height: h });
    if (opts.label) {
      this.doc.fontSize(7).font('Helvetica').fillColor(this.textMuted);
      this.doc.text(opts.label, x, y + h + 2, { width: w, align: 'center' });
      this.doc.fillColor('#000000');
    }
  }

  /* ── QR Code ── */
  drawQR(data, x, y, opts = {}) {
    try {
      const qrBuffer = QRCode.toBuffer(JSON.stringify(data), {
        errorCorrectionLevel: 'M', margin: 1, width: 200,
      });
      const size = opts.size || 55;
      this.doc.image(qrBuffer, x, y, { width: size, height: size });
      if (opts.label) {
        this.doc.fontSize(6).font('Helvetica').fillColor(this.textMuted);
        this.doc.text(opts.label, x, y + size + 2, { width: size, align: 'center' });
        this.doc.fillColor('#000000');
      }
    } catch { /* QR non-critical */ }
  }

  /* ── Footer ── */
  addFooter() {
    const fy = this.ph - this.margin - this.footerHeight;
    this.doc.lineWidth(0.5);
    this.doc.moveTo(this.margin, fy)
      .lineTo(this.rx, fy)
      .strokeColor(this.borderColor)
      .stroke();

    this.doc.fontSize(7.5).font('Helvetica').fillColor(this.textMuted);
    let ftext = '';
    if (this.config.GSTIN) ftext += `GST: ${this.config.GSTIN}  |  `;
    if (this.config.supportEmail) ftext += `${this.config.supportEmail}  |  `;
    if (this.config.website) ftext += `${this.config.website}  |  `;
    ftext += fmtDate(new Date(), 'DD/MM/YYYY');

    this.doc.text(ftext, this.margin, fy + 6, { width: this.cw, align: 'center' });
    this.doc.fontSize(7).fillColor(this.textMuted);
    const footerLine = this.config.invoiceFooter || 'Thank you for your business!';
    this.doc.text(footerLine, this.margin, fy + 18, { width: this.cw, align: 'center' });

    /* Page number */
    const pageCount = this.doc.bufferedPageRange ? this.doc.bufferedPageRange().count : this.doc.page;
    this.doc.text(`Page ${pageCount}`, this.margin, fy + 30, { width: this.cw, align: 'center' });
    this.doc.fillColor('#000000');
  }

  /* ── Finalize document ── */
  finalize() {
    this.addFooter();
  }
}

/* ── Invoice Service ── */
export const createInvoiceService = ({ configurationService, orderRepository, paymentOrderRepository, commissionRepository, ledgerRepository, createApiError }) => {
  const getDir = (type) => {
    const dir = path.join(BASE_INVOICE_DIR, type);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  };

  const getFilePath = (type, orderId) => path.join(getDir(type), `${orderId}.pdf`);

  /* Resolve SKU per order item from populated product.variants */
  const resolveItemSku = (item) => {
    if (item.product?.variants && Array.isArray(item.product.variants) && item.variantId) {
      const vId = item.variantId.toString ? item.variantId.toString() : item.variantId;
      const variant = item.product.variants.find((v) => {
        const vid = v._id?.toString ? v._id.toString() : v._id;
        return vid === vId;
      });
      if (variant?.sku) return variant.sku;
    }
    return item.sku || item.product?.sku || '-';
  };

  const loadConfig = async () => {
    const invoicing = await configurationService.getInvoicingConfig();
    const commissionConfig = await configurationService.getCommissionConfig();
    const general = await configurationService.getGeneralConfig?.() || {};

    const config = {
      ...invoicing,
      currency: invoicing.currency || commissionConfig.currency || 'INR',
      commissionConfig,
      general,
    };

    if (config.logo) {
      const logoPath = await fetchImageToTemp(config.logo);
      if (logoPath) config.logoPath = logoPath;
    }

    return config;
  };

  const buildDocument = async ({ orderId, type, templateFn, extra = {} }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw createApiError({ statusCode: 404, message: 'Order not found' });

    /* Attach payment info */
    if (paymentOrderRepository) {
      try {
        const payOrder = await paymentOrderRepository.findByOrderId(order._id || orderId);
        if (payOrder) {
          order._payment = {
            method: payOrder.paymentMethod || 'COD',
            status: payOrder.status || 'PENDING',
            amount: payOrder.amount || order.totalSellingPrice || 0,
            transactionId: payOrder.providerPaymentId || '',
          };
        }
      } catch { /* payment lookup non-critical */ }
    }
    if (!order._payment) {
      order._payment = {
        method: order.paymentMethod || 'COD',
        status: order.paymentStatus || 'PENDING',
        amount: order.totalSellingPrice || 0,
        transactionId: '',
      };
    }

    /* Resolve SKUs */
    const orderItems = (order.orderItems || order.items || []).map((item) => ({
      ...item,
      _sku: resolveItemSku(item),
    }));
    order._items = orderItems;

    const config = await loadConfig();
    const invoicePath = getFilePath(type, orderId);
    if (fs.existsSync(invoicePath)) return fs.readFileSync(invoicePath);

    const commission = type === 'seller'
      ? (await commissionRepository.findByOrder(orderId)) || null
      : null;

    let barcodeBuffer = null;
    try {
      barcodeBuffer = await bwipjs.toBuffer({
        bcid: 'code128', text: order.orderId || orderId, scale: 2, height: 12,
        includetext: false, textxalign: 'center',
      });
    } catch { /* barcode non-critical */ }

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'portrait' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    const layout = new LayoutEngine(doc, config);

    templateFn({
      doc, layout, order, config,
      commission, barcodeBuffer,
      fmtAmount, fmtDate,
      ...extra,
    });

    layout.finalize();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        try { fs.writeFileSync(invoicePath, pdfBuffer); } catch { /* non-critical */ }
        resolve(pdfBuffer);
      });
      doc.end();
    });
  };

  const generateCustomerInvoice = (params) =>
    buildDocument({ ...params, type: 'customer', templateFn: renderCustomerInvoice });

  const generateSellerInvoice = (params) =>
    buildDocument({ ...params, type: 'seller', templateFn: renderSellerInvoice });

  const generatePackingSlip = (params) =>
    buildDocument({ ...params, type: 'packing', templateFn: renderPackingSlip });

  const generateBulkDocuments = async ({ orderIds, type }) => {
    const results = [];
    for (const orderId of orderIds) {
      try {
        const buf = await buildDocument({
          orderId, type,
          templateFn: type === 'customer' ? renderCustomerInvoice
            : type === 'seller' ? renderSellerInvoice
              : renderPackingSlip,
        });
        results.push({ orderId, buffer: buf, success: true });
      } catch (err) {
        results.push({ orderId, success: false, error: err.message });
      }
    }
    return results;
  };

  return Object.freeze({
    generateCustomerInvoice,
    generateSellerInvoice,
    generatePackingSlip,
    generateBulkDocuments,
  });
};
