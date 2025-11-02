import React, { useState } from "react";
import {
  Box,
  Container,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const LaboratoryPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [medicines, setMedicines] = useState([]);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMedicines([...medicines, formData]);
    setShowForm(false);
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

  return (
    <>
      {/* Background blur when form is open */}
      <Box
        sx={{
          filter: showForm ? "blur(4px)" : "none",
          transition: "0.3s",
        }}
      >
        <Container
          sx={{
            mt: 4,
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">Add to Medicine</Typography>
          <Button
            variant="contained"
            sx={{
              "&:hover": { backgroundColor: "navy" },
            }}
            onClick={() => setShowForm(true)}
          >
            Add to Table
          </Button>
        </Container>

        {/* Table below */}
        {medicines.length > 0 && (
          <Container sx={{ mt: 4 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                    <TableCell>Form</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Prescription</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicines.map((med, index) => (
                    <TableRow key={index}>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>{med.genericName}</TableCell>
                      <TableCell>{med.form}</TableCell>
                      <TableCell>{med.category}</TableCell>
                      <TableCell>{med.price}</TableCell>
                      <TableCell>{med.stock}</TableCell>
                      <TableCell>
                        {med.requiresPrescription ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        )}
      </Box>

      {/* Scrollable popup form */}
      {showForm && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
          onClick={() => setShowForm(false)} // click outside closes form
        >
          <Paper
            onClick={(e) => e.stopPropagation()} // prevent close on click inside
            sx={{
              width: "80%",
              maxWidth: 600,
              maxHeight: "80vh",
              overflowY: "auto", // 🔥 allows scroll
              p: 4,
              borderRadius: 3,
              boxShadow: 5,
              transform: "scale(1.05)",
              transition: "0.3s",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Add New Medicine
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Generic Name"
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                label="Dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                select
                label="Form"
                name="form"
                value={formData.form}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              >
                {[
                  "tablet",
                  "capsule",
                  "syrup",
                  "injection",
                  "cream",
                  "ointment",
                  "drops",
                  "inhaler",
                  "other",
                ].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {[
                  "antibiotics",
                  "painkillers",
                  "vitamins",
                  "cardiovascular",
                  "diabetes",
                  "respiratory",
                  "gastrointestinal",
                  "dermatology",
                  "other",
                ].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requiresPrescription}
                    onChange={handleChange}
                    name="requiresPrescription"
                  />
                }
                label="Requires Prescription"
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button variant="outlined" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default LaboratoryPage;
