import mongoose from 'mongoose';

const CookieConsentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    anonymousId: {
        type: String,
        default: null,
        index: true,
    },
    ipAddress: {
        type: String,
        default: null,
    },
    userAgent: {
        type: String,
        default: null,
    },
    browser: {
        type: String,
        default: null,
    },
    os: {
        type: String,
        default: null,
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
    },
    country: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    language: {
        type: String,
        default: null,
    },
    timezone: {
        type: String,
        default: null,
    },
    consentVersion: {
        type: String,
        default: '1.0',
    },
    policyVersion: {
        type: String,
        default: '1.0',
    },
    necessaryCookies: {
        type: Boolean,
        default: true,
    },
    analyticsAccepted: {
        type: Boolean,
        default: false,
    },
    marketingAccepted: {
        type: Boolean,
        default: false,
    },
    preferencesAccepted: {
        type: Boolean,
        default: false,
    },
    acceptedAt: {
        type: Date,
        default: Date.now,
    },
    sourcePage: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

CookieConsentSchema.index({ userId: 1, anonymousId: 1 });
CookieConsentSchema.index({ createdAt: -1 });

export const CookieConsent = mongoose.model('CookieConsent', CookieConsentSchema);
