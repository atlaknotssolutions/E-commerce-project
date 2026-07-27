import React, { useEffect } from 'react';
import { Typography, Box, Link } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PolicyLayout from '../../components/Legal/PolicyLayout';
import PolicySection from '../../components/Legal/PolicySection';
import branding from '../../../Config/branding';

const toc = [
  { id: 'what-are-cookies', title: 'What Are Cookies' },
  { id: 'why-we-use-cookies', title: 'Why We Use Cookies' },
  { id: 'types-of-cookies', title: 'Types of Cookies' },
  { id: 'essential-cookies', title: 'Essential Cookies' },
  { id: 'analytics-cookies', title: 'Analytics Cookies' },
  { id: 'preference-cookies', title: 'Preference Cookies' },
  { id: 'marketing-cookies', title: 'Marketing Cookies' },
  { id: 'managing-cookies', title: 'Managing Cookies' },
  { id: 'third-party-cookies', title: 'Third-Party Cookies' },
  { id: 'changes-to-policy', title: 'Changes to This Policy' },
  { id: 'contact-information', title: 'Contact Us' },
];

const CookiePolicy = () => {
  useEffect(() => {
    document.title = 'Cookie Policy | ' + branding.appName;
  }, []);

  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle="How we use cookies"
      lastUpdated="July 2026"
      toc={toc}
    >
      {/* What Are Cookies */}
      <PolicySection id="what-are-cookies" title="What Are Cookies" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Cookies are small text files that are stored on your device (computer, tablet, or
          mobile) by your web browser when you visit a website. They are widely used to make
          websites work efficiently, provide a better browsing experience, and supply
          information to the website owners.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Cookies enable a website to recognize your device and remember certain information about
          your visit, such as your preferences, items in your shopping cart, and your browsing
          activity. They do not typically contain personally identifiable information directly, but
          they can be linked to other data we hold about you.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Cookies can be set by the website you are visiting ("first-party cookies") or by
          third-party services embedded in the website ("third-party cookies"). They can also
          be classified by their duration: "session cookies" are temporary and deleted when you
          close your browser, while "persistent cookies" remain on your device for a set period
          or until you manually delete them.
        </Typography>
      </PolicySection>

      {/* Why We Use Cookies */}
      <PolicySection id="why-we-use-cookies" title="Why We Use Cookies" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          We use cookies for several important purposes to ensure our marketplace functions
          properly and to enhance your experience:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
          {[
            'Authentication — Keeping you signed in and verifying your identity across pages so you do not need to re-enter credentials.',
            'Shopping Cart — Remembering items you have added to your cart, including quantities and selections, as you browse the marketplace.',
            'Analytics — Understanding how visitors interact with our platform, identifying popular pages, navigation patterns, and areas for improvement.',
            'Personalization — Remembering your preferences such as language, currency, and display settings to provide a tailored experience.',
            'Security — Detecting and preventing fraudulent activity, protecting your account, and ensuring the integrity of transactions.',
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

      {/* Types of Cookies */}
      <PolicySection id="types-of-cookies" title="Types of Cookies">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Cookies fall into two primary categories based on who sets them and how long they persist:
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Session Cookies
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Session cookies are temporary and exist only while your browser is open. They are
          automatically deleted when you close your browser. Session cookies are essential for
          maintaining your current browsing session, such as keeping you logged in as you
          navigate between pages.
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Persistent Cookies
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Persistent cookies remain on your device for a predetermined period or until you
          delete them manually. They help us recognize you when you return, remember your
          preferences, and provide a more personalized experience across visits.
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          First-Party Cookies
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          First-party cookies are set directly by {branding.appName} and can only be read by our
          platform. They are used for essential functionality, preferences, and analytics.
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#1a1a2e' }}>
          Third-Party Cookies
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Third-party cookies are set by external services embedded in our pages, such as
          analytics providers, payment processors, and advertising partners. These cookies
          enable those services to collect data about your browsing activity across websites.
        </Typography>
      </PolicySection>

      {/* Essential Cookies */}
      <PolicySection id="essential-cookies" title="Essential Cookies" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Essential cookies are strictly necessary for the marketplace to function correctly. They
          enable core features such as authentication, security, shopping cart functionality, and
          load balancing. Without these cookies, the platform cannot operate as intended.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Essential cookies include:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 2 }}>
          {[
            'Session management cookies that maintain your authenticated state across pages',
            'Security tokens that protect against cross-site request forgery (CSRF) and other attacks',
            'Load balancer cookies that distribute traffic across our servers for optimal performance',
            'Shopping cart cookies that preserve your selected items and quantities during a session',
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
          Because these cookies are required for the platform to work, they cannot be disabled
          through our cookie preference tool. Disabling them via browser settings will prevent you
          from using key features of the marketplace.
        </Typography>
      </PolicySection>

      {/* Analytics Cookies */}
      <PolicySection id="analytics-cookies" title="Analytics Cookies">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Analytics cookies help us understand how visitors interact with our marketplace by
          collecting and reporting information anonymously. This data allows us to measure and
          improve the performance and usability of our platform.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          We use the following analytics services:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 2 }}>
          {[
            'Google Analytics — Tracks page views, session duration, bounce rates, traffic sources, and user demographics. Data is anonymized and aggregated.',
            'Internal Analytics — Our own analytics platform monitors platform performance, feature usage, error rates, and conversion funnels to drive product improvements.',
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
          Analytics data is collected in aggregate and does not directly identify you as an
          individual. You may opt out of analytics tracking through our cookie preference tool or
          by installing the{' '}
          <Link
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: '#00927c' }}
          >
            Google Analytics Opt-Out Browser Add-on
          </Link>.
        </Typography>
      </PolicySection>

      {/* Preference Cookies */}
      <PolicySection id="preference-cookies" title="Preference Cookies">
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Preference cookies enable our platform to remember information that changes the way the
          site behaves or looks for you. These cookies allow us to provide enhanced, personalized
          features without requiring you to re-enter your preferences on each visit.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Examples of information stored by preference cookies include:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
          {[
            'Your preferred language and regional settings',
            'Selected display currency',
            'Display preferences such as grid or list view for product listings',
            'Recently viewed items and recently visited categories',
            'Notification and communication preferences',
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
          If you disable preference cookies, some features of the marketplace may not function
          properly, and your experience may be less personalized.
        </Typography>
      </PolicySection>

      {/* Marketing Cookies */}
      <PolicySection id="marketing-cookies" title="Marketing Cookies">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Marketing cookies are used to track your browsing activity across websites. They enable
          our advertising partners to build a profile of your interests and deliver targeted
          advertisements that are more relevant to you. These cookies may also be used to limit
          the number of times you see an advertisement and measure the effectiveness of
          advertising campaigns.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Marketing cookies are placed by third-party advertising networks with our permission.
          They remember that you have visited our platform and this information may be shared with
          other organizations such as advertisers.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          You can opt out of marketing cookies at any time through our cookie preference tool or
          by adjusting your browser settings. Opting out does not mean you will no longer see
          advertisements; it simply means the ads you see will be less tailored to your browsing
          history and interests.
        </Typography>
      </PolicySection>

      {/* Managing Cookies */}
      <PolicySection id="managing-cookies" title="Managing Cookies" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          You have the right to decide whether to accept or reject cookies. You can exercise your
          cookie preferences in the following ways:
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          Most web browsers allow you to control cookies through their settings. Below are
          instructions for common browsers:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 2 }}>
          {[
            'Google Chrome — Navigate to Settings > Privacy and Security > Cookies and Site Data. From here you can block all cookies, allow all cookies, or customize settings per site.',
            'Mozilla Firefox — Go to Settings > Privacy & Security. Under Enhanced Tracking Protection, choose Standard, Strict, or Custom to control cookie behavior.',
            'Apple Safari — Open Preferences > Privacy, then choose to block all cookies, block only third-party cookies, or allow cookies from visited websites.',
            'Microsoft Edge — Access Settings > Cookies and Site Permissions > Manage and Delete Cookies. You can block all cookies, allow all cookies, or add exceptions for specific sites.',
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
          Please note that blocking or deleting cookies may impact the functionality of our
          marketplace. Certain features, including the shopping cart, user authentication, and
          personalized recommendations, may not work correctly without cookies enabled. Essential
          cookies cannot be disabled through our preference tool as they are required for core
          platform functionality.
        </Typography>
      </PolicySection>

      {/* Third-Party Cookies */}
      <PolicySection id="third-party-cookies" title="Third-Party Cookies">
        <Typography variant="body1" sx={{ mb: 2, color: '#4a5568', lineHeight: 1.7 }}>
          Our marketplace integrates services from third-party providers that may set their own
          cookies on your device. These third-party cookies are governed by the respective privacy
          policies of those providers, not by this cookie policy. Common third-party cookies on
          our platform include:
        </Typography>
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0, mb: 2 }}>
          {[
            'Google Analytics (_ga, _gid) — Used to distinguish unique users and track page views. Retains data for up to 24 months.',
            'Google Tag Manager — Facilitates the deployment of tracking tags and manages third-party scripts on our platform.',
            'Payment Processor Cookies (e.g., Stripe, PayPal) — Enable secure payment processing, fraud detection, and transaction verification during checkout.',
            'Social Media Plugins — Cookies set by embedded social media widgets (e.g., Facebook, Instagram) when you interact with share buttons or embedded content.',
            'Customer Support Tools — Cookies used by our live chat and helpdesk providers to maintain conversation context and provide seamless support.',
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
          We recommend reviewing the privacy policies of these third-party providers for
          detailed information about their cookie usage and data handling practices.
        </Typography>
      </PolicySection>

      {/* Changes to Policy */}
      <PolicySection id="changes-to-policy" title="Changes to This Policy">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          We reserve the right to update or modify this cookie policy at any time. When we make
          material changes to how we use cookies, we will notify you by email and/or by posting a
          prominent notice on our platform prior to the changes taking effect. The "Last Updated"
          date at the top of this page reflects the most recent revision.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.7 }}>
          Your continued use of the marketplace after changes to this policy constitutes your
          acceptance of the updated terms. We encourage you to review this policy periodically to
          stay informed about how we use cookies and similar technologies.
        </Typography>
      </PolicySection>

      {/* Contact Information */}
      <PolicySection id="contact-information" title="Contact Us">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.7 }}>
          If you have any questions, concerns, or requests regarding this cookie policy or our use
          of cookies, please contact us:
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
          Our team will review and respond to your inquiry within 30 days.
        </Typography>
      </PolicySection>
    </PolicyLayout>
  );
};

export default CookiePolicy;
