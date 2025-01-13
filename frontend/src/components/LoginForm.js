import React, { useState } from "react";
import axios from "axios";
import "./css/LoginForm.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(username + password)
    try {
      const response = await axios.post("http://localhost:8000/login/", {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        alert("Login successful!");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    
    <div className="login-container">
      
      <div className="image-container">
        <img src="https://img.freepik.com/free-vector/store-staff-check-number-products-that-must-be-delivered-customers-day_1150-51079.jpg" alt="Login Illustration" />
      </div>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          <div className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            /><p>Show Password</p>
          </div>
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
