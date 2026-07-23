/**
 * Pure function-based factory representing the Administrative Business Service layer.
 * Coordinates administrative operations across seller management and homepage merchandising.
 */
export const createAdminService = ({
    sellerService,
    userRepository,
    mapUser,
    createApiError,
}) =>
{

    /**
     * Administrative Seller Moderation.
     * Updates seller account status.
     */
    const updateSellerStatus = async ({
        id,
        status,
    }) =>
    {
        return sellerService.updateAccountStatus({
            id,
            status,
        });
    };

    /**
     * Retrieves the authenticated admin's own account profile.
     * Admins are stored as User documents with role: ROLE_ADMIN.
     */
    const getAdminProfile = async ({ adminId }) =>
    {
        const user = await userRepository.findById(adminId);

        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'ADMIN_NOT_FOUND',
                message: 'The requested admin profile does not exist on this server.'
            });
        }

        return mapUser(user);
    };


    return Object.freeze({
        updateSellerStatus,
        getAdminProfile,
    });

};