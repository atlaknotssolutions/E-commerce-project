import mongoose from 'mongoose';
import { GATEWAY, GATEWAY_EVENT_TYPE } from '../../constants/enums.js';

/**
 * GatewayEvent schema — append-only audit log for all gateway interactions.
 *
 * Every gateway call, webhook, retry, and status change creates a NEW event document.
 * Events are NEVER updated — this guarantees a complete, immutable audit trail.
 *
 * The Payout and Refund models store a gatewayEventId reference pointing to the
 * most recent event. The full history lives here.
 */
const GatewayEventSchema = new mongoose.Schema({
    gateway: {
        type: String,
        enum: Object.values(GATEWAY),
        required: [true, 'Gateway provider is required'],
    },
    eventType: {
        type: String,
        enum: Object.values(GATEWAY_EVENT_TYPE),
        required: [true, 'Event type is required'],
    },
    entityType: {
        type: String,
        required: [true, 'Entity type is required'],
        enum: ['payout', 'refund'],
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Entity ID is required'],
        refPath: 'entityRefModel',
    },
    entityRefModel: {
        type: String,
        required: true,
        enum: ['Payout', 'Refund'],
    },
    gatewayId: {
        type: String,
        trim: true,
        default: null,
    },
    gatewayStatus: {
        type: String,
        default: null,
    },
    idempotencyKey: {
        type: String,
        trim: true,
        default: null,
    },
    correlationId: {
        type: String,
        trim: true,
        default: null,
    },
    request: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    webhookPayload: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    latency: {
        type: Number,
        default: null,
    },
    attemptCount: {
        type: Number,
        default: 1,
    },
    lastAttemptAt: {
        type: Date,
        default: null,
    },
    nextRetryAt: {
        type: Date,
        default: null,
    },
    processedAt: {
        type: Date,
        default: null,
    },
    failureReason: {
        type: String,
        default: null,
    },
    failureCode: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

// Indexes for efficient queries
GatewayEventSchema.index({ entityType: 1, entityId: 1 });
GatewayEventSchema.index({ gatewayId: 1 });
GatewayEventSchema.index({ gateway: 1, entityType: 1, gatewayStatus: 1 });
GatewayEventSchema.index({ idempotencyKey: 1 }, { sparse: true });
GatewayEventSchema.index({ correlationId: 1 }, { sparse: true });
GatewayEventSchema.index({ createdAt: -1 });

// =============================================================================
// EVENT RETENTION STRATEGY
// =============================================================================
// GatewayEvent is an append-only audit log. It grows unboundedly.
//
// RETENTION PROJECTIONS:
//   100 payouts/day  →  ~3-5 events each  →  ~150K events/year
//   1K payouts/day   →  ~1.5M events/year
//   10K payouts/day  →  ~15M events/year
//   100K payouts/day →  ~150M events/year (requires partitioning)
//
// RECOMMENDED RETENTION TIERS:
//   - Active (0-90 days):   Full event data, all indexes active
//   - Archive (90-365 days): Move to separate collection or cold storage
//   - Purge (>365 days):    Delete archived events (regulatory minimum: keep 7 years for financial)
//
// TODO: Implement TTL index when event volume exceeds 10M documents:
//   GatewayEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year
//
// TODO: Implement archive process (Phase 14+):
//   1. Cron job runs daily
//   2. Queries events older than 90 days
//   3. Bulk-inserts into GatewayEventArchive collection
//   4. Deletes originals from GatewayEvent
//   5. Archive collection uses smaller indexes (no idempotencyKey, no correlationId)
//
// INDEXES REQUIRING TTL REVIEW:
//   - { createdAt: -1 } — candidate for TTL when archive process is live
//   - { idempotencyKey: 1 } (sparse) — can be dropped after 30 days
//     (idempotency window is typically 24-48 hours)
//   - { correlationId: 1 } (sparse) — can be dropped after 90 days
//     (correlation tracing window is typically 30 days)
//
// CURRENT INDEXES MUST REMAIN UNCHANGED until archive process is implemented.
// =============================================================================

export const GatewayEvent = mongoose.model('GatewayEvent', GatewayEventSchema);
