/**
 * Pure function-based factory representing the Customer Users HTTP API Controllers.
 * Strictly enforces thin controller design principles, avoiding classes and context leaks.
 */
export const createUserController = ({ userService, createApiError }) =>
{

    /**
     * Retrieves authenticated customer's own account profile.
     * Maps exactly to: GET /api/users/profile (Authentication required)
     */
    const getUserProfile = async (req, res) =>
    {
        // Standard secure claims extraction: Pulls user identity ID directly from decoded Bearer claims
        const userId = req.user.id;

        const profile = await userService.getUserProfile({ userId });

        // 200 OK: Standard customer profile response payload delivery
        res.status(200).json(profile);
    };


    /**
 * Adds a new address to the authenticated user's address book.
 * Maps exactly to: POST /api/users/addresses
 */
    const addAddress = async (req, res) =>
    {
        const userId = req.user.id;

        const address = {
            name: req.body.name,
            mobile: req.body.mobile,
            streetAddress: req.body.address,
            locality: req.body.locality,
            city: req.body.city,
            state: req.body.state,
            pinCode: req.body.pinCode,
        };

        const updatedUser = await userService.addAddress({
            userId,
            address,
        });

        res.status(201).json(updatedUser);
    };



    /**
 * Updates one of the authenticated customer's saved addresses.
 * Maps exactly to:
 * PUT /api/users/address/:addressId
 */
    const updateUserAddress = async (req, res) =>
    {
        const userId = req.user.id;
        const { addressId } = req.params;

        const updatedUser = await userService.updateUserAddress({
            userId,
            addressId,
            address: req.body,
        });

        res.status(200).json(updatedUser);
    };

    /**
 * Deletes one of the authenticated customer's saved addresses.
 * Maps exactly to:
 * DELETE /api/users/address/:addressId
 */
    const deleteUserAddress = async (req, res) =>
    {
        const userId = req.user.id;
        const { addressId } = req.params;

        const updatedUser = await userService.deleteUserAddress({
            userId,
            addressId,
        });

        res.status(200).json(updatedUser);
    };

    /**
 * Sets one of the authenticated customer's saved addresses as the default address.
 * Maps exactly to:
 * PATCH /api/users/address/:addressId/default
 */
    const setDefaultUserAddress = async (req, res) =>
    {
        const userId = req.user.id;
        const { addressId } = req.params;

        const updatedUser = await userService.setDefaultUserAddress({
            userId,
            addressId,
        });

        res.status(200).json(updatedUser);
    };

    /**
     * Uploads or replaces the authenticated user's profile photo.
     * Maps exactly to: PUT /api/users/profile/photo (Authentication required)
     */
    const updateProfilePhoto = async (req, res) =>
    {
        const userId = req.user.id;
        const file = req.file;

        if (!file?.buffer)
        {
            throw createApiError({
                statusCode: 400,
                code: 'MISSING_UPLOAD_FILE',
                message: 'Upload failed: No image file found in the request payload.',
            });
        }

        const updatedProfile = await userService.updateProfileImage({
            userId,
            fileBuffer: file.buffer,
        });

        res.status(200).json(updatedProfile);
    };


    return Object.freeze({
        getUserProfile,
        addAddress,
        updateUserAddress,
        deleteUserAddress,
        setDefaultUserAddress,
        updateProfilePhoto,
    });
};