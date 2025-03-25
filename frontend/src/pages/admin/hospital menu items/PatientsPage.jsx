import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchPatients,
  deletePatient,
  createPatient,
  updatePatient,
} from "../../../../features/patientSlice";
import { fetchAllDoctors } from "../../../../features/doctorSlice";
import { fetchDepartments } from "../../../../features/departmentSlice";
import { fetchAllNurses } from "../../../../features/nurseSlice";
import { format } from "date-fns";

// MUI Components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  IconButton,
  Pagination,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Grid,
  Menu,
  CircularProgress,
  Tab,
  Tabs,
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";

// MUI Icons
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const PatientsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state selectors
  const {
    patients,
    pagination,
    loading: patientsLoading,
  } = useSelector((state) => state.patients);
  const { doctors = [], loading: doctorsLoading } = useSelector(
    (state) => state.doctors
  );
  const { departments = [], loading: departmentsLoading } = useSelector(
    (state) => state.departments
  );
  const { nurses = [], loading: nursesLoading } = useSelector(
    (state) => state.nurses
  );

  // State for filters and UI
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    doctorId: "",
    departmentId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form related state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Main form data state
  const [patientFormData, setPatientFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nepal",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    medicalHistory: [],
    allergies: "",
    currentMedications: [],
    admissionDate: "",
    dischargeDate: "",
    assignedDoctorId: "",
    assignedNurses: [],
    departmentId: "",
    status: "Outpatient",
    roomNumber: "",
    visits: [],
    upcomingAppointments: [],
    insuranceInfo: {
      provider: "",
      policyNumber: "",
      expiryDate: "",
    },
    profilePic: "",
    isActive: true,
    isDeleted: false,
  });

  // Temporary states for complex form inputs
  const [tempMedicalHistory, setTempMedicalHistory] = useState({
    condition: "",
    diagnisisDate: null,
    treatment: "",
    notes: "",
  });

  const [tempMedication, setTempMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: null,
    endDate: null,
  });

  // Load initial data
  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 10 }));
    dispatch(fetchAllDoctors());
    dispatch(fetchDepartments());
    dispatch(fetchAllNurses());
  }, [dispatch]);

  // Filter and pagination handlers
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    dispatch(
      fetchPatients({
        page: 1,
        limit: pagination.limit,
        ...filters,
      })
    );
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      status: "",
      doctorId: "",
      departmentId: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    dispatch(fetchPatients({ page: 1, limit: pagination.limit }));
  };

  const handlePageChange = (event, page) => {
    dispatch(
      fetchPatients({
        page,
        limit: pagination.limit,
        ...filters,
      })
    );
  };

  // Patient CRUD operations
  const confirmDelete = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (patientToDelete) {
      dispatch(deletePatient(patientToDelete._id));
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Admitted":
        return "success";
      case "Discharged":
        return "primary";
      case "Outpatient":
        return "warning";
      case "Emergency":
        return "error";
      default:
        return "default";
    }
  };

  // Form handlers
  const handleFormChange = (e, section = null) => {
    const { name, value } = e.target;

    if (section) {
      setPatientFormData({
        ...patientFormData,
        [section]: {
          ...patientFormData[section],
          [name]: value,
        },
      });
    } else {
      setPatientFormData({
        ...patientFormData,
        [name]: value,
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Medical history handlers
  const handleAddMedicalHistory = () => {
    if (!tempMedicalHistory.condition) return;
    
    setPatientFormData({
      ...patientFormData,
      medicalHistory: [...patientFormData.medicalHistory, {...tempMedicalHistory}]
    });
    
    setTempMedicalHistory({
      condition: "",
      diagnisisDate: null,
      treatment: "",
      notes: "",
    });
  };

  const handleRemoveMedicalHistory = (index) => {
    setPatientFormData({
      ...patientFormData,
      medicalHistory: patientFormData.medicalHistory.filter((_, i) => i !== index)
    });
  };

  // Medication handlers
  const handleAddMedication = () => {
    if (!tempMedication.name) return;
    
    setPatientFormData({
      ...patientFormData,
      currentMedications: [...patientFormData.currentMedications, {...tempMedication}]
    });
    
    setTempMedication({
      name: "",
      dosage: "",
      frequency: "",
      startDate: null,
      endDate: null,
    });
  };

  const handleRemoveMedication = (index) => {
    setPatientFormData({
      ...patientFormData,
      currentMedications: patientFormData.currentMedications.filter((_, i) => i !== index)
    });
  };

  // Profile picture handler
  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPatientFormData({
        ...patientFormData,
        profilePic: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Form open/close handlers
  const openNewPatientForm = () => {
    setIsEditMode(false);
    setPatientFormData({
      name: "",
      gender: "",
      dateOfBirth: "",
      bloodGroup: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Nepal",
      },
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      medicalHistory: [],
      allergies: "",
      currentMedications: [],
      admissionDate: "",
      dischargeDate: "",
      assignedDoctorId: "",
      assignedNurses: [],
      departmentId: "",
      status: "Outpatient",
      roomNumber: "",
      visits: [],
      upcomingAppointments: [],
      insuranceInfo: {
        provider: "",
        policyNumber: "",
        expiryDate: "",
      },
      profilePic: "",
      isActive: true,
      isDeleted: false,
    });
    
    setTempMedicalHistory({
      condition: "",
      diagnisisDate: null,
      treatment: "",
      notes: "",
    });
    
    setTempMedication({
      name: "",
      dosage: "",
      frequency: "",
      startDate: null,
      endDate: null,
    });
    
    setFormErrors({});
    setTabValue(0);
    setFormDialogOpen(true);
  };

  const openEditPatientForm = (patient) => {
    setIsEditMode(true);

    // Format dates for input fields
    const dob = patient.dateOfBirth
      ? format(new Date(patient.dateOfBirth), "yyyy-MM-dd")
      : "";

    const expiryDate = patient.insuranceInfo?.expiryDate
      ? format(new Date(patient.insuranceInfo.expiryDate), "yyyy-MM-dd")
      : "";
      
    const admissionDate = patient.admissionDate
      ? format(new Date(patient.admissionDate), "yyyy-MM-dd")
      : "";
      
    const dischargeDate = patient.dischargeDate
      ? format(new Date(patient.dischargeDate), "yyyy-MM-dd")
      : "";

    setPatientFormData({
      id: patient._id,
      name: patient.name || "",
      gender: patient.gender || "",
      dateOfBirth: dob,
      bloodGroup: patient.bloodGroup || "",
      email: patient.email || "",
      phone: patient.phone || "",
      address: {
        street: patient.address?.street || "",
        city: patient.address?.city || "",
        state: patient.address?.state || "",
        zipCode: patient.address?.zipCode || "",
        country: patient.address?.country || "Nepal",
      },
      emergencyContact: {
        name: patient.emergencyContact?.name || "",
        relationship: patient.emergencyContact?.relationship || "",
        phone: patient.emergencyContact?.phone || "",
      },
      medicalHistory: patient.medicalHistory || [],
      allergies: patient.allergies ? patient.allergies.join(", ") : "",
      currentMedications: patient.currentMedications || [],
      admissionDate: admissionDate,
      dischargeDate: dischargeDate,
      assignedDoctorId: patient.assignedDoctor?._id || "",
      assignedNurses: patient.assignedNurses?.map(nurse => nurse._id) || [],
      departmentId: patient.department?._id || "",
      status: patient.status || "Outpatient",
      roomNumber: patient.roomNumber || "",
      visits: patient.visits || [],
      upcomingAppointments: patient.upcomingAppointments || [],
      insuranceInfo: {
        provider: patient.insuranceInfo?.provider || "",
        policyNumber: patient.insuranceInfo?.policyNumber || "",
        expiryDate: expiryDate,
      },
      profilePic: patient.profilePic || "",
      isActive: patient.isActive !== false,
      isDeleted: patient.isDeleted || false,
    });

    setFormErrors({});
    setTabValue(0);
    setFormDialogOpen(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Basic required fields
    if (!patientFormData.name) errors.name = "Name is required";
    if (!patientFormData.gender) errors.gender = "Gender is required";
    if (!patientFormData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!patientFormData.phone) errors.phone = "Phone number is required";

    // Email validation
    if (patientFormData.email && !/\S+@\S+\.\S+/.test(patientFormData.email)) {
      errors.email = "Email format is invalid";
    }
    
    // Admission validation
    if (patientFormData.status === "Admitted" && !patientFormData.admissionDate) {
      errors.admissionDate = "Admission date is required for admitted patients";
    }
    
    // Discharge validation
    if (patientFormData.status === "Discharged" && !patientFormData.dischargeDate) {
      errors.dischargeDate = "Discharge date is required for discharged patients";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmitForm = () => {
    if (!validateForm()) return;

    setFormSubmitting(true);

    // Convert allergies string to array
    const allergiesArray = patientFormData.allergies
      ? patientFormData.allergies.split(",").map((item) => item.trim())
      : [];

    // Prepare data for submission
    const patientData = {
      ...patientFormData,
      allergies: allergiesArray,
    };

    const promise = isEditMode
      ? dispatch(
          updatePatient({
            patientId: patientData.id,
            data: { ...patientData, id: undefined },
          })
        )
      : dispatch(createPatient(patientData));

    promise
      .then((result) => {
        if (!result.error) {
          setFormDialogOpen(false);
          // Refresh patient list
          dispatch(
            fetchPatients({
              page: pagination.page || 1,
              limit: pagination.limit || 10,
              ...filters,
            })
          );
        }
      })
      .catch((error) => {
        console.error("Failed to save patient:", error);
      })
      .finally(() => {
        setFormSubmitting(false);
      });
  };

  const isLoading = patientsLoading || doctorsLoading || departmentsLoading || nursesLoading;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Add Patient Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Patient Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewPatientForm}
        >
          Add New Patient
        </Button>
      </Box>
      
      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Filters"
          subheader="Filter patient records by various criteria"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Patient Name"
                variant="outlined"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                placeholder="Search by name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Admitted">Admitted</MenuItem>
                  <MenuItem value="Discharged">Discharged</MenuItem>
                  <MenuItem value="Outpatient">Outpatient</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={filters.doctorId}
                  onChange={(e) => handleFilterChange("doctorId", e.target.value)}
                  label="Doctor"
                  disabled={doctorsLoading}
                >
                  <MenuItem value="">All Doctors</MenuItem>
                  {doctors?.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.departmentId}
                  onChange={(e) => handleFilterChange("departmentId", e.target.value)}
                  label="Department"
                  disabled={departmentsLoading}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments?.map((department) => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={applyFilters}
              disabled={isLoading}
            >
              Apply Filters
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Patient List Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Date Added</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : patients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>No patients found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                patients?.map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      <Link 
                        to={`/patients/${patient._id}`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>{patient.name}</Typography>
                      </Link>
                    </TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.status} 
                        color={getStatusColor(patient.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {patient.assignedDoctor
                        ? `Dr. ${patient.assignedDoctor.name}`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      {patient.department ? patient.department.name : "Unassigned"}
                    </TableCell>
                    <TableCell>{patient.roomNumber || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(patient.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedPatient(patient);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              navigate(`/patients/${selectedPatient?._id}`);
              setAnchorEl(null);
            }}
          >
            <VisibilityIcon sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem
            onClick={() => {
              openEditPatientForm(selectedPatient);
              setAnchorEl(null);
            }}
          >
            <EditIcon sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              confirmDelete(selectedPatient);
              setAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
        
        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the patient record for {patientToDelete?.name}. 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Patient Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isEditMode ? "Edit Patient" : "Add New Patient"}
            <IconButton onClick={() => setFormDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Personal Information" />
              <Tab label="Medical Information" />
              <Tab label="Emergency Contact" />
              <Tab label="Admission Details" />
              <Tab label="Medical History" />
              <Tab label="Medications" />
              <Tab label="Visits" />
            </Tabs>
          </Box>
          
          {/* Personal Information Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={patientFormData.name}
                  onChange={handleFormChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.gender}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    name="gender"
                    value={patientFormData.gender}
                    onChange={handleFormChange}
                    label="Gender *"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.gender && (
                    <FormHelperText>{formErrors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={patientFormData.dateOfBirth}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.dateOfBirth}
                  helperText={formErrors.dateOfBirth}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    name="bloodGroup"
                    value={patientFormData.bloodGroup}
                    onChange={handleFormChange}
                    label="Blood Group"
                  >
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={patientFormData.email}
                  onChange={handleFormChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={patientFormData.phone}
                  onChange={handleFormChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Address
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street"
                  value={patientFormData.address.street}
                  onChange={(e) => handleFormChange(e, 'address')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={patientFormData.address.city}
                  onChange={(e) => handleFormChange(e, 'address')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={patientFormData.address.state}
                  onChange={(e) => handleFormChange(e, 'address')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={patientFormData.address.zipCode}
                  onChange={(e) => handleFormChange(e, 'address')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={patientFormData.address.country}
                  onChange={(e) => handleFormChange(e, 'address')}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
          
          {/* Medical Information Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies"
                  name="allergies"
                  value={patientFormData.allergies}
                  onChange={handleFormChange}
                  margin="normal"
                  helperText="Enter allergies separated by commas"
                />
              </Grid>
            </Grid>
          )}
          
          {/* Emergency Contact Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  name="name"
                  value={patientFormData.emergencyContact.name}
                  onChange={(e) => handleFormChange(e, 'emergencyContact')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  name="relationship"
                  value={patientFormData.emergencyContact.relationship}
                  onChange={(e) => handleFormChange(e, 'emergencyContact')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="phone"
                  value={patientFormData.emergencyContact.phone}
                  onChange={(e) => handleFormChange(e, 'emergencyContact')}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
          
          {/* Admission Details Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={patientFormData.status}
                    onChange={handleFormChange}
                    label="Status"
                  >
                    <MenuItem value="Outpatient">Outpatient</MenuItem>
                    <MenuItem value="Admitted">Admitted</MenuItem>
                    <MenuItem value="Discharged">Discharged</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="doctor-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-label"
                    name="assignedDoctorId"
                    value={patientFormData.assignedDoctorId}
                    onChange={handleFormChange}
                    label="Doctor"
                    disabled={doctorsLoading}
                  >
                    <MenuItem value="">None</MenuItem>
                    {doctors?.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="nurses-label">Assigned Nurses</InputLabel>
                  <Select
                    labelId="nurses-label"
                    name="assignedNurses"
                    multiple
                    value={patientFormData.assignedNurses}
                    onChange={(e) => setPatientFormData({
                      ...patientFormData,
                      assignedNurses: e.target.value
                    })}
                    renderValue={(selected) => {
                      const selectedNurses = nurses.filter(nurse => 
                        selected.includes(nurse._id)
                      );
                      return selectedNurses.map(n => n.name).join(', ');
                    }}
                    label="Assigned Nurses"
                    disabled={nursesLoading}
                  >
                    {nurses?.map((nurse) => (
                      <MenuItem key={nurse._id} value={nurse._id}>
                        {nurse.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="departmentId"
                    value={patientFormData.departmentId}
                    onChange={handleFormChange}
                    label="Department"
                    disabled={departmentsLoading}
                  >
                    <MenuItem value="">None</MenuItem>
                    {departments?.map((department) => (
                      <MenuItem key={department._id} value={department._id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  name="roomNumber"
                  value={patientFormData.roomNumber}
                  onChange={handleFormChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Admission Date"
                    value={patientFormData.admissionDate ? new Date(patientFormData.admissionDate) : null}
                    onChange={(newValue) => setPatientFormData({
                      ...patientFormData,
                      admissionDate: newValue
                    })}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        margin="normal"
                        error={!!formErrors.admissionDate}
                        helperText={formErrors.admissionDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Discharge Date"
                    value={patientFormData.dischargeDate ? new Date(patientFormData.dischargeDate) : null}
                    onChange={(newValue) => setPatientFormData({
                      ...patientFormData,
                      dischargeDate: newValue
                    })}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        margin="normal"
                        error={!!formErrors.dischargeDate}
                        helperText={formErrors.dischargeDate}
                      />
                    )}
                    disabled={patientFormData.status !== "Discharged"}
                  />
                </LocalizationProvider>
              </Grid>
              
              {/* Profile Picture Upload */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Profile Picture
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {patientFormData.profilePic && (
                    <Box
                      component="img"
                      src={patientFormData.profilePic}
                      alt="Patient"
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                  )}
                  
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleProfilePicChange}
                    />
                  </Button>
                  
                  {patientFormData.profilePic && (
                    <Button 
                      color="error" 
                      onClick={() => setPatientFormData({...patientFormData, profilePic: ""})}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Insurance Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  name="provider"
                  value={patientFormData.insuranceInfo.provider}
                  onChange={(e) => handleFormChange(e, 'insuranceInfo')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  name="policyNumber"
                  value={patientFormData.insuranceInfo.policyNumber}
                  onChange={(e) => handleFormChange(e, 'insuranceInfo')}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  name="expiryDate"
                  value={patientFormData.insuranceInfo.expiryDate}
                  onChange={(e) => handleFormChange(e, 'insuranceInfo')}
                  InputLabelProps={{ shrink: true }}
                  margin="normal"
                />
              </Grid>
              
              {/* Active Status - only visible in edit mode */}
              {isEditMode && (
                <Grid item xs={12} sm={6}>
                  <FormControl component="fieldset" margin="normal">
                    <Typography variant="subtitle1">Status Control</Typography>
                    <RadioGroup
                      row
                      name="isActive"
                      value={patientFormData.isActive}
                      onChange={(e) => setPatientFormData({
                        ...patientFormData,
                        isActive: e.target.value === 'true'
                      })}
                    >
                      <FormControlLabel 
                        value={true} 
                        control={<Radio />} 
                        label="Active" 
                      />
                      <FormControlLabel 
                        value={false} 
                        control={<Radio />} 
                        label="Inactive" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          )}
          
          {/* Medical History Tab */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Add Medical History
                </Typography>
              </Grid>
              
              {/* Medical History Form */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medical Condition"
                  value={tempMedicalHistory.condition}
                  onChange={(e) => setTempMedicalHistory({...tempMedicalHistory, condition: e.target.value})}
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Diagnosis Date"
                    value={tempMedicalHistory.diagnisisDate}
                    onChange={(newValue) => setTempMedicalHistory({...tempMedicalHistory, diagnisisDate: newValue})}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Treatment"
                  value={tempMedicalHistory.treatment}
                  onChange={(e) => setTempMedicalHistory({...tempMedicalHistory, treatment: e.target.value})}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={tempMedicalHistory.notes}
                  onChange={(e) => setTempMedicalHistory({...tempMedicalHistory, notes: e.target.value})}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddMedicalHistory}
                  sx={{ mt: 1 }}
                >
                  Add Record
                </Button>
              </Grid>
              
              {/* Display existing medical history */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Medical History Records
                </Typography>
                
                {patientFormData.medicalHistory.length === 0 ? (
                  <Typography color="text.secondary">No medical history records</Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Condition</TableCell>
                          <TableCell>Diagnosis Date</TableCell>
                          <TableCell>Treatment</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patientFormData.medicalHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.condition}</TableCell>
                            <TableCell>
                              {record.diagnisisDate 
                                ? format(new Date(record.diagnisisDate), "MMM dd, yyyy") 
                                : "N/A"}
                            </TableCell>
                            <TableCell>{record.treatment || "N/A"}</TableCell>
                            <TableCell>{record.notes || "N/A"}</TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveMedicalHistory(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}
          
          {/* Medications Tab */}
          {tabValue === 5 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Add Current Medication
                </Typography>
              </Grid>
              
              {/* Medication Form */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  value={tempMedication.name}
                  onChange={(e) => setTempMedication({...tempMedication, name: e.target.value})}
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dosage"
                  value={tempMedication.dosage}
                  onChange={(e) => setTempMedication({...tempMedication, dosage: e.target.value})}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frequency"
                  value={tempMedication.frequency}
                  onChange={(e) => setTempMedication({...tempMedication, frequency: e.target.value})}
                  margin="normal"
                  placeholder="e.g., Twice Daily"
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={tempMedication.startDate}
                    onChange={(newValue) => setTempMedication({...tempMedication, startDate: newValue})}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={tempMedication.endDate}
                    onChange={(newValue) => setTempMedication({...tempMedication, endDate: newValue})}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddMedication}
                  sx={{ mt: 1 }}
                >
                  Add Medication
                </Button>
              </Grid>
              
              {/* Display existing medications */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Current Medications
                </Typography>
                
                {patientFormData.currentMedications.length === 0 ? (
                  <Typography color="text.secondary">No medications recorded</Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medication</TableCell>
                          <TableCell>Dosage</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patientFormData.currentMedications.map((med, index) => (
                          <TableRow key={index}>
                            <TableCell>{med.name}</TableCell>
                            <TableCell>{med.dosage || "N/A"}</TableCell>
                            <TableCell>{med.frequency || "N/A"}</TableCell>
                            <TableCell>
                              {med.startDate 
                                ? format(new Date(med.startDate), "MMM dd, yyyy") 
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {med.endDate 
                                ? format(new Date(med.endDate), "MMM dd, yyyy") 
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveMedication(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}
          
          {/* Visits Tab */}
          {tabValue === 6 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">
                  Visit records will be managed from the patient details page. This data is view-only during patient creation or editing.
                </Typography>
              </Grid>
              
              {isEditMode && patientFormData.visits && patientFormData.visits.length > 0 ? (
                <Grid item xs={12}>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Diagnosis</TableCell>
                          <TableCell>Doctor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patientFormData.visits.map((visit, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(visit.date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>{visit.reason || "N/A"}</TableCell>
                            <TableCell>{visit.diagnosis || "N/A"}</TableCell>
                            <TableCell>
                              {visit.doctor?.name ? `Dr. ${visit.doctor.name}` : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No visit records available.
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  Upcoming Appointments
                </Typography>
                
                {isEditMode && patientFormData.upcomingAppointments && patientFormData.upcomingAppointments.length > 0 ? (
                  <Typography>
                    This patient has {patientFormData.upcomingAppointments.length} upcoming appointments. Manage appointments from the Appointments page.
                  </Typography>
                ) : (
                  <Typography color="text.secondary">
                    No upcoming appointments scheduled.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setFormDialogOpen(false)}
            disabled={formSubmitting}
          >
            Cancel
          </Button>
          {tabValue > 0 && (
            <Button
              variant="outlined"
              onClick={() => setTabValue(tabValue - 1)}
              disabled={formSubmitting}
            >
              Back
            </Button>
          )}
          {tabValue < 6 ? (
            <Button
              variant="contained"
              onClick={() => setTabValue(tabValue + 1)}
              disabled={formSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmitForm}
              disabled={formSubmitting}
              startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isEditMode ? "Update Patient" : "Add Patient"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientsPage;