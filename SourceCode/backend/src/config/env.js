import dotenv from 'dotenv';

// 1. Process environment variables ko memory me load karein
dotenv.config();

// 2. Un variables ki list jo bootup par mandatory hain
const REQUIRED_ENV_VARS = [
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',

    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',

    'STRIPE_SECRET_KEY',

    // 'GROQ_API_KEY',
    // 'GROQ_MODEL',

    'FRONTEND_URL',
];

// 3. Check karein ki koi mandatory variable missing toh nahi hai
const missingVars = REQUIRED_ENV_VARS.filter((varName) => !process.env[varName]);

if (missingVars.length > 0)
{
    throw new Error(
        `[FATAL CONFIGURATION ERROR] Missing mandatory environment variables: ${missingVars.join(', ')}. Please configure them in your .env file.`
    );
}

// 4. Clean, typed, aur parsed options define karein
const configuration = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000', 10),
    mongoDbUri: process.env.MONGODB_URI,
    // groqApiKey: process.env.GROQ_API_KEY,
    // groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    logLevel: process.env.LOG_LEVEL || 'info',
    frontendUrl: process.env.FRONTEND_URL,
    apiBaseUrl: process.env.API_BASE_URL,

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },

    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
    },

    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },

    razorpayx: {
        keyId: process.env.RAZORPAYX_KEY_ID,
        keySecret: process.env.RAZORPAYX_KEY_SECRET,
        accountNumber: process.env.RAZORPAYX_ACCOUNT_NUMBER || null,
        webhookSecret: process.env.RAZORPAYX_WEBHOOK_SECRET || '',
    },

    jwt: {
        accessSecret:
            process.env.JWT_ACCESS_SECRET ||
            'simulation_jeet_access_secret_token_777',

        accessExpiresIn:
            process.env.JWT_ACCESS_EXPIRES_IN ||
            '15m',

        refreshSecret:
            process.env.JWT_REFRESH_SECRET ||
            'simulation_jeet_refresh_secret_token_777',

        refreshExpiresIn:
            process.env.JWT_REFRESH_EXPIRES_IN ||
            '7d',
    },

    // Local development backend and hosted frontend CORS setup
    corsOrigins: (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin !== ''),

    // Mock gateway configuration (development/testing only)
    mockGateways: {
        payoutFailureRate: parseInt(process.env.MOCK_PAYOUT_FAILURE_RATE || '0', 10),
        refundFailureRate: parseInt(process.env.MOCK_REFUND_FAILURE_RATE || '0', 10),
        defaultPayoutProvider: process.env.DEFAULT_PAYOUT_PROVIDER || 'mock_razorpayx',
        defaultRefundProvider: process.env.DEFAULT_REFUND_PROVIDER || 'mock_razorpay',
        webhookSecret: process.env.WEBHOOK_SECRET || '',
    },
};

// 5. Object ko immutable banaein (Read-Only)
export const env = Object.freeze(configuration);