/**
 * Centralized gateway status state machine.
 * Defines valid transitions for both payout and refund gateway statuses.
 * Both GatewayPayout and GatewayRefund reuse this single machine.
 */

const PAYOUT_TRANSITIONS = {
  pending: ['processing', 'failed'],
  processing: ['processed', 'failed', 'cancelled'],
  processed: ['reversed'],
  failed: ['processing', 'cancelled'],
  cancelled: [],
  reversed: [],
};

const REFUND_TRANSITIONS = {
  pending: ['processing', 'failed'],
  processing: ['processed', 'failed'],
  processed: [],
  failed: ['processing'],
};

/**
 * Validates whether a gateway status transition is allowed.
 * @param {string} entity    - "payout" | "refund"
 * @param {string} from      - Current gateway status
 * @param {string} to        - Target gateway status
 * @returns {boolean}        - true if transition is valid
 */
export const canTransition = (entity, from, to) => {
  const transitions = entity === 'payout' ? PAYOUT_TRANSITIONS : REFUND_TRANSITIONS;
  const allowed = transitions[from] || [];
  return allowed.includes(to);
};

/**
 * Returns all valid next states for a given entity and current status.
 * @param {string} entity    - "payout" | "refund"
 * @param {string} current   - Current gateway status
 * @returns {string[]}
 */
export const validNextStates = (entity, current) => {
  const transitions = entity === 'payout' ? PAYOUT_TRANSITIONS : REFUND_TRANSITIONS;
  return transitions[current] || [];
};
