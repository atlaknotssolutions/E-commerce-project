import mongoose from 'mongoose';

/**
 * Enterprise notification schema supporting multi-channel delivery,
 * template rendering, scheduling, retry logic, and soft-delete archival.
 * Backward-compatible: customer + message + readStatus + sentAt preserved.
 */
const NotificationSchema = new mongoose.Schema({
  // ── Legacy fields (backward-compatible) ──
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification alert must connect to a valid recipient customer'],
  },
  message: {
    type: String,
    required: [true, 'Notification alert message content is required'],
    trim: true,
  },
  readStatus: {
    type: Boolean,
    default: false,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
    required: true,
  },

  // ── Enterprise fields ──
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipientRole: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'GENERIC',
    trim: true,
  },
  title: {
    type: String,
    default: '',
    trim: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM',
  },
  status: {
    type: String,
    enum: ['PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING'],
    default: 'SENT',
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  template: {
    name: { type: String, default: null },
    variables: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  readAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  channelHistory: [{
    channel: { type: String },
    status: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    error: { type: String },
  }],
}, {
  timestamps: true,
});

NotificationSchema.index({ customer: 1, sentAt: -1 });
NotificationSchema.index({ customer: 1, readStatus: 1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ status: 1, scheduledAt: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ deletedAt: 1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
