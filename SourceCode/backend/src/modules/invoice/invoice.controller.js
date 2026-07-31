import Archiver from 'archiver';
import { ROLES } from '../../constants/enums.js';

export const createInvoiceController = ({ invoiceService, orderRepository, createApiError }) => {

  const checkCustomerAccess = (order, userId) => {
    const isOwner = order.user?._id?.toString() === userId?.toString()
      || order.user?.toString() === userId?.toString();
    if (!isOwner) {
      throw createApiError({ statusCode: 403, message: 'Access denied. You can only download your own invoice.' });
    }
  };

  const checkSellerAccess = (order, userId) => {
    const isOwner = order.seller?._id?.toString() === userId?.toString()
      || order.seller?.toString() === userId?.toString();
    if (!isOwner) {
      throw createApiError({ statusCode: 403, message: 'Access denied. You can only access your own orders.' });
    }
  };

  const getCustomerInvoice = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await orderRepository.findById(orderId);
    if (!order) throw createApiError({ statusCode: 404, message: 'Order not found' });

    if (userRole !== ROLES.ADMIN) checkCustomerAccess(order, userId);

    const pdf = await invoiceService.generateCustomerInvoice({ orderId });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);
    res.send(pdf);
  };

  const getSellerInvoice = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await orderRepository.findById(orderId);
    if (!order) throw createApiError({ statusCode: 404, message: 'Order not found' });

    if (userRole !== ROLES.ADMIN) checkSellerAccess(order, userId);

    const pdf = await invoiceService.generateSellerInvoice({ orderId });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="settlement-${orderId}.pdf"`);
    res.send(pdf);
  };

  const getPackingSlip = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await orderRepository.findById(orderId);
    if (!order) throw createApiError({ statusCode: 404, message: 'Order not found' });

    if (userRole !== ROLES.ADMIN) checkSellerAccess(order, userId);

    const pdf = await invoiceService.generatePackingSlip({ orderId });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="packing-slip-${orderId}.pdf"`);
    res.send(pdf);
  };

  const bulkDownload = async (req, res) => {
    const { orderIds, documentType } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw createApiError({ statusCode: 400, message: 'orderIds must be a non-empty array' });
    }
    if (!['customer', 'seller', 'packing'].includes(documentType)) {
      throw createApiError({ statusCode: 400, message: 'documentType must be customer, seller, or packing' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    const typeLabel = { customer: 'Invoice', seller: 'Settlement', packing: 'Packing-Slip' };
    const templateFn = documentType === 'customer'
      ? invoiceService.generateCustomerInvoice
      : documentType === 'seller'
        ? invoiceService.generateSellerInvoice
        : invoiceService.generatePackingSlip;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${typeLabel[documentType]}s-${Date.now()}.zip"`);

    const archive = Archiver('zip', { zlib: { level: 5 } });
    archive.pipe(res);

    let processed = 0;
    for (const orderId of orderIds) {
      try {
        const order = await orderRepository.findById(orderId);
        if (!order) continue;
        if (userRole !== ROLES.ADMIN) {
          const isOwner = order.seller?._id?.toString() === userId?.toString()
            || order.seller?.toString() === userId?.toString();
          if (!isOwner) continue;
        }
        const pdf = await templateFn({ orderId });
        archive.append(pdf, { name: `${typeLabel[documentType]}-${orderId}.pdf` });
        processed++;
      } catch { /* skip failed */ }
    }

    archive.finalize();
  };

  return Object.freeze({
    getCustomerInvoice,
    getSellerInvoice,
    getPackingSlip,
    bulkDownload,
  });
};
