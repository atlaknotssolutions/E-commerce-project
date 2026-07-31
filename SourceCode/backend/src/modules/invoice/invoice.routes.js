export const createInvoiceRoutes = ({
  router,
  controller,
  authenticate,
  authorizeRoles,
  asyncHandler,
}) => {

  /* ── Customer Tax Invoice ── */
  router.get(
    '/api/invoice/customer/:orderId',
    authenticate,
    asyncHandler(controller.getCustomerInvoice)
  );

  /* ── Seller Settlement Invoice ── */
  router.get(
    '/api/invoice/seller/:orderId',
    authenticate,
    authorizeRoles('ROLE_SELLER', 'ROLE_ADMIN'),
    asyncHandler(controller.getSellerInvoice)
  );

  /* ── Packing Slip ── */
  router.get(
    '/api/invoice/packing-slip/:orderId',
    authenticate,
    authorizeRoles('ROLE_SELLER', 'ROLE_ADMIN'),
    asyncHandler(controller.getPackingSlip)
  );

  /* ── Bulk Document Download (ZIP) ── */
  router.post(
    '/api/invoice/bulk',
    authenticate,
    authorizeRoles('ROLE_SELLER', 'ROLE_ADMIN'),
    asyncHandler(controller.bulkDownload)
  );

  return Object.freeze(router);
};
