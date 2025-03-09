import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./features/authSlice.js"
import searchReducer from './features/searchSlice.js'
import serviceReducer from './features/serviceSlice.js'

const store = configureStore({
  reducer: {
    auth: authSliceReducer, // Add reducers here
    search:searchReducer,
    service:serviceReducer,
  },
});

export default store;
