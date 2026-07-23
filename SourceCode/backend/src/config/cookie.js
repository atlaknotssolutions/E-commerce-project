import { env } from './env.js';

/**
 * Dynamic Cookie Options Generator matching standard browser security policies.
 * Automatically switches settings between local HTTP (localhost) and live HTTPS (production).
 */
const getCookieOptions = () =>
{
    const isProduction = env.nodeEnv === 'production';

    const options = {
        httpOnly: true, // Safeguards against XSS attacks by blocking client-side JS reads
        maxAge: 7 * 24 * 60 * 60 * 1000, // Valid for exactly 7 days
    };

    if (isProduction)
    {
        // Live Production HTTPS setups
        options.secure = true;
        options.sameSite = 'none'; // Essential to permit cross-origin cookie transfers securely
        options.domain = process.env.COOKIE_DOMAIN || undefined; // Scope boundary configuration
    } else
    {
        // Local Development plain HTTP setups (localhost:3000 to localhost:5000/5454)
        options.secure = false;
        options.sameSite = 'lax'; // Allows browsers to safely retain session cookies locally
    }

    return options;
};

export const COOKIE_OPTIONS = Object.freeze(getCookieOptions());