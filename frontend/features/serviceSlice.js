import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from './baseurl';


// Helper function to get the token from localStorage
const getAuthToken = () => {
 return localStorage.getItem('token');
};

// Async Thunks for API calls

// Get all active services
export const getAllServices = createAsyncThunk(
  'services/getAllServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/services`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Fetching failed');
    }
  }
);

// Get service by ID
export const getServiceById = createAsyncThunk(
  'services/getServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/services/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Fetching service by ID failed');
    }
  }
);

// Create a new service
export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}/services`, serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Creating service failed');
    }
  }
);

// Update a service
export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${BASE_URL}/services/${id}`, serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Updating service failed');
    }
  }
);

// Soft delete a service (update `isActive` to false)
export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${BASE_URL}/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { id }; // Only need the id to update the state
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Deleting service failed');
    }
  }
);

// Redux slice for services
const serviceSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    service: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Get all services
    builder
      .addCase(getAllServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
        state.error = null;
      })
      .addCase(getAllServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get service by ID
    builder
      .addCase(getServiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.service = action.payload;
        state.error = null;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create a new service
    builder
      .addCase(createService.pending, (state) => {
        state.loading = true;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.push(action.payload); // Add newly created service to the list
        state.error = null;
        state.success = true;
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Update a service
    builder
      .addCase(updateService.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        // Update the modified service in the state
        const index = state.services.findIndex(service => service._id === action.payload._id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Soft delete a service
    builder
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        // Update the service status to inactive
        const index = state.services.findIndex(service => service._id === action.payload.id);
        if (index !== -1) {
          state.services[index].isActive = false;
        }
        state.error = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default serviceSlice.reducer;