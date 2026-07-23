import { v2 as cloudinary } from 'cloudinary';

/**
 * Pure function-based factory representing the Cloudinary Media Integration Adapter.
 * Decouples external API configurations utilizing Dependency Injection.
 */
export const createCloudinaryClient = ({ cloudName, apiKey, apiSecret }) =>
{
    // Initialize Cloudinary configuration
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    /**
     * Enterprise-grade in-memory image uploader.
     * Uploads binary buffers directly to Cloudinary without storing files on disk.
     */
    const uploadImageBuffer = (
        fileBuffer,
        folder = 'AI_knots_Commerce'
    ) =>
    {
        return new Promise((resolve, reject) =>
        {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                },
                (error, result) =>
                {
                    if (error)
                    {
                        console.error(
                            '[CLOUDINARY] Upload failed:',
                            error.message
                        );

                        return reject(error);
                    }

                    resolve({
                        secureUrl: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            );

            uploadStream.end(fileBuffer);
        });
    };

    /**
     * Deletes an image from Cloudinary using its public ID.
     */
    const deleteImage = async (publicId) =>
    {
        if (!publicId)
        {
            return;
        }

        return cloudinary.uploader.destroy(publicId);
    };

    /**
     * Extracts Cloudinary public ID from a secure URL.
     *
     * Example:
     * https://res.cloudinary.com/demo/image/upload/v1234567890/Atla_Commerce/home/banner.jpg
     *
     * returns:
     *
     * AI_knots_Commerce/home/banner
     */
    const extractPublicId = (imageUrl) =>
    {
        if (!imageUrl)
        {
            return null;
        }

        const uploadMarker = '/upload/';

        const uploadIndex = imageUrl.indexOf(uploadMarker);

        if (uploadIndex === -1)
        {
            return null;
        }

        let path = imageUrl.substring(uploadIndex + uploadMarker.length);

        // Remove version if present (v123456789)
        path = path.replace(/^v\d+\//, '');

        // Remove extension (.jpg, .png, etc.)
        const extensionIndex = path.lastIndexOf('.');

        if (extensionIndex !== -1)
        {
            path = path.substring(0, extensionIndex);
        }

        return path;
    };

    return Object.freeze({
        uploadImageBuffer,
        deleteImage,
        extractPublicId,
    });
};