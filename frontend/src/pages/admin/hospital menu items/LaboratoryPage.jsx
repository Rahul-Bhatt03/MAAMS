import React, { useState, useEffect } from "react";
import ShowForm from "./medicine/ShowForm";
import DetailView from "./medicine/DetailView";
import MedicineTable from "./medicine/MedicineTable";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../../../../features/MedicineSlice";

import {
  Box,
  Container,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const LaboratoryPage = () => {
  // Local state for UI control
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null); // Store medicine object instead of index
  const [viewData, setViewData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Redux setup
  const dispatch = useDispatch();
  const { medicines, status, error } = useSelector((state) => {
    console.log("Medicines from Redux:", state.medicines);
    return state.medicines;
  });

  // Local form data
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    description: "",
    dosage: "",
    form: "",
    manufacturer: "",
    price: "",
    requiresPrescription: false,
    stock: "",
    category: "",
    expiryDate: "",
  });

  // Fetch medicines when page loads
  useEffect(() => {
    dispatch(fetchMedicines());
  }, [dispatch]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMedicine) {
        // Update existing medicine
        await dispatch(updateMedicine({ id: editingMedicine._id, medicineData: formData })).unwrap();
        setSnackbar({ open: true, message: "Medicine updated successfully!", severity: "success" });
      } else {
        // Add new medicine
        await dispatch(createMedicine(formData)).unwrap();
        setSnackbar({ open: true, message: "Medicine created successfully!", severity: "success" });
      }

      // After submit, close form and refresh list
      setShowForm(false);
      setEditingMedicine(null);
      resetForm();

      // Refresh medicines - but only if needed (Redux should handle updates)
      dispatch(fetchMedicines());
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message || "Operation failed"}`, severity: "error" });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      name: "",
      genericName: "",
      description: "",
      dosage: "",
      form: "",
      manufacturer: "",
      price: "",
      requiresPrescription: false,
      stock: "",
      category: "",
      expiryDate: "",
    });
  };

  // Handle edit - use medicine ID instead of index
  const handleEdit = (medicine) => {
    setFormData(medicine);
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  // Handle delete - use medicine ID instead of index
  const handleDelete = async (medicine) => {
    if (window.confirm(`Are you sure you want to delete "${medicine.name}"?`)) {
      try {
        await dispatch(deleteMedicine(medicine._id)).unwrap();
        setSnackbar({ open: true, message: "Medicine deleted successfully!", severity: "success" });
        // No need to call fetchMedicines() - Redux should update the state
      } catch (error) {
        setSnackbar({ open: true, message: `Delete failed: ${error.message}`, severity: "error" });
      }
    }
  };

  // Handle view
  const handleView = (data) => setViewData(data);
  const closeViewDialog = () => setViewData(null);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get filtered and sorted medicines for display
  const getDisplayMedicines = () => {
    return medicines
      .filter((med) => med.isActive !== false)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  return (
    <Box
      sx={{
        overflowX: "auto",
        width: "100%",
        height: "100vh",
        bgcolor: "#fafafa",
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          filter: showForm ? "blur(4px)" : "none",
          transition: "0.3s",
          px: { xs: 1, sm: 2, md: 4 },
          pb: 6,
        }}
      >
        {/* Header */}
        <Container
          sx={{
            mt: 4,
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: { xs: "center", sm: "left" },
              fontWeight: "bold",
            }}
          >
            Laboratory Medicines
          </Typography>

          <Button
            variant="contained"
            onClick={() => {
              setEditingMedicine(null);
              resetForm();
              setShowForm(true);
            }}
            sx={{
              width: { xs: "100%", sm: "auto" },
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "navy" },
            }}
          >
            Add Medicine
          </Button>
        </Container>

        {/* Loader */}
        {status === "loading" && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Error Message */}
        {status === "failed" && (
          <Typography align="center" color="error" mt={4}>
            Error: {error}
          </Typography>
        )}

        {/* Medicine Table */}
        {status === "succeeded" && (
          <Box sx={{ overflowX: "auto" }}>
            {getDisplayMedicines().length > 0 ? (
              <MedicineTable
                medicines={getDisplayMedicines()}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleView={handleView}
              />
            ) : (
              <Typography variant="body1" align="center" sx={{ mt: 4, color: "gray" }}>
                No medicines added yet.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Show Form Modal */}
      {showForm && (
        <ShowForm
          showForm={showForm}
          setShowForm={setShowForm}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          editingMedicine={editingMedicine} // Changed from editingIndex
        />
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewData} onClose={closeViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Medicine Details</DialogTitle>
        <DialogContent>
          {viewData && <DetailView data={viewData} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Bottom Scrollbar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "12px",
          overflowX: "auto",
          bgcolor: "#e0e0e0",
        }}
      >
        <Box sx={{ width: "200vw" }} />
      </Box>
    </Box>
  );
};

export default LaboratoryPage;