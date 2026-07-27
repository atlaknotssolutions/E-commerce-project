/**
 * Pure function-based factory for the SMS notification channel provider (mock).
 * In production, replace with Twilio, MSG91, or similar SMS gateway integration.
 */
export const createSmsProvider = () =>
{
  const send = async ({ recipientPhone, body, metadata = {} }) =>
  {
    if (!recipientPhone)
    {
      return { success: false, channel: 'SMS', error: 'No recipient phone provided' };
    }

    console.log(`[SMS MOCK] To: ${recipientPhone} | Body: ${body}`);

    return {
      success: true,
      channel: 'SMS',
      messageId: `mock-sms-${Date.now()}`,
      isMock: true,
    };
  };

  return Object.freeze({ send });
};
