import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from "./baseurl";

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
export const fetchAllResearch = createAsyncThunk(
  'research/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/research`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch research projects');
    }
  }
);

export const fetchResearchById = createAsyncThunk(
  'research/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/research/${id}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch research project');
    }
  }
);

export const createResearch = createAsyncThunk(
  'research/create',
  async (researchData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/research`, researchData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create research project');
    }
  }
);

export const updateResearch = createAsyncThunk(
  'research/update',
  async ({ id, researchData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/research/${id}`, researchData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update research project');
    }
  }
);

export const deleteResearch = createAsyncThunk(
  'research/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/research/${id}`, getAuthToken());
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete research project');
    }
  }
);

export const addAttachment = createAsyncThunk(
  'research/addAttachment',
  async ({ id, attachmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/research/${id}/attachments`, attachmentData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add attachment');
    }
  }
);

export const removeAttachment = createAsyncThunk(
  'research/removeAttachment',
  async ({ id, attachmentId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/research/${id}/attachments`,
        { ...getAuthToken(), data: { attachmentId } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove attachment');
    }
  }
);

export const fetchResearchByDepartment = createAsyncThunk(
  'research/fetchByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/research/department/${departmentId}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch department research projects');
    }
  }
);

export const fetchResearchByInvestigator = createAsyncThunk(
  'research/fetchByInvestigator',
  async (investigatorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/research/investigator/${investigatorId}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch investigator research projects');
    }
  }
);

// Slice
const researchSlice = createSlice({
  name: 'research',
  initialState: {
    items: [],
    currentResearch: null,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    resetResearchState: (state) => {
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearCurrentResearch: (state) => {
      state.currentResearch = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllResearch
      .addCase(fetchAllResearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllResearch.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllResearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchResearchById
      .addCase(fetchResearchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResearchById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResearch = action.payload;
      })
      .addCase(fetchResearchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle createResearch
      .addCase(createResearch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createResearch.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = true;
        state.message = 'Research project created successfully';
      })
      .addCase(createResearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Handle updateResearch
      .addCase(updateResearch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateResearch.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.currentResearch = action.payload;
        state.success = true;
        state.message = 'Research project updated successfully';
      })
      .addCase(updateResearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Handle deleteResearch
      .addCase(deleteResearch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteResearch.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload.id);
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(deleteResearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Handle addAttachment
      .addCase(addAttachment.fulfilled, (state, action) => {
        state.currentResearch = action.payload;
        state.items = state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.success = true;
        state.message = 'Attachment added successfully';
      })
      .addCase(addAttachment.rejected, (state, action) => {
        state.error = action.payload;
        state.success = false;
      })

      // Handle removeAttachment
      .addCase(removeAttachment.fulfilled, (state, action) => {
        state.currentResearch = action.payload;
        state.items = state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.success = true;
        state.message = 'Attachment removed successfully';
      })
      .addCase(removeAttachment.rejected, (state, action) => {
        state.error = action.payload;
        state.success = false;
      })

      // Handle fetchByDepartment
      .addCase(fetchResearchByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResearchByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResearchByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchByInvestigator
      .addCase(fetchResearchByInvestigator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResearchByInvestigator.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResearchByInvestigator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetResearchState, clearCurrentResearch } = researchSlice.actions;
export default researchSlice.reducer;