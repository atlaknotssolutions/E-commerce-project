import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import PolicyLayout from '../../components/Legal/PolicyLayout';
import PolicySection from '../../components/Legal/PolicySection';

const toc = [
  { id: 'accounts', title: 'Accounts' },
  { id: 'orders', title: 'Orders' },
  { id: 'payments', title: 'Payments' },
  { id: 'seller-responsibilities', title: 'Seller Responsibilities' },
  { id: 'buyer-responsibilities', title: 'Buyer Responsibilities' },
  { id: 'prohibited-activities', title: 'Prohibited Activities' },
  { id: 'product-listings', title: 'Product Listings' },
  { id: 'returns-and-refunds', title: 'Returns & Refunds' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'liability-limitation', title: 'Liability Limitation' },
  { id: 'termination', title: 'Termination' },
  { id: 'dispute-resolution', title: 'Dispute Resolution' },
  { id: 'applicable-law', title: 'Applicable Law' },
  { id: 'contact', title: 'Contact' },
];

const TermsConditions: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms & Conditions | AI Knots Marketplace';
  }, []);

  return (
    <PolicyLayout
      title="Terms & Conditions"
      lastUpdated="July 2026"
      toc={toc}
    >
      <PolicySection id="accounts" title="1. Accounts" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          To use our marketplace, you must be at least 18 years of age. By creating an account, you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding agreement.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. Providing false or misleading information may result in account suspension or termination.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Each individual or business entity is permitted to maintain only one account on the AI Knots Marketplace. Duplicate accounts may be merged or removed at our discretion.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          You are solely responsible for maintaining the confidentiality of your account credentials, including your password. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to secure your account.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          We reserve the right to suspend or permanently disable accounts that violate these Terms, engage in suspicious activity, or are otherwise deemed harmful to the marketplace community.
        </Typography>
      </PolicySection>

      <PolicySection id="orders" title="2. Orders">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Placing an order on the AI Knots Marketplace constitutes an offer to purchase a product from the respective seller, subject to these Terms. All orders are subject to acceptance by the seller and availability of the product.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, or errors identified by our fraud detection systems.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          In the event of a pricing error, we will notify you before processing the order and offer the option to proceed at the corrected price or cancel the order for a full refund.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          An order confirmation email does not constitute acceptance of your order. Your order is only confirmed once the seller has dispatched the product and you receive a shipment notification.
        </Typography>
      </PolicySection>

      <PolicySection id="payments" title="3. Payments">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          All payments on the AI Knots Marketplace are processed through secure, PCI-compliant third-party payment processors. We do not store your credit card or banking details on our servers.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          All product prices are displayed in the local currency unless explicitly stated otherwise. Applicable taxes, including GST, will be calculated and displayed at checkout before you confirm your purchase.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We accept payments via major credit and debit cards, UPI (Unified Payments Interface), net banking, and other payment methods as displayed at checkout. The availability of payment methods may vary based on your location and order details.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Full payment must be received and confirmed before an order is processed and dispatched. In the event of a payment failure, the order will not be fulfilled, and any pre-authorization holds will be released in accordance with your bank's policies.
        </Typography>
      </PolicySection>

      <PolicySection id="seller-responsibilities" title="4. Seller Responsibilities">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Sellers on the AI Knots Marketplace are expected to uphold the highest standards of professionalism and quality. By listing products on our platform, sellers agree to the following responsibilities:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Provide accurate, detailed, and truthful product descriptions that clearly represent the item being sold.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Fulfill orders in a timely manner within the shipping timelines specified in the product listing.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Ensure that all products meet quality standards and are free from defects unless the nature of the product is clearly disclosed.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Comply with all applicable local, state, and national laws and regulations relevant to the products being sold.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Maintain responsive communication with buyers, addressing inquiries and resolving issues within 48 hours.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Use appropriate packaging to ensure products arrive safely and in the condition described.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Handle returns and refunds in accordance with our platform's refund policy and within the specified timeframes.
          </Typography>
        </Box>
      </PolicySection>

      <PolicySection id="buyer-responsibilities" title="5. Buyer Responsibilities">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Buyers on the AI Knots Marketplace are expected to adhere to the following responsibilities to ensure a smooth and trustworthy shopping experience:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Provide accurate and complete delivery information, including a valid shipping address and contact number, at the time of placing an order.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Make timely payments using one of the accepted payment methods. Ensure sufficient funds are available at the time of purchase.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Inspect products promptly upon delivery and report any issues, damages, or discrepancies within the timeframes specified in our refund policy.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            File complaints and raise disputes within the designated timeframes to ensure timely resolution.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Leave honest, fair, and constructive reviews based on genuine experiences with the product and seller.
          </Typography>
        </Box>
      </PolicySection>

      <PolicySection id="prohibited-activities" title="6. Prohibited Activities">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          To maintain a safe and trustworthy marketplace, the following activities are strictly prohibited on the AI Knots Marketplace:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Listing, selling, or facilitating the sale of counterfeit, pirated, or trademark-infringing products.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Listing products that are prohibited by law or restricted under applicable regulations.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Engaging in price manipulation, including artificially inflating or deflating product prices.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Posting fake, misleading, or incentivized reviews to manipulate product ratings or buyer perception.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Sharing account credentials with others or creating multiple accounts to circumvent platform policies.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Attempting to circumvent platform fees, commissions, or payment processing through off-platform transactions.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Harassing, threatening, or intimidating other users, sellers, or platform staff.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Using automated tools, bots, or scripts to scrape data, manipulate listings, or exploit the platform.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Violation of these prohibitions may result in immediate account suspension, listing removal, and, where appropriate, legal action.
        </Typography>
      </PolicySection>

      <PolicySection id="product-listings" title="7. Product Listings">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Sellers are responsible for ensuring that all product listings on the AI Knots Marketplace are accurate, complete, and compliant with our guidelines. Each listing must include:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Accurate and descriptive product titles and descriptions that reflect the true nature of the item.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Real, high-quality photographs of the actual product. Stock images or digitally altered photos that misrepresent the product are not permitted.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Correct pricing that reflects the genuine value of the product, including all applicable taxes and fees.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Accurate stock and availability information to prevent overselling and order cancellations.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          We reserve the right to review, edit, or remove any listing that violates our content guidelines, misleads buyers, or otherwise compromises the integrity of the marketplace.
        </Typography>
      </PolicySection>

      <PolicySection id="returns-and-refunds" title="8. Returns & Refunds">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          All returns and refunds on the AI Knots Marketplace are governed by our Refund & Cancellation Policy, which is incorporated into these Terms by reference. By placing an order, you agree to the terms set forth in that policy.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          To be eligible for a return, products must be in their original, unused condition and returned within the timeframe specified in our Refund Policy. Products must include all original tags, labels, accessories, and packaging materials.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Digital products, downloadable software, and personalized or custom-made items may have different return terms or may be non-refundable. Such exceptions will be clearly stated at the time of purchase.
        </Typography>
      </PolicySection>

      <PolicySection id="intellectual-property" title="9. Intellectual Property">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          All content, materials, trademarks, logos, designs, and branding displayed on the AI Knots Marketplace are the exclusive property of AI Knots IT Solutions or its licensors and are protected by applicable intellectual property laws. No content from this platform may be reproduced, distributed, or used without prior written consent.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Sellers retain full ownership of their product images, descriptions, and original content. However, by listing products on the AI Knots Marketplace, sellers grant us a non-exclusive, royalty-free, worldwide license to use, display, reproduce, and distribute such content for the purpose of operating and promoting the marketplace.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          By posting reviews, ratings, questions, or other user-generated content on the platform, you grant AI Knots a non-exclusive, royalty-free, perpetual license to use, display, and distribute such content across our platform and marketing channels.
        </Typography>
      </PolicySection>

      <PolicySection id="liability-limitation" title="10. Liability Limitation">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          The AI Knots Marketplace is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted, error-free, or secure access to the platform.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          To the maximum extent permitted by applicable law, AI Knots shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the marketplace.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We are not responsible for the quality, safety, legality, or availability of products listed by sellers. Sellers are solely responsible for the products they list and sell on the platform.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We shall not be held liable for delays or failures in delivery caused by the seller, delivery partners, or circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, or force majeure events.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Our total aggregate liability for any claims arising out of or related to these Terms or your use of the platform shall not exceed the total amount paid by you for the specific order that is the subject of the claim.
        </Typography>
      </PolicySection>

      <PolicySection id="termination" title="11. Termination">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We reserve the right to suspend, restrict, or terminate your access to the AI Knots Marketplace at our sole discretion, with or without prior notice, for any reason including but not limited to violations of these Terms, fraudulent activity, or behavior that is harmful to other users or the platform.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Upon termination, your right to use the platform ceases immediately. Any pending orders, payments, or obligations may still be enforced, and we may retain certain data as required by law or for legitimate business purposes.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          You may close your account at any time by contacting our support team, provided that all pending obligations, including outstanding orders, returns, and payments, are fully resolved prior to account closure.
        </Typography>
      </PolicySection>

      <PolicySection id="dispute-resolution" title="12. Dispute Resolution">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          In the event of any dispute, claim, or controversy arising out of or relating to these Terms or the use of the marketplace, the parties involved agree to first attempt to resolve the matter through good faith negotiation and direct communication.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          If the dispute cannot be resolved through negotiation within a reasonable period, either party may request mediation through a mutually agreed-upon mediator. The costs of mediation shall be shared equally between the parties unless otherwise agreed.
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          For disputes that cannot be resolved through mediation, or for matters of significant financial impact, the dispute shall be referred to and finally resolved by binding arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended from time to time.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Notwithstanding the above, we reserve the right to seek injunctive or equitable relief in any court of competent jurisdiction to protect our intellectual property rights and proprietary information.
        </Typography>
      </PolicySection>

      <PolicySection id="applicable-law" title="13. Applicable Law">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in the jurisdiction where AI Knots IT Solutions is registered.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          If you are accessing the platform from outside India, you do so on your own initiative and are responsible for compliance with local laws to the extent they apply. We make no representation that the platform or its content is appropriate or available for use in all locations.
        </Typography>
      </PolicySection>

      <PolicySection id="contact" title="14. Contact">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          If you have any questions, concerns, or feedback regarding these Terms and Conditions, please reach out to our support team:
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
          <strong>Email:</strong> support@aiknots.com
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
          <strong>Website:</strong> www.aiknots.com
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Our support team is available Monday through Saturday, 9:00 AM to 6:00 PM IST, and will respond to your inquiry within 2 business days.
        </Typography>
      </PolicySection>
    </PolicyLayout>
  );
};

export default TermsConditions;
