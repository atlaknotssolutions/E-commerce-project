import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import PolicyLayout from '../../components/Legal/PolicyLayout';
import PolicySection from '../../components/Legal/PolicySection';

const toc = [
  { id: 'overview', title: 'Overview' },
  { id: 'eligible-refunds', title: 'Eligible Refunds' },
  { id: 'non-refundable-items', title: 'Non-Refundable Items' },
  { id: 'refund-process', title: 'Refund Process' },
  { id: 'refund-timeline', title: 'Refund Timeline' },
  { id: 'cancellation-policy', title: 'Cancellation Policy' },
  { id: 'seller-refund-rules', title: 'Seller Refund Rules' },
  { id: 'payment-gateway-refunds', title: 'Payment Gateway Refunds' },
  { id: 'late-or-missing-refunds', title: 'Late or Missing Refunds' },
  { id: 'contact', title: 'Contact' },
];

const RefundPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Refund & Cancellation Policy | AI Knots Marketplace';
  }, []);

  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      lastUpdated="July 2026"
      toc={toc}
    >
      <PolicySection id="overview" title="Overview" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          At the AI Knots Marketplace, your satisfaction is our priority. We understand that sometimes a purchase may not meet your expectations, and we are here to help. This Refund &amp; Cancellation Policy outlines the procedures, eligibility criteria, and timelines for requesting refunds and cancelling orders on our platform.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          We encourage all buyers to review this policy carefully before making a purchase. By placing an order on the AI Knots Marketplace, you acknowledge and agree to the terms described herein.
        </Typography>
      </PolicySection>

      <PolicySection id="eligible-refunds" title="Eligible Refunds">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          You may be eligible for a full or partial refund under the following circumstances:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            The product received is damaged during transit and is unusable in its delivered condition.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            The product received is defective, malfunctioning, or fails to perform as described.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            You received a wrong product that does not match your order details.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            The product significantly differs from its listing description, images, or specifications.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            The order was partially delivered, with one or more items missing from the package.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Refund requests must be initiated within <strong>7 days</strong> of the delivery date. Requests made after this period may not be eligible for a refund.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          The product must be unused and returned in its original packaging, including all tags, labels, accessories, and documentation. This requirement does not apply to products that are defective or damaged upon arrival.
        </Typography>
      </PolicySection>

      <PolicySection id="non-refundable-items" title="Non-Refundable Items">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Certain categories of products are not eligible for returns or refunds due to their nature or hygiene considerations. These include:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Perishable goods such as food, flowers, and other time-sensitive items.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Personalized or custom-made items created specifically to your specifications.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Digital products once they have been delivered, downloaded, or accessed.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Intimate or sanitary goods, including undergarments and beauty products with broken seals.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Hazardous materials, flammable liquids, and chemicals.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Gift cards and prepaid vouchers.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Downloadable software, applications, or digital content.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Clearance, final sale, or deeply discounted items unless they are defective or damaged upon delivery.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          If you receive a non-refundable item that is defective or damaged, please contact our support team for assistance on a case-by-case basis.
        </Typography>
      </PolicySection>

      <PolicySection id="refund-process" title="Refund Process">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Follow these steps to request a refund on the AI Knots Marketplace:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Step 1:</strong> Contact our customer support team via email at support@aiknots.com, or initiate a return request directly from your account dashboard under "My Orders."
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Step 2:</strong> Provide your order number, the reason for the refund request, and attach clear photographs of the product if the claim involves damage, defects, or wrong items.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Step 3:</strong> Our support team will review your request and respond within <strong>2 business days</strong> with a decision or a request for additional information.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Step 4:</strong> If your refund request is approved, you will receive detailed instructions on how and where to return the product. A prepaid return shipping label may be provided for eligible cases.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Step 5:</strong> Once we receive and inspect the returned product, your refund will be processed to your original payment method within the timelines specified below.
          </Typography>
        </Box>
      </PolicySection>

      <PolicySection id="refund-timeline" title="Refund Timeline">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          The refund process involves multiple stages, each with its own timeline. Below is an overview of what to expect:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Product Inspection:</strong> 3–5 business days after the returned item is received at our facility.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Refund Initiation:</strong> Within 2 business days after the inspection is completed and the refund is approved.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Credit/Debit Card Refunds:</strong> 5–10 business days after initiation, depending on your bank's processing time.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>UPI / Net Banking Refunds:</strong> 3–5 business days after initiation.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Wallet Refunds:</strong> Typically within 24 hours of initiation.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Please note that these timelines are estimates and may vary based on your financial institution or payment provider. We are unable to control or expedite third-party processing times.
        </Typography>
      </PolicySection>

      <PolicySection id="cancellation-policy" title="Cancellation Policy">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We understand that plans change. You may cancel your order at no additional cost under the following conditions:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Orders can be cancelled at any time before the seller dispatches the product for shipping.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            To cancel an order, navigate to "My Orders" in your account dashboard, select the order you wish to cancel, and click the "Cancel Order" option.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Once the product has been shipped, cancellation is no longer possible. However, you may initiate a return after receiving the product in accordance with our refund policy.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Cancellation is completely free of charge, and no fees will be deducted from your refund.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Refunds for cancelled orders are processed within <strong>5–7 business days</strong> from the date of cancellation confirmation. The refund will be credited to the original payment method used at the time of purchase.
        </Typography>
      </PolicySection>

      <PolicySection id="seller-refund-rules" title="Seller Refund Rules">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Sellers participating in the AI Knots Marketplace are required to comply with our refund policies and maintain fair practices. The following rules apply:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Sellers must accept and process valid return requests initiated within the policy timeframe. Failure to do so may result in automatic refund approval by the platform.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            The seller is financially responsible for refunds related to seller-fault issues, including but not limited to defective products, wrong items shipped, or products that significantly differ from their listing description.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            The platform reserves the right to cover refunds on behalf of the seller for platform-fault issues, such as payment processing errors or incorrect order routing, and to recover the amount from the seller's pending settlements.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Consistent failure to comply with refund policies may result in additional penalties, reduced visibility in search results, or account suspension.
        </Typography>
      </PolicySection>

      <PolicySection id="payment-gateway-refunds" title="Payment Gateway Refunds">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          All refunds on the AI Knots Marketplace are processed through the same payment method used for the original transaction. We do not offer refunds to alternative payment methods or accounts.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Once a refund is initiated by our team, the processing time is determined by the respective payment gateway, bank, or financial institution. These timeframes vary depending on the payment method:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Credit Card:</strong> 5–10 business days
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Debit Card:</strong> 5–10 business days
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>UPI:</strong> 3–5 business days
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Net Banking:</strong> 3–5 business days
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Wallets:</strong> 24 hours
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          We are unable to expedite refunds processed through third-party payment gateways. If the refund has not appeared in your account after the stated timeframe, please check with your bank or payment provider first.
        </Typography>
      </PolicySection>

      <PolicySection id="late-or-missing-refunds" title="Late or Missing Refunds">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          If you have been notified that your refund has been processed but have not yet received it, please follow these steps:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Check your bank or credit card statement</strong> carefully for any pending credits or refunds that may not yet be fully posted.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Contact your bank or credit card company</strong> to inquire about any processing delays. Some financial institutions take additional time to post refunds after receiving them from the payment processor.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Contact our support team</strong> if the issue persists after 10 business days. We will investigate with our payment partners and provide you with an update on the refund status.
          </Typography>
        </Box>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          If you have any questions about our Refund &amp; Cancellation Policy, need help with a return, or wish to discuss a specific case, our support team is ready to assist:
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
          <strong>Email:</strong> support@aiknots.com
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
          <strong>Website:</strong> www.aiknots.com
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Our support team is available Monday through Saturday, 9:00 AM to 6:00 PM IST. We strive to respond to all inquiries within 2 business days.
        </Typography>
      </PolicySection>
    </PolicyLayout>
  );
};

export default RefundPolicy;
