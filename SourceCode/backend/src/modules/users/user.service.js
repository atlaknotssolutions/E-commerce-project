import { mapUser } from "../../utils/mappers/user.mapper.js";

/**
 * Pure function-based factory representing the User core Business Service layer.
 * Coordinates customer profiles and manages address book retrievals.
 */
export const createUserService = ({ userRepository, cloudinaryClient, createApiError, mapUser, }) =>
{

    /**
     * Retrieves a customer's active account profile details.
     * Throws standard 404 exceptions on missing database entries.
     */
    const getUserProfile = async ({ userId }) =>
    {
        // 1. Fetch user profile from repository layer
        const user = await userRepository.findById(userId);

        // 2. Core Validation: Ensure user profile actually exists
        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'The requested user profile does not exist on this server.'
            });
        }

        return mapUser(user);
    };

    /**
 * Adds a new shipping address to the authenticated user's address book.
 */
    const addAddress = async ({ userId, address }) =>
    {
        // Verify that the user exists.
        const user = await userRepository.findById(userId);

        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'The requested user profile does not exist on this server.'
            });
        }

        // Persist the address.
        const updatedUser = await userRepository.addAddress({
            userId,
            address,
        });

        return mapUser(updatedUser);
    };

    /**
 * Updates one of the authenticated user's saved addresses.
 */
    const updateUserAddress = async ({
        userId,
        addressId,
        address,
    }) =>
    {
        const updatedUser = await userRepository.updateAddress({
            userId,
            addressId,
            address,
        });

        if (!updatedUser)
        {
            throw createApiError({
                statusCode: 404,
                code: "ADDRESS_NOT_FOUND",
                message: "Address not found.",
            });
        }

        return mapUser(updatedUser);
    };


    /**
 * Deletes one of the authenticated user's saved addresses.
 */
    const deleteUserAddress = async ({
        userId,
        addressId,
    }) =>
    {
        const updatedUser = await userRepository.deleteAddress({
            userId,
            addressId,
        });

        if (!updatedUser)
        {
            throw createApiError({
                statusCode: 404,
                code: "ADDRESS_NOT_FOUND",
                message: "Address not found.",
            });
        }

        return mapUser(updatedUser);
    };

    /**
 * Sets one of the authenticated user's saved addresses as the default address.
 */
    const setDefaultUserAddress = async ({
        userId,
        addressId,
    }) =>
    {
        const updatedUser = await userRepository.setDefaultAddress({
            userId,
            addressId,
        });

        if (!updatedUser)
        {
            throw createApiError({
                statusCode: 404,
                code: "ADDRESS_NOT_FOUND",
                message: "Address not found.",
            });
        }

        return mapUser(updatedUser);
    };

    /**
     * Uploads a new profile image, replaces any previous image, and returns the updated user.
     * Works for ALL roles: Customer, Seller, Admin.
     */
    const updateProfileImage = async ({ userId, fileBuffer }) =>
    {
        const user = await userRepository.findById(userId);

        if (!user)
        {
            throw createApiError({
                statusCode: 404,
                code: 'USER_NOT_FOUND',
                message: 'The requested user profile does not exist on this server.'
            });
        }

        // 1. Delete previous Cloudinary image if exists.
        if (user.profileImageId)
        {
            try
            {
                await cloudinaryClient.deleteImage(user.profileImageId);
            }
            catch (err)
            {
                console.error('[PROFILE_IMAGE] Failed to delete previous Cloudinary image:', err.message);
            }
        }

        // 2. Upload new image to Cloudinary.
        const uploaded = await cloudinaryClient.uploadImageBuffer(
            fileBuffer,
            'AI_knots_Commerce/user-avatars'
        );

        // 3. Save new image URL and public ID.
        const updatedUser = await userRepository.updateProfileImage({
            userId,
            profileImage: uploaded.secureUrl,
            profileImageId: uploaded.publicId,
        });

        return mapUser(updatedUser);
    };

    return Object.freeze({
        getUserProfile,
        addAddress,
        updateUserAddress,
        deleteUserAddress,
        setDefaultUserAddress,
        updateProfileImage,
    });
};