import React, { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import PolicyLayout from '../../components/Legal/PolicyLayout';
import PolicySection from '../../components/Legal/PolicySection';

const toc = [
  { id: 'overview', title: 'Overview' },
  { id: 'order-processing', title: 'Order Processing' },
  { id: 'shipping-timeline', title: 'Shipping Timeline' },
  { id: 'delivery-partners', title: 'Delivery Partners' },
  { id: 'shipping-costs', title: 'Shipping Costs' },
  { id: 'order-tracking', title: 'Order Tracking' },
  { id: 'international-shipping', title: 'International Shipping' },
  { id: 'delayed-shipments', title: 'Delayed Shipments' },
  { id: 'lost-or-damaged-packages', title: 'Lost or Damaged Packages' },
  { id: 'contact', title: 'Contact' },
];

const ShippingPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Shipping & Delivery Policy | AI Knots Marketplace';
  }, []);

  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      lastUpdated="July 2026"
      toc={toc}
    >
      <PolicySection id="overview" title="Overview" defaultExpanded>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          At the AI Knots Marketplace, we work with a network of reliable delivery partners to ensure your orders reach you safely and on time. This Shipping &amp; Delivery Policy outlines our order processing, shipping, and delivery processes so you know exactly what to expect when you shop with us.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          By placing an order, you agree to the shipping and delivery terms described below. We are committed to transparency and will keep you informed at every stage of your order's journey.
        </Typography>
      </PolicySection>

      <PolicySection id="order-processing" title="Order Processing">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          All orders are processed and prepared for dispatch within <strong>1–2 business days</strong> after payment confirmation. Business days exclude Sundays and national public holidays.
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Orders placed before <strong>2:00 PM IST</strong> on business days may be processed and dispatched on the same day, subject to seller readiness and product availability.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Orders placed on weekends (Saturday or Sunday) or on national holidays will be processed on the next business day.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Upon successful processing, you will receive an order confirmation email and SMS containing your order number, estimated delivery date, and other relevant details.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Please note that processing times may vary for certain product categories, including made-to-order items, oversized shipments, or items that require additional quality checks.
        </Typography>
      </PolicySection>

      <PolicySection id="shipping-timeline" title="Shipping Timeline">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Delivery times are calculated from the date of dispatch and vary based on the shipping option selected, destination, and other factors:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Standard Delivery:</strong> 5–7 business days from the date of dispatch.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Express Delivery:</strong> 2–3 business days from the date of dispatch (available for select pin codes and product categories).
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Remote / Rural Areas:</strong> 7–12 business days depending on the distance from major logistics hubs and accessibility of the delivery location.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          All delivery timelines are estimates and may vary due to factors beyond our control, including adverse weather conditions, natural disasters, government restrictions, strikes, or other unforeseen circumstances. We will communicate any known delays promptly via email or SMS.
        </Typography>
      </PolicySection>

      <PolicySection id="delivery-partners" title="Delivery Partners">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          The AI Knots Marketplace partners with leading courier and logistics services across India to provide reliable and efficient delivery. Our delivery partners include:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            Delhivery
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            BlueDart
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            DTDC
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            India Post
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            Other regional carriers as required by destination and package characteristics.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          The delivery partner for your order is selected based on the destination address, package dimensions, weight, and shipping speed chosen at checkout. We continually evaluate our delivery network to ensure the best possible service.
        </Typography>
      </PolicySection>

      <PolicySection id="shipping-costs" title="Shipping Costs">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Shipping charges are calculated at checkout and are based on a combination of the following factors:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Weight and dimensions</strong> of the package.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Destination</strong> and distance from the dispatch location.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Shipping speed</strong> selected (Standard or Express).
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We offer <strong>free shipping</strong> on qualifying orders that meet or exceed the minimum order threshold displayed during checkout. The free shipping threshold may vary based on promotional offers and product categories.
        </Typography>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
          Express delivery options carry additional charges, which are clearly displayed at checkout before you confirm your order. No hidden fees will be applied after the order is placed.
        </Typography>
      </PolicySection>

      <PolicySection id="order-tracking" title="Order Tracking">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          Once your order has been dispatched, you will receive a <strong>tracking number</strong> via email and SMS. This tracking number allows you to monitor your shipment in real time.
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>AI Knots Dashboard:</strong> Log in to your account and navigate to "My Orders" to view the current status and estimated delivery date for each order.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Delivery Partner's Website:</strong> Use the tracking number on the delivery partner's official website for more detailed, shipment-level updates including current location and expected delivery time.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Tracking updates may experience brief delays depending on the frequency of scans by the delivery partner. This is normal and does not indicate a problem with your shipment.
        </Typography>
      </PolicySection>

      <PolicySection id="international-shipping" title="International Shipping">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          The AI Knots Marketplace currently offers international shipping for select countries and product categories. Availability is indicated at checkout based on your shipping address.
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Shipping charges</strong> for international orders are calculated based on destination country, package weight, and dimensions. These charges are displayed at checkout.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Customs duties, import taxes,</strong> and any other charges imposed by the destination country's government are the sole responsibility of the buyer. These are not included in the product price or shipping charges.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Estimated delivery time</strong> for international shipments is <strong>10–20 business days</strong> depending on the destination country, customs clearance processes, and local postal services.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          We are not responsible for delays caused by customs processing or inaccurate import information provided by the buyer. Please ensure that your shipping address and contact details are correct and complete.
        </Typography>
      </PolicySection>

      <PolicySection id="delayed-shipments" title="Delayed Shipments">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          While we strive to deliver every order within the estimated timeline, delays may occasionally occur due to circumstances beyond our control, such as weather disruptions, natural disasters, strikes, or logistical challenges.
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            If your shipment is delayed beyond the estimated delivery date, please contact our support team. We will coordinate with the delivery partner to investigate the status of your shipment and provide you with an update.
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            For shipments that are delayed beyond <strong>15 business days</strong> from the estimated delivery date, we will offer appropriate compensation, which may include a partial refund, discount coupon, or expedited reshipment of the product.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            You may also choose to cancel the order and receive a full refund if the delay is unacceptable to you.
          </Typography>
        </Box>
      </PolicySection>

      <PolicySection id="lost-or-damaged-packages" title="Lost or Damaged Packages">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          We take every precaution to ensure your order arrives in perfect condition. However, in the rare event that your package is lost or arrives damaged, we are here to help resolve the issue promptly.
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 1.5 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Report within 48 hours:</strong> Contact our support team within 48 hours of the expected delivery date (for lost packages) or within 48 hours of receiving the package (for damaged packages).
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1, color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Provide evidence:</strong> Include your order number, photographs of the damaged packaging and product (if applicable), and a description of the issue to help us investigate efficiently.
          </Typography>
          <Typography component="li" variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8 }}>
            <strong>Resolution:</strong> Once the investigation with our delivery partner confirms the package is lost or irreparably damaged, we will offer a <strong>full replacement</strong> or a <strong>complete refund</strong>, including any shipping charges paid.
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#4a5568', lineHeight: 1.8, mt: 1.5 }}>
          Investigations typically take 5–7 business days. We will keep you informed throughout the process and work to resolve the matter as quickly as possible.
        </Typography>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <Typography variant="body1" sx={{ mb: 1.5, color: '#4a5568', lineHeight: 1.8 }}>
          If you have any questions about our Shipping &amp; Delivery Policy, need assistance with a current order, or wish to provide feedback on your delivery experience, please reach out to us:
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

export default ShippingPolicy;
