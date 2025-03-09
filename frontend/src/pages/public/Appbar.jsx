import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../../features/authSlice';
import { searchDatabase, clearSearchResults } from '../../../features/searchSlice';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Container,
  InputBase,
  Button,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useMediaQuery,
  Tooltip,
  alpha,
  styled,
  useTheme,
  Paper,
  CircularProgress,
  ClickAwayListener,
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';
import WorkIcon from '@mui/icons-material/Work';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';

// Custom styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 30,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.3s',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const SearchResults = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  right: 0,
  left: 0,
  zIndex: 1000,
  maxHeight: '300px',
  overflow: 'auto',
  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  borderRadius: '0 0 8px 8px',
  marginTop: '2px',
}));

const ResultItem = styled(ListItem)(({ theme }) => ({
  borderLeft: '3px solid transparent',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderLeftColor: theme.palette.primary.main,
  },
}));

const SearchSection = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#0d47a1',
  background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const NavButton = styled(Button)(({ theme, active }) => ({
  color: 'white',
  margin: theme.spacing(0, 0.5),
  fontWeight: 500,
  fontSize: '0.95rem',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: active ? '80%' : '0%',
    height: '3px',
    bottom: '0',
    left: '10%',
    backgroundColor: theme.palette.secondary.main,
    transition: 'width 0.3s ease',
    borderRadius: '3px',
  },
  '&:hover:after': {
    width: '80%',
  },
}));

const NavBarSkeleton = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {children}
  </Box>
);

const NoResultsMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const HospitalAppBar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get authentication state from Redux
  const { token, user } = useSelector((state) => {
    let authState = state.auth;
    if (!authState.user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          authState = {
            ...authState,
            user: JSON.parse(storedUser)
          };
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    return authState;
  });

  // Fixed: Properly handle potentially undefined search state
  const searchState = useSelector((state) => state.search || { results: { users: [], departments: [] }, loading: false, error: null });
  const { results, loading: searchLoading, error: searchError } = searchState;
  
  const isAuthenticated = !!token || !!localStorage.getItem('token');

  // Local state for UI
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const unreadNotificationsCount = 2; // Simplified from original

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim().length > 2) {
        dispatch(searchDatabase({ query, page: currentPage, limit: resultsPerPage }));
        setIsSearchOpen(true);
      } else {
        dispatch(clearSearchResults());
        setIsSearchOpen(false);
      }
    }, 500),
    [dispatch, currentPage, resultsPerPage]
  );

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      dispatch(searchDatabase({ query: searchValue, page: 1, limit: resultsPerPage }));
      setCurrentPage(1);
      setIsSearchOpen(true);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchValue('');
    dispatch(clearSearchResults());
    setIsSearchOpen(false);
  };

  // Handle search result click
  const handleResultClick = (type, id) => {
    setIsSearchOpen(false);
    navigate(`/${type}/${id}`);
  };

  // List of main navigation links
  const navLinks = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Appointments', path: '/appointments', icon: <EventIcon /> },
    { name: 'Services', path: '/services', icon: <MedicalServicesIcon /> },
    { name: 'Departments', path: '/departments', icon: <LocalHospitalIcon /> },
    { name: 'Research', path: '/research', icon: <ScienceIcon /> },
    { name: 'Careers', path: '/careers', icon: <WorkIcon /> },
  ];

  // List of profile menu items
  const profileMenuItems = [
    { name: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { name: 'Medical History', path: '/medical-history', icon: <HistoryIcon /> },
    { name: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
    { name: 'Appointments', path: '/my-appointments', icon: <ScheduleIcon /> },
    { name: 'Saved Doctors', path: '/saved-doctors', icon: <BookmarkIcon /> },
  ];

  // Check if given path is active
  const isActiveLink = (path) => location.pathname === path;

  // Handle drawer and menu toggles
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuToggle = () => setProfileMenuOpen(!profileMenuOpen);
  const handleClickAway = () => setIsSearchOpen(false);

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
    setProfileMenuOpen(false);
    navigate('/');
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ height: { xs: 56, sm: 64 }, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 2 }}>
        <Avatar src="/hospital-logo.png" alt="Hospital Logo" sx={{ width: 100, height: 100 }} />
      </Box>

      {isAuthenticated && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">{user?.name || 'User'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
          </Typography>
        </Box>
      )}

      <Divider />

      <List>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.name}
            component={Link}
            to={link.path}
            selected={isActiveLink(link.path)}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.name} />
            {isActiveLink(link.path) && <ArrowRightIcon />}
          </ListItem>
        ))}
      </List>

      <Divider />

      {isAuthenticated ? (
        <List>
          {profileMenuItems.map((item) => (
            <ListItem
              button
              key={item.name}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
          <ListItem
            button
            onClick={handleLogout}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            component={Link}
            to="/signin"
            onClick={() => setMobileOpen(false)}
            sx={{ mb: 1 }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            component={Link}
            to="/signup"
            onClick={() => setMobileOpen(false)}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );

  // Determine if search results are empty
  const hasSearchResults = results && (results.users?.length > 0 || results.departments?.length > 0);

  return (
    <>
      <StyledAppBar>
        <Container maxWidth="xl">
          <StyledToolbar disableGutters>
            {/* Logo & Mobile Menu Button */}
            <NavBarSkeleton>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Box
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Avatar
                  alt="MediCare+"
                  src="/url-logo.png"
                  sx={{
                    width: 40,
                    height: 40,
                    mr: 1,
                    border: '2px solid white',
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)',
                  }}
                />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '.1rem',
                    color: 'inherit',
                    display: { xs: 'none', md: 'flex' },
                  }}
                >
                  MediCare<Box component="span" sx={{ color: theme.palette.secondary.main }}>+</Box>
                </Typography>
              </Box>
            </NavBarSkeleton>

            {/* Navigation Links (Desktop) */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1, ml: 4 }}>
                {navLinks.map((link) => (
                  <NavButton
                    key={link.name}
                    component={Link}
                    to={link.path}
                    active={isActiveLink(link.path) ? 1 : 0}
                    startIcon={link.icon}
                  >
                    {link.name}
                  </NavButton>
                ))}
              </Box>
            )}

            {/* Search Bar with Results */}
            <Box sx={{ 
              flexGrow: { xs: 1, md: 0 }, 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center' 
            }}>
              <ClickAwayListener onClickAway={handleClickAway}>
                <SearchSection>
                  <form onSubmit={handleSearch}>
                    <Search>
                      <SearchIconWrapper>
                        <SearchIcon />
                      </SearchIconWrapper>
                      <StyledInputBase
                        placeholder="Search..."
                        inputProps={{ 'aria-label': 'search' }}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      {searchValue && (
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'white',
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Search>
                  </form>

                  {/* Search Results Dropdown */}
                  {isSearchOpen && (
                    <SearchResults>
                      {searchLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : searchError ? (
                        <NoResultsMessage>
                          <Typography>Error: {searchError}</Typography>
                        </NoResultsMessage>
                      ) : !hasSearchResults && searchValue.trim().length > 2 ? (
                        <NoResultsMessage>
                          <Typography>No results found for "{searchValue}"</Typography>
                        </NoResultsMessage>
                      ) : (
                        <>
                          {results.users?.length > 0 && (
                            <>
                              <Typography variant="subtitle2" sx={{ px: 2, py: 1, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                Users
                              </Typography>
                              <List dense>
                                {results.users.map((user) => (
                                  <ResultItem
                                    key={user._id}
                                    button
                                    onClick={() => handleResultClick('user', user._id)}
                                  >
                                    <ListItemIcon>
                                      <PersonIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={user.name}
                                      secondary={`${user.email} • ${user.role}`}
                                    />
                                  </ResultItem>
                                ))}
                              </List>
                            </>
                          )}

                          {results.departments?.length > 0 && (
                            <>
                              <Typography variant="subtitle2" sx={{ px: 2, py: 1, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                Departments
                              </Typography>
                              <List dense>
                                {results.departments.map((dept) => (
                                  <ResultItem
                                    key={dept._id}
                                    button
                                    onClick={() => handleResultClick('department', dept._id)}
                                  >
                                    <ListItemIcon>
                                      <LocalHospitalIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={dept.name}
                                      secondary={dept.description.substring(0, 60) + (dept.description.length > 60 ? '...' : '')}
                                    />
                                  </ResultItem>
                                ))}
                              </List>
                            </>
                          )}

                          {hasSearchResults && (
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => {
                                  navigate(`/search-results?query=${searchValue}`);
                                  setIsSearchOpen(false);
                                }}
                              >
                                View all results
                              </Button>
                            </Box>
                          )}
                        </>
                      )}
                    </SearchResults>
                  )}
                </SearchSection>
              </ClickAwayListener>

              {/* Login Button or Profile Menu */}
              {isAuthenticated ? (
                <Box sx={{ position: 'relative' }}>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleProfileMenuToggle}
                      sx={{
                        p: 0.5,
                        border: profileMenuOpen ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
                        transition: 'all 0.3s',
                      }}
                    >
                      <Badge
                        badgeContent={unreadNotificationsCount}
                        color="error"
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar
                          alt={user?.name || 'User'}
                          src={user?.profilePic || '/default-avatar.png'}
                          sx={{ width: 35, height: 35 }}
                        />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to="/signin"
                  sx={{ ml: 2, borderRadius: '24px', px: 3 }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </StyledToolbar>
        </Container>
      </StyledAppBar>
      
      <Toolbar />

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Profile Drawer */}
      <Drawer
        anchor="right"
        open={profileMenuOpen}
        onClose={handleProfileMenuToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          },
        }}
      >
        <Box sx={{ height: { xs: 56, sm: 64 }, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} />
        
        <Box sx={{ p: 3, backgroundColor: '#f5f9ff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              alt={user?.name || 'User'}
              src={user?.profilePic || '/default-avatar.png'}
              sx={{ width: 60, height: 60, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{user?.name || 'User'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            component={Link}
            to="/profile/edit"
            onClick={handleProfileMenuToggle}
            sx={{ mb: 1 }}
          >
            Edit Profile
          </Button>
        </Box>

        <Divider />

        <List>
          {profileMenuItems.map((item) => (
            <ListItem
              button
              key={item.name}
              component={Link}
              to={item.path}
              onClick={handleProfileMenuToggle}
              sx={{
                borderLeft: isActiveLink(item.path) ? `4px solid ${theme.palette.primary.main}` : 'none',
                backgroundColor: isActiveLink(item.path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
              {item.name === 'Notifications' && unreadNotificationsCount > 0 && (
                <Badge badgeContent={unreadNotificationsCount} color="error" />
              )}
            </ListItem>
          ))}
        </List>

        <Divider />

        <ListItem
          button
          onClick={handleLogout}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Drawer>
    </>
  );
};

export default HospitalAppBar;