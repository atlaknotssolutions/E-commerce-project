import { ORDER_STATUS } from './enums.js';

/**
 * Centralized Order Workflow Transition Map.
 *
 * Defines every valid forward transition in the order lifecycle.
 * All transition checks across the system MUST reference this map.
 *
 * Lifecycle:
 *   PENDING → CONFIRMED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
 *
 * Cancellation:
 *   PENDING → CANCELLED
 *   CONFIRMED → CANCELLED
 *   PACKED → CANCELLED
 *
 * Terminal states (no outbound transitions):
 *   DELIVERED
 *   CANCELLED
 */
const TRANSITION_MAP = Object.freeze({
    [ORDER_STATUS.PENDING]: Object.freeze([
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.CANCELLED,
    ]),
    [ORDER_STATUS.PLACED]: Object.freeze([
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.CANCELLED,
    ]),
    [ORDER_STATUS.CONFIRMED]: Object.freeze([
        ORDER_STATUS.PACKED,
        ORDER_STATUS.CANCELLED,
    ]),
    [ORDER_STATUS.PACKED]: Object.freeze([
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.CANCELLED,
    ]),
    [ORDER_STATUS.SHIPPED]: Object.freeze([
        ORDER_STATUS.OUT_FOR_DELIVERY,
    ]),
    [ORDER_STATUS.OUT_FOR_DELIVERY]: Object.freeze([
        ORDER_STATUS.DELIVERED,
    ]),
    [ORDER_STATUS.DELIVERED]: Object.freeze([]),
    [ORDER_STATUS.CANCELLED]: Object.freeze([]),
});

/**
 * Checks whether a status transition is valid.
 *
 * @param {string} currentStatus - The order's current status.
 * @param {string} nextStatus - The desired target status.
 * @returns {boolean} True if the transition is allowed.
 */
export const isValidTransition = (currentStatus, nextStatus) =>
{
    const allowed = TRANSITION_MAP[currentStatus];
    if (!allowed) return false;
    return allowed.includes(nextStatus);
};

/**
 * Returns the list of valid next statuses from a given current status.
 *
 * @param {string} currentStatus - The order's current status.
 * @returns {string[]} Array of allowed target statuses.
 */
export const getValidTransitions = (currentStatus) =>
{
    return TRANSITION_MAP[currentStatus] || [];
};

/**
 * Customer-allowed cancellations.
 * Customers may cancel only before the order is packed.
 */
const CUSTOMER_CANCELLABLE_STATUSES = Object.freeze([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PLACED,
    ORDER_STATUS.CONFIRMED,
]);

/**
 * Checks whether a customer is allowed to cancel an order in the given status.
 *
 * @param {string} currentStatus - The order's current status.
 * @returns {boolean} True if the customer may cancel.
 */
export const canCustomerCancel = (currentStatus) =>
{
    return CUSTOMER_CANCELLABLE_STATUSES.includes(currentStatus);
};

/**
 * Seller-allowed forward transitions.
 * Sellers advance orders through the fulfillment pipeline.
 * Sellers cannot cancel orders — only customers and admins can.
 */
const SELLER_TRANSITIONS = Object.freeze({
    [ORDER_STATUS.PENDING]: Object.freeze([ORDER_STATUS.CONFIRMED]),
    [ORDER_STATUS.PLACED]: Object.freeze([ORDER_STATUS.CONFIRMED]),
    [ORDER_STATUS.CONFIRMED]: Object.freeze([ORDER_STATUS.PACKED]),
    [ORDER_STATUS.PACKED]: Object.freeze([ORDER_STATUS.SHIPPED]),
    [ORDER_STATUS.SHIPPED]: Object.freeze([ORDER_STATUS.OUT_FOR_DELIVERY]),
    [ORDER_STATUS.OUT_FOR_DELIVERY]: Object.freeze([ORDER_STATUS.DELIVERED]),
    [ORDER_STATUS.DELIVERED]: Object.freeze([]),
    [ORDER_STATUS.CANCELLED]: Object.freeze([]),
});

/**
 * Returns the valid next statuses a seller may transition to.
 *
 * @param {string} currentStatus - The order's current status.
 * @returns {string[]} Array of allowed target statuses for a seller.
 */
export const getSellerTransitions = (currentStatus) =>
{
    return SELLER_TRANSITIONS[currentStatus] || [];
};

export default TRANSITION_MAP;
