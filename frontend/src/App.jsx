import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "../private route/PrivateRoute";
import SignupPage from "./login/signup";
import SigninPage from "./login/Signin";
import NurseDashboard from "./pages/nurse/NurseDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/public/Home";
import "../global.css";
import ServicePage from "./components/services/Services";
import Layout from "../Layout";
import UserProfile from "./pages/public/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />

        {/* public routes protected by PrivateRoute and uses Layout */}
        <Route element={<PrivateRoute requiredRole="public" />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServicePage />} />
            <Route path="/profile" element={<UserProfile/>} />
          </Route>
        </Route>

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/superAdmin-dashboard"
          element={
            <PrivateRoute requiredRole="superAdmin">
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <PrivateRoute requiredRole="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/nurse-dashboard"
          element={
            <PrivateRoute requiredRole="nurse">
              <NurseDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/services" element={<ServicePage />} />
      </Routes>
    </Router>
  );
};

export default App;
