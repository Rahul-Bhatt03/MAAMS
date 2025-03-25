import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDepartmentById, 
  updateDepartment, 
  clearDepartment 
} from '../../../features/departmentSlice';
import { fetchDoctorsByDepartment } from '../../../features/doctorSlice';
import { uploadFile, resetUploadState } from '../../../features/uploadSlice';

// MUI Components
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Skeleton,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery
} from '@mui/material';

// MUI Icons
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalServicesIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';

import { useTheme } from '@mui/material/styles';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redux state
  const { department, status, error } = useSelector(state => state.departments);
  const { items: doctors, loading: doctorsLoading } = useSelector(state => state.doctors);
  const { loading: uploadLoading, url: uploadedFileUrl } = useSelector(state => state.upload);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    doctors: [],
    services: [],
    timings: '',
    imageUrl: ''
  });
  const [filePreview, setFilePreview] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [newService, setNewService] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check user role from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = ['admin', 'superadmin', 'groupadmin'].includes(user.role);

  // Fetch department data
  useEffect(() => {
    dispatch(fetchDepartmentById(id));
    dispatch(fetchDoctorsByDepartment(id));
    
    // Cleanup function
    return () => {
      dispatch(clearDepartment());
      dispatch(resetUploadState());
    };
  }, [dispatch, id]);

  // Populate form data when department is loaded
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        doctors: department.doctors?.map(doc => doc._id || doc) || [],
        services: department.services || [],
        timings: department.timings || '',
        imageUrl: department.imageUrl || ''
      });
    }
  }, [department]);

  // Update form data when file is uploaded
  useEffect(() => {
    if (uploadedFileUrl) {
      setFormData(prev => ({ ...prev, imageUrl: uploadedFileUrl }));
      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success'
      });
    }
  }, [uploadedFileUrl]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle doctor selection
  const handleDoctorChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({ ...prev, doctors: value }));
  };

  // Handle service addition
  const handleAddService = () => {
    if (newService.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  // Handle service removal
  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (fileToUpload) {
      await dispatch(uploadFile(fileToUpload));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // First upload file if selected
    if (fileToUpload) {
      await handleFileUpload();
    }
    
    // Then update department
    const result = await dispatch(updateDepartment({ 
      id: department._id,
      departmentData: formData 
    }));
    
    if (!result.error) {
      setEditMode(false);
      setFilePreview(null);
      setFileToUpload(null);
      setSnackbar({
        open: true,
        message: 'Department updated successfully',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: `Failed to update department: ${result.error}`,
        severity: 'error'
      });
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Reset form data to current department data
      setFormData({
        name: department.name || '',
        description: department.description || '',
        doctors: department.doctors?.map(doc => doc._id || doc) || [],
        services: department.services || [],
        timings: department.timings || '',
        imageUrl: department.imageUrl || ''
      });
      setFilePreview(null);
      setFileToUpload(null);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/departments')}>
            Back to Departments
          </Button>
        </Box>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={100} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  // Error state
  if (status === 'failed' || !department) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/departments')}>
            Back to Departments
          </Button>
        </Box>
        <Alert severity="error" sx={{ my: 2 }}>
          {error || 'Department not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/departments')}>
          Back to Departments
        </Button>
        
        {isAdmin && (
          <Button
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "error" : "primary"}
            startIcon={editMode ? <CloseIcon /> : <EditIcon />}
            onClick={handleEditToggle}
          >
            {editMode ? 'Cancel Editing' : 'Edit Department'}
          </Button>
        )}
      </Box>

      {/* Department Details */}
      <Grid container spacing={4}>
        {/* Department Image */}
        <Grid item xs={12} md={4}>
          {editMode ? (
            <Paper sx={{ p: 2, height: '100%' }}>
<Typography variant="h6" sx={{ mb: 2 }}>Department Image</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 1 }}>
                {filePreview ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img 
                      src={filePreview} 
                      alt="Department preview" 
                      style={{ width: '100%', borderRadius: 8 }} 
                    />
                    <IconButton
                      sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.8)' }}
                      onClick={() => {
                        setFilePreview(null);
                        setFileToUpload(null);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : department.imageUrl ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img 
                      src={department.imageUrl} 
                      alt={department.name} 
                      style={{ width: '100%', borderRadius: 8 }} 
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                      Current image (select new to replace)
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No image available. Upload one now.
                  </Typography>
                )}
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Uploading...' : 'Choose Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            </Paper>
          ) : (
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="300"
                image={department.imageUrl || "https://via.placeholder.com/600x300?text=Department"}
                alt={department.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="body1">
                    <strong>Hours:</strong> {department.timings}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                {department.services && department.services.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MedicalServicesIcon sx={{ color: 'primary.main', mr: 1 }} />
                      <Typography variant="body1">
                        <strong>Services:</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {department.services.map((service, index) => (
                        <Chip key={index} label={service} color="primary" variant="outlined" size="small" />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
        
        {/* Department Information */}
        <Grid item xs={12} md={8}>
          {editMode ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Edit Department Information</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Department Name"
                    fullWidth
                    required
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="timings"
                    label="Operating Hours"
                    fullWidth
                    required
                    value={formData.timings}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="e.g. Mon-Fri: 9am-5pm, Sat: 10am-2pm"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>Services</Divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      label="Add Service"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddService}
                      sx={{ ml: 2, minWidth: 100 }}
                      disabled={!newService.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.services.map((service, index) => (
                      <Chip
                        key={index}
                        label={service}
                        onDelete={() => handleRemoveService(index)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>Doctors</Divider>
                  <FormControl fullWidth>
                    <InputLabel id="doctors-select-label">Select Doctors</InputLabel>
                    <Select
                      labelId="doctors-select-label"
                      id="doctors-select"
                      multiple
                      value={formData.doctors}
                      onChange={handleDoctorChange}
                      input={<OutlinedInput label="Select Doctors" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((doctorId) => {
                            const doctor = doctors.find(d => d._id === doctorId);
                            return (
                              <Chip 
                                key={doctorId} 
                                label={doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown'} 
                                size="small" 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      onClick={handleEditToggle} 
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      variant="contained" 
                      color="primary"
                      disabled={uploadLoading || status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 1 }} />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                {department.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {department.description}
              </Typography>
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="department tabs">
                  <Tab label="Doctors" id="tab-doctors" />
                  <Tab label="Services" id="tab-services" />
                </Tabs>
              </Box>
              
              {tabValue === 0 && (
                <Box role="tabpanel" aria-labelledby="tab-doctors">
                  {doctorsLoading ? (
                    <Box sx={{ p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : department.doctors && department.doctors.length > 0 ? (
                    <List>
                      {department.doctors.map((doctor) => {
                        // If doctor is just an ID, find the full doctor object
                        const fullDoctor = typeof doctor === 'string' 
                          ? doctors.find(d => d._id === doctor)
                          : doctor;
                        
                        return fullDoctor ? (
                          <ListItem 
                            key={fullDoctor._id} 
                            divider 
                            button 
                            onClick={() => navigate(`/doctors/${fullDoctor._id}`)}
                          >
                            <ListItemAvatar>
                              <Avatar alt={`${fullDoctor.firstName} ${fullDoctor.lastName}`} src={fullDoctor.imageUrl}>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={`Dr. ${fullDoctor.firstName} ${fullDoctor.lastName}`} 
                              secondary={fullDoctor.specialization}
                            />
                          </ListItem>
                        ) : (
                          <ListItem key={typeof doctor === 'string' ? doctor : doctor._id} divider>
                            <ListItemAvatar>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary="Doctor information not available" 
                              secondary="Doctor may have been removed"
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1">
                        No doctors assigned to this department yet.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box role="tabpanel" aria-labelledby="tab-services">
                  {department.services && department.services.length > 0 ? (
                    <List>
                      {department.services.map((service, index) => (
                        <ListItem key={index} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <MedicalServicesIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={service} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1">
                        No services listed for this department.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DepartmentDetail;