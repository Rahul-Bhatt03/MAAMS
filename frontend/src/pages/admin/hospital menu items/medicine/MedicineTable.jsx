import React from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";

const MedicineTable = ({ medicines, handleDelete, handleEdit, handleView }) => {
  return (
    <Container sx={{ mt: 4 }}>
      {/* 🖥️ Desktop/Tablet Table */}
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Generic Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Form</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Price (Rs.)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Prescription</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicines.map((med, index) => (
                <TableRow key={med._id} hover>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>{med.genericName}</TableCell>
                  <TableCell>{med.form}</TableCell>
                  <TableCell>{med.category}</TableCell>
                  <TableCell>Rs. {med.price}</TableCell>
                  <TableCell>{med.stock}</TableCell>
                  <TableCell>{med.requiresPrescription ? "Yes" : "No"}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleView(med)} 
                      title="View Details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleEdit(med)} 
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(med)} 
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 📱 Mobile View (Card Style Table) */}
      <Box sx={{ display: { xs: "block", sm: "none" }, mt: 2 }}>
        {medicines.map((med, index) => (
          <Paper
            key={med._id}
            elevation={3}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {med.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {med.genericName}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography>
                <b>Form:</b> {med.form}
              </Typography>
              <Typography>
                <b>Category:</b> {med.category}
              </Typography>
              <Typography>
                <b>Price:</b> Rs. {med.price}
              </Typography>
              <Typography>
                <b>Stock:</b> {med.stock}
              </Typography>
              <Typography>
                <b>Prescription:</b> {med.requiresPrescription ? "Yes" : "No"}
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <IconButton
                color="primary"
                onClick={() => handleView(med)}
                title="View Details"
              >
                <Visibility />
              </IconButton>
              <IconButton
                color="secondary"
                onClick={() => handleEdit(med)}
                title="Edit"
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDelete(med)}
                title="Delete"
              >
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default MedicineTable;