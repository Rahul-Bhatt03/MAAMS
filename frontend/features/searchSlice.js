// features/searchSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from './baseurl';

// Async thunk for searching
export const searchDatabase = createAsyncThunk(
  'search/searchDatabase',
  async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/search?query=${query}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: { users: [], departments: [] },
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.results = { users: [], departments: [] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDatabase.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Search failed';
      });
  },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;