import bcrypt from 'bcryptjs';

/**
 * Password hashing helpers for customer password authentication.
 *
 * Uses bcryptjs (pure-JS implementation, no native bindings) exclusively.
 * Passwords are NEVER stored in plaintext, never logged, and never
 * returned to callers in any form.
 */

// bcrypt cost factor. Higher is slower but more resistant to brute force.
const BCRYPT_COST = 12;

/**
 * Hashes a plaintext password with a freshly generated random salt.
 * Never logs the password or the resulting hash.
 */
export const hashPassword = (password, cost = BCRYPT_COST) =>
{
    return bcrypt.hash(password, cost);
};

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Returns a Promise resolving to a boolean.
 */
export const verifyPassword = (password, passwordHash) =>
{
    return bcrypt.compare(password, passwordHash);
};

/**
 * Returns true only when the stored value is a usable bcrypt hash.
 * Safely rejects null, empty, and legacy non-bcrypt values (e.g. the old
 * unsalted SHA-256 hashes) so password flows can route those accounts to
 * an OTP-based "set password" path instead of attempting verification.
 */
export const isUsablePasswordHash = (passwordHash) =>
{
    return typeof passwordHash === 'string'
        && passwordHash.length > 0
        && passwordHash.startsWith('$2');
};

/**
 * Returns true when a plaintext password satisfies the platform password
 * policy: a non-whitespace string of at least 8 characters, and no more
 * than 72 bytes (bcrypt's hard input limit).
 */
export const isValidPasswordPolicy = (password) =>
{
    return typeof password === 'string'
        && password.length >= 8
        && Buffer.byteLength(password, 'utf8') <= 72
        && password.trim().length > 0;
};
