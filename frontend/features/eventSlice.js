import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "./baseurl";

// Helper function to get token from localStorage
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  
  // Check if token exists and return proper authorization header
  if (!token) {
    console.warn("No authentication token found in localStorage");
    return {};
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async Thunks
export const fetchEvents = createAsyncThunk("events/fetchEvents", async (_, { rejectWithValue }) => {
  try {
    const authConfig = getAuthConfig();
    // Check if we have authorization headers
    if (!authConfig.headers?.Authorization) {
      return rejectWithValue({ message: "Authentication token not found" });
    }
    
    const response = await axios.get(`${BASE_URL}/events`, authConfig);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

// The rest of your thunks with the same pattern
export const fetchEventById = createAsyncThunk("events/fetchEventById", async (eventId, { rejectWithValue }) => {
  try {
    const authConfig = getAuthConfig();
    if (!authConfig.headers?.Authorization) {
      return rejectWithValue({ message: "Authentication token not found" });
    }
    
    const response = await axios.get(`${BASE_URL}/events/${eventId}`, authConfig);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const addEvent = createAsyncThunk("events/addEvent", async (eventData, { rejectWithValue }) => {
  try {
    const authConfig = getAuthConfig();
    if (!authConfig.headers?.Authorization) {
      return rejectWithValue({ message: "Authentication token not found" });
    }
    
    const response = await axios.post(`${BASE_URL}/events/create`, eventData, authConfig);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const softDeleteEvent = createAsyncThunk("events/softDeleteEvent", async (eventId, { rejectWithValue }) => {
  try {
    const authConfig = getAuthConfig();
    if (!authConfig.headers?.Authorization) {
      return rejectWithValue({ message: "Authentication token not found" });
    }
    
    await axios.delete(`${BASE_URL}/events/delete/${eventId}`, authConfig);
    return eventId;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

export const updateEvent = createAsyncThunk("events/updateEvent", async ({ eventId, eventData }, { rejectWithValue }) => {
  try {
    const authConfig = getAuthConfig();
    if (!authConfig.headers?.Authorization) {
      return rejectWithValue({ message: "Authentication token not found" });
    }
    
    const response = await axios.put(`${BASE_URL}/events/${eventId}`, eventData, authConfig);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: error.message });
  }
});

// The rest of your slice code remains the same
const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    event: null,
    status: "idle", // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
  },
  reducers: {
    clearEventError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      // Fetch Event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.event = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      // Add Event
      .addCase(addEvent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.events.push(action.payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      // Soft Delete Event
      .addCase(softDeleteEvent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(softDeleteEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.events = state.events.filter(event => event._id !== action.payload);
      })
      .addCase(softDeleteEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedEvent = action.payload;
        const index = state.events.findIndex((event) => event._id === updatedEvent._id);
        if (index !== -1) {
          state.events[index] = updatedEvent;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export const { clearEventError } = eventSlice.actions;
export default eventSlice.reducer;