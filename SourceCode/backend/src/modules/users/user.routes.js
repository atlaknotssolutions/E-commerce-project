/**
 * Pure function-based routing factory representing the Customer Users API gateways.
 * Binds user paths directly to authenticators filters using dependency injection.
 */
export const createUserRoutes = ({
    router,
    userController,
    authenticate,
    upload,
    asyncHandler
}) =>
{

    // ==========================================
    // SECURED USERS GATEWAYS (/api/users/*)
    // ==========================================

    // Customer Endpoint: Recalculates and pulls active user profile details (Authentication required)
    router.get(
        '/api/users/profile',
        authenticate,
        asyncHandler(userController.getUserProfile)
    );

    // Customer Endpoint: Adds a new address to the authenticated user's address book.
    router.post(
        '/api/users/address',
        authenticate,
        asyncHandler(userController.addAddress)
    );

    // Customer Endpoint: Updates one of the authenticated user's saved addresses.
    router.put(
        '/api/users/address/:addressId',
        authenticate,
        asyncHandler(userController.updateUserAddress)
    );

    // Customer Endpoint: Deletes one of the authenticated user's saved addresses.
    router.delete(
        '/api/users/address/:addressId',
        authenticate,
        asyncHandler(userController.deleteUserAddress)
    );


    // Customer Endpoint: Sets one of the authenticated user's saved addresses as the default.
    router.patch(
        '/api/users/address/:addressId/default',
        authenticate,
        asyncHandler(userController.setDefaultUserAddress)
    );

    // Unified Endpoint: Upload or replace the authenticated user's profile photo.
    // Works for ALL roles: Customer, Seller, Admin.
    router.put(
        '/api/users/profile/photo',
        authenticate,
        upload.single('image'),
        asyncHandler(userController.updateProfilePhoto)
    );

    return router;
};