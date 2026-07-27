/**
 * Pure function-based factory for the Notification Preference Persistence layer.
 * Manages per-user notification channel opt-in/out and quiet-hours configuration.
 */
export const createNotificationPreferenceRepository = ({ NotificationPreference }) =>
{
  const findByUser = async (userId, options = {}) =>
  {
    return NotificationPreference.findOne({ user: userId }, null, options).lean();
  };

  const findOrCreateByUser = async (userId, options = {}) =>
  {
    let pref = await NotificationPreference.findOne({ user: userId }, null, options).lean();
    if (!pref)
    {
      const [created] = await NotificationPreference.create(
        [{ user: userId }],
        options
      );
      pref = created ? created.toObject() : null;
    }
    return pref;
  };

  const upsertByUser = async (userId, updateData, options = {}) =>
  {
    return NotificationPreference.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { ...options, new: true, upsert: true, runValidators: true }
    ).lean();
  };

  const deleteByUser = async (userId, options = {}) =>
  {
    return NotificationPreference.findOneAndDelete({ user: userId }, options).lean();
  };

  return Object.freeze({
    findByUser,
    findOrCreateByUser,
    upsertByUser,
    deleteByUser,
  });
};
