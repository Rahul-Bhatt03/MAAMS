import React from 'react'
import { Box, Paper, Typography, TextField, MenuItem, FormControlLabel, Checkbox, Button } from '@mui/material';

const ShowForm = ({
  showForm,
  setShowForm,
  editingMedicine, // Changed from editingIndex to editingMedicine
  formData,
  handleChange,
  handleSubmit
}) => {
  return (
    <div>
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
            {editingMedicine !== null ? "Edit Medicine" : "Add New Medicine"}
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
              label="Dosage (in mg)"
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
              label="Price (In Rs.)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Stock (in units)"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 0 }}
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
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
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

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowForm(false)}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                sx={{ flex: 1 }}
              >
                {editingMedicine !== null ? "Update Medicine" : "Add Medicine"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </div>
  )
}

export default ShowForm