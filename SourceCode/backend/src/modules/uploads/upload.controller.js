/**
 * Pure function-based factory representing the Media Assets Upload HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createUploadController = ({ cloudinaryClient, createApiError }) =>
{
    /**
     * Whitelist of allowed Cloudinary folders.
     * Prevents arbitrary folder creation inside Cloudinary.
     */
    // const ALLOWED_UPLOAD_FOLDERS = Object.freeze([
    //     'general',
    //     'products',
    //     'categories',
    //     'home',
    //     'brands',
    //     'sellers',
    //     'users',
    // ]);

    const ALLOWED_UPLOAD_FOLDERS = Object.freeze([
        'general',

        // Product Catalog
        'products',
        'categories',
        'brands',
        'home',

        // User Profiles
        'seller-avatars',
        'customer-avatars',
        'admin-avatars',

        // Business Documents
        'seller-documents',

        // Reviews & Misc
        'reviews',
    ]);

    /**
     * Main Single Image Stream Upload Controller.
     * Receives Multer parsed memory buffer and streams binary directly to Cloudinary.
     * Maps exactly to: POST /api/uploads/image (Authentication required)
     */
    const uploadImage = async (req, res) =>
    {
        const file = req.file;

        // 1. Ensure uploaded image exists in request payload
        if (!file?.buffer)
        {
            throw createApiError({
                statusCode: 400,
                code: 'MISSING_UPLOAD_FILE',
                message:
                    'Upload failed: No binary image file located in the request payload.',
            });
        }

        // 2. Determine requested upload folder
        const requestedFolder = req.query.folder || 'general';

        // 3. Validate upload folder
        if (!ALLOWED_UPLOAD_FOLDERS.includes(requestedFolder))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_UPLOAD_FOLDER',
                message: `The upload folder "${requestedFolder}" is not supported.`,
            });
        }

        // 4. Build final Cloudinary folder path
        const targetFolder = `AI_knots_Commerce/${requestedFolder}`;

        // 5. Upload image directly from memory buffer
        const uploadedAsset = await cloudinaryClient.uploadImageBuffer(
            file.buffer,
            targetFolder
        );

        // 6. Return upload response
        res.status(201).json({
            success: true,
            message: 'Media asset successfully uploaded and secured.',
            secureUrl: uploadedAsset.secureUrl,
            publicId: uploadedAsset.publicId,
        });
    };

    return Object.freeze({
        uploadImage,
    });
};