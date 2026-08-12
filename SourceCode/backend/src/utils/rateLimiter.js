/**
 * In-memory, fixed-window rate limiter middleware factory.
 *
 * Provides lightweight brute-force protection for low-traffic endpoints
 * (e.g. password login) without adding a production dependency.
 *
 * LIMITATIONS:
 * - State lives in-process only. It is NOT shared across multiple server
 *   instances/processes. Fine for a single-process deployment; swap for a
 *   shared store (Redis etc.) when scaling horizontally.
 * - Counts every request to the protected route within the window,
 *   including successful ones. Window resets are fixed, not sliding.
 */
export const createRateLimiter = ({
    windowMs,
    maxAttempts,
    keyGenerator,
    message = 'Too many requests. Please try again later.',
    code = 'RATE_LIMIT_EXCEEDED',
    statusCode = 429,
}) =>
{
    // key -> { count, resetAt }
    const hits = new Map();

    // Lazily drop expired entries to keep memory bounded.
    const purgeExpired = () =>
    {
        const now = Date.now();
        for (const [key, entry] of hits)
        {
            if (entry.resetAt <= now)
            {
                hits.delete(key);
            }
        }
    };

    const middleware = (req, res, next) =>
    {
        purgeExpired();

        const now = Date.now();
        const key = keyGenerator(req);

        let entry = hits.get(key);
        if (!entry || entry.resetAt <= now)
        {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(key, entry);
        }

        entry.count += 1;

        if (entry.count > maxAttempts)
        {
            const error = new Error(message);
            Object.assign(error, {
                statusCode,
                code,
                isOperational: true,
            });
            return next(error);
        }

        return next();
    };

    return middleware;
};
