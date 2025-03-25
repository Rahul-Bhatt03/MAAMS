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

// Enum for specializations
const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Urology'
];

// Enum for qualifications
const QUALIFICATIONS = [
  'MBBS',
  'MD',
  'MS',
  'DNB',
  'DM',
  'MCh',
  'FRCS',
  'PhD',
  'MPH',
  'MBA'
];

// Styled component for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Styled component for the data grid container - enhanced for better scrolling
const DataGridContainer = styled(Paper)(({ theme }) => ({
  height: 500,
  width: '100%',
  position: 'relative',
  overflow: 'visible',
  '& .MuiDataGrid-root': {
    border: 'none',
    overflowX: 'auto',
    overflowY: 'auto',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.background.paper,
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '& .MuiDataGrid-virtualScroller': {
    backgroundColor: theme.palette.background.paper,
    overflowX: 'auto',
    overflowY: 'auto',
  },
  // Enhanced scrollbar styling for better visibility
  '& ::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
    display: 'block',
  },
  '& ::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '8px',
  },
  '& ::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '8px',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },
  '& ::-webkit-scrollbar-thumb:hover': {
    background: '#555',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },
}));

// Responsive wrapper for the entire page
const PageWrapper = styled(Box)(({ theme }) => ({
  padding: '20px',
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
  },
}));

// Header with responsive design
const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

// Fixed styled component for form inputs to prevent cursor jumping
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    overflow: 'visible',
  },
});

const StaffPage = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { items: doctors, loading: doctorsLoading } = useSelector(state => state.doctors || {});
  const { departments, status: departmentsStatus } = useSelector(state => state.departments || {});
  const { url: uploadedImageUrl, loading: uploadLoading, error: uploadError } = useSelector(state => state.upload || {});
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [staffType, setStaffType] = useState('');
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [formData, setFormData] = useState({
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
  });

  // Fetch doctors and departments on component mount
  useEffect(() => {
    dispatch(fetchAllDoctors());
    dispatch(fetchDepartments());
    
    // Cleanup function to reset upload state when component unmounts
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  // Update form data when image is successfully uploaded
  useEffect(() => {
    if (uploadedImageUrl) {
      setFormData(prevState => ({
        ...prevState,
        profilePic: uploadedImageUrl
      }));
    }
  }, [uploadedImageUrl]);

  const resetFormState = () => {
    setStaffType('');
    setSelectedQualifications([]);
    setImagePreview('');
    setEditMode(false);
    setCurrentDoctorId(null);
    dispatch(resetUploadState());
    setFormData({
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
    });
  };

  const handleOpenDialog = () => {
    resetFormState();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    resetFormState();
    setOpenDialog(false);
  };

  const handleEditDoctor = (doctor) => {
    setEditMode(true);
    setCurrentDoctorId(doctor.id);
    setStaffType('doctor');
    setSelectedQualifications(doctor.qualifications || []);
    setImagePreview(doctor.profilePic || '');
    
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || '',
      profilePic: doctor.profilePic || '',
      isActive: doctor.isActive ?? true,
      experience: doctor.experience?.toString() || '',
      qualifications: doctor.qualifications || [],
      department: doctor.department?._id || '',
      availableSlots: doctor.availableSlots || []
    });
    
    setOpenDialog(true);
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (doctorToDelete) {
      await dispatch(deleteDoctor(doctorToDelete.id));
      setConfirmDeleteDialog(false);
      setDoctorToDelete(null);
      dispatch(fetchAllDoctors());
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteDialog(false);
    setDoctorToDelete(null);
  };

  const handleStaffTypeChange = (event) => {
    setStaffType(event.target.value);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    // Keep focus in the field by using a controlled component approach
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleQualificationsChange = (event) => {
    const { value } = event.target;
    setSelectedQualifications(value);
    setFormData(prevState => ({
      ...prevState,
      qualifications: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      // Upload the file to server using Redux action
      dispatch(uploadFile(file));
    }
  };

  const handleSubmit = async () => {
    try {
      // Make sure experience is a number
      const submissionData = {
        ...formData,
        experience: Number(formData.experience)
      };

      if (staffType === 'doctor') {
        if (editMode && currentDoctorId) {
          await dispatch(updateDoctor({ id: currentDoctorId, doctorData: submissionData })).unwrap();
        } else {
          await dispatch(createDoctor(submissionData)).unwrap();
        }
        handleCloseDialog();
        dispatch(fetchAllDoctors());
      }
      // Add other staff types when they're implemented
    } catch (error) {
      console.error('Failed to create/update staff member:', error);
    }
  };

  const isFormValid = () => {
    // Check if experience is a valid number if provided
    const experienceValid = !formData.experience || !isNaN(Number(formData.experience));

    return formData.name && 
           formData.email && 
           formData.phone && 
           formData.specialization && 
           formData.department && 
           experienceValid;
  };

  // Define the action column with edit and delete buttons
  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    disableClickEventBubbling: true,
    renderCell: (params) => {
      return (
        <Box>
          <Tooltip title="Edit">
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => handleEditDoctor(params.row)}
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
      );
    }
  };

  // Combine the original columns with the action column
  const columns = [
    { field: 'name', headerName: 'Name', width: 150, flex: 1 },
    { field: 'email', headerName: 'Email', width: 200, flex: 1 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'specialization', headerName: 'Specialization', width: 150, flex: 1 },
    { 
      field: 'isActive', 
      headerName: 'Active', 
      width: 100,
      renderCell: (params) => params.value ? 'Yes' : 'No' 
    },
    { field: 'experience', headerName: 'Experience', width: 120 },
    { 
      field: 'qualifications', 
      headerName: 'Qualifications', 
      width: 200,
      flex: 1,
      renderCell: (params) => params.value ? params.value.join(', ') : '' 
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      width: 150,
      flex: 1,
      valueGetter: (params) => {
        try {
          return params.row.department?.name || 'No Department';
        } catch (error) {
          return 'No Department';
        }
      }
    },
    actionColumn // Add the action column
  ];

  // Map doctors to a format suitable for DataGrid
  const rows = doctors?.map(doctor => ({
    id: doctor._id, // Use _id as id
    ...doctor,
  })) || [];

  // Form component that's reused for all staff types
  const StaffForm = () => (
    <form>
      <StyledTextField
        name="name"
        label="Name"
        value={formData.name}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        required
        autoComplete="off"
      />
      <StyledTextField
        name="email"
        label="Email"
        value={formData.email}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        required
        type="email"
        autoComplete="off"
      />
      <StyledTextField
        name="phone"
        label="Phone"
        value={formData.phone}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        required
        autoComplete="off"
      />
      
      {/* Specialization Dropdown */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="specialization-label">Specialization</InputLabel>
        <Select
          labelId="specialization-label"
          name="specialization"
          value={formData.specialization}
          onChange={handleFormChange}
          label="Specialization"
          required
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
        >
          {SPECIALIZATIONS.map((spec) => (
            <MenuItem key={spec} value={spec}>
              {spec}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Qualifications Multi-select */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="qualifications-label">Qualifications</InputLabel>
        <Select
          labelId="qualifications-label"
          name="qualifications"
          multiple
          value={selectedQualifications}
          onChange={handleQualificationsChange}
          input={<OutlinedInput label="Qualifications" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
        >
          {QUALIFICATIONS.map((qual) => (
            <MenuItem key={qual} value={qual}>
              <Checkbox checked={selectedQualifications.indexOf(qual) > -1} />
              <ListItemText primary={qual} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Department Dropdown */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="department-label">Department</InputLabel>
        <Select
          labelId="department-label"
          name="department"
          value={formData.department}
          onChange={handleFormChange}
          label="Department"
          required
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
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
      
      <StyledTextField
        name="experience"
        label="Experience (years)"
        type="number"
        value={formData.experience}
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        InputProps={{
          inputProps: { min: 0 }
        }}
        helperText="Enter number of years only"
        autoComplete="off"
      />
      
      {/* Image Upload */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploadLoading}
        >
          {uploadLoading ? 'Uploading...' : 'Upload Profile Picture'}
          <VisuallyHiddenInput type="file" onChange={handleImageChange} accept="image/*" />
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
        
        {uploadedImageUrl && !uploadLoading && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Image uploaded successfully!
          </Alert>
        )}
        
        {imagePreview && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
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
    </form>
  );

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

      {/* Main Dialog for Adding/Editing Staff */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
        <DialogContent>
          {/* Always show the staff type selection, regardless of staffType value */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="staff-type-label">Staff Type</InputLabel>
            <Select
              labelId="staff-type-label"
              value={staffType}
              onChange={handleStaffTypeChange}
              label="Staff Type"
              required
              disabled={editMode}
            >
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
              <MenuItem value="pharmacist">Pharmacist</MenuItem>
            </Select>
          </FormControl>

          {staffType && <StaffForm />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary"
            disabled={!staffType || uploadLoading || !isFormValid()}
          >
            {uploadLoading ? 'Processing...' : editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={confirmDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete {doctorToDelete?.name}?</p>
          <p>This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced DataGrid with improved scrolling */}
      <DataGridContainer elevation={2}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          loading={doctorsLoading}
          disableSelectionOnClick
          autoHeight
          sx={{
            minHeight: 400,
            width: '100%',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'auto',
            },
          }}
          initialState={{
            pagination: {
              pageSize: 10,
            },
          }}
          scrollbarSize={12}
          disableColumnFilter={false}
          disableColumnMenu={false}
        />
      </DataGridContainer>
    </PageWrapper>
  );
};

export default StaffPage;