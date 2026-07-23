
import nodemailer from 'nodemailer';
import branding from '../../config/branding.js';

/**
 * Pure function-based factory establishing secure Email Delivery Integration Adapters.
 * Integrates an advanced Fault-Tolerant Console fallback for local development pipelines.
 */
export const createEmailClient = ({ smtpHost, smtpPort, smtpUser, smtpPass, emailFrom }) =>
{

    // Smart evaluation: Detects if credentials are set to default developmental mock values
    const isMockMode =
        !smtpUser ||
        smtpUser.includes('mock') ||
        !smtpPass ||
        smtpPass.includes('mock-pass') ||
        process.env.NODE_ENV === 'test';

    let transporter = null;

    // Real SMTP connection transporter compile only if valid configurations exist
    if (!isMockMode)
    {
        try
        {
            transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: Number(smtpPort) === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            transporter
                .verify()
                .then(() =>
                {
                    console.log('✅ SMTP connection established.');
                })
                .catch((error) =>
                {
                    console.warn('⚠️ SMTP connection failed:', error.message);
                    transporter = null;
                });
        }
        catch (error)
        {
            console.warn('⚠️ Failed to create SMTP transporter:', error.message);
            transporter = null;
        }
    }

    /**
     * Transmits security codes directly to inbox (production) or redirects to standard server console (local dev).
     */
    // const sendOTPEmail = async ({ toEmail, otp }) =>
    const sendEmail = async ({
        toEmail,

        recipientName = 'User',

        title = 'Verify Your Email',

        subject = `${branding.appName} • Verify Your Email`,

        message = `
Welcome to <strong>${branding.appName}</strong>.

Please verify your email address.

You can either use the OTP below or click the button to continue.
`,

        otp = null,

        buttonText = 'Verify My Email',

        verificationLink = null,

        showVerificationButton = false,

        footerNote = `
This verification code is valid for 10 minutes.

Please do not share this code with anyone.
`,

        otpExpiryText = 'This One-Time Password is valid for 10 minutes.',
    }) =>
    {

        // Developer Fallback Interface (Saves local runs from crashing)
        if (isMockMode || !transporter)
        {
            console.log('\n========================================================================');
            console.log(`[DEVELOPMENT SECURITY MAIL MONITOR] Redirecting SMTP dispatch...`);
            console.log(`Recipient Destination : ${toEmail}`);
            console.log(`Secure Code (OTP)     : ${otp}`);
            if (verificationLink)
            {
                console.log(`Verification Link   : ${verificationLink}`);
            }
            console.log('========================================================================\n');

            return {
                messageId: `mock-trans-id-${Date.now()}`,
                isMockMode: true
            };
        }


        const appName = process.env.APP_NAME?.trim() || branding.appName;

        const emailFromName = process.env.EMAIL_FROM_NAME?.trim() || appName;

        const supportEmail =
            process.env.EMAIL_SUPPORT?.trim() || branding.supportEmail;

        // HTML mail design visual setups (Branded under ${process.env.APP_NAME})
        const htmlEmailContent = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:30px;">

    <!-- Header -->
    <div style="text-align:center;border-bottom:2px solid #2563eb;padding-bottom:18px;margin-bottom:28px;">
        <h2 style="margin:0;color:#1e3a8a;font-size:26px;font-weight:bold;">
            ${appName}
        </h2>
    </div>

    <!-- Greeting -->
    <p style="font-size:16px;color:#334155;margin-bottom:12px;">
        Hello <strong>${recipientName}</strong>,
    </p>

    <!-- Dynamic Title -->
    <h3
        style="
            margin:0 0 18px 0;
            color:#1e293b;
            font-size:22px;
            font-weight:600;
            text-align:center;
        "
    >
        ${title}
    </h3>

    <!-- Dynamic Message -->
    <div
        style="
            font-size:15px;
            color:#475569;
            line-height:1.8;
            margin-bottom:25px;
        "
    >
        ${message}
    </div>

    <!-- OTP -->
    ${otp
                ? `
    <div
        style="
            background:#f8fafc;
            border:2px dashed #3b82f6;
            border-radius:8px;
            padding:22px;
            text-align:center;
            margin:30px 0;
        "
    >
        <div
            style="
                font-size:34px;
                letter-spacing:8px;
                color:#1e3a8a;
                font-weight:bold;
                font-family:'Courier New',monospace;
            "
        >
            ${otp}
        </div>

        <div
            style="
                margin-top:10px;
                font-size:13px;
                color:#64748b;
            "
        >
           ${otpExpiryText}
        </div>
    </div>
`
                : ''
            }

    <!-- Verify Button -->
    ${showVerificationButton && verificationLink
                ? `
    <div style="text-align:center;margin:35px 0;">
        <a
            href="${verificationLink}"
            style="
                background:#2563eb;
                color:#ffffff;
                text-decoration:none;
                padding:15px 34px;
                border-radius:8px;
                display:inline-block;
                font-weight:600;
                font-size:15px;
            "
        >
            ${buttonText}
        </a>
    </div>

    <p
        style="
            text-align:center;
            font-size:13px;
            color:#64748b;
            line-height:1.6;
        "
    >
        If the button doesn't work, copy and paste the following URL into your browser:
        <br><br>

        <span
            style="
                color:#2563eb;
                word-break:break-all;
            "
        >
            ${verificationLink}
        </span>
    </p>
`
                : ''
            }

    

    <div
    style="
        background:#fff7ed;
        border-left:4px solid #f59e0b;
        padding:16px;
        margin-top:30px;
        font-size:13px;
        color:#92400e;
        line-height:1.7;"
        >
    ${footerNote}
    </div>

    <!-- Footer -->
    <div
        style="
            border-top:1px solid #e2e8f0;
            margin-top:35px;
            padding-top:22px;
            text-align:center;
        "
    >
        <p
            style="
                font-size:13px;
                color:#64748b;
                margin-bottom:10px;
            "
        >
            Need help?
            <a
                href="mailto:${supportEmail}"
                style="
                    color:#2563eb;
                    text-decoration:none;
                "
            >
                ${supportEmail}
            </a>
        </p>

        <p
            style="
                font-size:11px;
                color:#94a3b8;
                line-height:1.7;
                margin:0;
            "
        >
            This is an automated email from
            <strong>${appName}</strong>.
            <br>
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
    </div>

</div>
`;


        const mailOptions = {
            from: `"${emailFromName}" <${emailFrom}>`,
            to: toEmail,
            subject,
            html: htmlEmailContent,
        };

        return transporter.sendMail(mailOptions);
    };

    return Object.freeze({
        sendEmail,
    });
};