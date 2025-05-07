import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from './baseurl';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async thunks
export const fetchAllDoctors = createAsyncThunk(
  'doctors/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/doctors`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/doctors/${id}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch doctor');
    }
  }
);

export const createDoctor = createAsyncThunk(
  'doctors/create',
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/doctors`, doctorData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create doctor');
    }
  }
);

export const updateDoctor = createAsyncThunk(
  'doctors/update',
  async ({ id, doctorData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/doctors/${id}`, doctorData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update doctor');
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  'doctors/delete',
  async (id, { rejectWithValue }) => {
    try {
      // Fix: Missing slash before the ID parameter
      const response = await axios.delete(`${BASE_URL}/doctors/${id}`, getAuthToken());
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete doctor');
    }
  }
);

export const fetchDoctorsByDepartment = createAsyncThunk(
  'doctors/fetchByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/doctors/department/${departmentId}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch department doctors');
    }
  }
);

export const updateDoctorAvailability = createAsyncThunk(
  'doctors/updateAvailability',
  async ({ id, availableSlots }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/doctors/${id}/availability`, 
        { availableSlots }, 
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update doctor availability');
    }
  }
);

// Slice
const doctorSlice = createSlice({
  name: 'doctors',
  initialState: {
    items: [],
    currentDoctor: null,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    resetDoctorState: (state) => {
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearCurrentDoctor: (state) => {
      state.currentDoctor = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllDoctors
      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchDoctorById
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle createDoctor
      .addCase(createDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = true;
        state.message = 'Doctor created successfully';
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Handle updateDoctor
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.currentDoctor = action.payload;
        state.success = true;
        state.message = 'Doctor updated successfully';
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Handle deleteDoctor
      .addCase(deleteDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload.id);
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Handle fetchDoctorsByDepartment
      .addCase(fetchDoctorsByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorsByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data||action.payload;
      })
      .addCase(fetchDoctorsByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateDoctorAvailability
      .addCase(updateDoctorAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateDoctorAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.currentDoctor = action.payload;
        state.success = true;
        state.message = 'Doctor availability updated successfully';
      })
      .addCase(updateDoctorAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetDoctorState, clearCurrentDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;