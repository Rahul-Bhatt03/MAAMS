import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import { Info, AddShoppingCart, Medication, Search } from "@mui/icons-material";


const medicines = [
  {
    id: 1,
    name: "Amoxicillin",
    strength: "500 mg",
    form: "Capsule",
    category: "Antibiotic",
    manufacturer: "ABC Pharma",
    expiry: "2026-05-30",
    price: 120,
    stock: 50,
    description: "Used to treat bacterial infections.",
  },
  {
    id: 2,
    name: "Paracetamol",
    strength: "650 mg",
    form: "Tablet",
    category: "Analgesic",
    manufacturer: "MediLife Ltd.",
    expiry: "2027-08-12",
    price: 80,
    stock: 0, // Out of stock for testing
    description: "Reduces fever and relieves pain.",
  },
  {
    id: 3,
    name: "Cetirizine",
    strength: "10 mg",
    form: "Tablet",
    category: "Antihistamine",
    manufacturer: "HealthCorp",
    expiry: "2025-09-22",
    price: 45,
    stock: 200,
    description: "Used for allergy relief.",
  },
];

const Medicinecard = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const cardRefs = useRef([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortType, setSortType] = useState("");

  // Equal height adjustment
  useEffect(() => {
    const updateHeights = () => {
      const heights = cardRefs.current.map((card) =>
        card ? card.getBoundingClientRect().height : 0
      );
      const tallest = Math.max(...heights);
      setMaxHeight(tallest);
    };
    updateHeights();
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, []);

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
    alert(`${medicine.name} added to cart 🛒`);
  };

  const filteredMedicines = medicines
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((m) => (categoryFilter ? m.category === categoryFilter : true))
    .sort((a, b) => {
      if (sortType === "priceAsc") return a.price - b.price;
      if (sortType === "priceDesc") return b.price - a.price;
      if (sortType === "nameAsc") return a.name.localeCompare(b.name);
      if (sortType === "nameDesc") return b.name.localeCompare(a.name);
      return 0;
    });

  const categories = [...new Set(medicines.map((m) => m.category))];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: "#f4f7fa" }}>
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
      </Paper>

      {/* Medicines Grid */}
      <Grid container spacing={4} justifyContent="center">
        {filteredMedicines.map((m, idx) => (
          <Grid
            item
            key={m.id}
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
              style={{ width: "100%", maxWidth: 340 }}
            >
              <Card
                ref={(el) => (cardRefs.current[idx] = el)}
                elevation={6}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  textAlign: "center",
                  p: 2,
                  height: maxHeight || "auto",
                  minHeight: 420,
                  background:
                    "linear-gradient(145deg, #ffffff, #f2f6fb 60%, #e8f0fe)",
                  boxShadow:
                    "0 8px 24px rgba(25, 118, 210, 0.18), 0 0 4px rgba(25,118,210,0.1)",
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
                    <strong>Strength:</strong> {m.strength}
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
        ))}
      </Grid>

      {/* Dialog */}
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
              <strong>Strength:</strong> {selectedMedicine.strength}
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
              <strong>Expiry Date:</strong> {selectedMedicine.expiry}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Price:</strong> ₹{selectedMedicine.price}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Stock:</strong> {selectedMedicine.stock}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontStyle: "italic" }}>
              {selectedMedicine.description}
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
    </Box>
  );
};

export default Medicinecard;
