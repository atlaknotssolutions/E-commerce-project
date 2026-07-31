import mongoose from 'mongoose';

const LEDGER_TYPES = [
    'ORDER_PLACED',
    'COMMISSION_CALCULATED',
    'SETTLEMENT_COMPLETED',
    'PAYOUT_INITIATED',
    'PAYOUT_COMPLETED',
    'REFUND_PROCESSED',
    'CANCELLATION',
    'ADJUSTMENT',
];

const LEDGER_DIRECTIONS = ['CREDIT', 'DEBIT'];

const LedgerEntrySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: [true, 'Ledger entry must reference a seller'],
    },
    type: {
        type: String,
        enum: LEDGER_TYPES,
        required: [true, 'Ledger entry type is required'],
    },
    direction: {
        type: String,
        enum: LEDGER_DIRECTIONS,
        required: [true, 'Ledger entry direction is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0,
    },
    runningBalance: {
        type: Number,
        default: 0,
    },
    referenceId: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

LedgerEntrySchema.index({ seller: 1, createdAt: -1 });
LedgerEntrySchema.index({ order: 1 });
LedgerEntrySchema.index({ type: 1 });

export const LedgerEntry = mongoose.model('LedgerEntry', LedgerEntrySchema);
