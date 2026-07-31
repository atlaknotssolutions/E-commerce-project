import mongoose from 'mongoose';

const SETTLEMENT_TYPES = ['PAYOUT', 'REFUND', 'COMMISSION', 'ADJUSTMENT'];
const SETTLEMENT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED'];

const SettlementSchema = new mongoose.Schema({
    payout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payout',
        default: null,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Settlement must belong to a seller'],
    },
    type: {
        type: String,
        enum: SETTLEMENT_TYPES,
        required: [true, 'Settlement type is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Settlement amount is required'],
        min: 0,
    },
    status: {
        type: String,
        enum: SETTLEMENT_STATUSES,
        default: 'PENDING',
    },
    gatewaySettlementId: {
        type: String,
        trim: true,
        default: null,
    },
    gatewayPayoutId: {
        type: String,
        trim: true,
        default: null,
    },
    referenceId: {
        type: String,
        trim: true,
        default: null,
    },
    utr: {
        type: String,
        trim: true,
        default: null,
    },
    bankAccount: {
        accountHolderName: { type: String, default: null },
        accountNumber: { type: String, default: null },
        ifsc: { type: String, default: null },
    },
    settledAt: {
        type: Date,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

SettlementSchema.index({ seller: 1, createdAt: -1 });
SettlementSchema.index({ payout: 1 });
SettlementSchema.index({ status: 1 });
SettlementSchema.index({ gatewaySettlementId: 1 }, { sparse: true });
SettlementSchema.index({ gatewayPayoutId: 1 }, { sparse: true });

export const Settlement = mongoose.model('Settlement', SettlementSchema);
