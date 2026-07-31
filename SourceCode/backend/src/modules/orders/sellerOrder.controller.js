import ExcelJS from 'exceljs';
import { emitToUser, emitToSeller } from '../../services/socket.service.js';
import { getSellerTransitions } from "../../constants/orderTransitions.js";
import { ORDER_STATUS } from "../../constants/enums.js";

/**
 * Pure function-based factory representing the Merchant Seller Order HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createSellerOrderController = ({ orderService, orderRepository, paymentOrderRepository, configurationService, createApiError }) =>
{

    /**
     * Retrieves merchant store orders list chronologically newest first.
     * Maps exactly to: GET /seller/orders (Seller authorization required)
     */
    const getSellerOrders = async (req, res) =>
    {
        const sellerId = req.user.id;
        const ordersList = await orderService.getSellerOrders({ sellerId });
        res.status(202).json(ordersList);
    };

    /**
     * Merchant Order Status Transitions Modifier.
     */
    const updateStatus = async (req, res) =>
    {
        const { orderId, orderStatus } = req.params;
        const sellerId = req.user.id;
        const updatedOrder = await orderService.updateOrderStatus({
            orderId, orderStatus, sellerId,
        });
        emitToUser(updatedOrder.user?._id || updatedOrder.user, 'order:statusChanged', {
            orderId, orderStatus, sellerId,
        });
        emitToSeller(sellerId, 'order:statusChanged', {
            orderId, orderStatus,
        });
        res.status(202).json(updatedOrder);
    };

    /**
     * Merchant Shipment Tracking Assignment.
     */
    const assignTracking = async (req, res) =>
    {
        const { orderId } = req.params;
        const sellerId = req.user.id;
        const { trackingNumber, carrier, estimatedDelivery } = req.body;
        const updatedOrder = await orderService.assignShipmentTracking({
            orderId, trackingNumber, carrier, estimatedDelivery, sellerId,
        });
        emitToUser(updatedOrder.user?._id || updatedOrder.user, 'order:trackingUpdated', {
            orderId, trackingNumber, carrier, estimatedDelivery,
        });
        res.status(200).json(updatedOrder);
    };

    /**
     * Merchant Order Deletions (Soft-cancel allocations).
     */
    const deleteOrder = async (req, res) =>
    {
        const { orderId } = req.params;
        const sellerId = req.user.id;
        const outcome = await orderService.deleteOrder({ orderId, sellerId });
        res.status(202).json(outcome);
    };

    /**
     * Returns the complete seller transition rules map.
     */
    const getSellerTransitionRules = async (req, res) =>
    {
        const statuses = Object.values(ORDER_STATUS);
        const rules = {};
        for (const status of statuses)
        {
            rules[status] = getSellerTransitions(status);
        }
        res.json({ transitionRules: rules });
    };

    /**
     * Exports seller orders as CSV or XLSX respecting current filters.
     * Maps exactly to: GET /seller/orders/export (Seller authorization required)
     */
    const exportSellerOrders = async (req, res) =>
    {
        const sellerId = req.user.id;
        const { format = 'csv', search, orderStatus, paymentStatus, paymentMethod } = req.query;

        const orders = await orderRepository.findBySeller({ sellerId });

        let filtered = orders;

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((o) =>
                o.orderId?.toLowerCase().includes(q) ||
                o.user?.fullName?.toLowerCase().includes(q) ||
                o.shippingAddress?.name?.toLowerCase().includes(q) ||
                o.orderItems?.some((i) => i.title?.toLowerCase().includes(q))
            );
        }
        if (orderStatus) {
            filtered = filtered.filter((o) => o.orderStatus === orderStatus);
        }
        if (paymentStatus) {
            filtered = filtered.filter((o) => (o.payment?.status || o.paymentStatus) === paymentStatus);
        }
        if (paymentMethod) {
            filtered = filtered.filter((o) => o.payment?.method === paymentMethod);
        }

        // Attach payment info to each order
        for (const order of filtered) {
            const payment = await paymentOrderRepository.findByOrderId(order._id || order.id);
            if (payment) {
                order.payment = {
                    method: payment.paymentMethod,
                    status: payment.status,
                    amount: payment.amount,
                    transactionId: payment.providerPaymentId,
                };
            }
        }

        const rows = [];
        for (const order of filtered) {
            const items = order.orderItems || [];
            for (const item of items) {
                rows.push({
                    orderId: order.orderId,
                    date: order.orderDate || order.createdAt,
                    customerName: order.shippingAddress?.name || order.user?.fullName || '-',
                    product: item.title || item.product?.title || '-',
                    quantity: item.quantity || 0,
                    mrp: item.mrpPrice || 0,
                    sellingPrice: item.sellingPrice || 0,
                    couponDiscount: order.couponPrice || 0,
                    amountPaid: order.payment?.amount || (order.totalSellingPrice - (order.couponPrice || 0)) || 0,
                    platformCommission: order.commissionAmount || 0,
                    platformGst: order.gstAmount || 0,
                    sellerEarnings: order.netSellerEarnings || order.settlementAmount || 0,
                    paymentMethod: order.payment?.method || order.paymentMethod || '-',
                    paymentStatus: order.payment?.status || order.paymentStatus || '-',
                    orderStatus: order.orderStatus || '-',
                    trackingNumber: order.trackingNumber || '-',
                    invoiceNumber: `INV-${order.orderId}`,
                    settlementStatus: order.settlementAmount ? 'SETTLED' : 'PENDING',
                });
            }
        }

        if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'AI Knots Marketplace';
            workbook.created = new Date();

            const sheet = workbook.addWorksheet('Orders');
            sheet.columns = [
                { header: 'Order ID', key: 'orderId', width: 22 },
                { header: 'Date', key: 'date', width: 18 },
                { header: 'Customer Name', key: 'customerName', width: 25 },
                { header: 'Product', key: 'product', width: 30 },
                { header: 'Quantity', key: 'quantity', width: 10 },
                { header: 'MRP', key: 'mrp', width: 12 },
                { header: 'Selling Price', key: 'sellingPrice', width: 14 },
                { header: 'Coupon Discount', key: 'couponDiscount', width: 16 },
                { header: 'Amount Paid', key: 'amountPaid', width: 14 },
                { header: 'Platform Commission', key: 'platformCommission', width: 20 },
                { header: 'Platform GST', key: 'platformGst', width: 14 },
                { header: 'Seller Earnings', key: 'sellerEarnings', width: 16 },
                { header: 'Payment Method', key: 'paymentMethod', width: 18 },
                { header: 'Payment Status', key: 'paymentStatus', width: 16 },
                { header: 'Order Status', key: 'orderStatus', width: 16 },
                { header: 'Tracking Number', key: 'trackingNumber', width: 20 },
                { header: 'Invoice Number', key: 'invoiceNumber', width: 22 },
                { header: 'Settlement Status', key: 'settlementStatus', width: 18 },
            ];

            rows.forEach((row) => sheet.addRow(row));

            sheet.getRow(1).font = { bold: true };

            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="orders-export-${Date.now()}.xlsx"`);
            res.send(Buffer.from(buffer));
        } else {
            const headers = [
                'Order ID', 'Date', 'Customer Name', 'Product', 'Quantity', 'MRP',
                'Selling Price', 'Coupon Discount', 'Amount Paid', 'Platform Commission',
                'Platform GST', 'Seller Earnings', 'Payment Method', 'Payment Status',
                'Order Status', 'Tracking Number', 'Invoice Number', 'Settlement Status',
            ];

            let csv = headers.join(',') + '\n';

            for (const row of rows) {
                const values = headers.map((h) => {
                    const key = h.toLowerCase().replace(/ /g, '');
                    const val = row[key] ?? row[Object.keys(row).find((k) => k.toLowerCase().replace(/[\s_]/g, '') === key)] ?? '-';
                    const str = String(val);
                    return str.includes(',') || str.includes('"') || str.includes('\n')
                        ? `"${str.replace(/"/g, '""')}"`
                        : str;
                });
                csv += values.join(',') + '\n';
            }

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="orders-export-${Date.now()}.csv"`);
            res.send(csv);
        }
    };

    return Object.freeze({
        getSellerOrders,
        updateStatus,
        assignTracking,
        deleteOrder,
        getSellerTransitionRules,
        exportSellerOrders,
    });
};
