import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Avatar, 
  Grid, 
  Paper, 
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

// Import the fetchUserProfile action
import { fetchUserProfile } from '../../../features/authSlice.js'; 

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, userDetails, loading, error } = useSelector((state) => state.auth);

  // State management
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch user data on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')); // Get user object from local storage
    if (storedUser && storedUser._id) { // Check if storedUser exists and has _id
      const userId = storedUser._id; // Extract userId
      dispatch(fetchUserProfile(userId)); // Dispatch action to fetch user profile
    } else {
      console.error('User ID not found in local storage');
    }
  }, [dispatch]);

  // Show error snackbar if fetch fails
  useEffect(() => {
    console.log('Fetching user profile...');
    if (userDetails) {
      console.log('User profile loaded:', userDetails);
    }
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [userDetails, error]);

  // Loading state
  if (loading) {
    console.log('Loading user profile...');
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // No user details
  if (!userDetails) {
    console.log('No user profile found');
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        No user profile found
      </Typography>
    );
  }

  console.log('Displaying user profile:', userDetails); // Added debug log to check userDetails

  return (
    <Box sx={{ p: 4, backgroundColor: '#f4f6f9' }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'white' 
            }}
          >
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mr: 3,
                bgcolor: 'primary.main'
              }}
            >
              {userDetails.name ? userDetails.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {userDetails.name || 'User Name'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {userDetails.role || 'User Role'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Contact Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography>{userDetails.email || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography>{userDetails.phoneNumber || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Additional User Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography>{userDetails.dob || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography>{userDetails.username || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for errors and success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;