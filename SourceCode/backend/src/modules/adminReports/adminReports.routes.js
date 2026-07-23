export const createAdminReportsRoutes = ({
  router,
  controller,
  authenticate,
  authorizeRoles,
  asyncHandler,
}) => {

  router.get(
    '/admin/reports/dashboard',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getDashboard)
  );

  router.get(
    '/admin/reports/sales',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getSales)
  );

  router.get(
    '/admin/reports/revenue',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getRevenue)
  );

  router.get(
    '/admin/reports/products',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getProducts)
  );

  router.get(
    '/admin/reports/sellers',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getSellers)
  );

  router.get(
    '/admin/reports/customers',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getCustomers)
  );

  router.get(
    '/admin/reports/orders',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getOrders)
  );

  router.get(
    '/admin/reports/returns',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getReturns)
  );

  router.get(
    '/admin/reports/coupons',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.getCoupons)
  );

  router.get(
    '/admin/reports/export/csv',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.exportCsv)
  );

  router.get(
    '/admin/reports/export/excel',
    authenticate,
    authorizeRoles('ROLE_ADMIN'),
    asyncHandler(controller.exportExcel)
  );

  return Object.freeze(router);
};


