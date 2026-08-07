import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from "morgan";


// Core Utilities & Middlewares
import { createErrorHandlerMiddleware } from './middlewares/errorHandler.js';
import { createAuthenticateMiddleware } from './middlewares/authenticate.js';
import { createAuthorizeRolesMiddleware } from './middlewares/authorizeRoles.js';
import { createApiError } from './utils/apiError.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { generateOTP } from './utils/otp.js';
import { signToken, verifyToken } from './utils/jwt.js';
import branding from './config/branding.js';
import { upload } from './middlewares/upload.js';

// Mongoose Models
import { User } from './modules/users/user.model.js';
import { Seller } from './modules/sellers/seller.model.js';
import { Cart } from './modules/cart/cart.model.js';
import { VerificationCode } from './modules/auth/verificationCode.model.js';
import { Category } from './modules/categories/category.model.js';
import { Product } from './modules/products/product.model.js';
import { Wishlist } from './modules/wishlist/wishlist.model.js';
import { Coupon } from './modules/coupons/coupon.model.js';
import { Order } from './modules/orders/order.model.js';
import { PaymentOrder } from './modules/payments/paymentOrder.model.js';
import { Transaction } from './modules/transactions/transaction.model.js';
import { SellerReport } from './modules/reports/sellerReport.model.js';
import { Review } from './modules/reviews/review.model.js';
import { Notification } from './modules/notifications/notification.model.js';
import { NotificationTemplate } from './modules/notifications/notificationTemplate.model.js';
import { NotificationPreference } from './modules/notifications/notificationPreference.model.js';
import { PasswordResetToken } from './modules/auth/passwordResetToken.model.js';
import { RefreshToken } from './modules/auth/refreshToken.model.js';
import { Deal } from './modules/deals/deal.model.js';
import { HomeCategory } from './modules/home/homeCategory.model.js';
import { CategoryRequest } from './modules/categoryRequests/categoryRequest.model.js';
import { ReturnRequest } from './modules/returns/returnRequest.model.js';
import { Refund } from './modules/payments/refund.model.js';
import { AdminNotification } from './modules/adminNotifications/adminNotification.model.js';
import { SystemSettings } from './modules/systemSettings/systemSettings.model.js';
import { Commission } from './modules/commissions/commission.model.js';
import { Payout } from './modules/payouts/payout.model.js';
import { GatewayEvent } from './modules/gateway/gatewayEvent.model.js';
import { Brand } from './modules/brands/brand.model.js';
import { BrandRequest } from './modules/brandRequests/brandRequest.model.js';
import { CookieConsent } from './modules/cookieConsent/cookieConsent.model.js';
import { CouponAssignment } from './modules/couponDistribution/couponAssignment.model.js';
import { Settlement } from './modules/settlements/settlement.model.js';
import { LedgerEntry } from './modules/settlementEngine/ledger.model.js';

// Persistence Repositories Factories
import { createUserRepository } from './modules/users/user.repository.js';
import { createSellerRepository } from './modules/sellers/seller.repository.js';
import { createCartRepository } from './modules/cart/cart.repository.js';
import { createVerificationCodeRepository } from './modules/auth/verificationCode.repository.js';
import { createCategoryRepository } from './modules/categories/category.repository.js';
import { createProductRepository } from './modules/products/product.repository.js';
import { createWishlistRepository } from './modules/wishlist/wishlist.repository.js';
import { createCouponRepository } from './modules/coupons/coupon.repository.js';
import { createOrderRepository } from './modules/orders/order.repository.js';
import { createPaymentOrderRepository } from './modules/payments/paymentOrder.repository.js';
import { createTransactionRepository } from './modules/transactions/transaction.repository.js';
import { createSellerReportRepository } from './modules/reports/sellerReport.repository.js';
import { createReviewRepository } from './modules/reviews/review.repository.js';
import { createNotificationRepository } from './modules/notifications/notification.repository.js';
import { createNotificationTemplateRepository } from './modules/notifications/notificationTemplate.repository.js';
import { createNotificationPreferenceRepository } from './modules/notifications/notificationPreference.repository.js';
import { createPasswordResetTokenRepository } from './modules/auth/passwordResetToken.repository.js';
import { createRefreshTokenRepository } from './modules/auth/refreshToken.repository.js';
import { createDealRepository } from './modules/deals/deal.repository.js';
import { createHomeCategoryRepository } from './modules/home/homeCategory.repository.js';
import { createCategoryRequestRepository } from './modules/categoryRequests/categoryRequest.repository.js';
import { createReturnRequestRepository } from './modules/returns/returnRequest.repository.js';
import { createRefundRepository } from './modules/payments/refund.repository.js';
import { createSellerDashboardRepository } from './modules/sellerDashboard/sellerDashboard.repository.js';
import { createAdminDashboardRepository } from './modules/adminDashboard/adminDashboard.repository.js';
import { createAdminUserRepository } from './modules/adminUser/adminUser.repository.js';
import { createSellerVerificationRepository } from './modules/sellerVerification/sellerVerification.repository.js';
import { createProductModerationRepository } from './modules/productModeration/productModeration.repository.js';
import { createAdminOrderService } from './modules/adminOrder/adminOrder.service.js';
import { createAdminOrderController } from './modules/adminOrder/adminOrder.controller.js';
import { createAdminOrderRoutes } from './modules/adminOrder/adminOrder.routes.js';
import { createAdminCouponService } from './modules/adminCoupon/adminCoupon.service.js';
import { createAdminCouponController } from './modules/adminCoupon/adminCoupon.controller.js';
import { createAdminCouponRoutes } from './modules/adminCoupon/adminCoupon.routes.js';
import { CustomerMetric } from './modules/customerSegmentation/customerMetric.model.js';
import { createCustomerMetricRepository } from './modules/customerSegmentation/customerMetric.repository.js';
import { createCustomerSegmentService } from './modules/customerSegmentation/customerSegment.service.js';
import { createCustomerSegmentController } from './modules/customerSegmentation/customerSegment.controller.js';
import { createCustomerSegmentRoutes } from './modules/customerSegmentation/customerSegment.routes.js';
import { SellerMetric } from './modules/sellerSegmentation/sellerMetric.model.js';
import { createSellerMetricRepository } from './modules/sellerSegmentation/sellerMetric.repository.js';
import { createSellerSegmentService } from './modules/sellerSegmentation/sellerSegment.service.js';
import { createSellerSegmentController } from './modules/sellerSegmentation/sellerSegment.controller.js';
import { createSellerSegmentRoutes } from './modules/sellerSegmentation/sellerSegment.routes.js';
import { createAdminReportsRepository } from './modules/adminReports/adminReports.repository.js';
import { createAdminReportsService } from './modules/adminReports/adminReports.service.js';
import { createAdminReportsController } from './modules/adminReports/adminReports.controller.js';
import { createAdminReportsRoutes } from './modules/adminReports/adminReports.routes.js';
import { createAdminNotificationRepository } from './modules/adminNotifications/adminNotification.repository.js';
import { createAdminNotificationService } from './modules/adminNotifications/adminNotification.service.js';
import { createAdminNotificationController } from './modules/adminNotifications/adminNotification.controller.js';
import { createAdminNotificationRoutes } from './modules/adminNotifications/adminNotification.routes.js';
import { createSystemSettingsRepository } from './modules/systemSettings/systemSettings.repository.js';
import { mapSystemSettings } from './modules/systemSettings/systemSettings.mapper.js';
import { createSystemSettingsService } from './modules/systemSettings/systemSettings.service.js';
import { createSystemSettingsController } from './modules/systemSettings/systemSettings.controller.js';
import { createSystemSettingsRoutes } from './modules/systemSettings/systemSettings.routes.js';
import { createCommissionRepository } from './modules/commissions/commission.repository.js';
import { createPayoutRepository } from './modules/payouts/payout.repository.js';
import { createGatewayEventRepository } from './modules/gateway/gatewayEvent.repository.js';
import { createBrandRepository } from './modules/brands/brand.repository.js';
import { createBrandRequestRepository } from './modules/brandRequests/brandRequest.repository.js';
import { createCookieConsentRepository } from './modules/cookieConsent/cookieConsent.repository.js';
import { createCouponAssignmentRepository } from './modules/couponDistribution/couponAssignment.repository.js';
import { createSettlementRepository } from './modules/settlements/settlement.repository.js';
import { createLedgerRepository } from './modules/settlementEngine/ledger.repository.js';
import { mapCommission, mapCommissions } from './modules/commissions/commission.mapper.js';
import { mapPayout, mapPayouts } from './modules/payouts/payout.mapper.js';
import { mapSettlement, mapSettlements } from './modules/settlements/settlement.mapper.js';
import { mapBrand, mapBrands } from './modules/brands/brand.mapper.js';
import { mapBrandRequest, mapBrandRequests } from './modules/brandRequests/brandRequest.mapper.js';
import { createCommissionService } from './modules/commissions/commission.service.js';
import { createCommissionController } from './modules/commissions/commission.controller.js';
import { createCommissionRoutes } from './modules/commissions/commission.routes.js';
import { createPayoutService } from './modules/payouts/payout.service.js';
import { createPayoutController } from './modules/payouts/payout.controller.js';
import { createPayoutRoutes } from './modules/payouts/payout.routes.js';
import { createSettlementService } from './modules/settlements/settlement.service.js';
import { createSettlementController } from './modules/settlements/settlement.controller.js';
import { createSettlementRoutes } from './modules/settlements/settlement.routes.js';
import { createSettlementEngineService } from './modules/settlementEngine/settlementEngine.service.js';
import { createSettlementEngineController } from './modules/settlementEngine/settlementEngine.controller.js';
import { createSettlementEngineRoutes } from './modules/settlementEngine/settlementEngine.routes.js';
import { createSellerCouponService } from './modules/sellerCoupon/sellerCoupon.service.js';
import { createSellerCouponController } from './modules/sellerCoupon/sellerCoupon.controller.js';
import { createSellerCouponRoutes } from './modules/sellerCoupon/sellerCoupon.routes.js';
import { createGatewayService } from './modules/gateway/gateway.service.js';
import { createGatewayController } from './modules/gateway/gateway.controller.js';
import { createGatewayRoutes } from './modules/gateway/gateway.routes.js';
import { createRazorpayXMockGateway } from './integrations/payment/gateways/razorpayx.mock.gateway.js';
import { createRazorpayMockGateway } from './integrations/payment/gateways/razorpay.mock.gateway.js';
import { createRazorpayXGateway } from './integrations/razorpayx/razorpayx.client.js';
import { createPaymentGatewayFactory } from './integrations/payment/paymentGatewayFactory.js';
import * as gatewayUtils from './integrations/payment/gatewayUtils.js';
import { seedHomeCategories } from "./database/seedHomeCategories.js"; // ---- seed  home data
import { createInventoryHelper } from './modules/orders/orderInventoryHelper.js';

// Coupon Distribution Engine
import { createCouponDistributionRulesService } from './modules/couponDistribution/couponDistributionRules.service.js';
import { createCouponDistributionEngine } from './modules/couponDistribution/CouponDistributionEngine.js';
import { createCouponDistributionController } from './modules/couponDistribution/couponDistribution.controller.js';
import { createCouponDistributionRoutes } from './modules/couponDistribution/couponDistribution.routes.js';

// Referral System
import { createReferralService } from './modules/referrals/referral.service.js';
import { createReferralController } from './modules/referrals/referral.controller.js';
import { createReferralRoutes } from './modules/referrals/referral.routes.js';

// Configuration Service
import { createConfigurationService } from './services/configuration.service.js';

// Invoice System
import { createInvoiceService } from './modules/invoice/invoice.service.js';
import { createInvoiceController } from './modules/invoice/invoice.controller.js';
import { createInvoiceRoutes } from './modules/invoice/invoice.routes.js';

// Scheduler Service
import { createSchedulerService } from './services/scheduler.service.js';

// Integration Adapters Factories
import { createEmailClient } from './integrations/email/nodemailer.client.js';
import { createCloudinaryClient } from './integrations/cloudinary/cloudinary.client.js';

import razorpayClient from "./integrations/payment/razorpay.client.js";
import stripeClient from "./integrations/payment/stripe.client.js";

// Business Services Factories
import { createAuthService } from './modules/auth/auth.service.js';
import { createSellerAuthService } from './modules/auth/sellerAuth.service.js';
import { createCategoryService } from './modules/categories/category.service.js';
import { createProductService } from './modules/products/product.service.js';
import { createCartService } from './modules/cart/cart.service.js';
import { createWishlistService } from './modules/wishlist/wishlist.service.js';
import { createCouponService } from './modules/coupons/coupon.service.js';
import { createOrderService } from './modules/orders/order.service.js';
import { createPaymentService } from './modules/payments/payment.service.js';
import { createRevenueService } from './modules/reports/revenue.service.js';
import { createSellerService } from './modules/sellers/seller.service.js';
import { createReviewService } from './modules/reviews/review.service.js';
import { createNotificationService } from './modules/notifications/notification.service.js';
import { createUserService } from './modules/users/user.service.js';
import { createAiService } from './modules/ai/ai.service.js';
import { createDealService } from './modules/deals/deal.service.js';
import { createTransactionService } from './modules/transactions/transaction.service.js';
import { createHomeService } from './modules/home/home.service.js';
import { createHomeCategoryService } from './modules/home/homeCategory.service.js';
import { createAdminService } from './modules/admin/admin.service.js';
import { createCategoryRequestService } from './modules/categoryRequests/categoryRequest.service.js';
import { createReturnService } from './modules/returns/return.service.js';
import { createSellerDashboardService } from './modules/sellerDashboard/sellerDashboard.service.js';
import { createAdminDashboardService } from './modules/adminDashboard/adminDashboard.service.js';
import { createAdminUserService } from './modules/adminUser/adminUser.service.js';
import { createSellerVerificationService } from './modules/sellerVerification/sellerVerification.service.js';
import { createProductModerationService } from './modules/productModeration/productModeration.service.js';
import { createBrandService } from './modules/brands/brand.service.js';
import { createBrandRequestService } from './modules/brandRequests/brandRequest.service.js';
import { createCookieConsentService } from './modules/cookieConsent/cookieConsent.service.js';

// HTTP Controllers Factories
import { createAuthController } from './modules/auth/auth.controller.js';
import { createSellerAuthController } from './modules/auth/sellerAuth.controller.js';
import { createProductController } from './modules/products/product.controller.js';
import { createCartController } from './modules/cart/cart.controller.js';
import { createWishlistController } from './modules/wishlist/wishlist.controller.js';
import { createCouponController } from './modules/coupons/coupon.controller.js';
import { createOrderController } from './modules/orders/order.controller.js';
import { createSellerOrderController } from './modules/orders/sellerOrder.controller.js';
import { createPaymentController } from './modules/payments/payment.controller.js';
import { createRevenueController } from './modules/reports/revenue.controller.js';
// import { createAdminController } from './modules/admin/admin.controller.js';
import { createAdminController } from './modules/admin/admin.controller.js';
import { createSellerController } from './modules/sellers/seller.controller.js';
import { createReviewController } from './modules/reviews/review.controller.js';
import { createNotificationController } from './modules/notifications/notification.controller.js';
import { createAiController } from './modules/ai/ai.controller.js';
import { createDealController } from './modules/deals/deal.controller.js';
import { createTransactionController } from './modules/transactions/transaction.controller.js';
import { createHomeController } from './modules/home/home.controller.js';
import { createHomeCategoryController } from './modules/home/homeCategory.controller.js';
import { createUploadController } from './modules/uploads/upload.controller.js';
import { createUserController } from './modules/users/user.controller.js';
import { createCategoryController } from "./modules/categories/category.controller.js";
import { createCategoryRequestController } from './modules/categoryRequests/categoryRequest.controller.js';
import { createReturnController } from './modules/returns/return.controller.js';
import { createSellerDashboardController } from './modules/sellerDashboard/sellerDashboard.controller.js';
import { createAdminDashboardController } from './modules/adminDashboard/adminDashboard.controller.js';
import { createAdminUserController } from './modules/adminUser/adminUserController.js';
import { createSellerVerificationController } from './modules/sellerVerification/sellerVerification.controller.js';
import { createProductModerationController } from './modules/productModeration/productModeration.controller.js';
import { createBrandController } from './modules/brands/brand.controller.js';
import { createBrandRequestController } from './modules/brandRequests/brandRequest.controller.js';
import { createCookieConsentController } from './modules/cookieConsent/cookieConsent.controller.js';

// Routing Gateway Compilers
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import { createProductRoutes } from './modules/products/product.routes.js';
import { createCartRoutes } from './modules/cart/cart.routes.js';
import { createWishlistRoutes } from './modules/wishlist/wishlist.routes.js';
import { createCouponRoutes } from './modules/coupons/coupon.routes.js';
import { createOrderRoutes } from './modules/orders/order.routes.js';
import { createSellerOrderRoutes } from './modules/orders/sellerOrder.routes.js';
import { createPaymentRoutes } from './modules/payments/payment.routes.js';
import { createRevenueRoutes } from './modules/reports/revenue.routes.js';
import { createAdminRoutes } from './modules/admin/admin.routes.js';
import { createSellerRoutes } from './modules/sellers/seller.routes.js';
import { createReviewRoutes } from './modules/reviews/review.routes.js';
import { createNotificationRoutes } from './modules/notifications/notification.routes.js';
import { createAiRoutes } from './modules/ai/ai.routes.js';
import { createDealRoutes } from './modules/deals/deal.routes.js';
import { createTransactionRoutes } from './modules/transactions/transaction.routes.js';
import { createHomeRoutes } from './modules/home/home.routes.js';
import { createUploadRoutes } from './modules/uploads/upload.routes.js';
import { createUserRoutes } from './modules/users/user.routes.js';
import { createCategoryRoutes } from "./modules/categories/category.routes.js";
import { createCategoryRequestRoutes } from './modules/categoryRequests/categoryRequest.routes.js';
import { createReturnRoutes } from './modules/returns/return.routes.js';
import { createSellerDashboardRoutes } from './modules/sellerDashboard/sellerDashboard.routes.js';
import { createAdminDashboardRoutes } from './modules/adminDashboard/adminDashboard.routes.js';
import { createAdminUserRoutes } from './modules/adminUser/adminUser.routes.js';
import { createSellerVerificationRoutes } from './modules/sellerVerification/sellerVerification.routes.js';
import { createProductModerationRoutes } from './modules/productModeration/productModeration.routes.js';
import { createBrandRoutes } from './modules/brands/brand.routes.js';
import { createBrandRequestRoutes } from './modules/brandRequests/brandRequest.routes.js';
import { createCookieConsentRoutes } from './modules/cookieConsent/cookieConsent.routes.js';


// mapper import 

import { mapProduct, mapProducts } from "./utils/mappers/product.mapper.js";
import { mapOrder, mapOrders, mapOrderItem } from "./utils/mappers/order.mapper.js";
import { mapUser } from "./utils/mappers/user.mapper.js";
import { transactionMapper } from "./utils/mappers/transaction.mapper.js";
import { mapReturn, mapReturns } from "./utils/mappers/return.mapper.js";
import { mapReview, mapReviews } from "./utils/mappers/review.mapper.js";
import { mapSellerDashboardSummary, mapRevenueAnalytics, mapProductAnalytics, mapOrderAnalytics, mapCustomerAnalytics, mapReturnRefundAnalytics } from "./utils/mappers/sellerDashboard.mapper.js";
import { mapSellerNotification, mapSellerNotifications, mapRecentActivity, mapRecentActivities } from "./utils/mappers/notification.mapper.js";
import { mapNotification, mapNotifications, mapNotificationListResponse, mapNotificationWithHistory } from "./modules/notifications/notification.mapper.js";
import { createInAppProvider } from './modules/notifications/providers/inApp.provider.js';
import { createEmailProvider } from './modules/notifications/providers/email.provider.js';
import { createSmsProvider } from './modules/notifications/providers/sms.provider.js';
import { createPushProvider } from './modules/notifications/providers/push.provider.js';
import { createNotificationChannelFactory } from './modules/notifications/providers/notificationChannelFactory.js';
import { createTemplateRenderer } from './modules/notifications/templateRenderer.js';
import { createNotificationDispatcher } from './modules/notifications/notificationDispatcher.js';

/**
 * Functional dependency-injection based Express App Creator.
 * Acts as the master compilation assembler of the entire backend system.
 */
export const createApp = async ({ env, dbManager }) =>
{
    const app = express();

    // 1. Core Global Security Middlewares
    app.use(helmet());
    app.use(
        cors({
            origin: [
                "https://e-commerce-project-iota-ten.vercel.app",
                "http://localhost:3000",
            ],
            credentials: true,
        })
    );

    // 2. Dynamic Performance and Parsers Utilities
    app.use(compression());
    app.use(morgan("dev"));
    app.use(express.json()); // Network JSON bodies parsing wrapper
    app.use(express.urlencoded({ extended: true })); // Standard forms content wrapper
    app.use(cookieParser());

    // 3. System Credentials secrets config settings
    const jwtAccessSecret = env.jwt.accessSecret;
    const jwtAccessExpiresIn = env.jwt.accessExpiresIn;

    // Session refresh token configurations parameters
    const jwtRefreshSecret = env.jwt.refreshSecret;
    const jwtRefreshExpiresIn = env.jwt.refreshExpiresIn;

    // console.log("Cloud Name:", env.cloudinary.cloudName);
    // =========================================================================
    // SECURITY MIDDLEWARES INSTANTIATIONS
    // =========================================================================

    const authenticate = createAuthenticateMiddleware({
        verifyToken,
        jwtAccessSecret,
        createApiError
    });

    const authorizeRoles = createAuthorizeRolesMiddleware({
        createApiError
    });


    // =========================================================================
    // DEPENDENCY INJECTION & INTEGRATIONS ASSEMBLY
    // =========================================================================

    // A. Instantiate Repositories
    const userRepository = createUserRepository({ User });
    const sellerRepository = createSellerRepository({ Seller });
    const cartRepository = createCartRepository({ Cart });
    const verificationCodeRepository = createVerificationCodeRepository({ VerificationCode });
    const categoryRepository = createCategoryRepository({ Category });
    const productRepository = createProductRepository({ Product });
    const wishlistRepository = createWishlistRepository({ Wishlist });
    const couponRepository = createCouponRepository({ Coupon });
    const orderRepository = createOrderRepository({ Order });
    const paymentOrderRepository = createPaymentOrderRepository({ PaymentOrder });
    const transactionRepository = createTransactionRepository({ Transaction });
    const sellerReportRepository = createSellerReportRepository({ SellerReport });
    const reviewRepository = createReviewRepository({ Review });
    const notificationRepository = createNotificationRepository({ Notification, Order, PaymentOrder, ReturnRequest, Product });
    const notificationTemplateRepository = createNotificationTemplateRepository({ NotificationTemplate });
    const notificationPreferenceRepository = createNotificationPreferenceRepository({ NotificationPreference });
    const passwordResetTokenRepository = createPasswordResetTokenRepository({ PasswordResetToken });
    const refreshTokenRepository = createRefreshTokenRepository({ RefreshToken });
    const dealRepository = createDealRepository({ Deal });
    const homeCategoryRepository = createHomeCategoryRepository({ HomeCategory });
    const categoryRequestRepository = createCategoryRequestRepository({ CategoryRequest });
    const returnRequestRepository = createReturnRequestRepository({ ReturnRequest, User, Seller });
    const refundRepository = createRefundRepository({ Refund });
    const sellerDashboardRepository = createSellerDashboardRepository({ Order, Product, ReturnRequest, Review, Notification, User, PaymentOrder, Refund });
    const adminDashboardRepository = createAdminDashboardRepository({ User, Seller, Product, Order, Review });
    const adminUserRepository = createAdminUserRepository({ User, Seller });
    const sellerVerificationRepository = createSellerVerificationRepository({ Seller });
    const productModerationRepository = createProductModerationRepository({ Product, Seller });

    const brandRepository = createBrandRepository({ Brand, Product });
    const brandRequestRepository = createBrandRequestRepository({ BrandRequest });

    const cookieConsentRepository = createCookieConsentRepository({ CookieConsent });

    const couponAssignmentRepository = createCouponAssignmentRepository({ CouponAssignment });

    const adminReportsRepository = createAdminReportsRepository({
        Order, Product, User, Seller, PaymentOrder, ReturnRequest, Refund, Coupon,
    });

    const adminNotificationRepository = createAdminNotificationRepository({
        AdminNotification, User, Seller,
    });

    const systemSettingsRepository = createSystemSettingsRepository({
        SystemSettings,
    });

    const configurationService = createConfigurationService({
        systemSettingsRepository,
    });

    const commissionRepository = createCommissionRepository({
        Commission,
    });

    const payoutRepository = createPayoutRepository({
        Payout,
    });

    const gatewayEventRepository = createGatewayEventRepository({
        GatewayEvent,
    });

    const settlementRepository = createSettlementRepository({
        Settlement,
    });

    const ledgerRepository = createLedgerRepository({
        LedgerEntry,
    });

    await seedHomeCategories({
        homeCategoryRepository,
    });

    // B. Setup Nodemailer Integration
    const emailClient = createEmailClient({
        smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email',
        smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
        smtpUser: process.env.SMTP_USER || 'mock@ethereal.email',
        smtpPass: process.env.SMTP_PASS || 'mock-pass',
        emailFrom: process.env.EMAIL_FROM || 'security@jeet-ahirwar.com',
    });

    // D. Setup Cloudinary Integration
    const cloudinaryClient = createCloudinaryClient({
        cloudName: env.cloudinary.cloudName,
        apiKey: env.cloudinary.apiKey,
        apiSecret: env.cloudinary.apiSecret,
    });


    // E. Setup Business Services
    const authService = createAuthService({
        userRepository,
        cartRepository,
        verificationCodeRepository,
        passwordResetTokenRepository,
        refreshTokenRepository,
        generateOTP,
        emailClient,
        signToken,
        verifyToken,
        createApiError,
        jwtAccessSecret,
        jwtAccessExpiresIn,
        jwtRefreshSecret,
        jwtRefreshExpiresIn,
    });

    const sellerAuthService = createSellerAuthService({
        sellerRepository,
        verificationCodeRepository,
        generateOTP,
        emailClient,
        signToken,
        createApiError,
        jwtAccessSecret,
        jwtAccessExpiresIn,
    });

    const categoryService = createCategoryService({
        categoryRepository,
        createApiError
    });

    const productService = createProductService({
        productRepository,
        categoryService,
        createApiError,
        mapProduct,
        mapProducts,
    });

    const cartService = createCartService({
        cartRepository,
        productRepository,
        createApiError,
    });

    const wishlistService = createWishlistService({
        wishlistRepository,
        productRepository,
        mapProduct,
        mapProducts,
        createApiError,
    });

    const customerMetricRepository = createCustomerMetricRepository({ CustomerMetric });
    const customerSegmentService = createCustomerSegmentService({
        customerMetricRepository,
        orderModel: Order,
        createApiError,
    });

    const sellerMetricRepository = createSellerMetricRepository({ SellerMetric });
    const sellerSegmentService = createSellerSegmentService({
        sellerMetricRepository,
        sellerModel: Seller,
        createApiError,
    });

    const couponService = createCouponService({
        couponRepository,
        cartRepository,
        userRepository,
        createApiError,
        customerSegmentService,
        sellerSegmentService,
    });

    // Enterprise Notification Channel Providers
    const inAppProvider = createInAppProvider({ notificationRepository });
    const emailProvider = createEmailProvider({ emailClient });
    const smsProvider = createSmsProvider();
    const pushProvider = createPushProvider();
    const notificationChannelFactory = createNotificationChannelFactory({ inAppProvider, emailProvider, smsProvider, pushProvider });
    const templateRenderer = createTemplateRenderer();
    const notificationDispatcher = createNotificationDispatcher({
        notificationChannelFactory,
        notificationTemplateRepository,
        notificationPreferenceRepository,
        notificationRepository,
        userRepository,
        User,
        templateRenderer,
        createApiError,
    });

    const notificationService = createNotificationService({
        notificationRepository,
        notificationTemplateRepository,
        notificationPreferenceRepository,
        notificationDispatcher,
        userRepository,
        createApiError,
        mapSellerNotification,
        mapSellerNotifications,
        mapRecentActivity,
        mapRecentActivities,
        mapNotification,
        mapNotifications,
        mapNotificationListResponse,
        mapNotificationWithHistory,
    });

    const commissionService = createCommissionService({
        commissionRepository,
        orderRepository,
        configurationService,
        createApiError,
        mapCommission,
        mapCommissions,
    });

    // Gateway module instantiation
    const razorpayXMockGateway = createRazorpayXMockGateway({
        gatewayEventRepository,
        mockGatewaysConfig: env.mockGateways,
    });

    const razorpayMockGateway = createRazorpayMockGateway({
        gatewayEventRepository,
        mockGatewaysConfig: env.mockGateways,
    });

    const razorpayXGateway = env.razorpayx?.keyId && env.razorpayx?.keySecret
        ? createRazorpayXGateway({
            gatewayEventRepository,
            razorpayxConfig: env.razorpayx,
            createApiError,
        })
        : null;

    const paymentGatewayFactory = createPaymentGatewayFactory();
    paymentGatewayFactory.register('mock_razorpayx', razorpayXMockGateway);
    paymentGatewayFactory.register('mock_razorpay', razorpayMockGateway);
    paymentGatewayFactory.register('RAZORPAYX', razorpayXGateway);

    const settlementService = createSettlementService({
        settlementRepository,
        payoutRepository,
        sellerRepository,
        createApiError,
        mapSettlement,
        mapSettlements,
    });

    const settlementEngineService = createSettlementEngineService({
        orderRepository,
        commissionRepository,
        ledgerRepository,
        configurationService,
        notificationService,
        createApiError,
    });

    const payoutService = createPayoutService({
        payoutRepository,
        commissionRepository,
        sellerReportRepository,
        settlementService,
        sellerRepository,
        razorpayXGateway,
        paymentGatewayFactory,
        gatewayEventRepository,
        gatewayUtils,
        mockGatewaysConfig: env.mockGateways,
        createApiError,
        mapPayout,
        mapPayouts,
    });

    const gatewayService = createGatewayService({
        gatewayEventRepository,
        payoutRepository,
        refundRepository,
        payoutService,
        commissionService,
        sellerReportRepository,
        notificationService,
        paymentGatewayFactory,
        createApiError,
    });

    const paymentService = createPaymentService({
        paymentOrderRepository,
        orderRepository,
        transactionRepository,
        sellerReportRepository,
        cartRepository,
        productRepository,
        couponRepository,
        userRepository,
        razorpayClient,
        stripeClient,
        createApiError,
    });

    const revenueService = createRevenueService({
        orderRepository,
        createApiError,
    });

    const sellerService = createSellerService({
        sellerRepository,
        createApiError,
    });

    const reviewService = createReviewService({
        reviewRepository,
        productRepository,
        createApiError,
        mapReview,
        mapReviews,
    });

    const aiService = createAiService({
        cartRepository,
        productRepository,
        orderRepository,
        createApiError,
    });

    const dealService = createDealService({
        dealRepository,
        createApiError,
    });

    const transactionService = createTransactionService({
        transactionRepository,
        orderRepository,
        createApiError,
    });

    const homeService = createHomeService({
        homeCategoryRepository,
        dealRepository,
        createApiError,
    });

    const adminService = createAdminService({
        sellerService,
        userRepository,
        mapUser,
        createApiError,
    });

    const homeCategoryService = createHomeCategoryService({
        homeCategoryRepository,
        createApiError,
    });

    const categoryRequestService = createCategoryRequestService({
        categoryRequestRepository,
        categoryRepository,
        notificationService,
        createApiError,
    });

    const userService = createUserService({
        userRepository,
        cloudinaryClient,
        createApiError,
        mapUser,
    });

    const returnInventoryHelper = createInventoryHelper({
        productRepository,
        createApiError,
    });

    const returnService = createReturnService({
        returnRequestRepository,
        orderRepository,
        paymentOrderRepository,
        refundRepository,
        inventoryHelper: returnInventoryHelper,
        notificationService,
        commissionService,
        sellerReportRepository,
        paymentGatewayFactory,
        gatewayEventRepository,
        gatewayUtils,
        mockGatewaysConfig: env.mockGateways,
        createApiError,
        mapReturn,
        mapReturns,
    });

    const sellerDashboardService = createSellerDashboardService({
        sellerDashboardRepository,
        createApiError,
        mapSellerDashboardSummary,
        mapRevenueAnalytics,
        mapProductAnalytics,
        mapOrderAnalytics,
        mapCustomerAnalytics,
        mapReturnRefundAnalytics,
    });

    const adminDashboardService = createAdminDashboardService({
        adminDashboardRepository,
        createApiError,
    });

    const adminUserService = createAdminUserService({
        adminUserRepository,
        createApiError,
    });

    const sellerVerificationService = createSellerVerificationService({
        sellerVerificationRepository,
        notificationService,
        createApiError,
    });

    const productModerationService = createProductModerationService({
        productModerationRepository,
        notificationService,
        createApiError,
    });

    const brandService = createBrandService({
        brandRepository,
        productRepository,
        cloudinaryClient,
        createApiError,
    });

    const brandRequestService = createBrandRequestService({
        brandRequestRepository,
        brandRepository,
        categoryRepository,
        notificationService,
        createApiError,
    });

    const cookieConsentService = createCookieConsentService({
        cookieConsentRepository,
        createApiError,
    });

    // Coupon Distribution Engine
    const couponDistributionRulesService = createCouponDistributionRulesService();
    const distributionEngine = createCouponDistributionEngine({
        couponAssignmentRepository,
        couponRepository,
        rulesService: couponDistributionRulesService,
        userRepository,
        notificationService,
        createApiError,
    });

    // Order Service
    const orderService = createOrderService({
        orderRepository,
        paymentOrderRepository,
        cartRepository,
        userRepository,
        couponRepository,
        sellerReportRepository,
        productRepository,
        notificationService,
        commissionService,
        settlementEngineService,
        distributionEngine,
        createApiError,
        mapOrder,
        mapOrders,
        mapOrderItem,
    });

    // Referral Service
    const referralService = createReferralService({
        userRepository,
        createApiError,
    });

    const adminOrderService = createAdminOrderService({
        Order,
        orderRepository,
        paymentOrderRepository,
        notificationService,
        commissionService,
        createApiError,
        mapOrder,
        mapOrders,
    });

    const adminCouponService = createAdminCouponService({
        couponRepository,
        notificationService,
        createApiError,
    });

    const sellerCouponService = createSellerCouponService({
        couponRepository,
        createApiError,
    });

    const adminReportsService = createAdminReportsService({
        adminReportsRepository,
        createApiError,
    });

    const adminNotificationService = createAdminNotificationService({
        adminNotificationRepository,
        createApiError,
    });

    const systemSettingsService = createSystemSettingsService({
        systemSettingsRepository,
        createApiError,
        mapSystemSettings,
    });

    const invoiceService = createInvoiceService({
        configurationService,
        orderRepository,
        paymentOrderRepository,
        commissionRepository,
        ledgerRepository,
        createApiError,
    });

    // E. Setup Thin HTTP Controllers
    const authController = createAuthController({ authService });
    const sellerAuthController = createSellerAuthController({ sellerAuthService });
    const productController = createProductController({ productService });
    const cartController = createCartController({ cartService });
    const wishlistController = createWishlistController({ wishlistService });
    const couponController = createCouponController({ couponService });
    const orderController = createOrderController({ orderService, paymentService, createApiError });
    const sellerOrderController = createSellerOrderController({
        orderService,
        orderRepository,
        paymentOrderRepository,
        configurationService,
        createApiError,
    });
    const paymentController = createPaymentController({ paymentService });
    const revenueController = createRevenueController({ revenueService });
    // const adminController = createAdminController({ sellerService, homeService, });
    const adminController = createAdminController({ adminService, });
    const sellerController = createSellerController({ sellerService, sellerReportRepository });
    const reviewController = createReviewController({ reviewService });
    const notificationController = createNotificationController({ notificationService });
    const aiController = createAiController({ aiService });
    const dealController = createDealController({ dealService });
    const transactionController = createTransactionController({ transactionService, transactionMapper, });
    // const homeController = createHomeMailController({ homeService, homeCategoryRepository });
    const homeController = createHomeController({ homeService, });
    const homeCategoryController = createHomeCategoryController({ homeCategoryService, });
    const uploadController = createUploadController({ cloudinaryClient, createApiError });
    const userController = createUserController({ userService, createApiError });
    const categoryController = createCategoryController({
        categoryService,
        asyncHandler,
    });

    const categoryRequestController = createCategoryRequestController({
        categoryRequestService,
        asyncHandler,
    });

    const returnController = createReturnController({ returnService });

    const sellerDashboardController = createSellerDashboardController({ sellerDashboardService });

    const adminDashboardController = createAdminDashboardController({ adminDashboardService });

    const adminUserController = createAdminUserController({ adminUserService });

    const sellerVerificationController = createSellerVerificationController({ sellerVerificationService });

    const productModerationController = createProductModerationController({ productModerationService });

    const brandController = createBrandController({ brandService });

    const brandRequestController = createBrandRequestController({
        brandRequestService,
        asyncHandler,
    });

    const cookieConsentController = createCookieConsentController({ cookieConsentService });

    const adminOrderController = createAdminOrderController({ adminOrderService });

    const adminCouponController = createAdminCouponController({ adminCouponService });
    const sellerCouponController = createSellerCouponController({ sellerCouponService });
    const customerSegmentController = createCustomerSegmentController({ customerSegmentService });
    const sellerSegmentController = createSellerSegmentController({ sellerSegmentService });

    const adminReportsController = createAdminReportsController({ adminReportsService });

    const adminNotificationController = createAdminNotificationController({ adminNotificationService });

    const systemSettingsController = createSystemSettingsController({
        systemSettingsService,
        cloudinaryClient,
        createApiError,
    });

    const commissionController = createCommissionController({ commissionService });

    const payoutController = createPayoutController({ payoutService });

    const settlementController = createSettlementController({ settlementService });

    const gatewayController = createGatewayController({ gatewayService });

    const couponDistributionController = createCouponDistributionController({ distributionEngine });

    const settlementEngineController = createSettlementEngineController({ settlementEngineService });

    const referralController = createReferralController({ referralService });

    const invoiceController = createInvoiceController({
        invoiceService,
        orderRepository,
        createApiError,
    });

    // F. Assembly Routes
    const rawAuthRouterInstance = express.Router();
    const authRoutes = createAuthRoutes({
        router: rawAuthRouterInstance,
        authController,
        sellerAuthController,
        authenticate, // Safely passed
        asyncHandler,
    });

    const rawProductRouterInstance = express.Router();
    const productRoutes = createProductRoutes({
        router: rawProductRouterInstance,
        productController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawCartRouterInstance = express.Router();
    const cartRoutes = createCartRoutes({
        router: rawCartRouterInstance,
        cartController,
        authenticate,
        asyncHandler,
    });

    const rawWishlistRouterInstance = express.Router();
    const wishlistRoutes = createWishlistRoutes({
        router: rawWishlistRouterInstance,
        wishlistController,
        authenticate,
        asyncHandler,
    });

    const rawCouponRouterInstance = express.Router();
    const couponRoutes = createCouponRoutes({
        router: rawCouponRouterInstance,
        couponController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawOrderRouterInstance = express.Router();
    const orderRoutes = createOrderRoutes({
        router: rawOrderRouterInstance,
        orderController,
        authenticate,
        asyncHandler,
    });

    const rawSellerOrderRouterInstance = express.Router();
    const sellerOrderRoutes = createSellerOrderRoutes({
        router: rawSellerOrderRouterInstance,
        sellerOrderController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawPaymentRouterInstance = express.Router();
    const paymentRoutes = createPaymentRoutes({
        router: rawPaymentRouterInstance,
        paymentController,
        authenticate,
        asyncHandler,
    });

    const rawRevenueRouterInstance = express.Router();
    const revenueRoutes = createRevenueRoutes({
        router: rawRevenueRouterInstance,
        revenueController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminRouterInstance = express.Router();
    const adminRoutes = createAdminRoutes({
        router: rawAdminRouterInstance,
        adminController,
        categoryController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawSellerRouterInstance = express.Router();
    const sellerRoutes = createSellerRoutes({
        router: rawSellerRouterInstance,
        sellerController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawReviewRouterInstance = express.Router();
    const reviewRoutes = createReviewRoutes({
        router: rawReviewRouterInstance,
        reviewController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawNotificationRouterInstance = express.Router();
    const notificationRoutes = createNotificationRoutes({
        router: rawNotificationRouterInstance,
        notificationController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAiRouterInstance = express.Router();
    const aiRoutes = createAiRoutes({
        router: rawAiRouterInstance,
        aiController,
        authenticate,
        asyncHandler,
    });

    const rawDealRouterInstance = express.Router();
    const dealRoutes = createDealRoutes({
        router: rawDealRouterInstance,
        dealController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawTransactionRouterInstance = express.Router();
    const transactionRoutes = createTransactionRoutes({
        router: rawTransactionRouterInstance,
        transactionController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    // const rawHomeRouterInstance = express.Router();
    // const homeRoutes = createHomeRoutes({
    //     router: rawHomeRouterInstance,
    //     homeController,
    //     authenticate,
    //     authorizeRoles,
    //     asyncHandler,
    // });

    const rawHomeRouterInstance = express.Router();

    const homeRoutes = createHomeRoutes({
        router: rawHomeRouterInstance,
        homeController,
        homeCategoryController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawUploadRouterInstance = express.Router();
    const uploadRoutes = createUploadRoutes({
        router: rawUploadRouterInstance,
        uploadController,
        upload,
        authenticate,
        asyncHandler,
    });

    const rawUserRouterInstance = express.Router();
    const userRoutes = createUserRoutes({
        router: rawUserRouterInstance,
        userController,
        authenticate,
        upload,
        asyncHandler,
    });

    const rawCategoryRouter = express.Router();
    const categoryRoutes = createCategoryRoutes({
        router: rawCategoryRouter,
        categoryController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawCategoryRequestRouter = express.Router();
    const categoryRequestRoutes = createCategoryRequestRoutes({
        router: rawCategoryRequestRouter,
        categoryRequestController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawReturnRouter = express.Router();
    const returnRoutes = createReturnRoutes({
        router: rawReturnRouter,
        returnController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawSellerDashboardRouter = express.Router();
    const sellerDashboardRoutes = createSellerDashboardRoutes({
        router: rawSellerDashboardRouter,
        sellerDashboardController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminDashboardRouter = express.Router();
    const adminDashboardRoutes = createAdminDashboardRoutes({
        router: rawAdminDashboardRouter,
        adminDashboardController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminUserRouter = express.Router();
    const adminUserRoutes = createAdminUserRoutes({
        router: rawAdminUserRouter,
        adminUserController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawSellerVerificationRouter = express.Router();
    const sellerVerificationRoutes = createSellerVerificationRoutes({
        router: rawSellerVerificationRouter,
        sellerVerificationController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawProductModerationRouter = express.Router();
    const productModerationRoutes = createProductModerationRoutes({
        router: rawProductModerationRouter,
        productModerationController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawBrandRouter = express.Router();
    const brandRoutes = createBrandRoutes({
        router: rawBrandRouter,
        controller: brandController,
        authenticate,
        authorizeRoles,
        upload,
        asyncHandler,
    });

    const rawBrandRequestRouter = express.Router();
    const brandRequestRoutes = createBrandRequestRoutes({
        router: rawBrandRequestRouter,
        brandRequestController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawCookieConsentRouter = express.Router();
    const cookieConsentRoutes = createCookieConsentRoutes({
        router: rawCookieConsentRouter,
        controller: cookieConsentController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminOrderRouter = express.Router();
    const adminOrderRoutes = createAdminOrderRoutes({
        router: rawAdminOrderRouter,
        adminOrderController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminCouponRouter = express.Router();
    const adminCouponRoutes = createAdminCouponRoutes({
        router: rawAdminCouponRouter,
        adminCouponController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawSellerCouponRouter = express.Router();
    const sellerCouponRoutes = createSellerCouponRoutes({
        router: rawSellerCouponRouter,
        sellerCouponController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawCustomerSegmentRouter = express.Router();
    const customerSegmentRoutes = createCustomerSegmentRoutes({
        router: rawCustomerSegmentRouter,
        customerSegmentController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawSellerSegmentRouter = express.Router();
    const sellerSegmentRoutes = createSellerSegmentRoutes({
        router: rawSellerSegmentRouter,
        sellerSegmentController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminReportsRouter = express.Router();
    const adminReportsRoutes = createAdminReportsRoutes({
        router: rawAdminReportsRouter,
        controller: adminReportsController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawAdminNotificationRouter = express.Router();
    const adminNotificationRoutes = createAdminNotificationRoutes({
        router: rawAdminNotificationRouter,
        controller: adminNotificationController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawSystemSettingsRouter = express.Router();
    const systemSettingsRoutes = createSystemSettingsRoutes({
        router: rawSystemSettingsRouter,
        controller: systemSettingsController,
        authenticate,
        authorizeRoles,
        asyncHandler,
        upload,
    });

    const rawCommissionRouter = express.Router();
    const commissionRoutes = createCommissionRoutes({
        router: rawCommissionRouter,
        controller: commissionController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawPayoutRouter = express.Router();
    const payoutRoutes = createPayoutRoutes({
        router: rawPayoutRouter,
        controller: payoutController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawGatewayRouter = express.Router();
    const gatewayRoutes = createGatewayRoutes({
        router: rawGatewayRouter,
        controller: gatewayController,
        authenticate,
        authorizeRoles,
        asyncHandler,
        webhookSecret: env.mockGateways.webhookSecret,
        razorpayXWebhookSecret: env.razorpayx.webhookSecret,
    });

    const rawSettlementRouter = express.Router();
    const settlementRoutes = createSettlementRoutes({
        router: rawSettlementRouter,
        controller: settlementController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawCouponDistributionRouter = express.Router();
    const couponDistributionRoutes = createCouponDistributionRoutes({
        router: rawCouponDistributionRouter,
        controller: couponDistributionController,
        authenticate,
        asyncHandler,
    });

    const rawSettlementEngineRouter = express.Router();
    const settlementEngineRoutes = createSettlementEngineRoutes({
        router: rawSettlementEngineRouter,
        controller: settlementEngineController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    const rawReferralRouter = express.Router();
    const referralRoutes = createReferralRoutes({
        router: rawReferralRouter,
        controller: referralController,
        authenticate,
        asyncHandler,
    });

    const rawInvoiceRouter = express.Router();
    const invoiceRoutes = createInvoiceRoutes({
        router: rawInvoiceRouter,
        controller: invoiceController,
        authenticate,
        authorizeRoles,
        asyncHandler,
    });

    // =========================================================================
    // MOUNT ROUTING & SYSTEM EXCEPTION CHANNELS
    // =========================================================================

    // Default Entry Gateway check
    app.get('/', (req, res) =>
    {
        res.status(200).json({
            message: `Welcome to ${branding.appName} API Gateway`,
            online: true,
            databaseConnected: dbManager.isConnected(),
        });
    });

    // Standard Health Check Endpoint
    app.get('/health', (req, res) =>
    {
        const isDbConnected = dbManager.isConnected();

        const payload = {
            status: isDbConnected ? 'UP' : 'DOWN',
            uptime: process.uptime(),
            database: isDbConnected ? 'UP' : 'DOWN',
            memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            timestamp: new Date().toISOString()
        };

        if (!isDbConnected)
        {
            return res.status(503).json(payload);
        }

        res.status(200).json(payload);
    });

    // Mount central authentication pipelines
    app.use(authRoutes);

    // Mount product catalog and merchandising pathways
    app.use(productRoutes);

    // Mount shopping cart pathways
    app.use(cartRoutes);

    // Mount wishlist pathways
    app.use(wishlistRoutes);

    // Mount coupon campaigns pathways
    app.use(couponRoutes);

    // Mount sales orders pathways
    app.use(orderRoutes);

    // Mount seller order management pathways
    app.use(sellerOrderRoutes);

    // Mount payment verification pathways
    app.use(paymentRoutes);

    // Mount seller revenue analytics pathways
    app.use(revenueRoutes);

    // Mount admin moderation pathways
    app.use(adminRoutes);

    // Mount seller profile and administrative seller management pathways
    app.use(sellerRoutes);

    // Mount customer user profile pathways
    app.use(userRoutes);

    // Mount reviews pathways
    app.use(reviewRoutes);

    // Mount notifications pathways
    app.use(notificationRoutes);

    // Mount AI chatbot pathways
    app.use(aiRoutes);

    // Mount campaign deals pathways
    app.use(dealRoutes);

    // Mount transaction ledger pathways
    app.use(transactionRoutes);

    // Mount homepage merchandising pathways
    app.use(homeRoutes);

    // Mount media assets uploads pathways
    app.use(uploadRoutes);

    app.use("/categories", categoryRoutes);

    app.use(categoryRequestRoutes);

    // Mount return management pathways
    app.use(returnRoutes);

    // Mount seller dashboard analytics pathways
    app.use(sellerDashboardRoutes);

    // Mount admin dashboard analytics pathways
    app.use(adminDashboardRoutes);

    // Mount admin user management pathways
    app.use(adminUserRoutes);

    // Mount seller verification management pathways
    app.use(sellerVerificationRoutes);

    // Mount product moderation management pathways
    app.use(productModerationRoutes);

    // Mount brand management pathways
    app.use(brandRoutes);

    // Mount brand request management pathways
    app.use(brandRequestRoutes);

    // Mount cookie consent management pathways
    app.use(cookieConsentRoutes);

    // Mount admin order management pathways
    app.use(adminOrderRoutes);

    // Mount admin coupon management pathways
    app.use(sellerCouponRoutes);

    app.use(adminCouponRoutes);

    // Mount customer segmentation pathways
    app.use(customerSegmentRoutes);

    // Mount seller segmentation pathways
    app.use(sellerSegmentRoutes);

    // Mount admin reports & analytics pathways
    app.use(adminReportsRoutes);

    // Mount admin notification center pathways
    app.use(adminNotificationRoutes);

    // Mount system settings pathways
    app.use(systemSettingsRoutes);

    // Mount commission engine pathways
    app.use(commissionRoutes);

    // Mount payout engine pathways
    app.use(payoutRoutes);

    // Mount gateway webhook and admin dashboard pathways
    app.use(gatewayRoutes);

    // Mount settlement history pathways
    app.use(settlementRoutes);

    // Mount settlement engine / financial ledger pathways
    app.use(settlementEngineRoutes);

    // Mount coupon distribution wallet pathways
    app.use(couponDistributionRoutes);

    // Mount referral system pathways
    app.use(referralRoutes);

    // Mount invoice generation pathways
    app.use(invoiceRoutes);

    // Initialize background scheduler for automatic coupon distribution
    const schedulerService = createSchedulerService({
        distributionEngine,
        userRepository,
        userModel: User,
        customerMetricModel: CustomerMetric,
        sellerMetricModel: SellerMetric,
        cartModel: Cart,
    });
    schedulerService.start();

    // Wildcard Fallback Route for non-existent system paths
    app.use((req, res, next) =>
    {
        next(createApiError({
            statusCode: 404,
            code: 'ROUTE_NOT_FOUND',
            message: `The requested endpoint ${req.originalUrl} does not exist on this server.`
        }));
    });

    // Central Centralized Error Interceptor Middleware
    app.use(createErrorHandlerMiddleware({ nodeEnv: env.nodeEnv }));

    return app;
};