import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./css/Sidebar.css";

const Sidebar = ({ toggleContentShift }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    toggleContentShift(!isOpen); // Notify parent component about the state
  };


  const handleLogout=()=>
  {
    navigate('/')
  }
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <nav>
        <ul>
          <li><Link to="/dashboard">🏠 Dashboard</Link></li>
          <li><Link to="/inventory">📦 Inventory</Link></li>
          <li><Link to="/purchase">🛒 Purchase</Link></li>
          <li><Link to="/sell">💰 Sell</Link></li>
          <li><Link to="/alerts">🔔 Alerts</Link></li>
          <li><Link to="/settings">Settings</Link></li>
         
        </ul>
      </nav>
      <div className="last-login">
        <p>Last Login:</p>
        <p>{new Date().toLocaleString()}</p>
      </div>
      <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
};

export default Sidebar;
