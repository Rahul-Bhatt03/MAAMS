import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  IconButton,
  Paper,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  Avatar,
  Stack
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  MedicalServices, 
  Category as CategoryIcon, 
  AccessTime, 
  AttachMoney,
  LocalHospital,
  Search,
  Close,
  Info
} from "@mui/icons-material";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../../../features/serviceSlice.js"; 

const ServicePage = () => {
  const dispatch = useDispatch();
  const { services, service, loading, error, success } = useSelector(
    (state) => state.service);
  
  // Assuming we'll fetch doctors from redux store
  const { doctors } = useSelector((state) => state.doctor || { doctors: [] });
  
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [role, setRole] = useState("");
  const [availability, setAvailability] = useState([{ day: "", startTime: "", endTime: "" }]);
  const [imageFile, setImageFile] = useState(null);
  const itemsPerPage = 6;

  const categories = [
    "General",
    "Emergency",
    "Specialty",
    "Surgery",
    "Diagnostic",
    "Preventive",
    "Mental Health",
    "Pediatric"
  ];

  // Fetch all services on component mount and get role from localStorage
  useEffect(() => {
    dispatch(getAllServices());
    // Get the user object from local storage and then get the role of the user
    const user= JSON.parse(localStorage.getItem("user"));
    if(user&&user.role){
      setRole(user.role);
    }
  }, [dispatch]);

  // Set selected doctors when editing a service
  useEffect(() => {
    if (selectedService && selectedService.doctors) {
      setSelectedDoctors(selectedService.doctors.map(doc => doc._id || doc));
    } else {
      setSelectedDoctors([]);
    }
  }, [selectedService]);

  // Handle modal open/close
  const handleOpenAddModal = () => {
    setSelectedService(null);
    setSelectedDoctors([]);
    setOpenModal(true);
  };
  
  const handleOpenEditModal = (service) => {
    setSelectedService(service);
    setEditModal(true);
  };
  
  const handleOpenViewModal = (service) => {
    setSelectedService(service);
    setViewModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditModal(false);
    setViewModal(false);
    setSelectedService(null);
    setSelectedDoctors([]);
    setAvailability([{ day: "", startTime: "", endTime: "" }]);
    setImageFile(null);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterCategory(event.target.value);
    setPage(1);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle availability change
  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...availability];
    updatedAvailability[index][field] = value;
    setAvailability(updatedAvailability);
  };

  // Add new availability row
  const addAvailabilityRow = () => {
    setAvailability([...availability, { day: "", startTime: "", endTime: "" }]);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
  };

  // Handle form submission (create/update service)
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Add availability to form data
    availability.forEach((avail, index) => {
      formData.append(`availability[${index}][day]`, avail.day);
      formData.append(`availability[${index}][startTime]`, avail.startTime);
      formData.append(`availability[${index}][endTime]`, avail.endTime);
    });

    // Add image file to form data
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Add selected doctors to form data
    selectedDoctors.forEach((doctorId) => {
      formData.append("doctors", doctorId);
    });

    const serviceData = Object.fromEntries(formData.entries());

    if (selectedService && editModal) {
      dispatch(updateService({ id: selectedService._id, serviceData }));
    } else {
      dispatch(createService(serviceData));
    }
    handleCloseModal();
  };

  // Handle delete service
  const handleDeleteService = (id, event) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this service?")) {
      dispatch(deleteService(id));
    }
  };

  // Filter services based on category and search term
  const filteredServices = services.filter(service => 
    (filterCategory === "All" || service.category === filterCategory) &&
    (service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginate services
  const paginatedServices = filteredServices.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Check if user has admin privileges
  const isAdmin= role&&['admin','superAdmin','groupAdmin'].includes(role)

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8f9fa", minHeight: "60vh" }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            <MedicalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
            Medical Services
          </Typography>
          
          {/* Add Service Button - Only for admin users */}
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              sx={{ 
                backgroundColor: "#4caf50", 
                "&:hover": { backgroundColor: "#388e3c" },
                boxShadow: 3,
                px: 3
              }}
            >
              Add Service
            </Button>
          )}
        </Stack>

        {/* Search and Filter Area */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', md: 'center' }}
          mb={3}
        >
          {/* Search Field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search services..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              sx: { borderRadius: 2 }
            }}
            sx={{ flex: 1 }}
          />

          {/* Filter by Category */}
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={handleFilterChange}
              label="Category"
              startAdornment={<CategoryIcon color="action" sx={{ mr: 1 }} />}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="All">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && filteredServices.length === 0 && (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Info fontSize="large" color="action" sx={{ mb: 2, opacity: 0.7 }} />
            <Typography variant="h6" color="textSecondary">
              No services found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Paper>
        )}

        {/* Services Grid */}
        <Grid container spacing={3}>
          {paginatedServices.map((service) => (
            <Grid item key={service._id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 3,
                  "&:hover": { 
                    transform: "translateY(-8px)",
                    boxShadow: 6
                  },
                  position: "relative"
                }}
                onClick={() => handleOpenViewModal(service)}
              >
                {/* Admin Controls */}
                {isAdmin && (
                  <Box 
                    sx={{ 
                      position: "absolute", 
                      top: 8, 
                      right: 8, 
                      zIndex: 2,
                      display: "flex",
                      gap: 1,
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderRadius: 1,
                      p: 0.5
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Edit Service">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(service);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Service">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => handleDeleteService(service._id, e)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <CardMedia
                  component="img"
                  height="200"
                  image={service.image || "https://via.placeholder.com/300x200?text=Medical+Service"}
                  alt={service.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {service.name}
                  </Typography>
                  
                  <Chip 
                    label={service.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<CategoryIcon fontSize="small" />}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {service.description ? 
                      (service.description.slice(0, 100) + 
                      (service.description.length > 100 ? "..." : "")) : 
                      "No description available"}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        ${service.pricing || "Varies"}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocalHospital fontSize="small" color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {service.doctors?.length || 0} Doctor{service.doctors?.length !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredServices.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
      </Paper>
  
      {/* Add/Edit Service Modal */}
      <Modal open={openModal || editModal} onClose={handleCloseModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "600px" },
            maxHeight: "90vh",
            overflowY: "auto",
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {editModal ? "Edit Service" : "Add New Service"}
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Service Name"
                  name="name"
                  variant="outlined"
                  defaultValue={selectedService?.name || ""}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="service-category-label">Category</InputLabel>
                  <Select
                    labelId="service-category-label"
                    label="Category"
                    name="category"
                    defaultValue={selectedService?.category || ""}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pricing ($)"
                  name="pricing"
                  variant="outlined"
                  type="number"
                  defaultValue={selectedService?.pricing || ""}
                  required
                />
              </Grid>

              {/* Availability Schedule */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Availability
                </Typography>
                {availability.map((avail, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Day"
                        value={avail.day}
                        onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={avail.startTime}
                        onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={avail.endTime}
                        onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                        required
                      />
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addAvailabilityRow}
                  sx={{ mt: 1 }}
                >
                  Add Availability
                </Button>
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outlined" component="span">
                    Upload Image
                  </Button>
                </label>
                {imageFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {imageFile.name}
                  </Typography>
                )}
              </Grid>

              {/* Doctors Dropdown */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Select Doctors
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="doctors-label">Doctors</InputLabel>
                  <Select
                    labelId="doctors-label"
                    label="Doctors"
                    multiple
                    value={selectedDoctors}
                    onChange={(e) => setSelectedDoctors(e.target.value)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.name} ({doctor.specialization})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  variant="outlined"
                  multiline
                  rows={4}
                  defaultValue={selectedService?.description || ""}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : editModal ? "Update Service" : "Add Service"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Modal>

      {/* View Service Details Modal */}
      <Modal open={viewModal} onClose={handleCloseModal}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "700px" },
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2
          }}
        >
          {selectedService && (
            <>
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={selectedService.image || "https://via.placeholder.com/700x250?text=Medical+Service"}
                  alt={selectedService.name}
                />
                <IconButton 
                  sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.8)" }}
                  onClick={handleCloseModal}
                >
                  <Close />
                </IconButton>
                <Chip
                  label={selectedService.category}
                  color="primary"
                  sx={{ 
                    position: "absolute", 
                    bottom: -12, 
                    left: 24,
                    fontWeight: "bold",
                    boxShadow: 2
                  }}
                />
              </Box>
              
              <Box sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {selectedService.name}
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {selectedService.description}
                  </Typography>
                </Box>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Availability
                      </Typography>
                      <Typography variant="body1" sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <AccessTime fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                        {selectedService.availability || "Contact for availability"}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Pricing
                      </Typography>
                      <Typography variant="body1" sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                        <AttachMoney fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                        ${selectedService.pricing || "Varies by treatment"}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Doctors Section */}
                {selectedService.doctors && selectedService.doctors.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Available Medical Specialists
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      {selectedService.doctors.map(doctor => (
                        <Grid item xs={12} sm={6} md={4} key={doctor._id || doctor}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 2
                            }}
                          >
                            <Avatar
                              src={doctor.profilePic}
                              alt={doctor.name || "Doctor"}
                              sx={{ width: 50, height: 50 }}
                            />
                            <Box>
                              <Typography variant="subtitle2" noWrap>
                                {doctor.name || "Dr. Name"}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" noWrap>
                                {doctor.specialization || "Specialist"}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCloseModal}
                    sx={{ px: 3 }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default ServicePage;