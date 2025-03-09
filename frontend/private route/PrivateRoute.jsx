import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Fetch user from localStorage
  const token = localStorage.getItem("token");

  console.log('PrivateRoute:', { token, user, requiredRole }); // Debugging

  if (!token) {
    return <Navigate to="/signin" replace />; // Redirect to sign-in if not authenticated
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace/>; // Redirect to home if role does not match
  }

  // return children; // Render the children if authenticated and role matches
  return <Outlet/>
};

export default PrivateRoute;