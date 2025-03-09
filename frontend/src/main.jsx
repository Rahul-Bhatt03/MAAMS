import React from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Provider } from "react-redux"; // Import Provider
import store from "../store.js"; // Import your Redux store
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Provider store={store}> {/* Wrap App with Provider */}
      <App />
    </Provider>
  </StrictMode>
);
