/**
 * Gateway Interface Contract
 *
 * Every gateway implementation (mock or real) must expose these methods.
 * Services never import gateway implementations directly — they use the factory.
 *
 * Payout methods:
 *   createPayout(request)  → GatewayPayoutResponse
 *   fetchPayout(payoutId)  → GatewayPayoutResponse
 *   cancelPayout(payoutId) → GatewayPayoutResponse
 *
 * Refund methods:
 *   createRefund(request)  → GatewayRefundResponse
 *   fetchRefund(refundId)  → GatewayRefundResponse
 *
 * Current implementations:
 *   RazorpayMockGateway  → razorpay.mock.gateway.js  (customer refunds)
 *   RazorpayXMockGateway → razorpayx.mock.gateway.js (seller payouts)
 *
 * Future implementations:
 *   RealRazorpayGateway, RealStripeGateway, RealRazorpayXGateway,
 *   RealCashfreeGateway, RealPhonePeGateway, etc.
 */

/**
 * @typedef {Object} GatewayPayoutRequest
 * @property {number}  amount       - Amount in paise (INR * 100)
 * @property {string}  currency     - ISO 4217 (e.g., "INR")
 * @property {string}  mode         - NEFT | RTGS | IMPS | UPI
 * @property {string}  purpose      - "payout"
 * @property {string}  referenceId  - Business reference ID
 * @property {string}  fundAccountId - Target fund account
 * @property {string}  idempotencyKey - Unique key to prevent duplicate payouts
 * @property {string}  [correlationId] - Traces request across system boundaries
 */

/**
 * @typedef {Object} GatewayPayoutResponse
 * @property {string}  id             - Gateway payout ID (pout_xxxx)
 * @property {string}  status         - pending | processing | processed | failed | cancelled
 * @property {number}  amount         - Amount in paise
 * @property {string}  currency       - ISO 4217
 * @property {string}  mode           - NEFT | RTGS | IMPS | UPI
 * @property {string}  referenceId    - Business reference ID
 * @property {string}  [failureReason] - Human-readable failure reason
 * @property {number}  createdAt      - Unix timestamp
 */

/**
 * @typedef {Object} GatewayRefundRequest
 * @property {string}  paymentId      - Original payment ID from gateway
 * @property {number}  amount         - Amount in paise
 * @property {string}  speed          - "normal" | "instant"
 * @property {Object}  [notes]        - Arbitrary metadata
 * @property {string}  idempotencyKey - Unique key to prevent duplicate refunds
 * @property {string}  [correlationId] - Traces request across system boundaries
 */

/**
 * @typedef {Object} GatewayRefundResponse
 * @property {string}  id             - Gateway refund ID (rfnd_xxxx)
 * @property {string}  status         - pending | processing | processed | failed
 * @property {number}  amount         - Amount in paise
 * @property {string}  paymentId      - Original payment ID
 * @property {number}  createdAt      - Unix timestamp
 * @property {string}  [failureReason] - Human-readable failure reason
 */
