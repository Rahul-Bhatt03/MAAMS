import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../features/tokenSlice';

// Async Thunks
export const fetchAllPharmacists = createAsyncThunk(
  'pharmacists/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pharmacists');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAllPharmacistsWithDeleted = createAsyncThunk(
  'pharmacists/fetchAllWithDeleted',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pharmacists/with-deleted');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPharmacist = createAsyncThunk(
  'pharmacists/create',
  async (pharmacistData, { rejectWithValue }) => {
    try {
      const response = await api.post('/pharmacists', pharmacistData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePharmacist = createAsyncThunk(
  'pharmacists/update',
  async ({ id, pharmacistData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pharmacists/${id}`, pharmacistData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePharmacist = createAsyncThunk(
  'pharmacists/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/pharmacists/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const restorePharmacist = createAsyncThunk(
  'pharmacists/restore',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pharmacists/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const pharmacistSlice = createSlice({
  name: 'pharmacists',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    deletedItems: [],
  },
  reducers: {
    resetPharmacistState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPharmacists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllPharmacists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAllPharmacists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAllPharmacistsWithDeleted.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllPharmacistsWithDeleted.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.filter(p => !p.isDeleted);
        state.deletedItems = action.payload.filter(p => p.isDeleted);
      })
      .addCase(fetchAllPharmacistsWithDeleted.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createPharmacist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPharmacist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createPharmacist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updatePharmacist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePharmacist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePharmacist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deletePharmacist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deletePharmacist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedItem = state.items.find(p => p._id === action.payload);
        if (deletedItem) {
          state.items = state.items.filter(p => p._id !== action.payload);
          state.deletedItems.push({ ...deletedItem, isDeleted: true });
        }
      })
      .addCase(deletePharmacist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(restorePharmacist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(restorePharmacist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const restoredItem = state.deletedItems.find(p => p._id === action.payload._id);
        if (restoredItem) {
          state.deletedItems = state.deletedItems.filter(p => p._id !== action.payload._id);
          state.items.push(action.payload);
        }
      })
      .addCase(restorePharmacist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetPharmacistState } = pharmacistSlice.actions;
export default pharmacistSlice.reducer;