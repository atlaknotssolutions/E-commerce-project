/**
 * Pure function-based routing factory representing the Media Assets Upload API gateways.
 * Binds upload paths directly to authenticators and Multer filters using dependency injection.
 */
export const createUploadRoutes = ({
    router,
    uploadController,
    upload, // Injected Multer configurations parser middleware
    authenticate,
    asyncHandler
}) =>
{

    // ==========================================
    // SECURED UPLOADS GATEWAYS (/api/uploads/*)
    // ==========================================

    // Customer/Seller/Admin Endpoint: Parses multipart binary named 'image' and streams file directly to Cloudinary (Authentication required)
    router.post(
        '/api/uploads/image',
        authenticate,
        upload.single('image'), // Intercepts single multipart file named 'image' in-memory
        asyncHandler(uploadController.uploadImage)
    );

    return router;
};