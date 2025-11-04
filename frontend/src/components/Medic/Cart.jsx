// src/components/Medic/Cart.jsx
import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';

const Cart = () => {
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        My Cart
      </Typography>
      <Divider />
      <Typography mt={2}>
        Your cart is currently empty.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Checkout
      </Button>
    </Box>
  );
};

export default Cart;
