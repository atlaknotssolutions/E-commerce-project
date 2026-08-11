/**
 * Global Centralized Error Handling Middleware for Express 5.
 * Handles all application errors in one place.
 */
export const createErrorHandlerMiddleware = ({ nodeEnv } = { nodeEnv: 'development' }) =>
{
    return (err, req, res, next) =>
    {
        // Use default values if the error object doesn't provide them
        let statusCode = err.statusCode || 500;
        let message = err.message || 'An unexpected server error occurred.';
        let code = err.code || 'INTERNAL_SERVER_ERROR';

        // Normalize Mongoose schema validation failures to 400 (client error)
        if (err.name === 'ValidationError')
        {
            statusCode = 400;
            code = 'VALIDATION_ERROR';
            const fields = Object.keys(err.errors || {});
            message = fields.length
                ? `Validation failed: ${fields.map(f => err.errors[f]?.message).join(', ')}`
                : 'The provided data is invalid.';
        }

        // Normalize Mongoose invalid ObjectId / cast failures to 400 (client error)
        if (err.name === 'CastError')
        {
            statusCode = 400;
            code = 'INVALID_ID';
            message = 'The identifier provided in the request is invalid.';
        }

        // Normalize JWT failures to 401 (unauthenticated)
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
        {
            statusCode = 401;
            code = 'UNAUTHORIZED';
            message = 'Authentication token is invalid or has expired.';
        }

        // Log server errors differently from client/operational errors
        if (statusCode >= 500)
        {
            console.error(`[CRITICAL APPLICATION EXCEPTION] Trace:`, err.stack || err);
        } else
        {
            console.warn(`[OPERATIONAL SYSTEM WARNING] Code: ${code} | Message: ${message}`);
        }

        // Standard error response sent to the client
        const responsePayload = {
            success: false,
            message,
            code,
            timestamp: new Date().toISOString(),
        };

        // Include stack trace only while developing the application
        if (nodeEnv === 'development' && statusCode >= 500)
        {
            responsePayload.stack = err.stack;
        }

        // Send the error response with the appropriate HTTP status code
        res.status(statusCode).json(responsePayload);
    };
};