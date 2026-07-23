/**
 * Pure function-based factory representing the Admin User Management Persistence layer.
 * Handles cross-collection queries across User and Seller models with pagination and search.
 */
export const createAdminUserRepository = ({ User, Seller }) =>
{
    /**
     * Builds a search filter for regex matching across name/email/mobile fields.
     */
    const buildSearchFilter = (search, fieldMap) =>
    {
        if (!search || !search.trim()) return {};

        const regex = new RegExp(search.trim(), 'i');
        const conditions = fieldMap.map((field) => ({ [field]: regex }));

        return { $or: conditions };
    };

    /**
     * Finds paginated customer users (ROLE_CUSTOMER).
     */
    const findCustomers = async ({ page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {
            role: 'ROLE_CUSTOMER',
            ...buildSearchFilter(search, ['fullName', 'email', 'mobile']),
        };

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [users, total] = await Promise.all([
            User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    };

    /**
     * Finds paginated admin users (ROLE_ADMIN).
     */
    const findAdmins = async ({ page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = {
            role: 'ROLE_ADMIN',
            ...buildSearchFilter(search, ['fullName', 'email', 'mobile']),
        };

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [users, total] = await Promise.all([
            User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(filter),
        ]);

        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    };

    /**
     * Finds paginated seller profiles from the Seller collection.
     */
    const findSellers = async ({ page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const filter = buildSearchFilter(search, ['sellerName', 'email', 'mobile']);

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [sellers, total] = await Promise.all([
            Seller.find(filter).sort(sort).skip(skip).limit(limit).lean(),
            Seller.countDocuments(filter),
        ]);

        return { users: sellers, total, page, limit, totalPages: Math.ceil(total / limit) };
    };

    /**
     * Finds all users across both User and Seller collections, merged and sorted.
     * Used when no role filter is specified (All tab).
     */
    const findAllUsers = async ({ page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}) =>
    {
        const fetchLimit = Math.max(limit * 3, 60);

        const [customerResult, sellerResult] = await Promise.all([
            findCustomers({ page: 1, limit: fetchLimit, search, sortBy, sortOrder }),
            findSellers({ page: 1, limit: fetchLimit, search, sortBy, sortOrder }),
        ]);

        const allUsers = [...customerResult.users, ...sellerResult.users];

        allUsers.sort((a, b) =>
        {
            const aVal = (a[sortBy] || a.sellerName || a.fullName || '').toString().toLowerCase();
            const bVal = (b[sortBy] || b.sellerName || b.fullName || '').toString().toLowerCase();

            if (sortOrder === 'asc') return aVal.localeCompare(bVal);
            return bVal.localeCompare(aVal);
        });

        const total = allUsers.length;
        const start = (page - 1) * limit;
        const paginatedUsers = allUsers.slice(start, start + limit);

        return {
            users: paginatedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    };

    /**
     * Finds a single User document by ID.
     */
    const findUserById = async (id, options = {}) =>
    {
        return User.findById(id, null, options).lean();
    };

    /**
     * Finds a single Seller document by ID.
     */
    const findSellerById = async (id, options = {}) =>
    {
        return Seller.findById(id, null, options).lean();
    };

    /**
     * Counts users by role across User and Seller collections.
     */
    const countAll = async () =>
    {
        const [customerCount, sellerCount, adminCount] = await Promise.all([
            User.countDocuments({ role: 'ROLE_CUSTOMER' }),
            Seller.countDocuments(),
            User.countDocuments({ role: 'ROLE_ADMIN' }),
        ]);

        return {
            ROLE_CUSTOMER: customerCount,
            ROLE_SELLER: sellerCount,
            ROLE_ADMIN: adminCount,
            total: customerCount + sellerCount + adminCount,
        };
    };

    /**
     * Updates a seller's account status by Seller document ID.
     */
    const updateSellerAccountStatus = async (sellerId, status, options = {}) =>
    {
        return Seller.findByIdAndUpdate(
            sellerId,
            { accountStatus: status },
            {
                ...options,
                new: true,
                runValidators: true,
            }
        ).lean();
    };

    return Object.freeze({
        findCustomers,
        findAdmins,
        findSellers,
        findAllUsers,
        findUserById,
        findSellerById,
        countAll,
        updateSellerAccountStatus,
    });
};
