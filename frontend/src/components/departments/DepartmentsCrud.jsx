import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDepartments,
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "../../../features/departmentSlice";
import { fetchAllDoctors } from "../../../features/doctorSlice";
import { uploadFile } from "../../../features/uploadSlice";
import { getAllServices } from "../../../features/serviceSlice";

// Components
import DepartmentCard from "./DepartmentCard"; // Adjust the import path as needed

// MUI Components
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  IconButton,
} from "@mui/material";

// MUI Icons
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";

const DepartmentsCrud = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [openForm, setOpenForm] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    doctors: [],
    services: [],
    timings: "",
    imageUrl: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  // Redux state
  const { departments, status, error } = useSelector(
    (state) => state.departments
  );
  
  // Fix for doctors selector
  const doctorsState = useSelector((state) => state.doctors);
  const doctors = doctorsState?.items || [];
  
  // Get services directly from the root state to avoid the undefined error
  const servicesFromState = useSelector((state) => state.services);
  const services = servicesFromState?.services || 
                   servicesFromState?.items || 
                   (Array.isArray(servicesFromState) ? servicesFromState : []);

  const {
    loading: uploadLoading,
    url: uploadedFileUrl,
    error: uploadError,
  } = useSelector((state) => state.upload);

  // Check user role from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = ["admin", "superadmin", "groupadmin"].includes(user.role);

  // Load departments, doctors, and services on component mount
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchAllDoctors());
    dispatch(getAllServices());
  }, [dispatch]);

  // Update formData when file is uploaded
  useEffect(() => {
    if (uploadedFileUrl) {
      setFormData((prev) => ({ ...prev, imageUrl: uploadedFileUrl }));
      setSnackbar({
        open: true,
        message: "File uploaded successfully",
        severity: "success",
      });
    }
  }, [uploadedFileUrl]);

  // Show error if upload fails
  useEffect(() => {
    if (uploadError) {
      setSnackbar({
        open: true,
        message: `Upload failed: ${uploadError}`,
        severity: "error",
      });
    }
  }, [uploadError]);

  // Filter departments based on search term
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(filterTerm.toLowerCase())
  );

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.timings.trim()) errors.timings = "Timings are required";
    if (!formData.imageUrl && !fileToUpload && !editMode) 
      errors.image = "Department image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle doctor selection
  const handleDoctorChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, doctors: value }));
  };

  // Handle service selection
  const handleServiceChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({ ...prev, services: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setFilePreview(URL.createObjectURL(file));
      if (formErrors.image) {
        setFormErrors((prev) => ({ ...prev, image: undefined }));
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (fileToUpload) {
      await dispatch(uploadFile(fileToUpload));
      return true;
    }
    return false;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // First upload file if selected
    if (fileToUpload) {
      const uploaded = await handleFileUpload();
      if (!uploaded) return;
    }

    // Create department with data
    const departmentData = {
      ...formData,
      image: formData.imageUrl, // Ensure field name matches backend expectation
    };

    let result;
    
    if (editMode) {
      result = await dispatch(updateDepartment({ 
        id: selectedDepartmentId, 
        departmentData 
      }));
    } else {
      result = await dispatch(createDepartment(departmentData));
    }

    if (!result.error) {
      // Reset form
      setFormData({
        name: "",
        description: "",
        doctors: [],
        services: [],
        timings: "",
        imageUrl: "",
      });
      setFilePreview(null);
      setFileToUpload(null);
      setOpenForm(false);
      setEditMode(false);
      setSelectedDepartmentId(null);
      setSnackbar({
        open: true,
        message: editMode 
          ? "Department updated successfully" 
          : "Department created successfully",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: `Failed to ${editMode ? 'update' : 'create'} department: ${result.error}`,
        severity: "error",
      });
    }
  };

  // Handle department deletion
  const handleDeleteDepartment = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      dispatch(deleteDepartment(id)).then((result) => {
        if (!result.error) {
          setSnackbar({
            open: true,
            message: "Department deleted successfully",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: `Failed to delete department: ${result.error}`,
            severity: "error",
          });
        }
      });
    }
  };

  // Handle department edit
  const handleEditDepartment = (department) => {
    setEditMode(true);
    setSelectedDepartmentId(department._id);
  
    // Set form data with department values
    setFormData({
      name: department.name,
      description: department.description,
      doctors: department.doctors?.map(doc => typeof doc === 'object' ? doc._id : doc) || [],
      services: department.services?.map(serv => typeof serv === 'object' ? serv.name : serv) || [],
      timings: department.timings,
      imageUrl: department.imageUrl || department.image,
    });
  
    // Show image preview if available
    if (department.imageUrl || department.image) {
      setFilePreview(department.imageUrl || department.image);
    }
  
    setOpenForm(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setOpenForm(false);
    setEditMode(false);
    setSelectedDepartmentId(null);
    setFormData({
      name: "",
      description: "",
      doctors: [],
      services: [],
      timings: "",
      imageUrl: "",
    });
    setFilePreview(null);
    setFileToUpload(null);
    setFormErrors({});
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Preset timing options
  const timingPresets = [
    "Mon-Fri: 9am-5pm",
    "Mon-Sat: 9am-7pm",
    "Mon-Fri: 8am-6pm, Sat: 9am-1pm",
    "24/7",
    "Mon-Fri: 10am-8pm, Sat-Sun: 10am-6pm",
  ];

  return (
    <Container maxWidth="100%" sx={{ py: 4, px: 3 }}>
      {/* Header with filter and add button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: isMobile ? "column" : "row",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Departments
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            width: isMobile ? "100%" : "auto",
            flexDirection: isMobile ? "column" : "row",
            
          }}
        >
          <TextField
            placeholder="Filter departments..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth={isMobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditMode(false);
                setOpenForm(true);
              }}
              fullWidth={isMobile}
            >
              Add Department
            </Button>
          )}
        </Box>
      </Box>

      {/* Loading state */}
      {status === "loading" && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {status === "failed" && (
        <Alert severity="error" sx={{ my: 2 }}>
          Failed to load departments: {error}
        </Alert>
      )}

      {/* Department Cards */}
      <Grid container spacing={3} >
        {filteredDepartments.map((department) => (
          <Grid item xs={12} sm={6} md={4} key={department._id}>
            <DepartmentCard
              department={department}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
              showAdminActions={true}
            />
          </Grid>
        ))}
      </Grid>

      {/* No results state */}
      {filteredDepartments.length === 0 && status !== "loading" && (
        <Paper sx={{ p: 3, textAlign: "center", mt: 2 }}>
          <Typography variant="h6">No departments found</Typography>
          <Typography variant="body2" color="text.secondary">
            {departments.length === 0
              ? "No departments have been added yet."
              : "No departments match your filter criteria."}
          </Typography>
        </Paper>
      )}

      {/* Add/Edit Department Form Dialog */}
      <Dialog open={openForm} onClose={handleFormClose} fullWidth maxWidth="md">
        <DialogTitle>
          {editMode ? "Edit Department" : "Add New Department"}
          <IconButton
            aria-label="close"
            onClick={handleFormClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Department Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
              />
              
              {/* Only one Timing Input - Combined select and input */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="timing-label">Operating Hours</InputLabel>
                <Select
                  labelId="timing-label"
                  id="timing-select"
                  value={formData.timings}
                  onChange={handleChange}
                  name="timings"
                  error={!!formErrors.timings}
                  input={<OutlinedInput label="Operating Hours" />}
                  startAdornment={
                    <InputAdornment position="start">
                      <AccessTimeIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em>Select or type your operating hours</em>
                  </MenuItem>
                  {timingPresets.map((preset) => (
                    <MenuItem key={preset} value={preset}>
                      {preset}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">
                    <em>Custom hours (type below)</em>
                  </MenuItem>
                </Select>
                <FormHelperText error={!!formErrors.timings}>
                  {formErrors.timings || 
                    (formData.timings === "custom" ? 
                      "Please type custom hours below" : 
                      "Select a preset or choose custom to enter your own")
                  }
                </FormHelperText>
              </FormControl>
              
              {/* Show custom input only if needed */}
              {formData.timings === "custom" && (
                <TextField
                  name="timings"
                  label="Custom Operating Hours"
                  fullWidth
                  value={formData.timings === "custom" ? "" : formData.timings}
                  onChange={handleChange}
                  error={!!formErrors.timings}
                  helperText={formErrors.timings || "e.g. Mon-Fri: 9am-5pm, Sat: 10am-2pm"}
                  margin="normal"
                  placeholder="e.g. Mon-Fri: 9am-5pm, Sat: 10am-2pm"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                margin="normal"
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Department Image</Divider>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                  border: "1px dashed",
                  borderColor: formErrors.image ? "error.main" : "grey.300",
                  borderRadius: 1,
                }}
              >
                {filePreview ? (
                  <Box
                    sx={{ position: "relative", width: "100%", maxWidth: 300 }}
                  >
                    <img
                      src={filePreview}
                      alt="Department preview"
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "rgba(255,255,255,0.8)",
                      }}
                      onClick={() => {
                        setFilePreview(null);
                        setFileToUpload(null);
                        // Only clear the imageUrl if in edit mode and a new file was selected
                        if (editMode && fileToUpload) {
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color={formErrors.image ? "error" : "text.secondary"}
                    sx={{ mb: 2 }}
                  >
                    {formErrors.image || 
                      (editMode ? 
                        "Upload a new image or keep existing" : 
                        "Upload an image for the department (required)")
                    }
                  </Typography>
                )}

                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                  disabled={uploadLoading}
                  color={formErrors.image ? "error" : "primary"}
                >
                  {uploadLoading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            </Grid>

            {/* Services */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="services-select-label">Services</InputLabel>
              <Select
                labelId="services-select-label"
                id="services-select"
                multiple
                value={formData.services}
                onChange={handleServiceChange}
                input={<OutlinedInput label="Services" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {Array.isArray(services) && services.length > 0 ? (
                  services.map((service) => (
                    <MenuItem key={service._id} value={service.name}>
                      {service.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No services available</MenuItem>
                )}
              </Select>
              <FormHelperText>
                {Array.isArray(services) && services.length > 0
                  ? "Select services for this department. The service names will be saved."
                  : "No services available. Please add services first."
                }
              </FormHelperText>
            </FormControl>

            {/* Doctors */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Doctors</Divider>
              <FormControl fullWidth margin="normal">
                <InputLabel id="doctors-select-label">
                  Select Doctors
                </InputLabel>
                <Select
                  labelId="doctors-select-label"
                  id="doctors-select"
                  multiple
                  value={formData.doctors}
                  onChange={handleDoctorChange}
                  input={<OutlinedInput label="Select Doctors" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((doctorId) => {
                        const doctor = doctors.find((d) => d._id === doctorId);
                        return (
                          <Chip
                            key={doctorId}
                            label={
                              doctor
                                ? `Dr. ${doctor.name}`
                                : "Unknown Doctor"
                            }
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {doctors && doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name}  ({doctor.specialization || "No specialization"})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No doctors available</MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {doctors && doctors.length > 0 
                    ? "Select doctors for this department. The doctor IDs will be saved."
                    : "No doctors available. Please add doctors first."
                  }
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleFormClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={uploadLoading || status === "loading"}
            startIcon={
              uploadLoading || status === "loading" ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {status === "loading" 
              ? (editMode ? "Updating..." : "Creating...") 
              : (editMode ? "Update Department" : "Create Department")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DepartmentsCrud;