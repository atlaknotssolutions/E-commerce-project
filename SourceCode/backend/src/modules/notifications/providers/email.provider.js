/**
 * Pure function-based factory for the Email notification channel provider.
 * Wraps the existing emailClient (nodemailer) for email delivery.
 */
export const createEmailProvider = ({ emailClient }) =>
{
  const send = async ({ recipientEmail, recipientName, title, body, subject, metadata = {} }) =>
  {
    if (!recipientEmail)
    {
      return { success: false, channel: 'EMAIL', error: 'No recipient email provided' };
    }

    try
    {
      const result = await emailClient.sendEmail({
        toEmail: recipientEmail,
        recipientName: recipientName || 'User',
        title: title || 'Notification',
        subject: subject || `${title || 'Notification'}`,
        message: body,
        footerNote: 'This is an automated notification from the platform.',
      });

      return {
        success: true,
        channel: 'EMAIL',
        messageId: result?.messageId || null,
      };
    }
    catch (error)
    {
      return { success: false, channel: 'EMAIL', error: error.message };
    }
  };

  return Object.freeze({ send });
};
