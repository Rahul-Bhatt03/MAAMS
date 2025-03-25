import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Stack,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Save as SaveIcon, Notifications as NotificationsIcon, Lock as LockIcon, Palette as PaletteIcon } from '@mui/icons-material';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSave = () => {
    // In a real app, you would save the settings to your backend
    setSuccessMessage('Settings saved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Settings
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="settings tabs"
          >
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
            <Tab icon={<LockIcon />} iconPosition="start" label="Security" />
            <Tab icon={<PaletteIcon />} iconPosition="start" label="Appearance" />
          </Tabs>
        </Box>
        
        {/* Notifications Tab */}
        {activeTab === 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    Receive email notifications for important system alerts and updates
                  </Typography>
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="SMS Notifications"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    Receive text messages for urgent notifications
                  </Typography>
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Calendar Reminders"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    Receive reminders for upcoming appointments and events
                  </Typography>
                  
                  <FormControlLabel
                    control={<Switch />}
                    label="Weekly Report"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    Receive weekly performance and metrics reports
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </Box>
          </CardContent>
        )}
        
        {/* Security Tab */}
        {activeTab === 1 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Password & Security
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2, height: '100%', bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Password Requirements:
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="ul" sx={{ pl: 2 }}>
                    <li>Minimum 8 characters length</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <FormControlLabel
                  control={<Switch />}
                  label="Enable Two-Factor Authentication"
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Add an extra layer of security to your account by requiring a verification code in addition to your password.
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Update Security Settings
              </Button>
            </Box>
          </CardContent>
        )}
        
        {/* Appearance Tab */}
        {activeTab === 2 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Display Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Theme Mode</InputLabel>
                  <Select
                    defaultValue="light"
                    label="Theme Mode"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Accent Color</InputLabel>
                  <Select
                    defaultValue="blue"
                    label="Accent Color"
                  >
                    <MenuItem value="blue">Blue</MenuItem>
                    <MenuItem value="teal">Teal</MenuItem>
                    <MenuItem value="purple">Purple</MenuItem>
                    <MenuItem value="green">Green</MenuItem>
                    <MenuItem value="orange">Orange</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    defaultValue="medium"
                    label="Font Size"
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Animations"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                  Show transition animations throughout the interface
                </Typography>
                
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Compact View"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                  Reduce spacing to show more content on each page
                </Typography>
                
                <FormControlLabel
                  control={<Switch />}
                  label="High Contrast Mode"
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                  Enhance visibility with higher contrast colors
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Display Settings
              </Button>
            </Box>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};

export default SettingsPage;