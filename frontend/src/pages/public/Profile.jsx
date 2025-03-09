import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Avatar, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Lock, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';

// Import the fetchUserProfile action
import { fetchUserProfile } from '../../../features/authSlice.js'; 

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, userDetails, loading, error } = useSelector((state) => state.auth);

  // State management
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Fetch user data on component mount
  useEffect(() => {
    // Get the user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user')); // Assuming 'user' is stored in localStorage

    if (storedUser && storedUser.length > 0) {
      const userId = storedUser[0].id;  // Assuming the user array contains an object with an 'id' field
      console.log('Dispatching fetchUserProfile with user ID:', userId);
      dispatch(fetchUserProfile(userId)); // Pass userId to the action
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

  // Password validation logic
  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    // Password complexity rules
    const complexityRules = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[a-z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)
    ];

    if (currentPassword === newPassword) {
      return 'New password must be different from current password';
    }

    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }

    if (complexityRules.filter(Boolean).length < 4) {
      return 'Password must include uppercase, lowercase, number, and special character';
    }

    return null;
  };

  // Handle password change
  const handlePasswordChange = () => {
    const validationError = validatePassword();
    
    if (validationError) {
      setSnackbarMessage(validationError);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // TODO: Implement actual password change API call
    try {
      setSnackbarMessage('Password changed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setPasswordDialogOpen(false);
    } catch (error) {
      setSnackbarMessage('Password change failed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
              <Button 
                variant="outlined" 
                startIcon={<Lock />}
                onClick={() => setPasswordDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
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

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type={passwordVisibility.currentPassword ? 'text' : 'password'}
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({
              ...prev, 
              currentPassword: e.target.value
            }))}
            InputProps={{
              endAdornment: (
                <IconButton 
                  onClick={() => togglePasswordVisibility('currentPassword')}
                >
                  {passwordVisibility.currentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type={passwordVisibility.newPassword ? 'text' : 'password'}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({
              ...prev, 
              newPassword: e.target.value
            }))}
            InputProps={{
              endAdornment: (
                <IconButton 
                  onClick={() => togglePasswordVisibility('newPassword')}
                >
                  {passwordVisibility.newPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
            helperText="Must include uppercase, lowercase, number, special character"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type={passwordVisibility.confirmPassword ? 'text' : 'password'}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({
              ...prev, 
              confirmPassword: e.target.value
            }))}
            InputProps={{
              endAdornment: (
                <IconButton 
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {passwordVisibility.confirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordChange} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

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
