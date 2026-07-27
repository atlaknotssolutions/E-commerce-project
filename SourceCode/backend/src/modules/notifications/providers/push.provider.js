/**
 * Pure function-based factory for the Push notification channel provider (mock).
 * In production, replace with Firebase Cloud Messaging (FCM) or OneSignal integration.
 */
export const createPushProvider = () =>
{
  const send = async ({ recipientId, title, body, metadata = {} }) =>
  {
    if (!recipientId)
    {
      return { success: false, channel: 'PUSH', error: 'No recipient ID provided' };
    }

    console.log(`[PUSH MOCK] To: ${recipientId} | Title: ${title} | Body: ${body}`);

    return {
      success: true,
      channel: 'PUSH',
      messageId: `mock-push-${Date.now()}`,
      isMock: true,
    };
  };

  return Object.freeze({ send });
};
