import { configureStore } from "@reduxjs/toolkit";
import authSliceReducer from "./features/authSlice.js";
import searchReducer from "./features/searchSlice.js";
import serviceReducer from "./features/serviceSlice.js";
import eventReducer from "./features/eventSlice.js";
import researchReducer from "./features/researchSlice.js";
import doctorReducer from "./features/doctorSlice.js";
import appointmentReducer from "./features/appointmentSlice.js";
import departmentReducer from './features/departmentSlice.js'
import uploadReducer from './features/uploadSlice';
import patientReducer from './features/patientSlice.js'
import nurseReducer from './features/nurseSlice.js'
import pharmacistReducer from './features/pharmacistSlice.js'

const store = configureStore({
  reducer: {
    auth: authSliceReducer, // Add reducers here
    search: searchReducer,
    service: serviceReducer,
    events: eventReducer,
    research: researchReducer,
    doctors: doctorReducer,
    appointments: appointmentReducer,
    departments:departmentReducer,
    upload: uploadReducer,
    patients:patientReducer,
    nurses:nurseReducer,
    pharmacists:pharmacistReducer,
  },
});

export default store;
