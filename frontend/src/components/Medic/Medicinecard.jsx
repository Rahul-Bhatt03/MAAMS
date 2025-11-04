import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Medication, Vaccines, MedicalServices, Info, AddShoppingCart } from "@mui/icons-material";
import { motion } from "framer-motion";

const categoryColors = {
  Antibiotics: "error",
  Painkillers: "warning",
  Vitamins: "success",
  Cardiovascular: "primary",
  Diabetes: "secondary",
  Respiratory: "info",
  Gastrointestinal: "default",
  Dermatology: "success",
};

const medicines = [
  {
    id: 1,
    name: "Paracetamol",
    strength: "500 mg",
    form: "Tablet",
    category: "Painkillers",
    manufacturer: "ABC Pharma",
    expiry: "2025-12-31",
    description: "Used for fever and pain relief.",
    price: 12.5,
    stock: 120,
    icon: <Medication sx={{ fontSize: 60, color: "#009688" }} />,
  },
  {
    id: 2,
    name: "Amoxicillin",
    strength: "250 mg",
    form: "Capsule",
    category: "Antibiotics",
    manufacturer: "XYZ Labs",
    expiry: "2026-03-31",
    description:
      "Broad-spectrum antibiotic used to treat various infections. This text is truncated to keep card height consistent.",
    price: 45,
    stock: 0,
    icon: <Vaccines sx={{ fontSize: 60, color: "#009688" }} />,
  },
  {
    id: 3,
    name: "Ibuprofen",
    strength: "200 mg",
    form: "Tablet",
    category: "Painkillers",
    manufacturer: "Heal Pharma",
    expiry: "2025-09-30",
    description: "Reduces inflammation and pain.",
    price: 20,
    stock: 36,
    icon: <MedicalServices sx={{ fontSize: 60, color: "#009688" }} />,
  },
];

const Medicinecard = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [cart, setCart] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const cardRefs = useRef([]);
  const [maxHeight, setMaxHeight] = useState(0);

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setOpenDialog(true);
  };

  // ✅ Add to Cart Handler
  const handleAddToCart = (medicine) => {
    if (medicine.stock === 0) {
      setSnackbar({ open: true, message: "Out of stock!", severity: "error" });
      return;
    }

    if (cart.some((item) => item.id === medicine.id)) {
      setSnackbar({ open: true, message: "Already in cart!", severity: "info" });
      return;
    }

    setCart((prev) => [...prev, { ...medicine, quantity: 1 }]);
    setSnackbar({ open: true, message: `${medicine.name} added to cart!`, severity: "success" });
  };

  // ✅ Calculate tallest card height
  useEffect(() => {
    const updateHeights = () => {
      const heights = cardRefs.current.map((card) => card?.getBoundingClientRect().height || 0);
      const tallest = Math.max(...heights);
      setMaxHeight(tallest);
    };

    updateHeights();
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, []);

  return (
    <Box p={2} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" mb={3} color="primary" align="center">
        Available Medicines
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {medicines.map((m, idx) => (
          <Grid item xs={12} sm={6} md={4} key={m.id} sx={{ display: "flex" }}>
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%" }}
            >
              <Card
                ref={(el) => (cardRefs.current[idx] = el)}
                elevation={4}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 2,
                  height: maxHeight || "100%",
                  minHeight: 420,
                }}
              >
                <CardMedia
                  sx={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#e0f7fa",
                  }}
                >
                  {m.icon}
                </CardMedia>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 240,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                    >
                      {m.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {m.strength} • {m.form}
                    </Typography>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Chip
                        label={m.category}
                        size="small"
                        color={categoryColors[m.category] || "default"}
                        sx={{ mt: 1 }}
                      />
                    </motion.div>
                    <Typography variant="body2" mt={1} color="textSecondary">
                      Manufacturer: {m.manufacturer}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Expiry: {m.expiry}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mt: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {m.description}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="h6" color="success.main">
                      ₹{m.price.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={m.stock > 0 ? "textSecondary" : "error.main"}
                    >
                      {m.stock > 0 ? `Stock: ${m.stock}` : "Out of Stock"}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ flexDirection: "column", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewDetails(m)}
                    startIcon={<Info />}
                  >
                    View Details
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="success"
                    onClick={() => handleAddToCart(m)}
                    startIcon={<AddShoppingCart />}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ✅ Details Modal */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        {selectedMedicine && (
          <>
            <DialogTitle>{selectedMedicine.name}</DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#e0f2f1" }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="center">{selectedMedicine.icon}</Box>
                <Typography><strong>Strength:</strong> {selectedMedicine.strength}</Typography>
                <Typography><strong>Form:</strong> {selectedMedicine.form}</Typography>
                <Typography><strong>Category:</strong> {selectedMedicine.category}</Typography>
                <Typography><strong>Manufacturer:</strong> {selectedMedicine.manufacturer}</Typography>
                <Typography><strong>Expiry:</strong> {selectedMedicine.expiry}</Typography>
                <Typography><strong>Price:</strong> ₹{selectedMedicine.price.toFixed(2)}</Typography>
                <Typography><strong>Stock:</strong> {selectedMedicine.stock > 0 ? selectedMedicine.stock : "Out of Stock"}</Typography>
                <Divider />
                <Typography>{selectedMedicine.description}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleAddToCart(selectedMedicine)} color="success" startIcon={<AddShoppingCart />}>
                Add to Cart
              </Button>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ✅ Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Medicinecard;
