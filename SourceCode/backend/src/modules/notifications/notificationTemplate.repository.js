/**
 * Pure function-based factory for the Notification Template Persistence layer.
 * Manages CRUD operations for reusable multi-channel notification templates.
 */
export const createNotificationTemplateRepository = ({ NotificationTemplate }) =>
{
  const create = async (templateData, options = {}) =>
  {
    const [created] = await NotificationTemplate.create([templateData], options);
    return created ? created.toObject() : null;
  };

  const findById = async (id, options = {}) =>
  {
    return NotificationTemplate.findById(id, null, options).lean();
  };

  const findByName = async (name, options = {}) =>
  {
    return NotificationTemplate.findOne({ name }, null, options).lean();
  };

  const findByType = async (type, options = {}) =>
  {
    return NotificationTemplate.find({ type, isActive: true }, null, options)
      .sort({ createdAt: -1 })
      .lean();
  };

  const findAll = async ({ page = 1, limit = 50, isActive = null } = {}, options = {}) =>
  {
    const filter = {};
    if (isActive !== null) filter.isActive = isActive;

    const skip = (page - 1) * limit;
    const [templates, total] = await Promise.all([
      NotificationTemplate.find(filter, null, options)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationTemplate.countDocuments(filter),
    ]);

    return { templates, total, page, limit };
  };

  const updateById = async (id, updateData, options = {}) =>
  {
    return NotificationTemplate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { ...options, new: true, runValidators: true }
    ).lean();
  };

  const deleteById = async (id, options = {}) =>
  {
    return NotificationTemplate.findByIdAndDelete(id, options).lean();
  };

  return Object.freeze({
    create,
    findById,
    findByName,
    findByType,
    findAll,
    updateById,
    deleteById,
  });
};
