/**
 * Pure function-based factory representing the Administrative HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createAdminController = ({
    adminService,
}) =>
{

    /**
     * Admin Seller Account Moderation Status Modifier.
     * Maps exactly to: PATCH /admin/seller/:id/status/:status (Admin authorization required)
     */
    const updateSellerStatus = async (req, res) =>
    {
        const { id, status } = req.params;

        const updatedSeller = await adminService.updateSellerStatus({
            id,
            status,
        });

        res.status(200).json(updatedSeller);
    };

    /**
     * Returns the authenticated admin's own account profile.
     * Maps exactly to: GET /admin/account (Admin authorization required)
     */
    const getProfile = async (req, res) =>
    {
        const adminId = req.user.id;

        const profile = await adminService.getAdminProfile({ adminId });

        res.status(200).json(profile);
    };

    return Object.freeze({
        updateSellerStatus,
        getProfile,
    });

};