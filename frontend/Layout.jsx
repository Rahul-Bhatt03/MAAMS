import React from "react";
import { Outlet } from "react-router-dom";
import AdvancedHospitalFooter from "./src/pages/public/Footer";
import HospitalAppBar from "./src/pages/public/Appbar";

const Layout = () => {
  console.log("Layout component rendering");
  return (
    <div className="app-container">
      {/* App Bar at the top */}
      <HospitalAppBar />

      {/* Main content section */}
      <main className="main-content">
        <Outlet /> {/* This will render child pages */}
      </main>

      {/* Footer at the bottom */}
      <AdvancedHospitalFooter />
    </div>
  );
};

export default Layout;