/**
 * Pure mapper functions for the Admin User Management module.
 * Transforms raw MongoDB documents into frontend-friendly DTO shapes.
 * Detects document type (User vs Seller) and maps accordingly.
 */

/**
 * Maps an Address subdocument into a frontend-friendly DTO.
 */
const mapAddress = (address) =>
{
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
 * Maps a User document (Customer/Admin) into an AdminUser DTO.
 */
const mapUserDocument = (doc) =>
{
    if (!doc) return null;

    return {
        id: doc._id?.toString(),
        fullName: doc.fullName,
        email: doc.email,
        mobile: doc.mobile || null,
        role: doc.role,
        profileImage: doc.profileImage ?? null,
        sellerId: null,
        businessName: null,
        gstNumber: null,
        accountStatus: null,
        isEmailVerified: null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};

/**
 * Maps a Seller document into an AdminUser DTO.
 * Seller documents use different field names (sellerName vs fullName, etc.).
 */
const mapSellerDocument = (doc) =>
{
    if (!doc) return null;

    return {
        id: doc._id?.toString(),
        fullName: doc.sellerName,
        email: doc.email,
        mobile: doc.mobile || null,
        role: 'ROLE_SELLER',
        profileImage: doc.avatar ?? null,
        sellerId: doc._id?.toString(),
        businessName: doc.businessDetails?.businessName || null,
        gstNumber: doc.businessDetails?.GSTIN || null,
        accountStatus: doc.accountStatus || null,
        isEmailVerified: doc.isEmailVerified ?? false,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};

/**
 * Detects document type and maps to AdminUser DTO.
 * User documents have `fullName`; Seller documents have `sellerName`.
 */
export const mapAdminUser = (doc) =>
{
    if (!doc) return null;

    const isSellerDoc = 'sellerName' in doc || 'businessDetails' in doc;

    return isSellerDoc ? mapSellerDocument(doc) : mapUserDocument(doc);
};

/**
 * Maps an array of mixed User/Seller documents into AdminUser DTOs.
 */
export const mapAdminUsers = (docs) =>
{
    if (!Array.isArray(docs)) return [];
    return docs.map(mapAdminUser).filter(Boolean);
};
