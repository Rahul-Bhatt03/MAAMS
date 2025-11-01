import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, ThemeProvider, createTheme, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ComputerIcon from '@mui/icons-material/Computer';
import SupportIcon from '@mui/icons-material/Support';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PeopleIcon from '@mui/icons-material/People';

// Custom Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    text: { secondary: '#555' },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

// Floating Particles with Parallax
const FloatingParticles = ({ count = 25 }) => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const initialX = Math.random() * window.innerWidth;
        const initialY = Math.random() * window.innerHeight;
        const size = 6 + Math.random() * 6;
        const speedFactor = 0.1 + Math.random() * 0.2;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: initialY + scrollY * speedFactor,
              left: initialX,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
            }}
            animate={{ y: [0, -50, 0], x: [0, 50, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: Math.random() * 5 }}
          />
        );
      })}
    </Box>
  );
};

// Reason Card with all effects
const ReasonCard = ({ icon, title, description }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const particleCount = 6;

  const particles = Array.from({ length: particleCount });

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
          p: 3,
          borderRadius: 4,
          height: '100%',
          minHeight: 320,
          maxWidth: 360,
          mx: 'auto',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 0 30px rgba(33,150,243,0.6), 0 12px 40px rgba(0,0,0,0.18)',
            border: '1px solid rgba(33,150,243,0.5)',
          },
        }}
      >
        {/* Floating Glowing Icon */}
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(33,150,243,0.3) 0%, rgba(33,150,243,0) 70%)',
              filter: 'blur(15px)',
              zIndex: -1,
            }}
          />
          <Box
            sx={{
              mb: 2,
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              color: theme.palette.primary.main,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 40 } })}
          </Box>
        </motion.div>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.dark }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
          {description}
        </Typography>

        {/* Particle Burst on Hover */}
        {hovered &&
          particles.map((_, i) => {
            const angle = Math.random() * 2 * Math.PI;
            const distance = 40 + Math.random() * 30;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 0.8, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: theme.palette.primary.main,
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            );
          })}
      </Paper>
    </motion.div>
  );
};

// Main WhyChooseUs Component
const WhyChooseUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const reasons = [
    { id: 1, icon: <LocalHospitalIcon />, title: 'Advanced Medical Care', description: 'Cutting-edge facilities with state-of-the-art medical technologies.' },
    { id: 2, icon: <MedicalServicesIcon />, title: 'Expert Medical Team', description: 'Highly skilled professionals with extensive experience in specialized fields.' },
    { id: 3, icon: <ComputerIcon />, title: 'Smart Healthcare Technology', description: 'Innovative digital solutions integrating AI and advanced diagnostic tools.' },
    { id: 4, icon: <SupportIcon />, title: 'Comprehensive Patient Support', description: 'Round-the-clock personalized care and holistic patient management.' },
    { id: 5, icon: <CreditCardIcon />, title: 'Flexible Financial Options', description: 'Transparent pricing, multiple payment plans, and insurance support.' },
    { id: 6, icon: <PeopleIcon />, title: 'Patient-Centered Approach', description: 'Individualized care plans, empathetic communication, and comfort prioritization.' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          py: 10,
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          animation: 'gradientShift 15s ease infinite',
          background: 'linear-gradient(135deg, #74ebd5, #ACB6E5, #2196f3)',
          backgroundSize: '400% 400%',
          '@keyframes gradientShift': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      >
        <FloatingParticles count={30} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box textAlign="center" mb={8}>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Typography variant={isMobile ? 'h4' : 'h2'} sx={{ fontWeight: 700, mb: 2, color: '#fff', textShadow: '2px 2px 6px rgba(0,0,0,0.3)' }}>
                Why Choose Our Hospital
              </Typography>
              <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', color: '#f0f0f0' }}>
                Delivering exceptional healthcare with compassion, expertise, and cutting-edge technology
              </Typography>
            </motion.div>
          </Box>

          <Grid container spacing={4}>
            {reasons.map((reason, idx) => (
              <Grid item xs={12} sm={6} md={4} key={reason.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                >
                  <ReasonCard {...reason} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default WhyChooseUs;
