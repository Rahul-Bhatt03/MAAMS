import React, { useState } from "react";
import { Button, TextField, Card, Typography, Box, Container, IconButton, CircularProgress, Alert } from "@mui/material";
import { Google, Facebook, VisibilityOff, Visibility } from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../features/authSlice";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {toast} from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  },
}));

const AnimatedTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    },
    "&.Mui-focused": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    },
  },
});

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1.5),
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
}));

const SignupPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth); // Access loading and error from Redux store
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    dob: null,
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dob: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    dispatch(signupUser({
      ...formData,
      dob: formData.dob ? dayjs(formData.dob).format("YYYY-MM-DD") : "",
    }))
    .then(() => {
      toast.success("Registration successfull !please sign in")
   setTimeout(()=>{
    navigate("/signin")
   },2000) 
  })
.catch(()=>{
  toast.error("registration failed ! please try again")
})
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <StyledCard>
        <motion.div initial="hidden" animate="visible">
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)", backgroundClip: "text", textFillColor: "transparent", mb: 4 }}>
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {["Name", "Username", "Email"].map((label, index) => (
              <AnimatedTextField
                key={label}
                label={label}
                variant="outlined"
                fullWidth
                required
                name={label.toLowerCase().replace(" ", "")}
                value={formData[label.toLowerCase().replace(" ", "")]}
                onChange={handleInputChange}
                type={label.toLowerCase().includes("password") ? "password" : "text"}
                sx={{ mb: 1 }}
              />
            ))}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DesktopDatePicker
                label="Date of Birth"
                inputFormat="MM/DD/YYYY"
                value={formData.dob}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

            <AnimatedTextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              required
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              type="tel"
              sx={{ mb: 1 }}
            />

            <AnimatedTextField
              label="Password"
              variant="outlined"
              fullWidth
              required
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              type={showPassword ? "text" : "password"}
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <IconButton position="end" onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <AnimatedTextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              type={showConfirmPassword ? "text" : "password"}
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <IconButton position="end" onClick={handleClickShowConfirmPassword} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                borderRadius: 2,
                height: 56,
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(33, 203, 243, .4)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
            </Button>

            <Typography align="center" sx={{ mt: 2, color: "text.secondary" }}>
              Already Have An Account ?{" "}
              <Typography component="span" color="primary" sx={{ cursor: "pointer", textDecoration: "underline", "&:hover": { color: "#21CBF3" } }} onClick={() => navigate("/signin")}>
                Sign in now
              </Typography>
            </Typography>
          </Box>
        </motion.div>
      </StyledCard>
    </Container>
  );
};

export default SignupPage;
