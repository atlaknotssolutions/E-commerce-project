/**
 * Creates a repository for managing users.
 */
export const createUserRepository = ({ User }) =>
{

    /**
     * Find a user by email.
     */
    const findByEmail = async (email, options = {}) =>
    {
        return User.findOne(
            { email: email.toLowerCase() },
            null, // Return all fields.
            options // Optional query options (e.g. session).
        ).lean(); // Return a plain JavaScript object.
    };

    /**
     * Find a user by ID.
     */
    // const findById = async (id, options = {}) =>
    // {
    //     return User.findById(
    //         id,
    //         { passwordHash: 0 }, // Exclude the password hash.
    //         options
    //     ).lean();
    // };

    const findById = async (id, options = {}) =>
    {
        return User.findById(
            id,
            { passwordHash: 0 },
            options
        );
    };

    /**
     * Create a new user.
     */
    const create = async (userData, options = {}) =>
    {
        // Using an array supports MongoDB transactions.
        const [newUser] = await User.create([userData], options);

        // Convert the document to a plain JavaScript object.
        return newUser ? newUser.toObject() : null;
    };

    /**
 * Adds a new address to the authenticated user's address book.
 */
    const addAddress = async ({ userId, address }, options = {}) =>
    {
        const user = await User.findById(userId, null, options);

        if (!user)
        {
            return null;
        }

        user.addresses.push(address);

        await user.save();

        return User.findById(
            userId,
            { passwordHash: 0 },
            options
        ).lean();
    };

    /**
 * Updates an existing address belonging to the authenticated user.
 */
    const updateAddress = async (
        {
            userId,
            addressId,
            address,
        },
        options = {}
    ) =>
    {
        const user = await User.findById(userId, null, options);

        if (!user)
        {
            return null;
        }

        const existingAddress = user.addresses.id(addressId);

        if (!existingAddress)
        {
            return null;
        }

        existingAddress.name = address.name;
        existingAddress.mobile = address.mobile;
        existingAddress.streetAddress = address.address;
        existingAddress.locality = address.locality;
        existingAddress.city = address.city;
        existingAddress.state = address.state;
        existingAddress.pinCode = address.pinCode;

        await user.save();

        return User.findById(
            userId,
            { passwordHash: 0 },
            options
        );
    };

    /**
 * Deletes an existing address belonging to the authenticated user.
 */
    const deleteAddress = async (
        {
            userId,
            addressId,
        },
        options = {}
    ) =>
    {
        const user = await User.findById(userId, null, options);

        if (!user)
        {
            return null;
        }

        const existingAddress = user.addresses.id(addressId);

        if (!existingAddress)
        {
            return null;
        }

        existingAddress.deleteOne();

        await user.save();

        return User.findById(
            userId,
            { passwordHash: 0 },
            options
        );
    };

    /**
 * Sets one of the authenticated user's saved addresses as the default address.
 */
    const setDefaultAddress = async (
        {
            userId,
            addressId,
        },
        options = {}
    ) =>
    {
        const user = await User.findById(userId, null, options);

        if (!user)
        {
            return null;
        }

        const selectedAddress = user.addresses.id(addressId);

        if (!selectedAddress)
        {
            return null;
        }

        // Clear the existing default address.
        user.addresses.forEach((address) =>
        {
            address.isDefault = false;
        });

        // Mark the selected address as default.
        selectedAddress.isDefault = true;

        await user.save();

        return User.findById(
            userId,
            { passwordHash: 0 },
            options
        );
    };

    /**
     * Updates the authenticated user's profile image and Cloudinary public ID.
     */
    const updateProfileImage = async ({ userId, profileImage, profileImageId }) =>
    {
        return User.findByIdAndUpdate(
            userId,
            { $set: { profileImage, profileImageId } },
            { new: true, runValidators: true }
        );
    };

    /**
     * Replaces the user's usedCoupons array atomically.
     * Used by coupon service to track redemption history.
     */
    const updateUsedCoupons = async ({ userId, usedCoupons }, options = {}) =>
    {
        return User.findByIdAndUpdate(
            userId,
            { $set: { usedCoupons } },
            { new: true, runValidators: true, ...options }
        );
    };

    return Object.freeze({
        findByEmail,
        findById,
        create,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        updateProfileImage,
        updateUsedCoupons,
    });
};