import mongoose from 'mongoose';

/**
 * Notification preference schema for storing per-user channel opt-in/out
 * and quiet-hours configuration.
 */
const NotificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true,
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '07:00' },
    timezone: { type: String, default: 'UTC' },
  },
  mutedTypes: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

export const NotificationPreference = mongoose.model(
  'NotificationPreference',
  NotificationPreferenceSchema
);
