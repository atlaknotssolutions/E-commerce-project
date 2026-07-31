export const createCouponAssignmentRepository = ({ CouponAssignment }) =>
{
    const create = async (data, options = {}) =>
    {
        const [assignment] = await CouponAssignment.create([data], options);
        return assignment ? assignment.toObject() : null;
    };

    const findById = async (id, options = {}) =>
    {
        return CouponAssignment.findById(id, null, options);
    };

    const findByUserAndStatus = async ({ userId, status }, options = {}) =>
    {
        return CouponAssignment.find({ userId, status }, null, options)
            .populate('couponId')
            .sort({ assignedAt: -1 });
    };

    const findActiveByUser = async (userId, options = {}) =>
    {
        return CouponAssignment.find(
            { userId, status: { $in: ['ASSIGNED', 'CLAIMED'] } },
            null,
            options
        )
            .populate('couponId')
            .sort({ assignedAt: -1 });
    };

    const findByUserAndCoupon = async ({ userId, couponId, trigger }, options = {}) =>
    {
        return CouponAssignment.findOne({ userId, couponId, trigger }, null, options);
    };

    const claimAssignment = async ({ id, userId }, options = {}) =>
    {
        return CouponAssignment.findOneAndUpdate(
            { _id: id, userId, status: 'ASSIGNED' },
            { $set: { status: 'CLAIMED', claimedAt: new Date() } },
            { new: true, ...options }
        ).populate('couponId');
    };

    const expireAssignments = async (options = {}) =>
    {
        const now = new Date();
        return CouponAssignment.updateMany(
            { status: 'ASSIGNED', expiresAt: { $lt: now } },
            { $set: { status: 'EXPIRED' } },
            options
        );
    };

    const markAsUsed = async ({ assignmentId, userId }, options = {}) =>
    {
        return CouponAssignment.findOneAndUpdate(
            { _id: assignmentId, userId },
            { $set: { status: 'USED' } },
            { new: true, ...options }
        );
    };

    const findExpiredAssignments = async (options = {}) =>
    {
        const now = new Date();
        return CouponAssignment.find(
            { status: 'ASSIGNED', expiresAt: { $lt: now } },
            null,
            options
        );
    };

    const countByUserAndStatus = async ({ userId, status }, options = {}) =>
    {
        return CouponAssignment.countDocuments({ userId, status }, options);
    };

    return Object.freeze({
        create,
        findById,
        findByUserAndStatus,
        findActiveByUser,
        findByUserAndCoupon,
        claimAssignment,
        expireAssignments,
        markAsUsed,
        findExpiredAssignments,
        countByUserAndStatus,
    });
};
