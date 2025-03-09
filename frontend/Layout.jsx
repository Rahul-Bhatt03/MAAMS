import React from "react";
import { Outlet } from "react-router-dom";
import AdvancedHospitalFooter from "./src/pages/public/Footer";
import HospitalAppBar from "./src/pages/public/Appbar";

const Layout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar at the top */}
      <HospitalAppBar />

      {/* Main content section */}
      <main style={{ flexGrow: 1, padding: 0 }}>
        <Outlet /> {/* This will render child pages */}
      </main>

      {/* Footer at the bottom */}
      <AdvancedHospitalFooter />
    </div>
  );
};

export default Layout;
