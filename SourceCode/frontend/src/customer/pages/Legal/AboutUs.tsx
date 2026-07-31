import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import DevicesIcon from '@mui/icons-material/Devices';
import HubIcon from '@mui/icons-material/Hub';
import SpeedIcon from '@mui/icons-material/Speed';
import BrushIcon from '@mui/icons-material/Brush';
import GroupsIcon from '@mui/icons-material/Groups';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageHero from '../../components/Legal/PageHero';
import SectionTitle from '../../components/Legal/SectionTitle';
import branding from '../../../Config/branding';

const cardShadow = '0 2px 12px rgba(0,0,0,0.06)';
const cardRadius = 12;

const AboutUs = () => {
  useEffect(() => {
    document.title = 'About Us | AI Knots Marketplace';
    return () => {
      document.title = 'AI Knots Marketplace';
    };
  }, []);

  const features = [
    {
      icon: <StorefrontIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Vendor Platform',
      description:
        'A thriving ecosystem where thousands of sellers showcase their products to a global audience, all under one roof.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Transactions',
      description:
        'End-to-end encryption and trusted payment gateways ensure every purchase is safe and protected.',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description:
        'Our dedicated support team is always available to resolve issues and ensure a seamless experience.',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Delivery',
      description:
        'Optimized logistics and trusted shipping partners deliver products quickly and reliably to your doorstep.',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: <SearchIcon sx={{ fontSize: 32 }} />,
      title: 'Browse & Discover',
      description:
        'Explore thousands of products from verified sellers across diverse categories. Advanced filters and AI-powered recommendations make finding exactly what you need effortless.',
    },
    {
      number: '02',
      icon: <PaymentIcon sx={{ fontSize: 32 }} />,
      title: 'Secure Checkout',
      description:
        'Complete your purchase with confidence using our encrypted checkout process. Multiple payment options including cards, UPI, net banking, and digital wallets.',
    },
    {
      number: '03',
      icon: <DeliveryDiningIcon sx={{ fontSize: 32 }} />,
      title: 'Fast Delivery',
      description:
        'Track your order in real time from the seller to your doorstep. Our logistics network ensures timely delivery with live status updates.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Products' },
    { value: '5K+', label: 'Sellers' },
    { value: '50K+', label: 'Customers' },
    { value: '99%', label: 'Satisfaction' },
  ];

  const values = [
    {
      icon: <SecurityIcon sx={{ fontSize: 32, color: '#00927c' }} />,
      title: 'Trust',
      description: 'Building lasting relationships through honesty, reliability, and consistent service quality.',
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 32, color: '#00927c' }} />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to continuously enhance the marketplace experience.',
    },
    {
      icon: <BrushIcon sx={{ fontSize: 32, color: '#00927c' }} />,
      title: 'Quality',
      description: 'Curating products and experiences that meet the highest standards of excellence.',
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 32, color: '#00927c' }} />,
      title: 'Community',
      description: 'Fostering a connected ecosystem where sellers and buyers thrive together.',
    },
    {
      icon: <VisibilityIcon sx={{ fontSize: 32, color: '#00927c' }} />,
      title: 'Transparency',
      description: 'Operating with complete openness in pricing, policies, and business practices.',
    },
    {
      icon: <PersonIcon sx={{ fontSize: 32, color: '#00927c' }} />,
      title: 'Customer-First',
      description: 'Every decision we make starts and ends with the customer experience in mind.',
    },
  ];

  const customerBenefits = [
    'Access to thousands of products across multiple categories',
    'Competitive pricing with exclusive deals and discounts',
    'Secure payment processing with buyer protection',
    'Real-time order tracking and delivery updates',
    'Easy returns and refund process',
    'Verified seller ratings and authentic reviews',
    'AI-powered personalized product recommendations',
    'Dedicated customer support for issue resolution',
  ];

  const sellerBenefits = [
    'Access to a large and growing customer base',
    'Powerful seller dashboard with analytics and insights',
    'Integrated logistics and shipping support',
    'Marketing tools and promotional features',
    'Secure and timely payment settlements',
    'Low commission rates with transparent pricing',
    'Seller training resources and growth programs',
    'Multi-category product listing capabilities',
  ];

  const techStack = [
    { name: 'React', icon: <DevicesIcon /> },
    { name: 'Node.js', icon: <HubIcon /> },
    { name: 'MongoDB', icon: <SpeedIcon /> },
    { name: 'Cloud Infrastructure', icon: <PublicIcon /> },
  ];

  const roadmap = [
    {
      title: 'Mobile App',
      description: 'Native iOS and Android apps for shopping on the go with exclusive mobile features.',
      timeline: 'Q1 2026',
    },
    {
      title: 'AI Recommendations',
      description: 'Intelligent product suggestions powered by machine learning and user behavior analysis.',
      timeline: 'Q2 2026',
    },
    {
      title: 'International Expansion',
      description: 'Multi-currency support, international shipping, and localized marketplace experiences.',
      timeline: 'Q3 2026',
    },
  ];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <PageHero
        title="About AI Knots Marketplace"
        subtitle="Connecting buyers and sellers through a technology-driven marketplace built for the modern world."
      />

      {/* Who We Are */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <SectionTitle
          title="Who We Are"
          align="center"
          sx={{ mb: 5 }}
        />
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: cardRadius,
            boxShadow: cardShadow,
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#4a4a4a',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.8,
              textAlign: 'center',
            }}
          >
            {branding.appName} is a multi-vendor e-commerce marketplace built to bridge the gap between
            talented sellers and discerning customers. We provide a technology-driven platform where
            businesses of all sizes can reach a wider audience, while customers enjoy an unparalleled
            shopping experience. Our marketplace is powered by modern web technologies, ensuring
            speed, security, and reliability at every step of the journey.
          </Typography>
        </Paper>
      </Container>

      {/* Mission & Vision */}
      <Box sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <SectionTitle
            title="Mission & Vision"
            align="center"
            sx={{ mb: 5 }}
          />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: cardRadius,
                  boxShadow: cardShadow,
                  height: '100%',
                  borderTop: '4px solid #00927c',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#00927c', mb: 2 }}
                >
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a4a4a', lineHeight: 1.8 }}>
                  To empower sellers with the tools and reach they need to grow their businesses,
                  while delighting customers with a seamless, trustworthy, and enjoyable shopping
                  experience. We aim to democratize e-commerce by making it accessible, affordable,
                  and efficient for everyone.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: cardRadius,
                  boxShadow: cardShadow,
                  height: '100%',
                  borderTop: '4px solid #007a6a',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: '#007a6a', mb: 2 }}
                >
                  Our Vision
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a4a4a', lineHeight: 1.8 }}>
                  To become the leading marketplace platform that connects millions of sellers
                  and customers worldwide. We envision a future where commerce is powered by
                  innovation, driven by trust, and built on sustainable practices that benefit
                  businesses, consumers, and communities alike.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <SectionTitle
          title="Why Choose Us"
          subtitle="Built with purpose, designed for trust, and engineered for performance."
          align="center"
          sx={{ mb: 5 }}
        />
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 3.5 },
                  borderRadius: cardRadius,
                  boxShadow: cardShadow,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,146,124,0.12)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0,146,124,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2.5,
                    color: '#00927c',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', lineHeight: 1.7 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <SectionTitle
            title="How It Works"
            subtitle="Shopping on AI Knots Marketplace is simple, secure, and efficient."
            align="center"
            sx={{ mb: 5 }}
          />
          <Grid container spacing={4} alignItems="stretch">
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.number}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: cardRadius,
                    boxShadow: cardShadow,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -10,
                      fontSize: '5rem',
                      fontWeight: 900,
                      color: 'rgba(0,146,124,0.04)',
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    {step.number}
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: cardRadius,
                      background: 'linear-gradient(135deg, #00927c, #007a6a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      mb: 2.5,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'flex' },
                        position: 'absolute',
                        top: '50%',
                        right: -20,
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        color: '#00927c',
                        opacity: 0.3,
                      }}
                    >
                      <ArrowForwardIcon />
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Marketplace Stats */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00927c 0%, #007a6a 50%, #005f52 100%)',
          py: { xs: 5, md: 7 },
        }}
      >
        <Container maxWidth="lg">
          <SectionTitle
            title="Our Impact in Numbers"
            subtitle="Growing every day with the trust of our community."
            align="center"
            sx={{ mb: 5 }}
          />
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: cardRadius,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#fff',
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontWeight: 500 }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Our Values */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <SectionTitle
          title="Our Values"
          subtitle="The principles that guide everything we do."
          align="center"
          sx={{ mb: 5 }}
        />
        <Grid container spacing={3}>
          {values.map((value) => (
            <Grid item xs={12} sm={6} md={4} key={value.title}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 3.5 },
                  borderRadius: cardRadius,
                  boxShadow: cardShadow,
                  height: '100%',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{value.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                  {value.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', lineHeight: 1.7 }}>
                  {value.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Customer Benefits */}
      <Box sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <SectionTitle
            title="Customer Benefits"
            subtitle="Designed to make your shopping experience exceptional."
            align="center"
            sx={{ mb: 5 }}
          />
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: cardRadius,
              boxShadow: cardShadow,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            <Stack spacing={2.5}>
              {customerBenefits.map((benefit) => (
                <Box key={benefit} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <CheckCircleIcon sx={{ color: '#00927c', mt: 0.25, flexShrink: 0 }} />
                  <Typography variant="body1" sx={{ color: '#4a4a4a', lineHeight: 1.6 }}>
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Seller Benefits */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <SectionTitle
          title="Seller Benefits"
          subtitle="Everything you need to build and grow your online business."
          align="center"
          sx={{ mb: 5 }}
        />
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: cardRadius,
            boxShadow: cardShadow,
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          <Stack spacing={2.5}>
            {sellerBenefits.map((benefit) => (
              <Box key={benefit} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <StorefrontIcon sx={{ color: '#00927c', mt: 0.25, flexShrink: 0 }} />
                <Typography variant="body1" sx={{ color: '#4a4a4a', lineHeight: 1.6 }}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Container>

      {/* Technology Stack */}
      <Box sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
          <SectionTitle
            title="Technology Stack"
            subtitle="Powered by modern, scalable, and reliable technologies."
            align="center"
            sx={{ mb: 5 }}
          />
          <Grid container spacing={3} justifyContent="center">
            {techStack.map((tech) => (
              <Grid item xs={6} sm={4} md={3} key={tech.name}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: cardRadius,
                    boxShadow: cardShadow,
                    textAlign: 'center',
                  }}
                >
                  <Box sx={{ color: '#00927c', mb: 1.5 }}>{tech.icon}</Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {tech.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Future Roadmap */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <SectionTitle
          title="Future Roadmap"
          subtitle="Exciting features and capabilities on the horizon."
          align="center"
          sx={{ mb: 5 }}
        />
        <Grid container spacing={3}>
          {roadmap.map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: cardRadius,
                  boxShadow: cardShadow,
                  height: '100%',
                  borderLeft: '4px solid #00927c',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    bgcolor: 'rgba(0,146,124,0.08)',
                    color: '#00927c',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {item.timeline}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact CTA */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #00927c 0%, #007a6a 50%, #005f52 100%)',
          py: { xs: 5, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: cardRadius,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#fff',
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 2,
              }}
            >
              Have Questions? We'd Love to Hear From You
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mb: 4,
                maxWidth: 550,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Whether you're a buyer looking for the perfect product or a seller ready to grow
              your business, our team is here to help you every step of the way.
            </Typography>
            <Button
              variant="contained"
              href="mailto:support@aiknotsit.com"
              sx={{
                bgcolor: '#fff',
                color: '#00927c',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Contact Us
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;
