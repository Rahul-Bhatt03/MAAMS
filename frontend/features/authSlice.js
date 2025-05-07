import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "./baseurl";

// Async Thunk for Signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Signup data being sent to API:", userData); // Debug log
      const response = await axios.post(`${BASE_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get user from localStorage
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    console.log("User from localStorage:",typeof user);
    return user&&user!="undefined" ? JSON.parse(`${user}`) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

//to fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      //get token from local storage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("no authentication token found");
      }
      //configure axios request with token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      //making an api call to fetch user profile
      const { data } = await axios.get(`${BASE_URL}/auth/profile/${userId}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchUsersByRole = createAsyncThunk(
  "auth/fetchUsersByRole",
  async (role, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }, // Fixed space after Bearer
      };

      const { data } = await axios.get(`${BASE_URL}/auth/role/${role}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Initial State
const initialState = {
  user: getUserFromStorage(), // Get user from localStorage on initial load
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  usersByRole: [], // New state to store users by role
};

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Additional reducers if needed
    resetUserProfile: (state) => {
      state.userDetails = null;
      state.loading = false;
      state.error = null;
    },
    // Reducer to clear errors
    clearError: (state) => {
      state.error = null;
    },
    // Reducer to logout user
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Also remove user from localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup Cases
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user)); // Store user in localStorage
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Signup failed";
      })
      //case of fetching user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload; // Store fetched user data
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userDetails = null;
      })
      // Login Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role,
        };
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: action.payload._id,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
          })
        ); // Store user in localStorage
        console.log("Login successful:", action.payload); // Debugging
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      //to fetch users by role
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.usersByRole = action.payload;
        state.error = null;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.usersByRole = [];
      });
  },
});

// Export Actions
export const { clearError, logoutUser, resetUserProfile } = authSlice.actions;

// Export Reducer
export default authSlice.reducer;
