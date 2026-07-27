/**
 * Pure function-based factory for the Notification Channel Provider Factory.
 * Resolves the appropriate channel provider by channel key.
 */
export const createNotificationChannelFactory = ({ inAppProvider, emailProvider, smsProvider, pushProvider }) =>
{
  const providers = Object.freeze({
    IN_APP: inAppProvider,
    EMAIL: emailProvider,
    SMS: smsProvider,
    PUSH: pushProvider,
  });

  const getProvider = (channel) =>
  {
    const provider = providers[channel];
    if (!provider)
    {
      throw new Error(`Unsupported notification channel: ${channel}`);
    }
    return provider;
  };

  const send = async (channel, payload) =>
  {
    const provider = getProvider(channel);
    return provider.send(payload);
  };

  return Object.freeze({ getProvider, send });
};
