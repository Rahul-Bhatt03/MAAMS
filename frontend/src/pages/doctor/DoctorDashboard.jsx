import React, { useState, useEffect } from 'react';
import { 
  Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  IconButton, Badge, Container, Grid, Paper, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Button, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, Notifications as NotificationsIcon,
  Dashboard as DashboardIcon, CalendarMonth as CalendarIcon, Event as EventIcon,
  People as PeopleIcon, MedicalServices as MedicalIcon, Settings as SettingsIcon,
  ExitToApp as LogoutIcon, Assignment as AssignmentIcon, PersonAdd as PersonAddIcon,
  MonetizationOn as MonetizationOnIcon, Biotech as BiotechIcon, Bed as BedIcon,
  Report as ReportIcon,
  SupervisedUserCircle, Person as PersonIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme, styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ProfilePage from '../public/Profile'; // Import the new ProfilePage
import { logoutUser } from '../../../features/authSlice';
import { useDispatch } from 'react-redux';
import DashboardPage from '../admin/main menu item/DashboardPage';
import UsersPage from '../admin/main menu item/UsersPage';
import CalendarPage from '../admin/main menu item/CalendarPage';
import EventsPage from '../admin/main menu item/EventsPage';
import LeavePage from '../admin/main menu item/LeavePage';
import StaffPage from '../admin/hospital menu items/StaffPage';
import PatientsPage from '../admin/hospital menu items/PatientsPage';
import LaboratoryPage from '../admin/hospital menu items/LaboratoryPage';
import BillingPage from '../admin/hospital menu items/BillingPage';
import ReportsPage from '../admin/hospital menu items/ReportsPage';
import ServicePage from '../../components/services/Services';
import SettingsPage from '../../components/setting/SettingsPage';

// Create a theme with hospital colors
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#009688' },
    background: { default: '#f5f7fa' },
    error: { main: '#e53935' },
    warning: { main: '#ffa000' },
    success: { main: '#43a047' },
    info: { main: '#03a9f4' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)' } } },
    MuiAppBar: { styleOverrides: { root: { borderTopLeftRadius: 0, borderTopRightRadius: 0 } } }
  }
});

// Styled components
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: isMobile ? 0 : (open ? drawerWidth : 0),
  })
);

const StyledAppBar = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, isMobile }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...(isMobile ? {} : open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    })
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end'
}));

// Menu item definitions for cleaner rendering
const mainMenuItems = [
  { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon/>, component: <DashboardPage /> },
  { id: 'users', text: 'User Management', icon: <PersonAddIcon />, component: <UsersPage /> },
  { id: 'calendar', text: 'Calendar', icon: <CalendarIcon />, component: <CalendarPage /> },
  { id: 'events', text: 'Events', icon: <EventIcon />, component: <EventsPage /> },
  { id: 'leave', text: 'Leave Requests', icon: <AssignmentIcon />, component: <LeavePage /> }
];

const hospitalMenuItems = [
  { id: 'staff', text: 'Staff Management', icon: <PeopleIcon />, component: <StaffPage/> },
  { id: 'patients', text: 'Patient Records', icon: <BedIcon />, component: <PatientsPage /> },
  { id: 'pharmacy', text: 'Pharmacy', icon: <BiotechIcon />, component: <LaboratoryPage /> },
  { id: 'billing', text: 'Billing', icon: <MonetizationOnIcon />, component: <BillingPage /> },
  { id: 'reports', text: 'Reports', icon: <ReportIcon />, component: <ReportsPage /> },
  { id: 'services', text: 'Services', icon: <ReportIcon />, component: <ServicePage /> }
];

// Adding profile menu items
const profileMenuItems = [
  { id: 'profile', text: 'Profile', icon: <PersonIcon />, component: <ProfilePage /> },
  { id: 'settings', text: 'Settings', icon: <SettingsIcon />, component: <SettingsPage /> }
];

const DoctorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch=useDispatch()

  // Reset drawer state on mobile/desktop switch
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // Combine all menu items for easier lookup
  const allMenuItems = [...mainMenuItems, ...hospitalMenuItems, ...profileMenuItems];
  
  // Get current page component
  const getCurrentPageComponent = () => {
    const menuItem = allMenuItems.find(item => item.id === activePage);
    return menuItem ? menuItem.component : <DashboardPage />;
  };

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleNotificationsOpen = (event) => setNotificationsAnchorEl(event.currentTarget);
  const handleNotificationsClose = () => setNotificationsAnchorEl(null);
  
  const handlePageChange = (page) => {
    setActivePage(page);
    // Close the profile menu if open
    if (anchorEl) {
      setAnchorEl(null);
    }
    // For mobile, close drawer after selecting a page
    if (isMobile) {
      setOpen(false);
    }
  };

  // Logout confirmation dialog
  const handleLogoutClick = () => {
    setAnchorEl(null); // Close profile menu if open
    setLogoutDialogOpen(true);
  };
  const handleLogoutCancel = () => setLogoutDialogOpen(false);
  const handleLogoutConfirm = () => {
     dispatch(logoutUser());
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    localStorage.clear(); // Clears any remaining items
    navigate('/signin');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* Top App Bar */}
        <StyledAppBar 
          position="fixed" 
          open={open} 
          isMobile={isMobile}
          sx={{ 
            borderTopLeftRadius: 0, 
            borderTopRightRadius: 0 
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ 
                mr: 2, 
                ...(open && !isMobile && { display: 'none' }) 
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              MediCare Hospital Management System
            </Typography>
            
            {/* Notifications */}
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
              aria-controls="notifications-menu"
              aria-haspopup="true"
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              id="notifications-menu"
              anchorEl={notificationsAnchorEl}
              keepMounted
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                style: {
                  width: '320px',
                  maxHeight: '400px',
                },
              }}
            >
              {/* Notification items can be added here */}
              <MenuItem onClick={handleNotificationsClose}>New patient admitted</MenuItem>
              <MenuItem onClick={handleNotificationsClose}>Lab results ready</MenuItem>
              <MenuItem onClick={handleNotificationsClose}>Staff meeting at 2 PM</MenuItem>
              <MenuItem onClick={handleNotificationsClose}>System maintenance scheduled</MenuItem>
            </Menu>
            
            {/* Profile */}
            <IconButton 
              onClick={handleProfileMenuOpen}
              aria-controls="profile-menu"
              aria-haspopup="true"
              color="inherit"
            >
              <Avatar alt="Admin User" src="/api/placeholder/40/40" />
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => handlePageChange('profile')}>Profile</MenuItem>
              <MenuItem onClick={() => handlePageChange('settings')}>Settings</MenuItem>
            </Menu>
          </Toolbar>
        </StyledAppBar>
        
        {/* Sidebar */}
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant={isMobile ? "temporary" : "persistent"}
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
        >
          <DrawerHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 1 }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                bgcolor: 'primary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1
              }}>
                <MedicalIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: 'primary.main' }}>
                MediCare
              </Typography>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          </DrawerHeader>
          <Divider />
          
          {/* Main Menu Items */}
          <List>
            {mainMenuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton 
                  selected={activePage === item.id} 
                  onClick={() => handlePageChange(item.id)}
                >
                  <ListItemIcon>
                    {React.cloneElement(item.icon, { 
                      color: activePage === item.id ? 'primary' : 'inherit' 
                    })}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1 }}>
            HOSPITAL MANAGEMENT
          </Typography>
          
          {/* Hospital Management Items */}
          <List>
            {hospitalMenuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activePage === item.id} 
                  onClick={() => handlePageChange(item.id)}
                >
                  <ListItemIcon>
                    {React.cloneElement(item.icon, { 
                      color: activePage === item.id ? 'primary' : 'inherit' 
                    })}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          {/* User Profile Items - Also shown in sidebar for convenience */}
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1 }}>
            USER ACCOUNT
          </Typography>
          
          <List>
            {profileMenuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activePage === item.id} 
                  onClick={() => handlePageChange(item.id)}
                >
                  <ListItemIcon>
                    {React.cloneElement(item.icon, { 
                      color: activePage === item.id ? 'primary' : 'inherit' 
                    })}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          <Box sx={{ p: 2 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              color="error" 
              startIcon={<LogoutIcon />}
              sx={{ borderRadius: 2 }}
              onClick={handleLogoutClick}
            >
              Sign Out
            </Button>
          </Box>
        </Drawer>
        
        {/* Main Content */}
        <Main open={open} isMobile={isMobile}>
          <DrawerHeader /> {/* This creates space at the top */}
          {getCurrentPageComponent()}
        </Main>
        
        {/* Logout Confirmation Dialog */}
        <Dialog
          open={logoutDialogOpen}
          onClose={handleLogoutCancel}
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
        >
          <DialogTitle id="logout-dialog-title">
            Confirm Logout
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Are you sure you want to log out of the system?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogoutCancel}>Cancel</Button>
            <Button onClick={handleLogoutConfirm} color="error" autoFocus>
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default DoctorDashboard;