import React, { useEffect, useState, useCallback } from "react";
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
import { uploadFile } from "../../../../features/uploadSlice";
import { format, parseISO, isValid } from "date-fns";
import debounce from "lodash/debounce";

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
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
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


// Initial form state
const initialPatientFormData = {
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
  assignedDoctor: "",
  assignedNurses: [],
  department: "",
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
};

const PatientsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme=useTheme()
  const isMobile=useMediaQuery(theme.breakpoints.down('sm'));

  // Redux state selectors
  const {
    patients = [],
    allPatientPayloads = [],
    pagination = {},
    loading: patientsLoading = false,
    error: patientsError,
  } = useSelector((state) => state.patients) || {};

  const {
    items: doctors = [],
    loading: doctorsLoading = false,
    error: doctorsError,
  } = useSelector((state) => state.doctors) || {};

  const {
    departments = [],
    loading: departmentsLoading = false,
    error: departmentsError,
  } = useSelector((state) => state.departments) || {};

  const {
    items: nurses = [],
    loading: nursesLoading = false,
    error: nursesError,
  } = useSelector((state) => state.nurses) || {};

  const {
    url: uploadedImageUrl,
    loading: uploadLoading,
    error: uploadError,
  } = useSelector((state) => state.upload);

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form related state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  //local state for table pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page,setPage]=useState(0);

  // Main form data state
  const [patientFormData, setPatientFormData] = useState(
    initialPatientFormData
  );

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

  // Debounced fetch patients function
  const debouncedFetchPatients = useCallback(
    debounce((filters) => {
      dispatch(
        fetchPatients({
          page: 1,
          limit: pagination.limit || 10,
          ...filters,
        })
      );
    }, 500),
    [dispatch, pagination.limit]
  );

  const handleChangePage=(event,newPage)=>{
    setPage(newPage);
  }

  const handleChangeRowsPerPage=(event)=>{
    setRowsPerPage(parseInt(event.target.value,10 ))
      setPage(newPage)
  }

  // Load initial data
  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 10 }));
    dispatch(fetchAllDoctors());
    dispatch(fetchDepartments());
    dispatch(fetchAllNurses());
  }, [dispatch]);

  // Load dropdown data when form opens
  useEffect(() => {
    if (formDialogOpen) {
      dispatch(fetchAllDoctors());
      dispatch(fetchDepartments());
      dispatch(fetchAllNurses());
    }
  }, [formDialogOpen, dispatch]);

  // Auto-fetch when filters change
  useEffect(() => {
    debouncedFetchPatients(filters);
  }, [filters, debouncedFetchPatients]);

  // Show errors if any
  useEffect(() => {
    const error =
      patientsError ||
      doctorsError ||
      departmentsError ||
      nursesError ||
      uploadError;
    if (error) {
      setSnackbar({
        open: true,
        message:
          typeof error === "string"
            ? error
            : error.message || "An error occurred",
        severity: "error",
      });
    }
  }, [patientsError, doctorsError, departmentsError, nursesError, uploadError]);

  // Helper function to get error message
  const getError = (fieldName) => {
    if (fieldName.includes(".")) {
      const [parent, child] = fieldName.split(".");
      return formErrors[`${parent}.${child}`] || "";
    }
    return formErrors[fieldName] || "";
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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

  const handleDelete = async () => {
    if (patientToDelete) {
      const result = await dispatch(deletePatient(patientToDelete._id));
      if (!result.error) {
        setSnackbar({
          open: true,
          message: "Patient deleted successfully",
          severity: "success",
        });
      }
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
    
    // For debugging - log all changes
    console.log(`Field changed: ${section ? `${section}.${name}` : name}`, "Value:", value);
  
    setPatientFormData(prev => {
      const newState = {...prev};
      
      if (section) {
        newState[section] = {
          ...prev[section],
          [name]: value
        };
      } else {
        newState[name] = value;
      }
      
      return newState;
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Medical history handlers
  const handleAddMedicalHistory = () => {
    if (!tempMedicalHistory.condition) {
      setSnackbar({
        open: true,
        message: "Condition is required for medical history",
        severity: "error",
      });
      return;
    }

    setPatientFormData((prev) => ({
      ...prev,
      medicalHistory: [...prev.medicalHistory, { ...tempMedicalHistory }],
    }));

    setTempMedicalHistory({
      condition: "",
      diagnisisDate: null,
      treatment: "",
      notes: "",
    });
  };

  const handleRemoveMedicalHistory = (index) => {
    setPatientFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  // Medication handlers
  const handleAddMedication = () => {
    if (!tempMedication.name) {
      setSnackbar({
        open: true,
        message: "Medication name is required",
        severity: "error",
      });
      return;
    }

    setPatientFormData((prev) => ({
      ...prev,
      currentMedications: [...prev.currentMedications, { ...tempMedication }],
    }));

    setTempMedication({
      name: "",
      dosage: "",
      frequency: "",
      startDate: null,
      endDate: null,
    });
  };

  const handleRemoveMedication = (index) => {
    setPatientFormData((prev) => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index),
    }));
  };

  // Profile picture handler
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await dispatch(uploadFile(file));
      if (!result.error && result.payload?.url) {
        setPatientFormData((prev) => ({
          ...prev,
          profilePic: result.payload.url,
        }));
        setSnackbar({
          open: true,
          message: "Image uploaded successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to upload image",
        severity: "error",
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Basic required fields validation
    if (!patientFormData.name?.trim()) errors.name = "Name is required";
    if (!patientFormData.gender) errors.gender = "Gender is required";
    if (!patientFormData.dateOfBirth)
      errors.dateOfBirth = "Date of birth is required";
    if (!patientFormData.phone?.trim()) errors.phone = "Phone is required";

    // Status-specific validations
    if (
      patientFormData.status === "Admitted" &&
      !patientFormData.admissionDate
    ) {
      errors.admissionDate = "Admission date is required for admitted patients";
    }

    if (
      patientFormData.status === "Discharged" &&
      !patientFormData.dischargeDate
    ) {
      errors.dischargeDate =
        "Discharge date is required for discharged patients";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmitForm = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the form errors before submitting",
        severity: "error",
      });
      return;
    }

    setFormSubmitting(true);

    try {
      // Prepare the data for API submission
      const formattedData = {
        ...patientFormData,
        dateOfBirth: patientFormData.dateOfBirth
          ? new Date(patientFormData.dateOfBirth).toISOString()
          : undefined,
          bloodGroup: patientFormData.bloodGroup || undefined, 
        admissionDate: patientFormData.admissionDate
          ? new Date(patientFormData.admissionDate).toISOString()
          : undefined,
        dischargeDate: patientFormData.dischargeDate
          ? new Date(patientFormData.dischargeDate).toISOString()
          : undefined,
        allergies: patientFormData.allergies
          ? patientFormData.allergies.split(",").map(item => item.trim()).filter(item => item !== "")
          : undefined,
        insuranceInfo: {
          ...patientFormData.insuranceInfo,
          expiryDate: patientFormData.insuranceInfo.expiryDate
            ? new Date(patientFormData.insuranceInfo.expiryDate).toISOString()
            : undefined,
        },
        ...(isEditMode ? { id: patientFormData.id } : {}),
      };

      // Clean up empty fields
      formattedData.address = Object.fromEntries(
        Object.entries(formattedData.address).filter(([_, v]) => v !== "")
      );
      formattedData.emergencyContact = Object.fromEntries(
        Object.entries(formattedData.emergencyContact).filter(([_, v]) => v !== "")
      );
      formattedData.insuranceInfo = Object.fromEntries(
        Object.entries(formattedData.insuranceInfo).filter(([_, v]) => v !== "")
      );

      // Submit to API
      const result = isEditMode
        ? await dispatch(
            updatePatient({
              patientId: patientFormData.id,
              data: formattedData,
            })
          )
        : await dispatch(createPatient(formattedData));

      if (result.error) {
        throw new Error(result.error.message || "Failed to submit form");
      }

      setSnackbar({
        open: true,
        message: isEditMode
          ? "Patient updated successfully"
          : "Patient created successfully",
        severity: "success",
      });
      setFormDialogOpen(false);

      // Refresh patient list
      dispatch(
        fetchPatients({
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          ...filters,
        })
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error.message ||
          (isEditMode
            ? "Failed to update patient"
            : "Failed to create patient"),
        severity: "error",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Form open/close handlers
  const openNewPatientForm = () => {
    setIsEditMode(false);
    setPatientFormData(initialPatientFormData);
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

    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    setPatientFormData({
      ...initialPatientFormData,
      id: patient._id,
      name: patient.name || "",
      gender: patient.gender || "",
      dateOfBirth: formatDate(patient.dateOfBirth),
      bloodGroup: patient.bloodGroup || "",
      email: patient.email || "",
      phone: patient.phone || "",
      address: {
        ...initialPatientFormData.address,
        ...patient.address,
      },
      emergencyContact: {
        ...initialPatientFormData.emergencyContact,
        ...patient.emergencyContact,
      },
      medicalHistory: patient.medicalHistory || [],
      allergies: patient.allergies ? patient.allergies.join(", ") : "",
      currentMedications: patient.currentMedications || [],
      admissionDate: formatDate(patient.admissionDate),
      dischargeDate: formatDate(patient.dischargeDate),
      assignedDoctor: patient.assignedDoctor?._id || "",
      assignedNurses: patient.assignedNurses?.map((nurse) => nurse._id) || [],
      department: patient.department?._id || "",
      status: patient.status || "Outpatient",
      roomNumber: patient.roomNumber || "",
      visits: patient.visits || [],
      upcomingAppointments: patient.upcomingAppointments || [],
      insuranceInfo: {
        ...initialPatientFormData.insuranceInfo,
        provider: patient.insuranceInfo?.provider || "",
        policyNumber: patient.insuranceInfo?.policyNumber || "",
        expiryDate: formatDate(patient.insuranceInfo?.expiryDate),
      },
      profilePic: patient.profilePic || "",
      isActive: patient.isActive !== false,
      isDeleted: patient.isDeleted || false,
    });

    setFormErrors({});
    setTabValue(0);
    setFormDialogOpen(true);
  };

  const isLoading =
    patientsLoading || doctorsLoading || departmentsLoading || nursesLoading;

  return (
    <Box sx={{ p:isMobile?1:3 }}>
      {/* Header and Add Patient Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection:isMobile?"column":"row",
          justifyContent:isMobile?"flex-start": "space-between",
          alignItems: isMobile?"flex-start":"center",
          mb: 3,
          gap:isMobile?2:0,
        }}
      >
        <Typography variant="h4" component="h1">
          Patient Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openNewPatientForm}
          sx={{
            ml:isMobile?0:'auto',
            alignSelf:isMobile?'flex-start':'auto'
          }}
        >
          Add New Patient
        </Button>
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Filters"
          subheader="Patient records will update automatically as you filter"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={isMobile?1:3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size={isMobile?"small":"medium"}
                label="Patient Name"
                variant="outlined"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                placeholder="Search by name"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size={isMobile?"small":"medium"}>
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
              <FormControl fullWidth size={isMobile?"small":"medium"}>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={filters.doctorId}
                  onChange={(e) =>
                    handleFilterChange("doctorId", e.target.value)
                  }
                  label="Doctor"
                  disabled={doctorsLoading}
                >
                  <MenuItem value="">All Doctors</MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size={isMobile?"small":"medium"}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filters.departmentId}
                  onChange={(e) =>
                    handleFilterChange("departmentId", e.target.value)
                  }
                  label="Department"
                  disabled={departmentsLoading}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              startIcon={<RefreshIcon />}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Patient List Table */}
      <Card>
        <Box sx={{width:'100%',overflowX:'auto',position:'relative'}}>
        <TableContainer component={Paper} sx={{minWidth:800}}>
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
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography>No patients found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                patients.filter(p => p?._id).slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage).map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      <Link
                        to={`/patients/${patient._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>
                          {patient.name}
                        </Typography>
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
                      {patient.department
                        ? patient.department.name
                        : "Unassigned"}
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
        </Box>

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
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
 {/* Enhanced Pagination with rows selector */}
 <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderTop: '1px solid rgba(224, 224, 224, 1)'
        }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {page * rowsPerPage + 1} to{' '}
              {Math.min((page + 1) * rowsPerPage, patients.length)} of{' '}
              {patients.length} patients
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Rows</InputLabel>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                label="Rows"
              >
                {[5, 10, 25, 50].map((rows) => (
                  <MenuItem key={rows} value={rows}>
                    {rows} per page
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Pagination
              count={Math.ceil(patients.length / rowsPerPage)}
              page={page + 1}
              onChange={(e, newPage) => handleChangePage(e, newPage - 1)}
              color="primary"
              showFirstButton
              showLastButton
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the patient record for{" "}
            {patientToDelete?.name}. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isEditMode ? "Edit Patient" : "Add New Patient"}
            <IconButton onClick={() => setFormDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
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
                  error={!!getError("name")}
                  helperText={getError("name")}
                  required
                  margin="normal"
                />
              </Grid>

              <FormControl 
  fullWidth 
  margin="normal" 
  error={!!getError("gender")}
  required
>
  <InputLabel id="gender-label">Gender *</InputLabel>
  <Select
    labelId="gender-label"
    name="gender"
    value={patientFormData.gender}
    onChange={(e) => handleFormChange(e)}
    label="Gender *"
    inputProps={{ 'aria-required': 'true' }}
  >
    <MenuItem value=""><em>Select Gender</em></MenuItem>
    <MenuItem value="Male">Male</MenuItem>
    <MenuItem value="Female">Female</MenuItem>
    <MenuItem value="Other">Other</MenuItem>
  </Select>
  {getError("gender") && (
    <FormHelperText error>{getError("gender")}</FormHelperText>
  )}
</FormControl>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={patientFormData.dateOfBirth}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!getError("dateOfBirth")}
                  helperText={getError("dateOfBirth")}
                  required
                  margin="normal"
                />
              </Grid>
              <FormControl fullWidth margin="normal">
  <InputLabel>Blood Group</InputLabel>
  <Select
    name="bloodGroup"
    value={patientFormData.bloodGroup || null}  // Use null instead of empty string
    onChange={handleFormChange}
    label="Blood Group"
  >
    <MenuItem value={null}>Select Blood Group</MenuItem>
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  value={patientFormData.email}
                  onChange={handleFormChange}
                  error={!!getError("email")}
                  helperText={getError("email")}
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
                  error={!!getError("phone")}
                  helperText={getError("phone")}
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
                  onChange={(e) => handleFormChange(e, "address")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={patientFormData.address.city}
                  onChange={(e) => handleFormChange(e, "address")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={patientFormData.address.state}
                  onChange={(e) => handleFormChange(e, "address")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={patientFormData.address.zipCode}
                  onChange={(e) => handleFormChange(e, "address")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={patientFormData.address.country}
                  onChange={(e) => handleFormChange(e, "address")}
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
                  onChange={(e) => handleFormChange(e, "emergencyContact")}
                  error={!!getError("emergencyContact.name")}
                  helperText={getError("emergencyContact.name")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  name="relationship"
                  value={patientFormData.emergencyContact.relationship}
                  onChange={(e) => handleFormChange(e, "emergencyContact")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  name="phone"
                  value={patientFormData.emergencyContact.phone}
                  onChange={(e) => handleFormChange(e, "emergencyContact")}
                  error={!!getError("emergencyContact.phone")}
                  helperText={getError("emergencyContact.phone")}
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
                    value={patientFormData.status || "Outpatient"}
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
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    name="assignedDoctor"
                    value={patientFormData.assignedDoctor || ""}
                    onChange={handleFormChange}
                    label="Doctor"
                    disabled={doctorsLoading}
                  >
                    <MenuItem value="">None</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {doctorsLoading && (
                    <FormHelperText>Loading doctors...</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Assigned Nurses</InputLabel>
                  <Select
                    name="assignedNurses"
                    multiple
                    value={patientFormData.assignedNurses || []}
                    onChange={(e) =>
                      setPatientFormData({
                        ...patientFormData,
                        assignedNurses: e.target.value,
                      })
                    }
                    renderValue={(selected) => {
                      const selectedNurses = nurses.filter((nurse) =>
                        selected.includes(nurse._id)
                      );
                      return selectedNurses.map((n) => n.name).join(", ");
                    }}
                    label="Assigned Nurses"
                    disabled={nursesLoading}
                  >
                    {nurses.map((nurse) => (
                      <MenuItem key={nurse._id} value={nurse._id}>
                        {nurse.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {nursesLoading && (
                    <FormHelperText>Loading nurses...</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={patientFormData.department || ""}
                    onChange={handleFormChange}
                    label="Department"
                    disabled={departmentsLoading}
                  >
                    <MenuItem value="">None</MenuItem>
                    {departments.map((department) => (
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
                    value={
                      patientFormData.admissionDate
                        ? new Date(patientFormData.admissionDate)
                        : null
                    }
                    onChange={(newValue) =>
                      setPatientFormData({
                        ...patientFormData,
                        admissionDate: newValue,
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={!!getError("admissionDate")}
                        helperText={getError("admissionDate")}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Discharge Date"
                    value={
                      patientFormData.dischargeDate
                        ? new Date(patientFormData.dischargeDate)
                        : null
                    }
                    onChange={(newValue) =>
                      setPatientFormData({
                        ...patientFormData,
                        dischargeDate: newValue,
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={!!getError("dischargeDate")}
                        helperText={getError("dischargeDate")}
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {(patientFormData.profilePic || uploadedImageUrl) && (
                    <Box
                      component="img"
                      src={uploadedImageUrl || patientFormData.profilePic}
                      alt="Patient"
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #e0e0e0",
                      }}
                    />
                  )}

                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? "Uploading..." : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleProfilePicChange}
                    />
                  </Button>

                  {(patientFormData.profilePic || uploadedImageUrl) && (
                    <Button
                      color="error"
                      onClick={() => {
                        setPatientFormData({
                          ...patientFormData,
                          profilePic: "",
                        });
                      }}
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
                  onChange={(e) => handleFormChange(e, "insuranceInfo")}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  name="policyNumber"
                  value={patientFormData.insuranceInfo.policyNumber}
                  onChange={(e) => handleFormChange(e, "insuranceInfo")}
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
                  onChange={(e) => handleFormChange(e, "insuranceInfo")}
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
                      onChange={(e) =>
                        setPatientFormData({
                          ...patientFormData,
                          isActive: e.target.value === "true",
                        })
                      }
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
                  onChange={(e) =>
                    setTempMedicalHistory({
                      ...tempMedicalHistory,
                      condition: e.target.value,
                    })
                  }
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Diagnosis Date"
                    value={tempMedicalHistory.diagnisisDate}
                    onChange={(newValue) =>
                      setTempMedicalHistory({
                        ...tempMedicalHistory,
                        diagnisisDate: newValue,
                      })
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="normal" />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Treatment"
                  value={tempMedicalHistory.treatment}
                  onChange={(e) =>
                    setTempMedicalHistory({
                      ...tempMedicalHistory,
                      treatment: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={tempMedicalHistory.notes}
                  onChange={(e) =>
                    setTempMedicalHistory({
                      ...tempMedicalHistory,
                      notes: e.target.value,
                    })
                  }
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
                  <Typography color="text.secondary">
                    No medical history records
                  </Typography>
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
                                ? format(
                                    new Date(record.diagnisisDate),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>{record.treatment || "N/A"}</TableCell>
                            <TableCell>{record.notes || "N/A"}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleRemoveMedicalHistory(index)
                                }
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
                  onChange={(e) =>
                    setTempMedication({
                      ...tempMedication,
                      name: e.target.value,
                    })
                  }
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dosage"
                  value={tempMedication.dosage}
                  onChange={(e) =>
                    setTempMedication({
                      ...tempMedication,
                      dosage: e.target.value,
                    })
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frequency"
                  value={tempMedication.frequency}
                  onChange={(e) =>
                    setTempMedication({
                      ...tempMedication,
                      frequency: e.target.value,
                    })
                  }
                  margin="normal"
                  placeholder="e.g., Twice Daily"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={tempMedication.startDate}
                    onChange={(newValue) =>
                      setTempMedication({
                        ...tempMedication,
                        startDate: newValue,
                      })
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="normal" />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={tempMedication.endDate}
                    onChange={(newValue) =>
                      setTempMedication({
                        ...tempMedication,
                        endDate: newValue,
                      })
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="normal" />
                    )}
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
                  <Typography color="text.secondary">
                    No medications recorded
                  </Typography>
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
                        {patientFormData.currentMedications.map(
                          (med, index) => (
                            <TableRow key={index}>
                              <TableCell>{med.name}</TableCell>
                              <TableCell>{med.dosage || "N/A"}</TableCell>
                              <TableCell>{med.frequency || "N/A"}</TableCell>
                              <TableCell>
                                {med.startDate
                                  ? format(
                                      new Date(med.startDate),
                                      "MMM dd, yyyy"
                                    )
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {med.endDate
                                  ? format(
                                      new Date(med.endDate),
                                      "MMM dd, yyyy"
                                    )
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
                          )
                        )}
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
                  Visit records will be managed from the patient details page.
                  This data is view-only during patient creation or editing.
                </Typography>
              </Grid>

              {isEditMode &&
              patientFormData.visits &&
              patientFormData.visits.length > 0 ? (
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
                              {visit.doctor?.name
                                ? `Dr. ${visit.doctor.name}`
                                : "N/A"}
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

                {isEditMode &&
                patientFormData.upcomingAppointments &&
                patientFormData.upcomingAppointments.length > 0 ? (
                  <Typography>
                    This patient has{" "}
                    {patientFormData.upcomingAppointments.length} upcoming
                    appointments. Manage appointments from the Appointments
                    page.
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
          ) : null}
          <Button
            variant="contained"
            onClick={handleSubmitForm}
            disabled={formSubmitting}
            startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
            sx={{ ml: "auto" }}
          >
            {isEditMode ? "Update Patient" : "Add Patient"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientsPage;