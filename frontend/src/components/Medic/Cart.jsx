import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Divider, IconButton, Paper, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, TextField, Container, Card, CardContent, Stack
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCartCheckout } from '@mui/icons-material';
import { 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  toggleItemSelection, 
  toggleAllSelection, 
  deleteSelectedItems,
  applyCoupon 
} from '../../../features/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalQuantity, shippingCost, discount, couponCode } = useSelector((state) => state.cart);
  const [couponInput, setCouponInput] = useState("");

  // --- Calculations ---
  const selectedItems = items.filter(item => item.isSelected);
  const selectedSubtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = discount > 0 ? (selectedSubtotal * discount) : 0;
  const finalTotal = selectedSubtotal - discountAmount + (selectedItems.length > 0 ? shippingCost : 0);
  
  const isAllSelected = items.length > 0 && items.every(item => item.isSelected);
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  // --- Handlers ---
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity === 0) {
      if(window.confirm("Remove this item?")) dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  
  const shopping = () => {
    navigate('/medicine');
  }
  
  const handleApplyCoupon = () => {
    dispatch(applyCoupon(couponInput));
    if(couponInput !== "SAVE10") alert("Invalid Coupon (Try SAVE10)");
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" mb={2} color="text.secondary">Your cart is empty</Typography>
        <Button variant="contained" size="large" onClick={shopping}>Start Shopping</Button>
      </Container>
    );
  }

  return (
    // maxWidth={false} ensures it takes up the full width of the screen to reduce empty space
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        
        {/* --- LEFT SIDE: CART ITEMS (Responsive) --- */}
        {/* On Medium screens takes 8/12 (66%), on Large screens takes 9/12 (75%) */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper elevation={2} sx={{ mb: 2, overflow: 'hidden' }}>
            
            {/* Toolbar */}
            <Box p={2} display="flex" alignItems="center" bgcolor="#f5f5f5" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Checkbox 
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => dispatch(toggleAllSelection(e.target.checked))}
                />
                <Typography variant="subtitle1">Select All ({items.length})</Typography>
              </Box>
              
              {selectedItems.length > 0 && (
                <Button 
                  color="error" 
                  size="small"
                  startIcon={<Delete />} 
                  onClick={() => {
                    if(window.confirm(`Delete ${selectedItems.length} items?`)) dispatch(deleteSelectedItems());
                  }}
                >
                  Delete Selected
                </Button>
              )}
            </Box>
            <Divider />

            {/* --- DESKTOP VIEW (Table) - Hidden on Mobile (xs) --- */}
            <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%"></TableCell>
                    <TableCell width="45%">Product</TableCell>
                    <TableCell width="20%" align="center">Quantity</TableCell>
                    <TableCell width="15%" align="right">Price</TableCell>
                    <TableCell width="15%" align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id} hover selected={item.isSelected}>
                      <TableCell>
                        <Checkbox 
                          checked={!!item.isSelected} 
                          onChange={() => dispatch(toggleItemSelection(item._id))}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="500">{item.name}</Typography>
                        {/* ID Removed as requested */}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" border={1} borderColor="divider" borderRadius={1} width="fit-content" mx="auto">
                          <IconButton size="small" onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography px={2}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell align="right" sx={{fontWeight:'bold'}}>₹{item.price * item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* --- MOBILE VIEW (Cards) - Hidden on Desktop (md) --- */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {items.map((item) => (
                <Box key={item._id}>
                  <Box p={2} display="flex" alignItems="flex-start" gap={2}>
                    <Checkbox 
                      checked={!!item.isSelected} 
                      onChange={() => dispatch(toggleItemSelection(item._id))}
                      sx={{ p: 0, mt: 0.5 }}
                    />
                    <Box flexGrow={1}>
                      <Box display="flex" justifyContent="space-between">
                         <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                         <Typography variant="subtitle1" fontWeight="bold">₹{item.price * item.quantity}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">Unit Price: ₹{item.price}</Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center" border={1} borderColor="divider" borderRadius={1}>
                          <IconButton size="small" onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography px={2}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Box>

          </Paper>
          
          <Button variant="text" onClick={() => dispatch(clearCart())} color="inherit">
            Clear Entire Cart
          </Button>
        </Grid>

        {/* --- RIGHT SIDE: ORDER SUMMARY --- */}
        {/* On Medium screens takes 4/12 (33%), on Large screens takes 3/12 (25%) */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={1} mb={2}>
                <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Selected Items:</Typography>
                <Typography fontWeight="500">{selectedItems.length}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Subtotal:</Typography>
                <Typography fontWeight="500">₹{selectedSubtotal.toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Shipping:</Typography>
                <Typography fontWeight="500">₹{selectedItems.length > 0 ? shippingCost : 0}</Typography>
                </Box>

                {discount > 0 && (
                <Box display="flex" justifyContent="space-between" color="success.main">
                    <Typography>Discount:</Typography>
                    <Typography>- ₹{discountAmount.toFixed(2)}</Typography>
                </Box>
                )}
            </Stack>

            <Box my={3}>
              <Typography variant="caption" display="block" mb={1}>Coupon Code</Typography>
              <Box display="flex" gap={1}>
                <TextField 
                  size="small" 
                  fullWidth 
                  placeholder="Enter code" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={discount > 0}
                />
                <Button 
                  variant="contained" 
                  onClick={handleApplyCoupon}
                  disabled={discount > 0 || !couponInput}
                  sx={{ minWidth: '80px' }}
                >
                  {discount > 0 ? "Done" : "Apply"}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">₹{finalTotal.toFixed(2)}</Typography>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              startIcon={<ShoppingCartCheckout />}
              disabled={selectedItems.length === 0}
            >
              Checkout
            </Button>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default Cart;