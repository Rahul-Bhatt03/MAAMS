import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  MenuItem, 
  Select, 
  TextField, 
  FormControl,
  InputLabel,
  Chip,
  Box,
  ListItemText,
  Checkbox,
  OutlinedInput,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAllDoctors, createDoctor, deleteDoctor, updateDoctor } from '../../../../features/doctorSlice';
import { fetchDepartments } from '../../../../features/departmentSlice';
import { uploadFile, resetUploadState } from '../../../../features/uploadSlice';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { createPharmacist, fetchAllPharmacists, updatePharmacist } from '../../../../features/pharmacistSlice';
import { createNurse, fetchAllNurses, updateNurse } from '../../../../features/nurseSlice';
import { he } from 'date-fns/locale';

// Constants
const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Urology'
];

const QUALIFICATIONS = [
  'MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh', 'FRCS', 'PhD', 'MPH', 'MBA'
];

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 0,
});

const DataGridContainer = styled(Paper)(({ theme }) => ({
  height: '70vh',
  width: '100%',
  position: 'relative',
  [theme.breakpoints.down('sm')]: { height: '60vh' },
  [theme.breakpoints.up('md')]: { height: '75vh' },
  [theme.breakpoints.up('lg')]: { height: '80vh' },
  '& .MuiDataGrid-root': {
    border: 'none',
  },
  // This ensures the scrollable container works properly
  '& .MuiDataGrid-virtualScroller': {
    overflowX: 'auto !important',
  },
  '& ::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '& ::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#888',
    borderRadius: '5px',
  },
}));


const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

// Main component
const StaffPage = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { items: doctors, loading: doctorsLoading } = useSelector(state => state.doctors || {});
  const { departments, status: departmentsStatus } = useSelector(state => state.departments || {});
  const { url: uploadedImageUrl, loading: uploadLoading, error: uploadError } = useSelector(state => state.upload || {});
  
  // Local state - combined into a single state object to reduce re-renders
  const [state, setState] = useState({
    openDialog: false,
    confirmDeleteDialog: false,
    staffType: '',
    imagePreview: '',
    editMode: false,
    currentStaffId: null,
    staffToDelete: null,
    formData: {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      profilePic: '',
      isActive: true,
      experience: '',
      qualifications: [],
      department: '',
      availableSlots: []
    }
  });

  // Initial data fetch - single useEffect for all initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        dispatch(fetchAllDoctors()),
        dispatch(fetchDepartments())
      ]);
    };
    
    fetchInitialData();
    
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  // Handle uploaded image URL changes
  useEffect(() => {
    if (uploadedImageUrl) {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          profilePic: uploadedImageUrl
        }
      }));
    }
  }, [uploadedImageUrl]);

  // Use updater functions for state changes to prevent issues with stale state
  const updateState = (updates) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const updateFormData = (updates) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates
      }
    }));
  };

  // Form handling functions
  const resetForm = () => {
    setState({
      ...state,
      staffType: '',
      imagePreview: '',
      editMode: false,
      currentStaffId: null,
      formData: {
        name: '',
        email: '',
        phone: '',
        specialization: '',
        profilePic: '',
        isActive: true,
        experience: '',
        qualifications: [],
        department: '',
        availableSlots: []
      }
    });
    dispatch(resetUploadState());
  };

  const handleOpenDialog = () => {
    resetForm();
    updateState({ openDialog: true });
  };

  const handleCloseDialog = () => {
    resetForm();
    updateState({ openDialog: false });
  };

  const handleEditStaff = (staff) => {
    setState({
      ...state,
      editMode: true,
      currentStaffId: staff.id,
      staffType: 'doctor', // Set based on staff type
      imagePreview: staff.profilePic || '',
      openDialog: true,
      formData: {
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        specialization: staff.specialization || '',
        profilePic: staff.profilePic || '',
        isActive: staff.isActive ?? true,
        experience: staff.experience?.toString() || '',
        qualifications: staff.qualifications || [],
        department: staff.department?._id || '',
        availableSlots: staff.availableSlots || []
      }
    });
  };

  const handleDeleteClick = (staff) => {
    updateState({
      staffToDelete: staff,
      confirmDeleteDialog: true
    });
  };

  const handleDeleteConfirm = async () => {
    if (state.staffToDelete) {
      await dispatch(deleteDoctor(state.staffToDelete.id));
      updateState({
        confirmDeleteDialog: false,
        staffToDelete: null
      });
      dispatch(fetchAllDoctors());
    }
  };

  // Input change handlers - use dedicated functions for different form field types
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleQualificationsChange = (e) => {
    const { value } = e.target;
    updateFormData({ qualifications: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateState({ imagePreview: URL.createObjectURL(file) });
      dispatch(uploadFile(file));
    }
  };

  const handleStaffTypeChange = (e) => {
    updateState({ staffType: e.target.value });
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...state.formData,
        experience: Number(state.formData.experience) || 0
      };

      // Determine which action to dispatch based on staff type and mode
      if (state.staffType === 'doctor') {
        if (state.editMode) {
          await dispatch(updateDoctor({
            id: state.currentStaffId,
            doctorData: submissionData
          }));
        } else {
          await dispatch(createDoctor(submissionData));
        }
        dispatch(fetchAllDoctors());
      } else if (state.staffType === 'nurse') {
        if (state.editMode) {
          await dispatch(updateNurse({
            id: state.currentStaffId,
            nurseData: submissionData
          }));
        } else {
          await dispatch(createNurse(submissionData));
        }
        dispatch(fetchAllNurses());
      } else if (state.staffType === 'pharmacist') {
        if (state.editMode) {
          await dispatch(updatePharmacist({
            id: state.currentStaffId,
            pharmacistData: submissionData
          }));
        } else {
          await dispatch(createPharmacist(submissionData));
        }
        dispatch(fetchAllPharmacists());
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save staff member:', error);
    }
  };

  // Validation
  const isFormValid = () => {
    const { name, email, phone, specialization, department, experience } = state.formData;
    const experienceValid = !experience || !isNaN(Number(experience));
    return name && email && phone && specialization && department && experienceValid;
  };

  // DataGrid columns
  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'specialization', headerName: 'Specialization', flex: 1, minWidth: 150 },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => params.value ? 'Active' : 'Inactive'
    },
    { field: 'experience', headerName: 'Experience', width: 100 },
    { 
      field: 'qualifications', 
      headerName: 'Qualifications', 
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (params.value || []).join(', ')
    },
// Modified department column valueGetter function - this is the only change needed
{ 
  field: 'department', 
  headerName: 'Department', 
  flex: 1,
  minWidth: 100,
  // More robust valueGetter to handle all undefined cases
  valueGetter: (params) => {
    try {
      // Make sure params and params.row exist before attempting to access department
      if (!params || !params.row) return 'N/A';
      
      // Check if department exists and has a name property
      const department = params.row.department;
      return department && typeof department === 'object' && department.name 
        ? department.name 
        : 'N/A';
    } catch (error) {
      console.error('Error getting department value:', error);
      return 'N/A';
    }
  }
},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => handleEditStaff(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              size="small"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Prepare rows for DataGrid
  const rows = doctors?.map(doctor => ({
    id: doctor._id,
    ...doctor
  })) || [];

  return (
    <PageWrapper>
      <PageHeader>
        <h1>Staff Management</h1>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenDialog}
          size="large"
        >
          Add Staff
        </Button>
      </PageHeader>

      {/* Main Staff Form Dialog */}
      <Dialog 
        open={state.openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {state.editMode ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="staff-type-label">Staff Type</InputLabel>
            <Select
              labelId="staff-type-label"
              value={state.staffType}
              onChange={handleStaffTypeChange}
              label="Staff Type"
              required
              disabled={state.editMode}
            >
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
              <MenuItem value="pharmacist">Pharmacist</MenuItem>
            </Select>
          </FormControl>

          {state.staffType && (
            <Box component="form" noValidate>
              <TextField
                name="name"
                label="Name"
                value={state.formData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                autoComplete="off"
              />
              <TextField
                name="email"
                label="Email"
                value={state.formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                type="email"
                autoComplete="off"
              />
              <TextField
                name="phone"
                label="Phone"
                value={state.formData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                autoComplete="off"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={state.formData.specialization}
                  onChange={handleInputChange}
                  label="Specialization"
                  required
                >
                  {SPECIALIZATIONS.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Qualifications</InputLabel>
                <Select
                  name="qualifications"
                  multiple
                  value={state.formData.qualifications}
                  onChange={handleQualificationsChange}
                  input={<OutlinedInput label="Qualifications" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {QUALIFICATIONS.map((qual) => (
                    <MenuItem key={qual} value={qual}>
                      <Checkbox checked={(state.formData.qualifications || []).indexOf(qual) > -1} />
                      <ListItemText primary={qual} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={state.formData.department}
                  onChange={handleInputChange}
                  label="Department"
                  required
                >
                  {departmentsStatus === 'loading' ? (
                    <MenuItem disabled>Loading departments...</MenuItem>
                  ) : departments?.length > 0 ? (
                    departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No departments available</MenuItem>
                  )}
                </Select>
              </FormControl>
              
              <TextField
                name="experience"
                label="Experience (years)"
                type="number"
                value={state.formData.experience}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputProps={{
                  inputProps: { min: 0 }
                }}
                helperText="Enter number of years"
                autoComplete="off"
              />
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Profile Picture'}
                  <VisuallyHiddenInput 
                    type="file" 
                    onChange={handleImageChange} 
                    accept="image/*" 
                  />
                </Button>
                
                {uploadLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                
                {uploadError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Error uploading image. Please try again.
                  </Alert>
                )}
                
                {state.imagePreview && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={state.imagePreview} 
                      alt="Profile preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }} 
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary"
            variant="contained"
            disabled={!state.staffType || uploadLoading || !isFormValid()}
          >
            {uploadLoading ? 'Processing...' : state.editMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={state.confirmDeleteDialog} onClose={() => updateState({ confirmDeleteDialog: false })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete {state.staffToDelete?.name}?</p>
          <p>This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateState({ confirmDeleteDialog: false })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Data Grid */}
<DataGridContainer elevation={3}>
  <DataGrid
    rows={rows}
    columns={columns}
    pagination
    pageSize={10}
    loading={doctorsLoading}
    disableSelectionOnClick
    autoHeight={false}
    sx={{ 
      '& .MuiDataGrid-cell:focus': { outline: 'none' },
      minWidth: '800px', // Move minWidth here
    }}
    initialState={{ pagination: { pageSize: 10 }}}
  />
</DataGridContainer>
    </PageWrapper>
  );
};

export default StaffPage;