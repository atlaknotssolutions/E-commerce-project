import React, { useEffect } from 'react';
import { Typography, Box, Link } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PolicyLayout from '../../components/Legal/PolicyLayout';
import PolicySection from '../../components/Legal/PolicySection';
import branding from '../../../Config/branding';

const toc = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use-information', title: 'How We Use Information' },
  { id: 'sharing-information', title: 'Sharing Information' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'user-rights', title: 'Your Rights' },
  { id: 'account-deletion', title: 'Account Deletion' },
  { id: 'children-privacy', title: "Children's Privacy" },
  { id: 'international-transfers', title: 'International Transfers' },
  { id: 'changes-to-policy', title: 'Changes to This Policy' },
  { id: 'contact-information', title: 'Contact Us' },
];

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | ' + branding.appName;
  }, []);

  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Your privacy is important to us"
      lastUpdated="July 2026"
      toc={toc}
    >
      {/* Introduction */}
      <PolicySection id="introduction" title="Introduction" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          {branding.appName} ("we", "our", "us") operates the marketplace platform accessible
          through our website and mobile applications. This privacy policy explains how we collect,
          use, disclose, and safeguard your information when you use our marketplace, including
          when you browse, purchase, or sell products.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          By accessing or using our platform, you agree to the collection and use of information
          in accordance with this policy. We are committed to protecting your personal data and
          respecting your privacy in compliance with applicable data protection laws, including the
          General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA),
          and other relevant legislation.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          We encourage you to read this policy in full. If you do not agree with our practices,
          please discontinue use of our platform. For questions, contact us at{' '}
          <Link href={`mailto:${branding.supportEmail}`} sx={{ color: '#00927c' }}>
            {branding.supportEmail}
          </Link>.
        </Typography>
      </PolicySection>

      {/* Information We Collect */}
      <PolicySection id="information-we-collect" title="Information We Collect" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          We collect various categories of information to provide and improve our marketplace
          services. The types of data we gather include:
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Personal Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          When you create an account or place an order, we collect personally identifiable
          information including your full name, email address, phone number, and shipping and
          billing addresses. This information is necessary to fulfill orders, communicate with
          you, and provide customer support.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Account Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Your account profile may include a username, encrypted password, profile picture, and
          account preferences such as notification settings, language, and currency. Passwords
          are stored using industry-standard hashing algorithms and are never accessible in plain
          text.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Order Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          When you make a purchase, we record details about the products purchased, your complete
          order history, delivery addresses, and payment confirmations. Order information is
          retained to provide order tracking, handle returns and refunds, and offer customer
          support.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Payment Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Payment card details are processed securely through certified third-party payment
          processors compliant with PCI DSS standards. We do not store your full credit card
          number, CVV, or expiration date on our servers. We retain a record of transaction
          history for order management, refund processing, and financial reporting purposes.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Usage Information
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          We automatically collect certain data when you interact with our platform, including
          pages viewed, search queries, click patterns, items added to your cart, session
          duration, device information (model, operating system), IP address, browser type and
          version, and referring URLs. This information helps us optimize platform performance
          and user experience.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Cookies and Tracking Technologies
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          We use cookies and similar tracking technologies to maintain your session, authenticate
          your identity, store your preferences, and analyze usage patterns. For comprehensive
          details on the specific cookies we use and how to manage them, please refer to our{' '}
          <Link href="/cookie-policy" sx={{ color: '#00927c' }}>
            Cookie Policy
          </Link>.
        </Typography>
      </PolicySection>

      {/* How We Use Information */}
      <PolicySection id="how-we-use-information" title="How We Use Information" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          We use the information we collect for the following purposes:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
          {[
            'Processing and fulfilling your orders, including shipping, delivery, and return management',
            'Creating and managing your marketplace account, including authentication and profile customization',
            'Providing customer support, responding to inquiries, and resolving disputes',
            'Detecting and preventing fraudulent activity, unauthorized access, and other harmful behaviors',
            'Sending marketing communications and promotional offers, only with your explicit consent and in accordance with applicable law',
            'Analyzing platform usage trends and user behavior to improve our services, features, and user experience',
            'Complying with legal obligations, enforcing our terms of service, and responding to lawful requests from authorities',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </PolicySection>

      {/* Sharing Information */}
      <PolicySection id="sharing-information" title="Sharing Information">
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          We do not sell your personal data to third parties. We share your information only in
          the following limited circumstances:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 2 }}>
          {[
            'Delivery Partners — We share your name, shipping address, and contact number with courier and logistics providers to fulfill and deliver your orders.',
            'Payment Processors — Payment details are transmitted to certified payment processing services to complete transactions securely.',
            'Sellers — When you purchase from a seller on our marketplace, we share your order details (name, shipping address, and item information) solely to enable order fulfillment.',
            'Analytics Providers — We share anonymized, aggregated usage data with analytics services to help us understand platform trends and improve our services.',
            'Law Enforcement — We may disclose information when legally required, such as in response to a valid subpoena, court order, or other governmental request.',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          All third-party service providers are contractually obligated to protect your data and
          use it only for the purposes we specify.
        </Typography>
      </PolicySection>

      {/* Data Security */}
      <PolicySection id="data-security" title="Data Security">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          We implement robust technical and organizational safeguards to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 1.5 }}>
          {[
            'End-to-end encryption (TLS 1.3) for all data transmitted between your device and our servers',
            'Role-based access controls ensuring only authorized personnel can access personal data on a need-to-know basis',
            'Regular security audits, vulnerability assessments, and penetration testing conducted by independent firms',
            'PCI DSS Level 1 compliance for all payment processing operations',
            'Secure server infrastructure with firewalls, intrusion detection systems, and real-time monitoring',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          While we strive to use commercially acceptable means to protect your data, no method of
          electronic transmission or storage is completely secure. We continuously evaluate and
          enhance our security practices to address emerging threats.
        </Typography>
      </PolicySection>

      {/* Data Retention */}
      <PolicySection id="data-retention" title="Data Retention">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          We retain your personal information only for as long as necessary to fulfill the
          purposes outlined in this policy, unless a longer retention period is required or
          permitted by law:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 1.5 }}>
          {[
            'Account Data — Retained for the duration your account remains active. Upon account deletion, personal data is retained for up to 3 years to support any outstanding orders, disputes, or legal claims.',
            'Order Data — Transaction records, invoices, and order details are retained for 7 years to comply with tax regulations, financial reporting requirements, and applicable legal obligations.',
            'Cookie Data — Retention periods vary by cookie type as described in our Cookie Policy. Session cookies expire when you close your browser; persistent cookies may remain for up to 24 months.',
            'Marketing Data — Consent records and marketing preferences are retained until you withdraw consent or unsubscribe from communications.',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Once the retention period expires, data is securely deleted or anonymized so that it can
          no longer be associated with you.
        </Typography>
      </PolicySection>

      {/* User Rights */}
      <PolicySection id="user-rights" title="Your Rights" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Depending on your jurisdiction, you may have the following rights regarding your personal
          data:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 2 }}>
          {[
            'Right of Access — You may request a copy of the personal data we hold about you.',
            'Right to Rectification — You may request correction of inaccurate or incomplete data.',
            'Right to Erasure — You may request deletion of your personal data, subject to legal retention obligations.',
            'Right to Data Portability — You may request your data in a structured, commonly used, machine-readable format.',
            'Right to Opt-Out of Marketing — You may unsubscribe from marketing emails at any time using the link in the email or through your account settings.',
            'Right to Object — You may object to the processing of your data for specific purposes, including profiling and direct marketing.',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          To exercise any of these rights, please contact us at{' '}
          <Link href={`mailto:${branding.supportEmail}`} sx={{ color: '#00927c' }}>
            {branding.supportEmail}
          </Link>
          . We will respond to your request within 30 days.
        </Typography>
      </PolicySection>

      {/* Account Deletion */}
      <PolicySection id="account-deletion" title="Account Deletion">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          You have the right to delete your marketplace account at any time. You can initiate
          account deletion through the following methods:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 1.5 }}>
          {[
            'Navigate to Account Settings > Privacy > Delete Account and follow the confirmation steps.',
            'Send an account deletion request to our support team at ' + branding.supportEmail + '.',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          We process all account deletion requests within 30 days. During this period, your account
          will be deactivated and you will be unable to access marketplace features. Upon
          completion, your personal data is permanently deleted or anonymized, except where
          retention is required by law (such as order and financial records).
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Please note that deleting your account does not cancel any pending orders. Unfulfilled
          orders will be processed in accordance with our terms of service, and relevant data will
          be retained until the order is completed or canceled.
        </Typography>
      </PolicySection>

      {/* Children's Privacy */}
      <PolicySection id="children-privacy" title="Children's Privacy">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Our marketplace is not intended for use by children under the age of 13. We do not
          knowingly collect, solicit, or maintain personal information from children under 13
          years of age. If we become aware that we have inadvertently collected personal data from
          a child under 13, we will take immediate steps to delete such information from our
          records.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          If you are a parent or guardian and believe that your child has provided us with personal
          information, please contact us immediately at{' '}
          <Link href={`mailto:${branding.supportEmail}`} sx={{ color: '#00927c' }}>
            {branding.supportEmail}
          </Link>
          . We will promptly investigate and remove any such information.
        </Typography>
      </PolicySection>

      {/* International Transfers */}
      <PolicySection id="international-transfers" title="International Transfers">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Your personal data may be transferred to and processed in countries other than your
          country of residence, including countries that may not provide the same level of data
          protection. These transfers occur when our servers, service providers, or partners are
          located in different jurisdictions.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          When we transfer data across borders, we implement appropriate safeguards to ensure your
          information receives adequate protection, including:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 1.5 }}>
          {[
            'Standard contractual clauses approved by relevant data protection authorities',
            'Binding corporate rules where applicable',
            'Encryption of data in transit and at rest',
            'Contracts with third-party processors requiring compliance with applicable data protection laws',
          ].map((text, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                mb: 1.5,
                color: '#4a5568',
                lineHeight: 1.7,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircleIcon sx={{ color: '#00927c', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </PolicySection>

      {/* Changes to Policy */}
      <PolicySection id="changes-to-policy" title="Changes to This Policy">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          We reserve the right to update or modify this privacy policy at any time. When we make
          material changes, we will notify you by email and/or by posting a prominent notice on
          our platform prior to the changes taking effect. The "Last Updated" date at the top of
          this page reflects the most recent revision.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Your continued use of the marketplace after any changes to this policy constitutes your
          acceptance of the updated terms. We encourage you to review this policy periodically to
          stay informed about how we protect your data.
        </Typography>
      </PolicySection>

      {/* Contact Information */}
      <PolicySection id="contact-information" title="Contact Us">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          If you have any questions, concerns, or requests regarding this privacy policy or our
          data practices, please contact us:
        </Typography>
        <Box sx={{ ml: 2, mb: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#4a5568', mb: 0.5 }}>
            <strong>Email:</strong>{' '}
            <Link href={`mailto:${branding.supportEmail}`} sx={{ color: '#00927c' }}>
              {branding.supportEmail}
            </Link>
          </Typography>
          {branding.supportPhone && (
            <Typography variant="body2" sx={{ color: '#4a5568', mb: 0.5 }}>
              <strong>Phone:</strong> {branding.supportPhone}
            </Typography>
          )}
          {branding.address && (
            <Typography variant="body2" sx={{ color: '#4a5568' }}>
              <strong>Address:</strong> {branding.address}
            </Typography>
          )}
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Our data protection team will review and respond to your inquiry within 30 days.
        </Typography>
      </PolicySection>
    </PolicyLayout>
  );
};

export default PrivacyPolicy;
