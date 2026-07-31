/**
 * Segment rule definitions for customer segmentation.
 *
 * Each rule specifies:
 *   name        — unique segment identifier (used in coupons as targetType: `SEGMENT_<name>`)
 *   label       — human-readable display name
 *   criteria    — conditions evaluated against CustomerMetric fields
 *   priority    — higher priority wins when a user matches multiple segments
 *   isActive    — whether the rule is currently in use
 *
 * Criteria use MongoDB query syntax against the CustomerMetric document fields:
 *   totalOrders, lifetimeSpend, averageOrderValue, lastOrderDate, daysSinceLastOrder
 *
 * All thresholds are configurable here — never hardcoded in business logic.
 */

export const SEGMENT_RULES = Object.freeze([
    {
        name: 'NEW_CUSTOMER',
        label: 'New Customer',
        criteria: { totalOrders: 0 },
        priority: 10,
        isActive: true,
    },
    {
        name: 'RETURNING_CUSTOMER',
        label: 'Returning Customer',
        criteria: { totalOrders: { $gte: 1 } },
        priority: 20,
        isActive: true,
    },
    {
        name: 'REGULAR_CUSTOMER',
        label: 'Regular Customer',
        criteria: { totalOrders: { $gte: 5 } },
        priority: 30,
        isActive: true,
    },
    {
        name: 'FREQUENT_BUYER',
        label: 'Frequent Buyer',
        criteria: { totalOrders: { $gte: 10 } },
        priority: 40,
        isActive: true,
    },
    {
        name: 'HIGH_SPENDER',
        label: 'High Spender',
        criteria: { averageOrderValue: { $gte: 5000 } },
        priority: 50,
        isActive: true,
    },
    {
        name: 'VIP_CUSTOMER',
        label: 'VIP Customer',
        criteria: { lifetimeSpend: { $gte: 50000 } },
        priority: 60,
        isActive: true,
    },
    {
        name: 'TOP_CUSTOMER',
        label: 'Top Customer',
        criteria: { isTopPercentile: true },
        priority: 70,
        isActive: true,
    },
    {
        name: 'INACTIVE_CUSTOMER',
        label: 'Inactive Customer',
        criteria: { daysSinceLastOrder: { $gte: 180 } },
        priority: 5,
        isActive: true,
    },
]);
