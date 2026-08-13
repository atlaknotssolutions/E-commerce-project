/**
 * Converts MongoDB Seller document
 * into frontend compatible Seller DTO.
 */
// export const mapSeller = (seller) =>
// {
//     if (!seller)
//     {
//         return null;
//     }

//     return {
//         id: seller._id.toString(),

//         sellerName: seller.sellerName,
//         email: seller.email,
//         mobile: seller.mobile,

//         gstin:
//             seller.gstin ??
//             seller.businessDetails?.GSTIN ??
//             "",

//         businessDetails: {
//             businessName:
//                 seller.businessDetails?.businessName ?? "",
//         },

//         pickupAddress: seller.pickupAddress
//             ? {
//                 name: seller.pickupAddress.name,
//                 mobile:
//                     seller.pickupAddress.mobile ??
//                     seller.mobile,

//                 pincode:
//                     seller.pickupAddress.pinCode ??
//                     seller.pickupAddress.pincode ??
//                     "",

//                 address:
//                     seller.pickupAddress.streetAddress ??
//                     seller.pickupAddress.address,

//                 locality:
//                     seller.pickupAddress.locality ?? "",

//                 city: seller.pickupAddress.city,
//                 state: seller.pickupAddress.state,
//             }
//             : null,

//         bankDetails: seller.bankDetails
//             ? {
//                 accountNumber: seller.bankDetails.accountNumber,
//                 ifscCode:
//                     seller.bankDetails.IFSC ??
//                     seller.bankDetails.ifscCode ??
//                     "",
//                 accountHolderName:
//                     seller.bankDetails.accountHolderName,
//             }
//             : null,

//         accountStatus: seller.accountStatus,
//         isEmailVerified: seller.isEmailVerified,

//         createdAt: seller.createdAt,
//         updatedAt: seller.updatedAt,
//     };
// };

export const mapSeller = (
    seller,
    { hideSensitive = false } = {}
) =>
{
    if (!seller)
    {
        return null;
    }

    return {
        id: seller._id.toString(),

        sellerName: seller.sellerName,
        email: seller.email,
        mobile: seller.mobile,
        avatar: seller.avatar ?? null,

        gstin:
            seller.gstin ??
            seller.businessDetails?.GSTIN ??
            "",

        businessDetails: {
            businessName:
                seller.businessDetails?.businessName ?? "",
        },

        pickupAddress: seller.pickupAddress
            ? {
                name: seller.pickupAddress.name,
                mobile:
                    seller.pickupAddress.mobile ?? "",
                pincode:
                    seller.pickupAddress.pinCode ??
                    seller.pickupAddress.pincode ??
                    "",
                address:
                    seller.pickupAddress.streetAddress ??
                    seller.pickupAddress.address,
                locality:
                    seller.pickupAddress.locality ?? "",
                city: seller.pickupAddress.city,
                state: seller.pickupAddress.state,
            }
            : null,

        bankDetails: seller.bankDetails
            ? {
                accountNumber: hideSensitive
                    ? null
                    : seller.bankDetails.accountNumber,

                ifscCode:
                    seller.bankDetails.IFSC ??
                    seller.bankDetails.ifscCode ??
                    "",

                accountHolderName:
                    seller.bankDetails.accountHolderName,
            }
            : null,

        accountStatus: seller.accountStatus,
        isEmailVerified: seller.isEmailVerified,

        createdAt: seller.createdAt,
        updatedAt: seller.updatedAt,
    };
};

export const mapSellerList = (sellers = []) =>
{
    return sellers.map(mapSeller);
};


/**
 * Converts frontend seller update payload
 * into MongoDB Seller schema compatible update object.
 */
export const mapSellerUpdatePayload = (
    existingSeller,
    payload
) =>
{
    const normalized = {};

    // ============================
    // Root Fields
    // ============================

    if (payload.sellerName !== undefined)
    {
        normalized.sellerName = payload.sellerName;
    }

    if (payload.mobile !== undefined)
    {
        normalized.mobile = payload.mobile;
    }

    if (payload.avatar !== undefined)
    {
        normalized.avatar = payload.avatar;
    }

    // ============================
    // Business Details
    // ============================

    if (
        payload.businessDetails ||
        payload.gstin
    )
    {
        normalized.businessDetails = {
            businessName:
                payload.businessDetails?.businessName ??
                existingSeller.businessDetails.businessName,

            GSTIN:
                payload.gstin ??
                payload.businessDetails?.GSTIN ??
                existingSeller.businessDetails.GSTIN,

            businessAddress:
                payload.businessDetails?.businessAddress ??
                existingSeller.businessDetails.businessAddress,
        };
    }

    // ============================
    // Pickup Address
    // ============================

    if (payload.pickupAddress)
    {
        const existingPickup = existingSeller.pickupAddress ?? {};

        normalized.pickupAddress = {
            streetAddress:
                payload.pickupAddress.address ??
                payload.pickupAddress.streetAddress ??
                existingPickup.streetAddress,

            city:
                payload.pickupAddress.city ??
                existingPickup.city,

            state:
                payload.pickupAddress.state ??
                existingPickup.state,

            pinCode:
                payload.pickupAddress.pinCode ??
                payload.pickupAddress.pincode ??
                existingPickup.pinCode,

            mobile:
                payload.pickupAddress.mobile ??
                existingPickup.mobile,
        };
    }

    // ============================
    // Bank Details
    // ============================

    if (payload.bankDetails)
    {
        normalized.bankDetails = {
            accountHolderName:
                payload.bankDetails.accountHolderName ??
                existingSeller.bankDetails.accountHolderName,

            accountNumber:
                payload.bankDetails.accountNumber ??
                existingSeller.bankDetails.accountNumber,

            IFSC:
                payload.bankDetails.ifscCode ??
                payload.bankDetails.IFSC ??
                existingSeller.bankDetails.IFSC,
        };
    }

    return normalized;
};