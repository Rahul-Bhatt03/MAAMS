// patientSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
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

// Initial state
const initialState = {
  patients: [],
  allPatientPayloads: [], // New array to store all patient payloads
  currentPatient: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loading: false,
  error: null
};

// Async thunks
export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, name, status, doctorId, departmentId, sortBy, sortOrder } = params;
      let queryString = `?page=${page}&limit=${limit}`;
      if (name) queryString += `&name=${name}`;
      if (status) queryString += `&status=${status}`;
      if (doctorId) queryString += `&doctorId=${doctorId}`;
      if (departmentId) queryString += `&departmentId=${departmentId}`;
      if (sortBy) queryString += `&sortBy=${sortBy}&sortOrder=${sortOrder || 'desc'}`;
      
      const response = await axios.get(`${BASE_URL}/patients${queryString}`, getAuthToken());
      console.log("Response data:", response.data);
      return {patients:response.data.message.patients,
      pagination:response.data.message.pagination,
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  "patients/fetchPatientById",
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/patients/${patientId}`, getAuthToken());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createPatient = createAsyncThunk(
  "patients/createPatient",
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/patients`, patientData, getAuthToken());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updatePatient = createAsyncThunk(
  "patients/updatePatient",
  async ({ patientId, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${BASE_URL}/patients/${patientId}`, data, getAuthToken());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deletePatient = createAsyncThunk(
  "patients/deletePatient",
  async (patientId, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/patients/${patientId}`, getAuthToken());
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice
const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearCurrentPatient: (state) => {
      state.currentPatient = null;
    },
    resetPatientError: (state) => {
      state.error = null;
    },
    // New reducer to add payload to allPatientPayloads
    addPatientPayload: (state, action) => {
      state.allPatientPayloads.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // In your fetchPatients.fulfilled case
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both direct array and nested response structures
        state.patients = Array.isArray(action.payload) 
          ? action.payload 
          : action.payload?.success?.patients || action.payload?.patients || [];
        state.pagination = action.payload?.success?.pagination || action.payload?.pagination || {
          total: state.patients.length,
          page: 1,
          limit: 10,
          totalPages: 1
        };
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch patients";
      })
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch patient";
      })
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.unshift(action.payload);
        state.allPatientPayloads.push(action.payload); // Add to allPatientPayloads
        state.pagination.total += 1;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create patient";
      })
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patients.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
        // Update in allPatientPayloads if exists
        const payloadIndex = state.allPatientPayloads.findIndex(p => p._id === action.payload._id);
        if (payloadIndex !== -1) {
          state.allPatientPayloads[payloadIndex] = action.payload;
        } else {
          state.allPatientPayloads.push(action.payload);
        }
        if (state.currentPatient && state.currentPatient._id === action.payload._id) {
          state.currentPatient = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update patient";
      })
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(patient => patient._id !== action.payload);
        // Remove from allPatientPayloads
        state.allPatientPayloads = state.allPatientPayloads.filter(p => p._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentPatient && state.currentPatient._id === action.payload) {
          state.currentPatient = null;
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete patient";
      });
  }
});

export const { clearCurrentPatient, resetPatientError, addPatientPayload } = patientSlice.actions;
export default patientSlice.reducer;