/**
 * Maps an Address subdocument into a frontend-friendly DTO.
 */
export const mapAddress = (address) => {
    if (!address) return null;

    return {
        id: address._id?.toString(),
        name: address.name,
        mobile: address.mobile,
        address: address.streetAddress,
        locality: address.locality,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        isDefault: address.isDefault,
    };
};

/**
 * Maps a User document into a frontend-friendly DTO.
 */
export const mapUser = (user) => {
    if (!user) return null;

    return {
        id: user._id?.toString(),
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage ?? null,
        addresses: (user.addresses || []).map(mapAddress),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};