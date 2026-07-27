/**
 * Centralized Platform Branding Configuration (Frontend)
 *
 * Every component that displays platform information MUST import from here.
 * Never hardcode platform names in source code.
 * To rebrand: update only .env / .env.production and rebuild.
 */
const branding = Object.freeze({
  appName: process.env.REACT_APP_NAME || 'AI Knots Marketplace',
  appShortName: process.env.REACT_APP_SHORT_NAME || '',
  companyName: process.env.REACT_APP_COMPANY_NAME || 'AI Knots IT Solutions',
  supportEmail: process.env.REACT_APP_SUPPORT_EMAIL || 'support@aiknotsit.com',
  website: process.env.REACT_APP_WEBSITE || 'https://aiknotsit.com',
  logoUrl: process.env.REACT_APP_LOGO_URL || '/Ai-kart-logo.png',
  logoUrlTransparent: '/Ai-kart-logo-removebg-preview.png',
  copyright: process.env.REACT_APP_COPYRIGHT || '© AI Knots IT Solutions',
  tagline: process.env.REACT_APP_TAGLINE || '',
  supportPhone: process.env.REACT_APP_SUPPORT_PHONE || '',
  address: process.env.REACT_APP_ADDRESS || '',
  socialLinks: Object.freeze({
    facebook: process.env.REACT_APP_SOCIAL_FACEBOOK || '',
    twitter: process.env.REACT_APP_SOCIAL_TWITTER || '',
    instagram: process.env.REACT_APP_SOCIAL_INSTAGRAM || '',
    linkedin: process.env.REACT_APP_SOCIAL_LINKEDIN || '',
  }),
});

export type BrandingConfig = typeof branding;

export default branding;
