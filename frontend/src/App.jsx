import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "../private route/PrivateRoute"; // Ensure the path is correct
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
import CalendarPage from "./pages/admin/main menu item/CalendarPage";
import ResearchDetail from "./components/research/ResearchDetail";
import DepartmentDetail from "./components/departments/DepartmentDetails";
import DepartmentsCrud from "./components/departments/DepartmentsCrud";
import Research from "./components/research/Research";

const App = () => {
  console.log("App component rendering"); // Check if the App component is rendered
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />

        {/* public routes protected by PrivateRoute and uses Layout */}
        <Route element={<PrivateRoute requiredRole="public" />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
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
        
        <Route path="/profile" element={<UserProfile />} />
       

        <Route element={<Layout />}>
        <Route path="/research" element={<Research/>} />
        <Route path="/research/:id" element={<ResearchDetail />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/department/:id" element={<DepartmentDetail />} />
          <Route path="/departments" element={<DepartmentsCrud />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
