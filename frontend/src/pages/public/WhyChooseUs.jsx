import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  ThemeProvider, 
  createTheme,
  useMediaQuery,
  useTheme
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ComputerIcon from '@mui/icons-material/Computer';
import SupportIcon from '@mui/icons-material/Support';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PeopleIcon from '@mui/icons-material/People';
import { motion } from 'framer-motion';

// Custom Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Vibrant blue
      light: '#64b5f6',
      dark: '#1976d2'
    },
    background: {
      default: '#f4f6f9'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  }
});

// Reason Card Component
const ReasonCard = ({ icon, title, description }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <Paper
        elevation={6}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(3),
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff, #e6e9f0)',
          boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff'
          }
        }}
      >
        <Box
          sx={{
            background: theme.palette.primary.light,
            borderRadius: '50%',
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing(2),
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {React.cloneElement(icon, { 
            sx: { 
              fontSize: isMobile ? 40 : 50,
              color: 'white' 
            } 
          })}
        </Box>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontWeight: 600, 
            marginBottom: theme.spacing(1),
            color: theme.palette.primary.dark
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 400,
            lineHeight: 1.6
          }}
        >
          {description}
        </Typography>
      </Paper>
    </motion.div>
  );
};

// Main Component
const WhyChooseUs = () => {
  const [reasons] = useState([
    {
      id: 1,
      icon: <LocalHospitalIcon />,
      title: 'Advanced Medical Care',
      description: 'Cutting-edge facilities with state-of-the-art medical technologies and comprehensive treatment approaches.',
    },
    {
      id: 2,
      icon: <MedicalServicesIcon />,
      title: 'Expert Medical Team',
      description: 'Highly skilled professionals with extensive experience and continuous training in specialized medical fields.',
    },
    {
      id: 3,
      icon: <ComputerIcon />,
      title: 'Smart Healthcare Technology',
      description: 'Innovative digital solutions integrating AI, machine learning, and advanced diagnostic tools.',
    },
    {
      id: 4,
      icon: <SupportIcon />,
      title: 'Comprehensive Patient Support',
      description: 'Round-the-clock personalized care, emotional support, and holistic patient management.',
    },
    {
      id: 5,
      icon: <CreditCardIcon />,
      title: 'Flexible Financial Options',
      description: 'Transparent pricing, multiple payment plans, and comprehensive insurance support.',
    },
    {
      id: 6,
      icon: <PeopleIcon />,
      title: 'Patient-Centered Approach',
      description: 'Individualized care plans, empathetic communication, and patient comfort as our top priority.',
    }
  ]);

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          background: 'linear-gradient(to right, #e0f2f1, #b2ebf2)',
          py: { xs: 4, md: 8 },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={6}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.primary.dark,
                  marginBottom: theme.spacing(2)
                }}
              >
                Why Choose Our Hospital
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: 700, 
                  margin: '0 auto',
                  fontWeight: 400
                }}
              >
                Delivering exceptional healthcare with compassion, expertise, and cutting-edge technology
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {reasons.map((reason, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={reason.id}
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.2 
                  }}
                >
                  <ReasonCard 
                    icon={reason.icon}
                    title={reason.title}
                    description={reason.description}
                  />
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