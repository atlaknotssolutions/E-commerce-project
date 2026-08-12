/**
 * Pure function-based factory representing the Seller Persistence database interface.
 * Decouples database collections lookup pipelines using Dependency Injection.
 */
export const createSellerRepository = ({ Seller }) =>
{

    /**
     * Locates a registered merchant seller using unique business email.
     */
    const findByEmail = async (email, options = {}) =>
    {
        return Seller.findOne(
            { email: email.toLowerCase() },
            null, // Fetches entire schema layout fields
            options
        ).lean(); // Returns plain lightweight Javascript object instead of Mongoose documents
    };

    /**
     * Locates a registered merchant seller using unique business email,
     * explicitly including the passwordHash field despite its schema-level
     * `select: false`. Intended ONLY for password credential verification
     * inside the auth service. Callers must never serialize the returned
     * hash back to clients.
     */
    const findByEmailWithPassword = async (email, options = {}) =>
    {
        return Seller.findOne(
            { email: email.toLowerCase() },
            '+passwordHash', // Explicitly opt back into the excluded field.
            options
        ).lean();
    };

    /**
     * Resolves a seller profile using unique database ObjectId.
     */
    const findById = async (id, options = {}) =>
    {
        return Seller.findById(
            id,
            null,
            options
        ).lean();
    };

    /**
     * Resolves a seller profile using unique database ObjectId, explicitly
     * including the passwordHash field despite its schema-level
     * `select: false`. Intended ONLY for password credential verification
     * inside the auth service. Callers must never serialize the returned
     * hash back to clients.
     */
    const findByIdWithPassword = async (id, options = {}) =>
    {
        return Seller.findById(
            id,
            '+passwordHash', // Explicitly opt back into the excluded field.
            options
        ).lean();
    };

    /**
     * Updates ONLY the passwordHash field for a seller.
     * The returned document never exposes passwordHash because the schema
     * marks the field as `select: false`.
     */
    const updatePasswordHash = async ({ userId, passwordHash }, options = {}) =>
    {
        return Seller.findByIdAndUpdate(
            userId,
            { $set: { passwordHash } },
            { new: true, runValidators: true, ...options }
        ).lean();
    };

    /**
     * Commits a new seller/merchant register profile into database.
     */
    const create = async (sellerData, options = {}) =>
    {
        const [newSeller] = await Seller.create([sellerData], options);
        return newSeller ? newSeller.toObject() : null;
    };

    /**
     * Commits verification states, flagging seller email confirmed inside database registries.
     */
    const updateVerificationStatus = async ({ id, isEmailVerified }, options = {}) =>
    {
        return Seller.findByIdAndUpdate(
            id,
            { isEmailVerified },
            { ...options, new: true } // Returns updated record state
        ).lean();
    };

    /**
     * Commits administrative account status changes (e.g., ACTIVE, SUSPENDED, BANNED) into database.
     * Enforces schema enum validations on target state parameter inputs.
     */
    const updateAccountStatus = async ({ id, status }, options = {}) =>
    {
        return Seller.findByIdAndUpdate(
            id,
            { accountStatus: status },
            {
                ...options,
                new: true, // Returns newly updated document state
                runValidators: true, // Forces Mongoose to run enum checks validations on update
            }
        ).lean();
    };

    /**
     * Searches sellers by name, email, or business name with pagination.
     */
    const searchSellers = async ({ search, page = 1, limit = 20 }) =>
    {
        const query = {};

        const trimmed = search ? search.trim() : '';
        if (trimmed.length >= 2)
        {
            const regex = new RegExp(trimmed, 'i');
            query.$or = [
                { sellerName: regex },
                { email: regex },
                { 'businessDetails.businessName': regex },
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Seller.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Seller.countDocuments(query),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    };

    const updateRazorpayXFields = async ({ id, contactId, fundAccountId, fundAccountStatus }, options = {}) =>
    {
        const $set = {};
        if (contactId !== undefined) $set.razorpayxContactId = contactId;
        if (fundAccountId !== undefined) $set.razorpayxFundAccountId = fundAccountId;
        if (fundAccountStatus !== undefined) $set.razorpayxFundAccountStatus = fundAccountStatus;
        return Seller.findByIdAndUpdate(id, { $set }, { ...options, new: true }).lean();
    };

    return Object.freeze({
        findByEmail,
        findByEmailWithPassword,
        findById,
        findByIdWithPassword,
        updatePasswordHash,
        create,
        updateVerificationStatus,
        updateAccountStatus,
        searchSellers,
        updateRazorpayXFields,
    });
};