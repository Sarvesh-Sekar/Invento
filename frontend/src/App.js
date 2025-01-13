import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Purchase from "./components/Purchase";
import Sell from "./components/Sell";
import Alert from "./components/Alert";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/alerts" element={<Alert />} />

      </Routes>
    </Router>
  );
}

export default App;