import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Import axios
import BASE_URL from "./baseurl"; // Ensure this path is correct

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
export const fetchDepartments = createAsyncThunk(
  "departments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/departments`, getAuthToken());
    
      return response.data;
     
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching departments");
    }
  }
);

export const fetchDepartmentById = createAsyncThunk(
  "departments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/departments/${id}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching department");
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/create",
  async (departmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/departments`, departmentData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating department");
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, departmentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/departments/${id}`, departmentData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating department");
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/departments/${id}`, getAuthToken());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting department");
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    departments: [],
    department: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearDepartment: (state) => {
      state.department = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.department = action.payload;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex(dep => dep._id === action.payload._id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(dep => dep._id !== action.payload);
      });
  },
});

export const { clearDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;