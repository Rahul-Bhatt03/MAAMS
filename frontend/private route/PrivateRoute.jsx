import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, requiredRole }) => {
  // Safely get and parse user data from localStorage
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      // Check if userStr is null, undefined, or the string "undefined"
      if (!userStr || userStr === "undefined") {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem("user");
      return null;
    }
  };

  const user = getUserFromStorage();
  const token = localStorage.getItem("token");

  console.log('PrivateRoute:', { token, user, requiredRole }); // Debugging

  if (!token) {
    console.log("No token found, redirecting to /signin");
    return <Navigate to="/signin" replace />; // Redirect to sign-in if not authenticated
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log(`Role mismatch: expected ${requiredRole}, but got ${user?.role}`);
    return <Navigate to="/" replace />; // Redirect to home if role does not match
  }

  console.log("Authenticated and role matches, rendering child components.");
  return children ? children : <Outlet />; // Support both `children` and nested routes
};

export default PrivateRoute;