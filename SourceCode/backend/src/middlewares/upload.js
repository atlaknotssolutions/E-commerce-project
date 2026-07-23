import multer from 'multer';

// 1. Direct memory buffer configuration (Zero local files systems writes)
const storage = multer.memoryStorage();

/**
 * Custom File Format Security Filter.
 * Strictly scans MIME types to block dynamic scripting injection attacks.
 */
const fileFilter = (req, file, cb) =>
{
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype))
    {
        cb(null, true); // Approved: Proceeds safely
    } else
    {
        // Rejected: Emits custom validation exception warning
        cb(new Error('Validation Failure: Only JPG, JPEG, PNG, and WEBP image formats are permitted!'), false);
    }
};

/**
 * Configured Multer Multipart Form-Data Parser.
 * Limits uploaded assets sizes to prevent server memory exhaustion.
 */
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Enforces strict upper boundary limits of 5 Megabytes
    },
});