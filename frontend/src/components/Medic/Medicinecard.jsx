import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Divider,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Pagination,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import { Info, AddShoppingCart, Medication, Search } from "@mui/icons-material";
import { fetchMedicines } from "../../../features/MedicineSlice"; // adjust path as needed
import { addToCart } from "../../../features/cartSlice"; // adjust path as needed

const Medicinecard = () => {
  const dispatch = useDispatch();
  const { medicines, status, error } = useSelector((state) => state.medicines);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const cardRefs = useRef([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortType, setSortType] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Default 9 items per page (3x3 grid)

  // Fetch medicines on component mount
  useEffect(() => {
    dispatch(fetchMedicines());
  }, [dispatch]);

  // Equal height adjustment
  useEffect(() => {
    if (status === "succeeded" && medicines.length > 0) {
      const updateHeights = () => {
        const heights = cardRefs.current.map((card) =>
          card ? card.getBoundingClientRect().height : 0
        );
        const tallest = Math.max(...heights);
        setMaxHeight(tallest);
      };
      
      // Delay height calculation to ensure cards are rendered
      setTimeout(updateHeights, 100);
      window.addEventListener("resize", updateHeights);
      return () => window.removeEventListener("resize", updateHeights);
    }
  }, [medicines, status]);

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMedicine(null);
  };

  const handleAddToCart = (medicine) => {
    if (medicine.stock === 0) return;
    dispatch(addToCart(medicine));
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, sortType]);

  // Filter and sort logic
  const filteredMedicines = medicines
    .filter((m) => 
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((m) => (categoryFilter ? m.category === categoryFilter : true))
    .sort((a, b) => {
      if (sortType === "priceAsc") return a.price - b.price;
      if (sortType === "priceDesc") return b.price - a.price;
      if (sortType === "nameAsc") return a.name?.localeCompare(b.name);
      if (sortType === "nameDesc") return b.name?.localeCompare(a.name);
      return 0;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Smooth scroll to top of medicines section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(1); // Reset to first page
  };

  const categories = [...new Set(medicines.map((m) => m.category).filter(Boolean))];

  // Loading state
  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading medicines...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading medicines: {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => dispatch(fetchMedicines())}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          color: "#1976d2",
          letterSpacing: 1,
        }}
      >
        🏥 Available Medicines
      </Typography>

      {/* Filter Bar */}
      <Paper
        sx={{
          mb: 4,
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          label="Search Medicines"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "#1976d2" }} />,
          }}
          sx={{ flex: 1, minWidth: 180 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortType}
            label="Sort By"
            onChange={(e) => setSortType(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="priceAsc">Price: Low → High</MenuItem>
            <MenuItem value="priceDesc">Price: High → Low</MenuItem>
            <MenuItem value="nameAsc">Name: A → Z</MenuItem>
            <MenuItem value="nameDesc">Name: Z → A</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={itemsPerPage}
            label="Per Page"
            onChange={handleItemsPerPageChange}
          >
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={9}>9</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={18}>18</MenuItem>
            <MenuItem value={24}>24</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex + 1} - {Math.min(endIndex, filteredMedicines.length)} of {filteredMedicines.length} medicines
        </Typography>
      </Box>

      {/* Medicines Grid */}
      <Grid container spacing={4} justifyContent="center">
        {currentMedicines.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" textAlign="center" color="text.secondary">
              No medicines found matching your criteria.
            </Typography>
          </Grid>
        ) : (
          currentMedicines.map((m, idx) => (
            <Grid
              item
              key={m._id || m.id}
              xs={12}
              sm={6}
              md={4}
              display="flex"
              justifyContent="center"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  width: "320px", 
                  maxWidth: "100%", 
                  display: "flex", 
                  flexDirection: "column" 
                }}
              >
                <Card
                  elevation={6}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    textAlign: "center",
                    p: 2,
                    height: "100%",
                    width: "100%",
                    background: "linear-gradient(145deg, #ffffff, #f2f6fb 60%, #e8f0fe)",
                    boxShadow: "0 8px 24px rgba(25, 118, 210, 0.18), 0 0 4px rgba(25,118,210,0.1)",
                    transition: "0.3s",
                    "&:hover": { boxShadow: "0 12px 32px rgba(25,118,210,0.3)" },
                    position: "relative",
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Medication sx={{ fontSize: 50, color: "#1976d2", mb: 1 }} />
                    <Typography
                      variant="h6"
                      sx={{ mb: 1, fontWeight: 700, color: "#0d47a1" }}
                    >
                      {m.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      <strong>Dosage:</strong> {m.dosage}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      <strong>Form:</strong> {m.form}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      <strong>Category:</strong> {m.category}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      <strong>Manufacturer:</strong> {m.manufacturer}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        fontWeight: "bold",
                        color: m.stock > 0 ? "green" : "red",
                      }}
                    >
                      {m.stock > 0 ? `${m.stock} available` : "Out of stock"}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: "#1976d2" }}>
                      <strong>₹{m.price}</strong>
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Info />}
                      onClick={() => handleViewDetails(m)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      startIcon={<AddShoppingCart />}
                      onClick={() => handleAddToCart(m)}
                      disabled={m.stock === 0}
                    >
                      {m.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination Controls */}
      {filteredMedicines.length > 0 && (
        <Stack spacing={2} sx={{ mt: 4, alignItems: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1rem",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                backgroundColor: "#1976d2 !important",
                color: "#fff",
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        </Stack>
      )}

      {/* Medicine Details Dialog */}
      {selectedMedicine && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              backdropFilter: "blur(8px)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.95), rgba(240,248,255,0.9))",
              boxShadow: "0 8px 24px rgba(25,118,210,0.3)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              color: "#fff",
              background:
                "linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)",
              textAlign: "center",
              py: 2,
            }}
          >
            <Medication sx={{ mr: 1, verticalAlign: "middle" }} />
            {selectedMedicine.name}
          </DialogTitle>

          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>
              <strong>Dosage:</strong> {selectedMedicine.dosage}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Form:</strong> {selectedMedicine.form}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Category:</strong> {selectedMedicine.category}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Manufacturer:</strong> {selectedMedicine.manufacturer}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Expiry Date:</strong> {selectedMedicine.expiry || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Price:</strong> ₹{selectedMedicine.price}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Stock:</strong> {selectedMedicine.stock}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontStyle: "italic" }}>
              {selectedMedicine.description || "No description available."}
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", py: 2 }}>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddShoppingCart />}
              onClick={() => handleAddToCart(selectedMedicine)}
              disabled={selectedMedicine.stock === 0}
            >
              {selectedMedicine.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar for add to cart confirmation */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {selectedMedicine?.name} added to cart 🛒
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Medicinecard;