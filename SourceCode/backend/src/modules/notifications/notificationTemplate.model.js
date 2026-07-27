import mongoose from 'mongoose';

/**
 * Notification template schema for storing reusable notification templates
 * with multi-channel content variants and variable placeholders.
 */
const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    required: [true, 'Template type is required'],
    trim: true,
  },
  channelContent: {
    inApp: {
      title: { type: String, default: '' },
      body: { type: String, default: '' },
    },
    email: {
      subject: { type: String, default: '' },
      body: { type: String, default: '' },
    },
    sms: {
      body: { type: String, default: '' },
    },
    push: {
      title: { type: String, default: '' },
      body: { type: String, default: '' },
    },
  },
  variables: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

NotificationTemplateSchema.index({ name: 1 });
NotificationTemplateSchema.index({ type: 1 });
NotificationTemplateSchema.index({ isActive: 1 });

export const NotificationTemplate = mongoose.model(
  'NotificationTemplate',
  NotificationTemplateSchema
);
