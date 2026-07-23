import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized Platform Branding Configuration
 *
 * Every module that displays platform information MUST import from here.
 * Never hardcode platform names in source code.
 * To rebrand: update only .env and restart the server.
 */
const branding = Object.freeze({
    appName: process.env.APP_NAME || 'AI Knots Marketplace',
    appShortName: process.env.APP_SHORT_NAME || 'AI Knots',
    companyName: process.env.APP_COMPANY_NAME || 'AI Knots IT Solutions',
    supportEmail: process.env.APP_SUPPORT_EMAIL || 'support@aiknotsit.com',
    website: process.env.APP_WEBSITE || 'https://aiknotsit.com',
    logoUrl: process.env.APP_LOGO_URL || '',
    copyright: process.env.APP_COPYRIGHT || '© AI Knots IT Solutions',
    tagline: process.env.APP_TAGLINE || '',
    supportPhone: process.env.APP_SUPPORT_PHONE || '',
    address: process.env.APP_ADDRESS || '',
    socialLinks: Object.freeze({
        facebook: process.env.APP_SOCIAL_FACEBOOK || '',
        twitter: process.env.APP_SOCIAL_TWITTER || '',
        instagram: process.env.APP_SOCIAL_INSTAGRAM || '',
        linkedin: process.env.APP_SOCIAL_LINKEDIN || '',
    }),
});

export default branding;
