import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  MenuItem,
  Stack,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SendIcon from '@mui/icons-material/Send';
import PageHero from '../../components/Legal/PageHero';
import SectionTitle from '../../components/Legal/SectionTitle';
import branding from '../../../Config/branding';

const subjects = [
  'General Inquiry',
  'Order Support',
  'Seller Support',
  'Technical Issue',
  'Partnership',
  'Feedback',
];

const faqs = [
  {
    question: 'How do I track my order?',
    answer:
      'You can track your order by navigating to the "My Orders" section in your account dashboard. Each order displays its current status, estimated delivery date, and real-time tracking information once the shipment is dispatched.',
  },
  {
    question: 'How do I become a seller?',
    answer:
      'Click the "Become a Seller" button in the navigation bar and complete our verification process. Our team will review your application within 2-3 business days. Once approved, you can start listing your products on the marketplace.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), net banking from all major banks, and popular digital wallets for a seamless checkout experience.',
  },
  {
    question: 'How do I request a refund?',
    answer:
      'To request a refund, go to "My Orders" in your account, select the item you wish to return, and click "Initiate Return." Follow the on-screen instructions to complete the process. Refunds are typically processed within 5-7 business days after the return is received.',
  },
  {
    question: 'Can I cancel my order?',
    answer:
      'Yes, you can cancel your order before it is shipped. Go to "My Orders," select the order, and click "Cancel Order." Once the order has been dispatched, cancellation is no longer available, but you can request a return after delivery.',
  },
  {
    question: 'How do I contact customer support?',
    answer:
      'You can reach our customer support team by emailing us at ' +
      (branding.supportEmail || 'support@aiknotsit.com') +
      ', calling our helpline, or by using the contact form on this page. Our team is available during business hours and typically responds within 24 business hours.',
  },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us | AI Knots Marketplace';
    return () => {
      document.title = 'AI Knots Marketplace';
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSnackbar(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const contactCards = [
    {
      icon: <MailOutlineIcon sx={{ fontSize: 28, color: '#fff' }} />,
      title: 'Email Us',
      detail: branding.supportEmail || 'support@aiknotsit.com',
      sub: "We'll respond within 24 business hours",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 28, color: '#fff' }} />,
      title: 'Call Us',
      detail: branding.supportPhone || '+91 XXX XXX XXXX',
      sub: 'Mon-Fri, 9:00 AM - 6:00 PM IST',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 28, color: '#fff' }} />,
      title: 'Visit Us',
      detail: branding.address || 'AI Knots IT Solutions',
      sub: 'India',
    },
  ];

  const socialLinks = [
    { key: 'facebook' as const, icon: <FacebookIcon />, label: 'Facebook' },
    { key: 'twitter' as const, icon: <TwitterIcon />, label: 'Twitter' },
    { key: 'instagram' as const, icon: <InstagramIcon />, label: 'Instagram' },
    { key: 'linkedin' as const, icon: <LinkedInIcon />, label: 'LinkedIn' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <PageHero
        title="Contact Us"
        subtitle="Have a question, feedback, or need assistance? We're here to help. Reach out to our friendly team and we'll get back to you as soon as possible."
      />

      {/* Contact Cards */}
      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          {contactCards.map((card) => (
            <Grid item xs={12} md={4} key={card.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,146,124,0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#00927c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 500, mb: 0.5 }}>
                  {card.detail}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                  {card.sub}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Contact Form + Office Info */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={5}>
          {/* Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                Send Us a Message
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mb: 4 }}>
                Fill out the form below and we'll get back to you promptly.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#00927c' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00927c' },
                    }}
                  />
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#00927c' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00927c' },
                    }}
                  />
                  <TextField
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    select
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#00927c' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00927c' },
                    }}
                  >
                    {subjects.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    multiline
                    rows={5}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&.Mui-focused fieldset': { borderColor: '#00927c' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00927c' },
                    }}
                  />
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      endIcon={!isSubmitting ? <SendIcon /> : undefined}
                      sx={{
                        mt: 1,
                        px: 5,
                        py: 1.5,
                        borderRadius: '10px',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        background: 'linear-gradient(135deg, #00927c 0%, #007a6a 100%)',
                        boxShadow: '0 4px 16px rgba(0,146,124,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #007a6a 0%, #005f52 100%)',
                          boxShadow: '0 6px 24px rgba(0,146,124,0.4)',
                        },
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Office Info */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 3 }}>
                Office Information
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <AccessTimeIcon sx={{ color: '#00927c', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      Business Hours
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5} sx={{ pl: 4 }}>
                    <Typography variant="body2" sx={{ color: '#444' }}>
                      <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM IST
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#444' }}>
                      <strong>Saturday:</strong> 10:00 AM - 4:00 PM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#444' }}>
                      <strong>Sunday:</strong> Closed
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ borderTop: '1px solid #eee', pt: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <SendIcon sx={{ color: '#00927c', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      Social Links
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {socialLinks.map((link) => {
                      const href = branding.socialLinks[link.key];
                      return (
                        <IconButton
                          key={link.key}
                          href={href || '#'}
                          target={href ? '_blank' : undefined}
                          rel={href ? 'noopener noreferrer' : undefined}
                          aria-label={link.label}
                          sx={{
                            color: href ? '#00927c' : '#bbb',
                            backgroundColor: href ? 'rgba(0,146,124,0.08)' : '#f5f5f5',
                            '&:hover': {
                              backgroundColor: '#00927c',
                              color: '#fff',
                            },
                          }}
                        >
                          {link.icon}
                        </IconButton>
                      );
                    })}
                  </Stack>
                </Box>

                <Box sx={{ borderTop: '1px solid #eee', pt: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <MailOutlineIcon sx={{ color: '#00927c', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                      Response Time
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: '#6c757d', pl: 4, lineHeight: 1.7 }}>
                    We typically respond within 24 business hours. For urgent inquiries, please
                    call us directly during business hours.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ backgroundColor: '#fff', py: 8 }}>
        <Container maxWidth="md">
          <SectionTitle
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions"
            align="center"
          />
          <Box>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                elevation={0}
                sx={{
                  mb: 1.5,
                  borderRadius: '10px !important',
                  border: '1px solid #eee',
                  boxShadow: 'none',
                  '&::before': { display: 'none' },
                  '&.Mui-expanded': { margin: '0 0 12px 0' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#00927c' }} />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      py: 1.5,
                      '&.Mui-expanded': { my: 1.5 },
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2.5 }}>
                  <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Map Placeholder */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e0f5f1 0%, #b2e8df 50%, #e0f5f1 100%)',
          py: 8,
        }}
      >
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <LocationOnIcon sx={{ fontSize: 48, color: '#00927c', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
              Visit Us
            </Typography>
            <Typography variant="body1" sx={{ color: '#555', mb: 1 }}>
              {branding.address || 'AI Knots IT Solutions'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c757d' }}>
              India
            </Typography>
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: '10px', width: '100%' }}
        >
          Your message has been sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactUs;
