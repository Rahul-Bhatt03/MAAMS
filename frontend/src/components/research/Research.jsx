import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchAllResearch, 
  createResearch, 
  resetResearchState,
  fetchResearchByDepartment,
  fetchResearchByInvestigator
} from '../../../features/researchSlice';
import { uploadFile, resetUploadState } from '../../../features/uploadSlice';
import { fetchAllDoctors } from '../../../features/doctorSlice';
import { fetchDepartments } from '../../../features/departmentSlice';
import { format } from 'date-fns';

// Material UI imports
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  FormHelperText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper,
  IconButton,
  Divider,
  Badge,
  Drawer,
  Stack,
  InputAdornment,
  Tooltip
} from '@mui/material';

// Material UI icons
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachFile as AttachmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Sort as SortIcon
} from '@mui/icons-material';

// Custom styles
import { alpha } from '@mui/material/styles';

const Research = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { items: researchProjects, loading, error, success } = useSelector((state) => state.research);
  const { url: uploadedFileUrl, loading: uploadLoading } = useSelector((state) => state.upload);
  const { departments: deptList, status: deptStatus } = useSelector((state) => state.departments);
  const { items: doctorList, loading: doctorsLoading } = useSelector((state) => state.doctors);
  
  // Local state
  const [userRole, setUserRole] = useState('');
  const [openAddDrawer, setOpenAddDrawer] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Pending',
    funding_source: '',
    principal_investigator_id: '',
    department_id: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Initial data loading
  useEffect(() => {
    dispatch(fetchAllResearch());
    dispatch(fetchDepartments());
    dispatch(fetchAllDoctors());
    
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserRole(parsedUser.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Clean up on component unmount
    return () => {
      dispatch(resetResearchState());
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (deptList && deptList.length > 0) {
      setDepartments(deptList);
    } else if (deptStatus === 'failed') {
      // Fallback data if API fails
      setDepartments([
        { _id: '1', name: 'Cardiology' },
        { _id: '2', name: 'Neurology' },
        { _id: '3', name: 'Oncology' }
      ]);
    }
  }, [deptList, deptStatus]);

  useEffect(() => {
    if (doctorList && doctorList.length > 0) {
      setDoctors(doctorList);
    } else if (doctorsLoading === false && doctorList.length === 0) {
      // Fallback data if API fails
      setDoctors([
        { _id: '1', name: 'Dr. John Smith', specialization: 'Cardiology' },
        { _id: '2', name: 'Dr. Jane Doe', specialization: 'Neurology' },
        { _id: '3', name: 'Dr. Robert Johnson', specialization: 'Oncology' }
      ]);
    }
  }, [doctorList, doctorsLoading]);

  // Handle success state changes
  useEffect(() => {
    if (success) {
      setOpenAddDrawer(false);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Pending',
        funding_source: '',
        principal_investigator_id: '',
        department_id: '',
      });
      setAttachments([]);
      setSelectedFile(null);
      
      setSnackbarMessage('Research project saved successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      dispatch(fetchAllResearch());
    }
  }, [success, dispatch]);

  // Handle uploaded file URL
  useEffect(() => {
    if (uploadedFileUrl) {
      // Add the uploaded file to attachments
      setAttachments([
        ...attachments,
        { 
          name: selectedFile?.name || 'Uploaded file',
          url: uploadedFileUrl,
          type: selectedFile?.type || 'application/pdf',
          uploaded_at: new Date()
        }
      ]);
      setSelectedFile(null);
      
      setSnackbarMessage('File uploaded successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      dispatch(resetUploadState());
    }
  }, [uploadedFileUrl, selectedFile, attachments, dispatch]);

  // When Add Research drawer is opened, ensure we have fresh data
  useEffect(() => {
    if (openAddDrawer) {
      // Refresh doctors and departments when drawer opens
      dispatch(fetchDepartments());
      dispatch(fetchAllDoctors());
    }
  }, [openAddDrawer, dispatch]);

  // Form input handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if there was one
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.start_date) errors.start_date = 'Start date is required';
    if (!formData.principal_investigator_id) errors.principal_investigator_id = 'Principal investigator is required';
    if (!formData.department_id) errors.department_id = 'Department is required';
    
    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      errors.end_date = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data with attachments
      const researchData = {
        ...formData,
        attachments: attachments
      };
      
      dispatch(createResearch(researchData))
        .unwrap()
        .catch((error) => {
          console.error('Error creating research project:', error);
          setSnackbarMessage('Failed to create research project');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        });
    }
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      dispatch(uploadFile(file));
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter handler
  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setFilterBy(filter);
    
    if (filter === 'all') {
      dispatch(fetchAllResearch());
    } else if (filter.startsWith('dept-')) {
      const deptId = filter.replace('dept-', '');
      dispatch(fetchResearchByDepartment(deptId));
    } else if (filter.startsWith('pi-')) {
      const piId = filter.replace('pi-', '');
      dispatch(fetchResearchByInvestigator(piId));
    }
  };

  // Sort handler
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Filtered and sorted research projects
  const filteredProjects = researchProjects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    let color;
    
    switch (status) {
      case 'Ongoing':
        color = 'primary';
        break;
      case 'Completed':
        color = 'success';
        break;
      case 'Pending':
        color = 'warning';
        break;
      case 'Cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  // Check if user has admin access
  const hasAdminAccess = () => {
    return ['admin', 'superadmin', 'groupadmin'].includes(userRole.toLowerCase());
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScienceIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Research Projects
          </Typography>
        </Box>
        
        {hasAdminAccess() && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDrawer(true)}
            sx={{ 
              px: 3, 
              py: 1, 
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            Add Research
          </Button>
        )}
      </Box>

      {/* Search and Filter Tools */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center',
          gap: 2,
          borderRadius: 2
        }}
      >
        <TextField
          placeholder="Search research projects..."
          variant="outlined"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter By</InputLabel>
          <Select
            value={filterBy}
            onChange={handleFilterChange}
            label="Filter By"
            startAdornment={<FilterIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="all">All Projects</MenuItem>
            <Divider />
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                By Department
              </Typography>
            </MenuItem>
            {departments.map(dept => (
              <MenuItem key={dept._id} value={`dept-${dept._id}`}>{dept.name}</MenuItem>
            ))}
            <Divider />
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                By Investigator
              </Typography>
            </MenuItem>
            {doctors.map(doc => (
              <MenuItem key={doc._id} value={`pi-${doc._id}`}>{doc.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Sort By"
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="alphabetical">A-Z</MenuItem>
          </Select>
        </FormControl>
      </Paper>

     {/* Projects Grid */}
     {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : sortedProjects.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            No research projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Add a new research project to get started'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedProjects.map((research) => (
            <Grid item xs={12} md={6} lg={4} key={research._id}>
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    cursor: 'pointer'
                  }
                }}
                onClick={() => navigate(`/research/${research._id}`)}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {research.title}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <StatusBadge status={research.status} />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(research.start_date), 'MMM yyyy')}
                          {research.end_date && ` - ${format(new Date(research.end_date), 'MMM yyyy')}`}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    {research.description}
                  </Typography>
                  
                  {research.attachments && research.attachments.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Badge badgeContent={research.attachments.length} color="primary">
                        <AttachmentIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </Badge>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        Attachments
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, py: 1, backgroundColor: alpha('#f5f5f5', 0.5) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {research.principal_investigator_id?.name || 'Unknown PI'}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {research.department_id?.name || 'Unknown Dept'}
                    </Typography>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Research Drawer */}
      <Drawer
        anchor="right"
        open={openAddDrawer}
        onClose={() => setOpenAddDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: '80%', md: '50%' },
            maxWidth: '600px',
            p: 3
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Add New Research Project
          </Typography>
          <IconButton onClick={() => setOpenAddDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box component="form" onSubmit={handleFormSubmit} sx={{ overflowY: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Research Title"
                fullWidth
                required
                value={formData.title}
                onChange={handleFormChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
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
                onChange={handleFormChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="start_date"
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.start_date}
                onChange={handleFormChange}
                error={!!formErrors.start_date}
                helperText={formErrors.start_date}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="end_date"
                label="End Date (Optional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.end_date}
                onChange={handleFormChange}
                error={!!formErrors.end_date}
                helperText={formErrors.end_date}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Ongoing">Ongoing</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="funding_source"
                label="Funding Source (Optional)"
                fullWidth
                value={formData.funding_source}
                onChange={handleFormChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.principal_investigator_id}>
                <InputLabel>Principal Investigator</InputLabel>
                <Select
                  name="principal_investigator_id"
                  value={formData.principal_investigator_id}
                  onChange={handleFormChange}
                  label="Principal Investigator"
                  disabled={doctorsLoading}
                >
                  {doctors.map(doctor => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      {doctor.name} ({doctor.specialization})
                    </MenuItem>
                  ))}
                </Select>
                {doctorsLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>Loading doctors...</Typography>
                  </Box>
                )}
                {formErrors.principal_investigator_id && 
                  <FormHelperText>{formErrors.principal_investigator_id}</FormHelperText>
                }
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!formErrors.department_id}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleFormChange}
                  label="Department"
                  disabled={deptStatus === 'loading'}
                >
                  {departments.map(department => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
                {deptStatus === 'loading' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ ml: 1 }}>Loading departments...</Typography>
                  </Box>
                )}
                {formErrors.department_id && 
                  <FormHelperText>{formErrors.department_id}</FormHelperText>
                }
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Attachments
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <input
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  id="attachment-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="attachment-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachmentIcon />}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Add Attachment'}
                  </Button>
                </label>
                
                {uploadLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Uploading file...
                    </Typography>
                  </Box>
                )}
                
                {attachments.length > 0 && (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {attachments.map((attachment, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 1,
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachmentIcon sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {attachment.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveAttachment(index)}
                          aria-label="remove attachment"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => setOpenAddDrawer(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={16} color="inherit" />}
            >
              {loading ? 'Saving...' : 'Save Research Project'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Research;