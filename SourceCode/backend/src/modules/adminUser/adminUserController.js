/**
 * Pure function-based factory representing the Admin User Management HTTP API Controllers.
 * Strictly enforces thin controller design principles.
 */
export const createAdminUserController = ({ adminUserService }) =>
{
    /**
     * Lists users with optional role filter, search, pagination, and sorting.
     * GET /admin/users?role=&page=&limit=&search=&sortBy=&sortOrder=
     */
    const listUsers = async (req, res) =>
    {
        const { role, page, limit, search, sortBy, sortOrder } = req.query;

        const result = await adminUserService.getUsers({
            role: role || null,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            search: search || null,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder || 'desc',
        });

        res.status(200).json({
            success: true,
            data: result.users,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    };

    /**
     * Returns full details for a single user/seller by ID.
     * GET /admin/users/:id
     */
    const getUserById = async (req, res) =>
    {
        const { id } = req.params;

        const user = await adminUserService.getUserDetails(id);

        res.status(200).json({ success: true, data: user });
    };

    /**
     * Updates a seller's account status.
     * PATCH /admin/users/:id/seller-status   { status: "ACTIVE" }
     */
    const updateSellerAccountStatus = async (req, res) =>
    {
        const { id } = req.params;
        const { status } = req.body;

        if (!status)
        {
            return res.status(400).json({
                success: false,
                message: 'Status field is required in the request body.',
            });
        }

        const result = await adminUserService.updateSellerStatus({
            sellerId: id,
            status,
        });

        res.status(200).json({ success: true, data: result });
    };

    /**
     * Returns aggregated user counts by role.
     * GET /admin/users/counts
     */
    const getUserCounts = async (req, res) =>
    {
        const counts = await adminUserService.getUserCounts();

        res.status(200).json({ success: true, data: counts });
    };

    return Object.freeze({
        listUsers,
        getUserById,
        updateSellerAccountStatus,
        getUserCounts,
    });
};
