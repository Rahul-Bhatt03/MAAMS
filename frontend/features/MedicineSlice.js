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

// Async thunks
export const fetchMedicines = createAsyncThunk(
  "medicines/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/medicines`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching medicines");
    }
  }
);

export const fetchMedicineByID = createAsyncThunk(
  "medicines/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/medicines/${id}`, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching medicine");
    }
  }
);

export const createMedicine = createAsyncThunk(
  "medicines/create",
  async (medicineData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/medicines`, medicineData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error Creating Medicine");
    }
  }
);

export const updateMedicine = createAsyncThunk(
  "medicines/update",
  async ({ id, medicineData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/medicines/${id}`, medicineData, getAuthToken());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error Updating Medicine");
    }
  }
);

export const deleteMedicine = createAsyncThunk(
  "medicines/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/medicines/${id}`, getAuthToken());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting Medicine");
    }
  }
);

const medicineSlice = createSlice({
  name: "medicines",
  initialState: {
    medicines: [],
    medicine: null,
    status: "idle",
    error: null,
  },extraReducers: (builder) => {
  builder
    .addCase(fetchMedicines.pending, (state) => {
      state.status = "loading";
    })
    .addCase(fetchMedicines.fulfilled, (state, action) => {
      state.status = "succeeded";
      // ✅ Only store the data array, not the full response
      state.medicines = action.payload.data;
    })
    .addCase(fetchMedicines.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    })
    .addCase(fetchMedicineByID.fulfilled, (state, action) => {
      // Single item response likely looks like { success: true, data: { ... } }
      state.medicine = action.payload.data;
    })
    .addCase(createMedicine.fulfilled, (state, action) => {
      // ✅ Append only the created medicine object, not wrapper object
      const newMed = action.payload.data;
      if (Array.isArray(state.medicines)) {
        state.medicines.push(newMed);
      } else {
        state.medicines = [newMed];
      }
    })
    .addCase(updateMedicine.fulfilled, (state, action) => {
      const updatedMed = action.payload.data;
      const index = state.medicines.findIndex(med => med._id === updatedMed._id);
      if (index !== -1) {
        state.medicines[index] = updatedMed;
      }
    })
    .addCase(deleteMedicine.fulfilled, (state, action) => {
      state.medicines = state.medicines.filter(med => med._id !== action.payload);
    });
}
});

export const { clearMedicine } = medicineSlice.actions;
export default medicineSlice.reducer;