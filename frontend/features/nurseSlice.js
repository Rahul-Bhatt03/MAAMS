import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from './baseurl';

// Reuse the same getAuthToken helper function
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async Thunks
export const fetchAllNurses = createAsyncThunk(
  'nurses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/nurses`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch nurses');
    }
  }
);

export const createNurse = createAsyncThunk(
  'nurses/create',
  async (nurseData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/nurses`, nurseData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create nurse');
    }
  }
);

export const updateNurse = createAsyncThunk(
  'nurses/update',
  async ({ id, nurseData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/nurses/${id}`, nurseData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update nurse');
    }
  }
);

export const deleteNurse = createAsyncThunk(
  'nurses/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/nurses/${id}`, getAuthToken());
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete nurse');
    }
  }
);

const nurseSlice = createSlice({
  name: 'nurses',
  initialState: {
    items: [],
    currentNurse: null,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    resetNurseState: (state) => {
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearCurrentNurse: (state) => {
      state.currentNurse = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Nurses
      .addCase(fetchAllNurses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNurses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllNurses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Nurse
      .addCase(createNurse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNurse.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = true;
        state.message = 'Nurse created successfully';
      })
      .addCase(createNurse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Nurse
      .addCase(updateNurse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateNurse.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.success = true;
        state.message = 'Nurse updated successfully';
      })
      .addCase(updateNurse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete Nurse
      .addCase(deleteNurse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteNurse.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload.id);
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(deleteNurse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetNurseState, clearCurrentNurse } = nurseSlice.actions;
export default nurseSlice.reducer;