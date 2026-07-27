/**
 * Pure function-based factory representing the GatewayEvent Persistence database interface.
 * Append-only: events are created but never updated.
 */
export const createGatewayEventRepository = ({ GatewayEvent }) => {

    /**
     * Creates a new gateway event record. Events are append-only — never updated.
     * @param {Object} eventData - Event data
     * @returns {Object} - Created event (plain object)
     */
    const log = async (eventData, options = {}) => {
        const entityRefModel = eventData.entityType === 'payout' ? 'Payout' : 'Refund';
        const dataWithRef = { ...eventData, entityRefModel };
        const [event] = await GatewayEvent.create([dataWithRef], options);
        return event ? event.toObject() : null;
    };

    /**
     * Finds the most recent event for a given entity.
     * Used to get the current gateway status without scanning full history.
     * @param {Object} params
     * @param {string} params.entityType - "payout" | "refund"
     * @param {string} params.entityId   - MongoDB ObjectId
     * @returns {Object|null} - Latest event or null
     */
    const findLatestByEntity = async ({ entityType, entityId }) => {
        return GatewayEvent.findOne({ entityType, entityId })
            .sort({ createdAt: -1 })
            .lean();
    };

    /**
     * Finds all events for a given entity, sorted chronologically.
     * Returns the full audit trail / timeline.
     * @param {Object} params
     * @param {string} params.entityType - "payout" | "refund"
     * @param {string} params.entityId   - MongoDB ObjectId
     * @returns {Object[]} - Events sorted oldest first (timeline order)
     */
    const findTimelineByEntity = async ({ entityType, entityId }) => {
        return GatewayEvent.find({ entityType, entityId })
            .sort({ createdAt: 1 })
            .lean();
    };

    /**
     * Finds an event by its gateway-assigned ID (pout_xxxx, rfnd_xxxx).
     * @param {string} gatewayId - Gateway-assigned unique ID
     * @returns {Object|null}
     */
    const findByGatewayId = async (gatewayId) => {
        return GatewayEvent.findOne({ gatewayId }).lean();
    };

    /**
     * Finds events by idempotency key. Used for duplicate detection.
     * @param {string} idempotencyKey
     * @returns {Object|null}
     */
    const findByIdempotencyKey = async (idempotencyKey) => {
        return GatewayEvent.findOne({ idempotencyKey }).lean();
    };

    /**
     * Finds events by correlation ID. Used for cross-boundary tracing.
     * @param {string} correlationId
     * @returns {Object[]}
     */
    const findByCorrelationId = async (correlationId) => {
        return GatewayEvent.find({ correlationId })
            .sort({ createdAt: 1 })
            .lean();
    };

    /**
     * Returns paginated events with optional filters.
     * Used by the admin gateway dashboard.
     */
    const findAll = async ({ page = 1, limit = 20, gateway, entityType, gatewayStatus, startDate, endDate } = {}) => {
        const filter = {};
        if (gateway) filter.gateway = gateway;
        if (entityType) filter.entityType = entityType;
        if (gatewayStatus) filter.gatewayStatus = gatewayStatus;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            GatewayEvent.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            GatewayEvent.countDocuments(filter),
        ]);

        return {
            events,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    };

    /**
     * Returns aggregate statistics for the gateway dashboard.
     * Groups by entityType and gatewayStatus, sums amounts from request payloads.
     */
    const getAggregateStats = async ({ gateway, entityType } = {}) => {
        const match = {};
        if (gateway) match.gateway = gateway;
        if (entityType) match.entityType = entityType;

        const stats = await GatewayEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        entityType: '$entityType',
                        gatewayStatus: '$gatewayStatus',
                    },
                    count: { $sum: 1 },
                    latestEvent: { $max: '$createdAt' },
                },
            },
        ]);

        return stats;
    };

    /**
     * Returns health metrics: success rate, failure rate, avg latency.
     */
    const getHealthMetrics = async ({ gateway, entityType, since } = {}) => {
        const match = {};
        if (gateway) match.gateway = gateway;
        if (entityType) match.entityType = entityType;
        if (since) match.createdAt = { $gte: new Date(since) };

        const metrics = await GatewayEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$gatewayStatus',
                    count: { $sum: 1 },
                    avgLatency: { $avg: '$latency' },
                },
            },
        ]);

        return metrics;
    };

    /**
     * Counts events grouped by entityType and status for today.
     */
    const getTodayStats = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await GatewayEvent.aggregate([
            { $match: { createdAt: { $gte: today } } },
            {
                $group: {
                    _id: {
                        entityType: '$entityType',
                        gatewayStatus: '$gatewayStatus',
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        return stats;
    };

    /**
     * Counts all events.
     */
    const countAll = async () => {
        return GatewayEvent.countDocuments();
    };

    /**
     * Returns the most recent event across all types.
     */
    const findLatest = async () => {
        return GatewayEvent.findOne().sort({ createdAt: -1 }).lean();
    };

    /**
     * Counts events for a specific entity.
     */
    const countByEntity = async ({ entityType, entityId }) => {
        return GatewayEvent.countDocuments({ entityType, entityId });
    };

    /**
     * Returns the correlation ID from the earliest event for an entity.
     */
    const findCorrelationIdByEntity = async ({ entityType, entityId }) => {
        const earliest = await GatewayEvent.findOne({ entityType, entityId })
            .sort({ createdAt: 1 })
            .select('correlationId')
            .lean();
        return earliest?.correlationId || null;
    };

    return Object.freeze({
        log,
        findLatestByEntity,
        findTimelineByEntity,
        findByGatewayId,
        findByIdempotencyKey,
        findByCorrelationId,
        findAll,
        getAggregateStats,
        getHealthMetrics,
        getTodayStats,
        countAll,
        findLatest,
        countByEntity,
        findCorrelationIdByEntity,
    });
};
