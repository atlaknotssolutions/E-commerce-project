import mongoose from 'mongoose';

const AdminNotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    notificationType: {
        type: String,
        required: true,
        enum: [
            'SYSTEM',
            'PLATFORM_ANNOUNCEMENT',
            'PROMOTIONAL',
            'MAINTENANCE',
            'SECURITY',
            'ORDER',
            'RETURN',
            'COUPON',
        ],
        default: 'SYSTEM',
    },
    targetAudience: {
        type: String,
        required: true,
        enum: [
            'ALL_USERS',
            'ALL_CUSTOMERS',
            'ALL_SELLERS',
            'SPECIFIC_CUSTOMER',
            'SPECIFIC_SELLER',
            'SELECTED_CUSTOMERS',
            'SELECTED_SELLERS',
        ],
        default: 'ALL_USERS',
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    targetSellers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
    }],
    status: {
        type: String,
        required: true,
        enum: ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'DELIVERED', 'FAILED', 'ARCHIVED'],
        default: 'DRAFT',
    },
    scheduledAt: {
        type: Date,
        default: null,
    },
    publishedAt: {
        type: Date,
        default: null,
    },
    deliveredAt: {
        type: Date,
        default: null,
    },
    failedAt: {
        type: Date,
        default: null,
    },
    archivedAt: {
        type: Date,
        default: null,
    },
    deliveredCount: {
        type: Number,
        default: 0,
    },
    failedCount: {
        type: Number,
        default: 0,
    },
    readCount: {
        type: Number,
        default: 0,
    },
    errorLog: {
        type: String,
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

AdminNotificationSchema.index({ status: 1, createdAt: -1 });
AdminNotificationSchema.index({ notificationType: 1, status: 1 });
AdminNotificationSchema.index({ targetAudience: 1, status: 1 });
AdminNotificationSchema.index({ scheduledAt: 1, status: 1 });
AdminNotificationSchema.index({ title: 'text', message: 'text' });

export const AdminNotification = mongoose.model('AdminNotification', AdminNotificationSchema);
