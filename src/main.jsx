import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Login from "./components/login.jsx";
import Dashboard from "./components/dashboard.jsx";
import DashboardManajer from "./components/dashboard_manajer";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard_manajer" element={<DashboardManajer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
