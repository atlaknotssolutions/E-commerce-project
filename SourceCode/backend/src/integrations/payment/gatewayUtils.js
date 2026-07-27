import crypto from 'crypto';

/**
 * Generates a unique idempotency key for gateway calls.
 * Format: {prefix}-{entityId}-attempt-{attemptCount}
 * Example: PAYOUT-64a1b2c3-attempt-1
 *
 * @param {string} prefix     - "PAYOUT" | "REFUND"
 * @param {string} entityId   - MongoDB ObjectId string
 * @param {number} attempt    - Attempt number (1-based)
 * @returns {string}
 */
export const generateIdempotencyKey = (prefix, entityId, attempt = 1) => {
    return `${prefix}-${entityId}-attempt-${attempt}`;
};

/**
 * Generates a unique correlation ID for tracing requests across system boundaries.
 * Format: CORR_{random hex}
 * Example: CORR_87d6a3f1b2c4
 *
 * @returns {string}
 */
export const generateCorrelationId = () => {
    return `CORR_${crypto.randomBytes(6).toString('hex')}`;
};
