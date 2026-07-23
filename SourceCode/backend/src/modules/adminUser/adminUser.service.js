import { mapAdminUser } from './adminUser.mapper.js';

/**
 * Pure function-based factory representing the Admin User Management Business Service layer.
 * Coordinates user listing, detail retrieval, and seller status moderation.
 */
export const createAdminUserService = ({ adminUserRepository, createApiError }) =>
{
    /**
     * Retrieves a paginated list of users, optionally filtered by role.
     * Routes to the correct repository method based on the role filter.
     */
    const getUsers = async ({ role, page, limit, search, sortBy, sortOrder }) =>
    {
        let result;

        switch (role)
        {
            case 'ROLE_CUSTOMER':
                result = await adminUserRepository.findCustomers({ page, limit, search, sortBy, sortOrder });
                break;

            case 'ROLE_SELLER':
                result = await adminUserRepository.findSellers({ page, limit, search, sortBy, sortOrder });
                break;

            case 'ROLE_ADMIN':
                result = await adminUserRepository.findAdmins({ page, limit, search, sortBy, sortOrder });
                break;

            default:
                result = await adminUserRepository.findAllUsers({ page, limit, search, sortBy, sortOrder });
                break;
        }

        return {
            ...result,
            users: result.users.map(mapAdminUser).filter(Boolean),
        };
    };

    /**
     * Retrieves full details for a single user/seller by ID.
     * Detects whether the ID belongs to the User or Seller collection.
     */
    const getUserDetails = async (userId) =>
    {
        const user = await adminUserRepository.findUserById(userId);

        if (user)
        {
            return mapAdminUser(user);
        }

        const seller = await adminUserRepository.findSellerById(userId);

        if (seller)
        {
            return mapAdminUser(seller);
        }

        throw createApiError({
            statusCode: 404,
            code: 'USER_NOT_FOUND',
            message: 'The requested user account does not exist.',
        });
    };

    /**
     * Updates a seller's account status.
     * Validates the target status against allowed values before committing.
     */
    const updateSellerStatus = async ({ sellerId, status }) =>
    {
        const allowedStatuses = ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED'];
        const normalizedStatus = status.toUpperCase().trim();

        if (!allowedStatuses.includes(normalizedStatus))
        {
            throw createApiError({
                statusCode: 400,
                code: 'INVALID_ACCOUNT_STATUS',
                message: `'${status}' is not a valid account status. Allowed: ${allowedStatuses.join(', ')}.`,
            });
        }

        const seller = await adminUserRepository.findSellerById(sellerId);

        if (!seller)
        {
            throw createApiError({
                statusCode: 404,
                code: 'SELLER_NOT_FOUND',
                message: 'The requested seller profile does not exist.',
            });
        }

        const updated = await adminUserRepository.updateSellerAccountStatus(sellerId, normalizedStatus);

        return {
            sellerId: updated._id?.toString(),
            accountStatus: updated.accountStatus,
        };
    };

    /**
     * Returns aggregated user counts by role.
     */
    const getUserCounts = async () =>
    {
        return adminUserRepository.countAll();
    };

    return Object.freeze({
        getUsers,
        getUserDetails,
        updateSellerStatus,
        getUserCounts,
    });
};
