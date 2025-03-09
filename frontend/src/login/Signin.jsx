import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearError } from "../../features/authSlice";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Collapse,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";

const SigninPage = () => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  
  // Redux and navigation hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  // Display error from Redux state
  useEffect(() => {
    if (error) {
      showAlert(error, "error");
    }
  }, [error]);

  // Handle successful login and navigation
  useEffect(() => {
    if (user) {
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      const roleRoutes = {
        public: "/",
        admin: "/admin-dashboard",
        superAdmin: "/superAdmin-dashboard",
        doctor: "/doctor-dashboard",
        nurse: "/nurse-dashboard",
      };
      
      const route = roleRoutes[user.role] || "/";
      showAlert(`Welcome, ${user.name || 'User'}! Redirecting...`, "success");
      
      // Small delay to show the welcome message
      const timer = setTimeout(() => {
        navigate(route);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showAlert("Please fill in all required fields", "error");
      return;
    }

    // Clear any previous errors
    dispatch(clearError());
    
    // Dispatch login action
    dispatch(loginUser({ email, password }));
  };

  // Helper function to show alerts
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm" component="main" sx={{ py: 4 }}>
      {/* Alert for notifications */}
      <Collapse in={alertOpen}>
        <Alert 
          severity={alertType}
          action={
            <IconButton
              size="small"
              onClick={() => setAlertOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {alertMessage}
        </Alert>
      </Collapse>

      {/* Main signin card */}
      <Paper 
        elevation={6} 
        sx={{
          borderRadius: 2,
          transition: "box-shadow 0.3s",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom fontWeight="bold">
            Welcome Back
          </Typography>
          
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 3 }}>
            Sign in to access your account
          </Typography>

          {/* Login form */}
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  transition: "border-color 0.3s",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      sx={{
                        transition: "opacity 0.3s",
                        "&:hover": { opacity: 0.7 }
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  transition: "border-color 0.3s",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                transition: "background-color 0.3s, transform 0.2s",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  transform: "translateY(-2px)"
                }
              }}
              disabled={loading}
              endIcon={<LoginIcon />}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
            
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  style={{ 
                    textDecoration: "none",
                    fontWeight: "medium",
                    transition: "color 0.3s",
                    color: "#1976d2"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#1565c0"}
                  onMouseLeave={(e) => e.target.style.color = "#1976d2"}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SigninPage;