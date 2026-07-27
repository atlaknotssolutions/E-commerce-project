/**
 * Pure function-based factory for the Notification Dispatcher.
 * Orchestrates channel resolution, template rendering, provider dispatch,
 * preference checking, and delivery history persistence.
 */
export const createNotificationDispatcher = ({
  notificationChannelFactory,
  notificationTemplateRepository,
  notificationPreferenceRepository,
  notificationRepository,
  userRepository,
  User,
  templateRenderer,
  createApiError,
}) =>
{
  const resolveChannels = async ({ recipientId, requestedChannels }) =>
  {
    const preferences = await notificationPreferenceRepository.findOrCreateByUser(recipientId);
    if (!preferences) return requestedChannels;

    const resolved = {};
    for (const channel of requestedChannels)
    {
      const channelKey = channel.toLowerCase();
      if (preferences.mutedTypes && preferences.mutedTypes.includes(channel))
      {
        resolved[channel] = false;
        continue;
      }
      if (preferences.quietHours && preferences.quietHours.enabled)
      {
        const now = new Date();
        const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
        const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (startMinutes > endMinutes)
        {
          if (currentMinutes >= startMinutes || currentMinutes < endMinutes)
          {
            resolved[channel] = channel === 'IN_APP' ? true : false;
            continue;
          }
        }
        else if (currentMinutes >= startMinutes && currentMinutes < endMinutes)
        {
          resolved[channel] = channel === 'IN_APP' ? true : false;
          continue;
        }
      }
      resolved[channel] = preferences.channels[channelKey] !== false;
    }
    return resolved;
  };

  const dispatch = async ({ recipientId, recipientEmail, recipientPhone, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', recipientRole = null, createdBy = null }) =>
  {
    let renderedTitle = title;
    let renderedBody = body;

    if (templateName)
    {
      const template = await notificationTemplateRepository.findByName(templateName);
      if (template)
      {
        const rendered = templateRenderer.renderChannelContent(template.channelContent, variables);
        if (rendered.inApp)
        {
          renderedTitle = rendered.inApp.title || renderedTitle;
          renderedBody = rendered.inApp.body || renderedBody;
        }
      }
    }

    const channelList = Array.isArray(channels) ? channels : ['IN_APP'];
    const resolvedChannels = await resolveChannels({ recipientId, requestedChannels: channelList });

    const notificationRecord = await notificationRepository.createNotification({
      customer: recipientId,
      recipient: recipientId,
      recipientRole,
      message: renderedBody,
      title: renderedTitle,
      type: type || 'GENERIC',
      priority,
      status: 'SENT',
      channels: {
        inApp: resolvedChannels.IN_APP || false,
        email: resolvedChannels.EMAIL || false,
        sms: resolvedChannels.SMS || false,
        push: resolvedChannels.PUSH || false,
      },
      metadata,
      template: templateName ? { name: templateName, variables } : undefined,
      readStatus: false,
      sentAt: new Date(),
      createdBy,
      channelHistory: [],
    });

    const results = [];

    for (const [channelKey, enabled] of Object.entries(resolvedChannels))
    {
      if (!enabled) continue;

      const payload = { recipientId, recipientEmail, recipientPhone, title: renderedTitle, body: renderedBody, metadata, subject: renderedTitle };
      const result = await notificationChannelFactory.send(channelKey, payload);

      results.push(result);

      const historyEntry = {
        channel: channelKey,
        status: result.success ? 'DELIVERED' : 'FAILED',
        sentAt: new Date(),
        deliveredAt: result.success ? new Date() : undefined,
        error: result.error || undefined,
      };
      await notificationRepository.updateStatus({
        id: notificationRecord._id,
        status: result.success ? 'DELIVERED' : 'FAILED',
        channelHistoryEntry: historyEntry,
      });
    }

    return { notification: notificationRecord, channelResults: results };
  };

  const dispatchBulk = async ({ recipientIds, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', createdBy = null }) =>
  {
    const results = [];
    for (const recipientId of recipientIds)
    {
      try
      {
        const result = await dispatch({
          recipientId,
          type,
          title,
          body,
          channels,
          templateName,
          variables,
          metadata,
          priority,
          createdBy,
        });
        results.push({ recipientId, success: true, ...result });
      }
      catch (error)
      {
        results.push({ recipientId, success: false, error: error.message });
      }
    }
    return results;
  };

  const dispatchToRole = async ({ role, type, title, body, channels, templateName, variables = {}, metadata = {}, priority = 'MEDIUM', createdBy = null }) =>
  {
    const recipients = await User.find({ role }).select('_id').lean();
    const recipientIds = recipients.map(r => r._id);

    if (!recipientIds.length) return { results: [], totalRecipients: 0 };

    const results = await dispatchBulk({
      recipientIds,
      type,
      title,
      body,
      channels,
      templateName,
      variables,
      metadata,
      priority,
      createdBy,
    });

    return { results, totalRecipients: recipientIds.length };
  };

  return Object.freeze({ dispatch, dispatchBulk, dispatchToRole, resolveChannels });
};
