import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from "./baseurl";

// Format date helper
const formatDate = (date) => date.toISOString().split("T")[0].replace(/-/g, "/");

// Parse date helper
const parseDate = (dateStr) => new Date(dateStr.replace(/\//g, "-"));

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/appointments`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch appointments' });
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/appointments/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed fetching appointment by ID' });
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      // Validate date isn't in the past
      const appointmentDate = parseDate(appointmentData.date);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate < currentDate) {
        return rejectWithValue({ message: 'Cannot book an appointment in the past' });
      }
      
      const response = await axios.post(`${BASE_URL}/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create appointment' });
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, appointmentData }, { rejectWithValue }) => {
    try {
      // Validate date isn't in the past if provided
      if (appointmentData.date) {
        const appointmentDate = parseDate(appointmentData.date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        if (appointmentDate < currentDate) {
          return rejectWithValue({ message: 'Cannot update appointment to a past date' });
        }
      }
      
      const response = await axios.put(`${BASE_URL}/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update the appointment' });
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      if (!["Pending", "Confirmed", "Rejected"].includes(status)) {
        return rejectWithValue({ message: 'Invalid status value' });
      }
      
      const response = await axios.patch(`${BASE_URL}/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update appointment status' });
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/appointments/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete the appointment' });
    }
  }
);

export const fetchAppointmentsByDepartment = createAsyncThunk(
  'appointments/fetchByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/appointments/department/${departmentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error fetching department appointments' });
    }
  }
);

export const fetchAppointmentsByDoctor = createAsyncThunk(
  'appointments/fetchByDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error fetching doctor appointments' });
    }
  }
);

// Initial state
const initialState = {
  appointments: [],
  currentAppointment: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filteredAppointments: []
};

// Create slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    filterAppointmentsByStatus: (state, action) => {
      const status = action.payload;
      if (status === 'All') {
        state.filteredAppointments = state.appointments;
      } else {
        state.filteredAppointments = state.appointments.filter(
          appointment => appointment.status === status
        );
      }
    },
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
        state.filteredAppointments = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch appointments' };
      })
      
      // Fetch appointment by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentAppointment = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch appointment' };
      })
      
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments.unshift(action.payload);
        state.filteredAppointments.unshift(action.payload);
        state.currentAppointment = action.payload;
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to create appointment' };
      })
      
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedAppointment = action.payload;
        
        // Update in appointments array
        const index = state.appointments.findIndex(app => app._id === updatedAppointment._id);
        if (index !== -1) {
          state.appointments[index] = updatedAppointment;
        }
        
        // Update in filtered appointments array
        const filteredIndex = state.filteredAppointments.findIndex(app => app._id === updatedAppointment._id);
        if (filteredIndex !== -1) {
          state.filteredAppointments[filteredIndex] = updatedAppointment;
        }
        
        // Update current appointment if it's the same one
        if (state.currentAppointment && state.currentAppointment._id === updatedAppointment._id) {
          state.currentAppointment = updatedAppointment;
        }
        
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update appointment' };
      })
      
      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedAppointment = action.payload;
        
        // Update in appointments array
        const index = state.appointments.findIndex(app => app._id === updatedAppointment._id);
        if (index !== -1) {
          state.appointments[index] = updatedAppointment;
        }
        
        // Update in filtered appointments array
        const filteredIndex = state.filteredAppointments.findIndex(app => app._id === updatedAppointment._id);
        if (filteredIndex !== -1) {
          state.filteredAppointments[filteredIndex] = updatedAppointment;
        }
        
        // Update current appointment if it's the same one
        if (state.currentAppointment && state.currentAppointment._id === updatedAppointment._id) {
          state.currentAppointment = updatedAppointment;
        }
        
        state.error = null;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to update appointment status' };
      })
      
      // Delete appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove from appointments array
        state.appointments = state.appointments.filter(app => app._id !== action.payload.id);
        // Remove from filtered appointments array
        state.filteredAppointments = state.filteredAppointments.filter(app => app._id !== action.payload.id);
        // Clear current appointment if it's the same one
        if (state.currentAppointment && state.currentAppointment._id === action.payload.id) {
          state.currentAppointment = null;
        }
        state.error = null;
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to delete appointment' };
      })
      
      // Fetch appointments by department
      .addCase(fetchAppointmentsByDepartment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointmentsByDepartment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredAppointments = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointmentsByDepartment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch department appointments' };
      })
      
      // Fetch appointments by doctor
      .addCase(fetchAppointmentsByDoctor.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointmentsByDoctor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredAppointments = action.payload;
        state.error = null;
      })
      .addCase(fetchAppointmentsByDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to fetch doctor appointments' };
      });
  }
});

// Export actions
export const { clearCurrentAppointment, filterAppointmentsByStatus, clearErrors } = appointmentSlice.actions;

// Export selectors
export const selectAllAppointments = state => state.appointments.appointments;
export const selectFilteredAppointments = state => state.appointments.filteredAppointments;
export const selectCurrentAppointment = state => state.appointments.currentAppointment;
export const selectAppointmentStatus = state => state.appointments.status;
export const selectAppointmentError = state => state.appointments.error;

// Export reducer
export default appointmentSlice.reducer;