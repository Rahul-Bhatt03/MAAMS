import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from './baseurl';
import { format, parseISO } from 'date-fns';
import Doctor from '../../backend/models/doctorModel';

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
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { page, limit, status, doctorId, departmentId, patientId } = params || {};
      let url = `${BASE_URL}/appointments?`;
      
      if (page) url += `page=${page}&`;
      if (limit) url += `limit=${limit}&`;
      if (status) url += `status=${status}&`;
      if (doctorId) url += `doctorId=${doctorId}&`;
      if (departmentId) url += `departmentId=${departmentId}&`;
      if (patientId) url += `patientId=${patientId}&`;
      
      const response = await axios.get(url, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchUserAppointments = createAsyncThunk(
  'appointments/fetchUserAppointments',
  async (status, { rejectWithValue }) => {
    try {
      let url = `${BASE_URL}/appointments/my-appointments`;
      if (status) url += `?status=${status}`;
      
      const response = await axios.get(url, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user appointments');
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctorAppointments',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/appointments/doctor/${doctorId}`,
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor appointments');
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/appointments/${id}`,
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = appointmentData.date instanceof Date ?
      format(appointmentData.date, 'yyyy-MM-dd'): format (parseISO(appointmentData.date), 'yyyy-MM-dd');
      
      const response = await axios.post(
        `${BASE_URL}/appointments`,
        { ...appointmentData, date: formattedDate },
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, appointmentData }, { rejectWithValue }) => {
    try {
      // Format date if provided
      const dataToSend = { ...appointmentData };
      if (appointmentData.date) {
        dataToSend.date = format(appointmentData.date, 'yyyy-MM-dd');
      }
      
      const response = await axios.put(
        `${BASE_URL}/appointments/${id}`,
        dataToSend,
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/appointments/${id}/status`,
        { status },
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment status');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/appointments/${id}`,
        getAuthToken()
      );
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete appointment');
    }
  }
);

export const fetchAppointmentsByDepartment = createAsyncThunk(
  'appointments/fetchByDepartment',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/appointments/department/${departmentId}`,
        getAuthToken()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department appointments');
    }
  }
);
export const fetchAvailableTimeSlots = createAsyncThunk(
  'appointments/fetchAvailableTimeSlots',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      // Fetch the doctor details
      const doctorResponse = await axios.get(
        `${BASE_URL}/doctors/${doctorId}`,
        getAuthToken()
      );
      
      const doctor = doctorResponse.data.data || doctorResponse.data;
      const appointmentDate = new Date(date);
      const dayName = format(appointmentDate, 'EEEE'); // e.g., "Monday"
      
      // Find the available slot for this day
      const availableSlotForDay = doctor.availableSlots
        .find(slot => slot.day === dayName);
      
      let availableTimeSlots = [];
      
      if (availableSlotForDay) {
        // Parse the time range (e.g., "10AM-2PM") into individual slots
        availableTimeSlots = parseTimeRangeToSlots(availableSlotForDay.time);
      }
      
      return {
        availableTimeSlots,
        doctorId,
        date: format(appointmentDate, 'yyyy-MM-dd')
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available time slots');
    }
  }
);

// Helper function to parse time ranges into individual slots
function parseTimeRangeToSlots(timeRange) {
  // Example: "10AM-2PM" -> ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30"]
  const [startTime, endTime] = timeRange.split('-');
  
  // Convert 12-hour to 24-hour format
  const start = convertTo24Hour(startTime);
  const end = convertTo24Hour(endTime);
  
  // Generate slots at 30-minute intervals
  return generateTimeSlots(start, end, 30);
}

function convertTo24Hour(time) {
  let hours = parseInt(time.replace(/[^0-9]/g, ''));
  const isPM = time.toLowerCase().includes('pm');
  
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:00`;
}

function generateTimeSlots(start, end, intervalMinutes) {
  const slots = [];
  let currentTime = start;
  
  while (currentTime < end) {
    slots.push(currentTime);
    
    // Add interval
    const [hours, minutes] = currentTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + intervalMinutes, 0, 0);
    
    // Format back to HH:MM
    currentTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  return slots;
}

// Slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    userAppointments: [],
    doctorAppointments: [],
    availableTimeSlots: [],
    currentAppointment: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    resetAppointmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearAvailableTimeSlots: (state) => {
      state.availableTimeSlots = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data.docs || action.payload.data;
        state.pagination = {
          page: action.payload.data.page || 1,
          limit: action.payload.data.limit || 10,
          total: action.payload.data.total || action.payload.data.length,
          totalPages: action.payload.data.totalPages || 1
        };
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user appointments
      .addCase(fetchUserAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.userAppointments = action.payload.data;
      })
      .addCase(fetchUserAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch doctor appointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorAppointments = action.payload.data;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch appointment by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload.data;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userAppointments.unshift(action.payload.data);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
            // Update appointment
            .addCase(updateAppointment.fulfilled, (state, action) => {
              state.loading = false;
              state.success = true;
              
              // Update in appointments array
              state.appointments = state.appointments.map(app => 
                app._id === action.payload.data._id ? action.payload.data : app
              );
              
              // Update in user appointments array
              state.userAppointments = state.userAppointments.map(app =>
                app._id === action.payload.data._id ? action.payload.data : app
              );
              
              // Update in doctor appointments array
              state.doctorAppointments = state.doctorAppointments.map(app =>
                app._id === action.payload.data._id ? action.payload.data : app
              );
              
              // Update current appointment if it's the same one
              if (state.currentAppointment && state.currentAppointment._id === action.payload.data._id) {
                state.currentAppointment = action.payload.data;
              }
            })
            .addCase(updateAppointment.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
              state.success = false;
            })
            
            // Update appointment status
            .addCase(updateAppointmentStatus.pending, (state) => {
              state.loading = true;
              state.error = null;
              state.success = false;
            })
            .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
              state.loading = false;
              state.success = true;
              
              // Update in appointments array
              state.appointments = state.appointments.map(app => 
                app._id === action.payload.data._id ? action.payload.data : app
              );
              
              // Update in user appointments array
              state.userAppointments = state.userAppointments.map(app =>
                app._id === action.payload.data._id ? action.payload.data : app
              );
              
              // Update in doctor appointments array
              state.doctorAppointments = state.doctorAppointments.map(app =>
                app._id === action.payload.data._id ? action.payload.data : app
              );
              
              // Update current appointment if it's the same one
              if (state.currentAppointment && state.currentAppointment._id === action.payload.data._id) {
                state.currentAppointment = action.payload.data;
              }
            })
            .addCase(updateAppointmentStatus.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
              state.success = false;
            })
            
            // Delete appointment
            .addCase(deleteAppointment.pending, (state) => {
              state.loading = true;
              state.error = null;
              state.success = false;
            })
            .addCase(deleteAppointment.fulfilled, (state, action) => {
              state.loading = false;
              state.success = true;
              
              // Remove from appointments array
              state.appointments = state.appointments.filter(
                app => app._id !== action.payload.id
              );
              
              // Remove from user appointments array
              state.userAppointments = state.userAppointments.filter(
                app => app._id !== action.payload.id
              );
              
              // Remove from doctor appointments array
              state.doctorAppointments = state.doctorAppointments.filter(
                app => app._id !== action.payload.id
              );
              
              // Clear current appointment if it's the same one
              if (state.currentAppointment && state.currentAppointment._id === action.payload.id) {
                state.currentAppointment = null;
              }
            })
            .addCase(deleteAppointment.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
              state.success = false;
            })
            
            // Fetch appointments by department
            .addCase(fetchAppointmentsByDepartment.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(fetchAppointmentsByDepartment.fulfilled, (state, action) => {
              state.loading = false;
              state.appointments = action.payload.data;
            })
            .addCase(fetchAppointmentsByDepartment.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            })
            
            // Fetch available time slots
            .addCase(fetchAvailableTimeSlots.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(fetchAvailableTimeSlots.fulfilled, (state, action) => {
              state.loading = false;
              state.availableTimeSlots = action.payload.availableTimeSlots;
            })
            .addCase(fetchAvailableTimeSlots.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
            });
        }
      });
      
      export const { 
        resetAppointmentState, 
        clearCurrentAppointment,
        clearAvailableTimeSlots
      } = appointmentSlice.actions;
      
      export default appointmentSlice.reducer;