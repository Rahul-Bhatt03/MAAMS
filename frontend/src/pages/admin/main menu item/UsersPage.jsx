// components/UsersPage.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, fetchUsersByRole } from "../../../../features/authSlice.js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const UsersPage = () => {
  const dispatch = useDispatch();
  const { usersByRole, user, loading, error } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    dob: "",
    email: "",
    password: "",
    role: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);

  // Handle role change and automatically fetch users
  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    if (role) {
      dispatch(fetchUsersByRole(role));
    }
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Enhanced role selection handler with proper logging
  const handleRoleSelection = (event) => {
    const role = event.target.value;
    console.log("Selected role for new user:", role); // Debug log
    setNewUser((prevUser) => {
      const updatedUser = { ...prevUser, role: role };
      console.log("Updated new user state:", updatedUser); // Debug log
      return updatedUser;
    });
  };

  const handleAddUser = () => {
    // Set default role to the currently selected role if available
    const initialRole = selectedRole || "";
    const initialUserData = {
      name: "",
      username: "",
      phoneNumber: "",
      dob: "",
      email: "",
      password: "",
      role: initialRole,
    };
    
    console.log("Initial user data with role:", initialUserData); // Debug log
    setNewUser(initialUserData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewUser({
      name: "",
      username: "",
      phoneNumber: "",
      dob: "",
      email: "",
      password: "",
      role: "",
    });
    setShowPassword(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewUser((prevUser) => {
      // Special handling for role field to ensure it's properly updated
      if (name === "role") {
        console.log(`Setting role to: ${value}`); // Debug log
      }
      return { ...prevUser, [name]: value };
    });
  };

  const handleSubmit = async () => {
    try {
      // Create a copy of the user data to ensure we don't modify the state directly
      const userData = { ...newUser };
      
      // Make sure role is set if it's empty
      if (!userData.role || userData.role === "") {
        userData.role = selectedRole || "public";
      }
      
      console.log("Submitting user data:", userData); // Debug log
      console.log("Role being sent:", userData.role); // Specific debug for role
      
      await dispatch(signupUser(userData)).unwrap();
      
      setSnackbarMessage("User registered successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseDialog();
      
      if (selectedRole) {
        dispatch(fetchUsersByRole(selectedRole)); // Refresh the user list
      }
    } catch (error) {
      console.error("Signup error:", error); // Debug log
      setSnackbarMessage(error.message || "Failed to register user");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Determine available roles for the add user dialog based on current user's role
  const getAvailableRoles = () => {
    const allRoles = ["admin", "superAdmin", "groupAdmin", "doctor", "nurse", "pharmist", "public"];
    
    if (!user) return [];
    
    switch (user.role) {
      case "admin":
        return allRoles.filter(role => role !== "superAdmin" && role !== "groupAdmin");
      case "superAdmin":
        return allRoles; // All roles available
      case "groupAdmin":
        return allRoles.filter(role => role !== "superAdmin");
      default:
        return [];
    }
  };

  // Debug effect to log the newUser state whenever it changes
  useEffect(() => {
    console.log("Current newUser state:", newUser);
  }, [newUser]);

  return (
    <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}>
        User Management
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={selectedRole}
              onChange={handleRoleChange}
              label="Select Role"
              fullWidth
            >
              <MenuItem value="" disabled>
                Select Role
              </MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="superAdmin">Super Admin</MenuItem>
              <MenuItem value="groupAdmin">Group Admin</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
              <MenuItem value="pharmist">Pharmist</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {["admin", "superAdmin", "groupAdmin"].includes(user?.role) && (
          <Grid item xs={12} sm={6} md={4}>
            <Button variant="contained" onClick={handleAddUser} fullWidth>
              Add User
            </Button>
          </Grid>
        )}
      </Grid>

      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : usersByRole.length > 0 ? (
                usersByRole.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users found for the selected role.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Name"
            value={newUser.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="username"
            label="Username"
            value={newUser.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="phoneNumber"
            label="Phone Number"
            value={newUser.phoneNumber}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="dob"
            label="Date of Birth"
            type="date"
            value={newUser.dob}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="email"
            label="Email"
            value={newUser.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={newUser.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="new-user-role-label">Role</InputLabel>
            <Select
              labelId="new-user-role-label"
              id="new-user-role"
              name="role"
              value={newUser.role}
              onChange={handleRoleSelection}
              label="Role"
            >
              {getAvailableRoles().map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!newUser.name || !newUser.email || !newUser.password || !newUser.role}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;