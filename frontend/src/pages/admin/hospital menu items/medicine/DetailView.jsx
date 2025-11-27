import React from 'react'
import { Box, Typography } from '@mui/material';

const DetailView = ({ data }) => {
  return (
    <div>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Typography><strong>Name:</strong> {data.name || "-"}</Typography>
              <Typography><strong>Generic Name:</strong> {data.genericName || "-"}</Typography>
              <Typography><strong>Description:</strong> {data.description || "-"}</Typography>
              <Typography><strong>Dosage:</strong> {data.dosage || "-"}</Typography>
              <Typography><strong>Form:</strong> {data.form || "-"}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Manufacturing & Pricing</Typography>
              <Typography><strong>Manufacturer:</strong> {data.manufacturer || "-"}</Typography>
              <Typography><strong>Price:</strong> {data.price || "-"}</Typography>
              <Typography><strong>Stock:</strong> {data.stock || "-"}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Additional Information</Typography>
              <Typography><strong>Category:</strong> {data.category || "-"}</Typography>
              <Typography><strong>Expiry Date:</strong> {data.expiryDate || "-"}</Typography>
              <Typography><strong>Requires Prescription:</strong> {data.requiresPrescription ? "Yes" : "No"}</Typography>
            </Box>
    </div>
  )
}

export default DetailView
