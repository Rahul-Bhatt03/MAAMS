// features/uploadSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from './baseurl';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  };
};

// Upload file async thunk
export const uploadFile = createAsyncThunk(
  'upload/file',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post(
        `${BASE_URL}/upload`, 
        formData, 
        getAuthToken()
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to upload file');
    }
  }
);

// Slice
const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    url: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetUploadState: (state) => {
      state.url = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.url = action.payload.url;
        state.success = true;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;