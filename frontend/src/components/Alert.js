// Alert.js
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; // Adjust the import path based on your project structure
import "./css/Alert.css"; // Import the CSS file



const Alert = () => {
    const [shiftContent, setShiftContent] = useState(false);
  return (
    <div className="alert-page">
       <Sidebar toggleContentShift={setShiftContent} />
      <div className="alert-content">
        {/* Total and Today's Alerts Section */}
        <div className="alert-summary">
          <div className="alert-summary-box total-alerts">
            <h2>Total Alerts</h2>
            <p>45</p> {/* Dummy total alerts count */}
          </div>
          <div className="alert-summary-box todays-alerts">
            <h2>Today's Alerts</h2>
            <p>5</p> {/* Dummy today's alerts count */}
          </div>
        </div>

        {/* Alerts List Section */}
        <div className="alerts-list">
          {/* Dummy Alert Containers */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="alert-box" key={index}>
              <p><strong>Date:</strong> 2025-01-04</p>
              <p><strong>Product Quantity:</strong> 120</p>
              <p><strong>Alert Rate:</strong> $500</p>
              <p><strong>Mail Sent To:</strong> example@mail.com</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alert;
