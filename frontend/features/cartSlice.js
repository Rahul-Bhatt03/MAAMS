import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    shippingCost: 50, // Default shipping cost
    discount: 0,      // Discount amount
    couponCode: "",   // Applied code
  },
  reducers: {
    addToCart: (state, action) => {
      const medicine = action.payload;
      const existingItem = state.items.find(item => item._id === medicine._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        // New items are selected by default
        state.items.push({ ...medicine, quantity: 1, isSelected: true });
      }
      
      state.totalQuantity += 1;
      state.totalAmount += medicine.price;
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);
      
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter(item => item._id !== id);
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item._id === id);
      
      if (existingItem && quantity > 0) {
        state.totalQuantity += quantity - existingItem.quantity;
        state.totalAmount += existingItem.price * (quantity - existingItem.quantity);
        existingItem.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.discount = 0;
      state.couponCode = "";
    },
    // --- NEW FEATURES ---
    toggleItemSelection: (state, action) => {
      const id = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) {
        item.isSelected = !item.isSelected;
      }
    },
    toggleAllSelection: (state, action) => {
      const shouldSelect = action.payload; // boolean
      state.items.forEach(item => {
        item.isSelected = shouldSelect;
      });
    },
    deleteSelectedItems: (state) => {
      // Filter out items that are selected
      const itemsKeep = state.items.filter(item => !item.isSelected);
      const itemsRemove = state.items.filter(item => item.isSelected);

      // Recalculate totals based on what's being removed
      const quantityRemoved = itemsRemove.reduce((acc, item) => acc + item.quantity, 0);
      const amountRemoved = itemsRemove.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      state.items = itemsKeep;
      state.totalQuantity -= quantityRemoved;
      state.totalAmount -= amountRemoved;
    },
    applyCoupon: (state, action) => {
      const code = action.payload;
      // Mock logic for coupon - in real app, validate with backend
      if (code === "SAVE10") {
        state.discount = 0.1; // 10% representation
        state.couponCode = code;
      } else {
        state.discount = 0;
        state.couponCode = "";
      }
    }
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  toggleItemSelection,
  toggleAllSelection,
  deleteSelectedItems,
  applyCoupon
} = cartSlice.actions;

export default cartSlice.reducer;