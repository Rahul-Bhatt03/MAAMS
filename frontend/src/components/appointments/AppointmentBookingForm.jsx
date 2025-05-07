import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../../../features/departmentSlice";
import { fetchPatients } from "../../../features/patientSlice";
import { createAppointment } from "../../../features/appointmentSlice";
import { 
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress, 
  FormControl,
  FormHelperText,
  Grid as MuiGrid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fetchDoctorsByDepartment } from "../../../features/doctorSlice";
import { CalendarMonth, AccessTime, Notes, MedicalServices, Healing } from "@mui/icons-material";
import { format, parseISO } from 'date-fns';

const Grid = ({ children, xs = 12, sm = 6, md = 6, lg = 4, xl = 3, ...props }) => {
  return (
    <MuiGrid 
      item 
      xs={xs} 
      sm={sm} 
      md={md} 
      lg={lg} 
      xl={xl}
      {...props}
    >
      {children}
    </MuiGrid>
  );
};

const AppointmentBookingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const { loading = false, error = null, success = false } = useSelector((state) => state.appointments || {});
  const { departments = [] } = useSelector((state) => state.departments || {});
  const { items: doctors = [] } = useSelector((state) => state.doctors || {});
  const { patients: patientData = [] } = useSelector((state) => state.patients || {});
  const user = useSelector((state) => state.auth?.user);
  
  const patients = Array.isArray(patientData) 
    ? patientData 
    : patientData?.success?.patients || patientData?.patients || [];

  const [isLoading, setIsLoading] = useState({
    departments: false,
    doctors: false,
    patients: false
  });

  const [formData, setFormData] = useState({
    departmentId: "",
    doctorId: "",
    patientId: "",
    date: new Date(),
    timeSlot: "",
    notes: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  useEffect(() => {
    setIsLoading(prev => ({ ...prev, departments: true }));
    
    dispatch(fetchDepartments())
      .unwrap()
      .catch(error => {
        console.error("Error fetching departments:", error);
        setSnackbar({
          open: true,
          message: "Failed to load departments. Please try again.",
          severity: "error"
        });
      })
      .finally(() => {
        setIsLoading(prev => ({ ...prev, departments: false }));
      });
      
    if (user?.role === "admin" || user?.role === "groupAdmin") {
      setIsLoading(prev => ({ ...prev, patients: true }));
      
      dispatch(fetchPatients())
        .unwrap()
        .catch(error => {
          console.error("Error fetching patients:", error);
          setSnackbar({
            open: true,
            message: "Failed to load patients. Please try again.",
            severity: "error"
          });
        })
        .finally(() => {
          setIsLoading(prev => ({ ...prev, patients: false }));
        });
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (formData.departmentId) {
      setIsLoading(prev => ({ ...prev, doctors: true }));
      
      dispatch(fetchDoctorsByDepartment(formData.departmentId))
        .unwrap()
        .catch(error => {
          console.error("Error fetching doctors:", error);
          setSnackbar({
            open: true,
            message: "Failed to load doctors. Please try again.",
            severity: "error"
          });
        })
        .finally(() => {
          setIsLoading(prev => ({ ...prev, doctors: false }));
        });
    }
  }, [formData.departmentId, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "doctorId") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        timeSlot: "" // Reset timeSlot when doctor changes
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date, timeSlot: "" })); // Reset timeSlot when date changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.timeSlot) {
      setSnackbar({
        open: true,
        message: "Please select a time slot",
        severity: "error"
      });
      return;
    }
    
    const submissionData = {
      ...formData,
      date: formData.date instanceof Date 
        ? format(formData.date, 'yyyy-MM-dd')
        : format(parseISO(formData.date), 'yyyy-MM-dd'),
      timeSlot: formData.timeSlot
    };
  
    if (!submissionData.departmentId || !submissionData.doctorId || 
        !submissionData.date || !submissionData.timeSlot) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error"
      });
      return;
    }
    
    if ((user?.role === "admin" || user?.role === "groupAdmin") && !submissionData.patientId) {
      setSnackbar({
        open: true,
        message: "Please select a patient",
        severity: "error"
      });
      return;
    }
    
    try {
      await dispatch(createAppointment(submissionData)).unwrap();
      setSnackbar({
        open: true,
        message: "Appointment created successfully",
        severity: "success"
      });

      setFormData({
        departmentId: "",
        doctorId: "",
        patientId: "",
        date: new Date(),
        timeSlot: "",
        notes: "",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.message || "Failed to create appointment",
        severity: "error"
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filterPastDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  
  const getDepartmentId = (dept) => {
    if (!dept) return null;
    return dept._id || dept.id || null;
  };
  
  const getDepartmentName = (dept) => {
    if (!dept) return "Unknown Department";
    return dept.name || "Unnamed Department";
  };
  
  const validDepartments = Array.isArray(departments) 
    ? departments.filter(dept => dept && (dept._id || dept.id))
    : [];

  const fieldWidths = {
    xs: 12,
    sm: isSmallScreen ? 12 : 6,
    md: isMediumScreen ? 6 : 4,
    lg: isLargeScreen ? 3 : 4
  };

  // Get the selected doctor's available slots
  const selectedDoctor = doctors.find(doc => doc._id === formData.doctorId);
  const availableSlots = selectedDoctor?.availableSlots || [];

  // Filter slots by selected day
  const filteredSlots = formData.date 
    ? availableSlots.filter(slot => {
        const selectedDay = format(formData.date, 'EEEE'); // Get day name (e.g. "Monday")
        return slot.day === selectedDay;
      })
    : availableSlots;

  return (
    <Paper elevation={3} sx={{ 
      borderRadius: 1, 
      overflow: 'hidden',
      bgcolor: 'background.paper',
      transition: 'all 0.3s ease-in-out',
      '&:hover': { boxShadow: 6 },
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <MedicalServices fontSize="large" />
        <Typography variant="h5" fontWeight="bold">
          Book New Appointment
        </Typography>
      </Box>

      <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <MuiGrid container spacing={3}>
              <Grid {...fieldWidths}>
                <FormControl fullWidth>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="departmentId"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    label="Department"
                    required
                    disabled={isLoading.departments}
                    startAdornment={
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        {isLoading.departments ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Healing fontSize="small" />
                        )}
                      </Box>
                    }
                  >
                    <MenuItem value=""><em>Select Department</em></MenuItem>
                    {validDepartments.length > 0 ? (
                      validDepartments.map((dept) => (
                        <MenuItem key={getDepartmentId(dept)} value={getDepartmentId(dept)}>
                          {getDepartmentName(dept)}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No departments available</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>
                    {isLoading.departments 
                      ? "Loading departments..." 
                      : validDepartments.length === 0 
                        ? "No departments available" 
                        : "Choose the medical department"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid {...fieldWidths}>
                <FormControl fullWidth disabled={!formData.departmentId || isLoading.doctors}>
                  <InputLabel id="doctor-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-label"
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    label="Doctor"
                    required
                    startAdornment={
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        {isLoading.doctors ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <MedicalServices fontSize="small" />
                        )}
                      </Box>
                    }
                  >
                    <MenuItem value=""><em>Select Doctor</em></MenuItem>
                    {doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        doctor?._id && (
                          <MenuItem key={doctor._id} value={doctor._id}>
                            {doctor.name || "Unnamed Doctor"}
                          </MenuItem>
                        )
                      ))
                    ) : (
                      <MenuItem disabled>No doctors available</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>
                    {!formData.departmentId 
                      ? "Please select a department first" 
                      : isLoading.doctors
                        ? "Loading doctors..."
                        : doctors.length === 0
                          ? "No doctors available for this department"
                          : "Choose your preferred doctor"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </MuiGrid>

            {(user?.role === "admin" || user?.role === "groupAdmin") && (
              <Grid xs={12}>
                <FormControl fullWidth disabled={isLoading.patients}>
                  <InputLabel id="patient-label">Patient</InputLabel>
                  <Select
                    labelId="patient-label"
                    id="patientId"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    label="Patient"
                    required
                    startAdornment={
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        {isLoading.patients ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <MedicalServices fontSize="small" />
                        )}
                      </Box>
                    }
                  >
                    <MenuItem value=""><em>Select Patient</em></MenuItem>
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        patient?._id && (
                          <MenuItem key={patient._id} value={patient._id}>
                            {patient.name || "Unnamed Patient"} - {patient.email || "No email"}
                          </MenuItem>
                        )
                      ))
                    ) : (
                      <MenuItem disabled>No patients available</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>
                    {isLoading.patients 
                      ? "Loading patients..." 
                      : patients.length === 0 
                        ? "No patients available" 
                        : "Select the patient for this appointment"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}

            <MuiGrid container spacing={3}>
              <Grid {...fieldWidths}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={formData.date}
                    onChange={handleDateChange}
                    shouldDisableDate={filterPastDates}
                    minDate={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        InputProps: {
                          startAdornment: (
                            <Box sx={{ mr: 1, color: 'primary.main' }}>
                              <CalendarMonth fontSize="small" />
                            </Box>
                          ),
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid {...fieldWidths}>
                <FormControl fullWidth disabled={!formData.doctorId || !formData.date}>
                  <InputLabel id="timeSlot-label">Time Slot</InputLabel>
                  <Select
                    labelId="timeSlot-label"
                    id="timeSlot"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleInputChange}
                    label="Time Slot"
                    required
                    startAdornment={
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        <AccessTime fontSize="small" />
                      </Box>
                    }
                  >
                    <MenuItem value=""><em>Select Time Slot</em></MenuItem>
                    {filteredSlots.length > 0 ? (
                      filteredSlots.map((slot) => (
                        <MenuItem key={slot._id} value={slot.time}>
                          {slot.time}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        {!formData.doctorId ? "Please select a doctor first" : 
                         !formData.date ? "Please select a date first" : 
                         "No available slots for selected day"}
                      </MenuItem>
                    )}
                  </Select>
                  <FormHelperText>
                    {!formData.doctorId 
                      ? "Please select doctor first" 
                      : !formData.date
                        ? "Please select date first"
                        : filteredSlots.length === 0
                          ? "No available slots for selected day"
                          : "Choose your preferred time slot"}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </MuiGrid>

            <Grid xs={12}>
              <TextField
                fullWidth
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                multiline
                name="notes"
                label="Notes (Optional)"
                variant="outlined"
                id="notes"
                placeholder="Add any special instructions or notes for the doctor"
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, mt: 1, color: 'primary.main', alignSelf: 'flex-start' }}>
                      <Notes fontSize="small" />
                    </Box>
                  ),
                }}
              />
            </Grid>

            <Grid xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: 2,
                  mt: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </Grid>
          </Stack>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity} 
            sx={{ width: "100%", boxShadow: 3 }}
            variant="filled"
            elevation={6}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Paper>
  );
};

export default AppointmentBookingForm;