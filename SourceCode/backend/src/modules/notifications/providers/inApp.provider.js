/**
 * Pure function-based factory for the In-App notification channel provider.
 * Stores notifications directly in the database for real-time in-app retrieval.
 */
export const createInAppProvider = ({ notificationRepository }) =>
{
  const send = async ({ recipientId, title, body, metadata = {} }) =>
  {
    const notification = await notificationRepository.createNotification({
      customer: recipientId,
      recipient: recipientId,
      message: body,
      title,
      status: 'DELIVERED',
      channels: { inApp: true, email: false, sms: false, push: false },
      metadata,
      readStatus: false,
      sentAt: new Date(),
      deliveredAt: new Date(),
      channelHistory: [{
        channel: 'IN_APP',
        status: 'DELIVERED',
        sentAt: new Date(),
        deliveredAt: new Date(),
      }],
    });

    return { success: true, channel: 'IN_APP', notification };
  };

  return Object.freeze({ send });
};
