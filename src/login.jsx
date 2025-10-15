import React from "react";
import "./App.css";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "./assets/impalalogo.png"; // ganti nama file sesuai logo kamu
import logo2 from "./assets/heterologo.png";

function App() {
    return (
    <div className="login-page">
      <div className="wave-top"></div>

      <div className="login-container">
        <div className="login-box">

          {/* Dua logo sejajar */}
          <div className="logo-group">
            <img src={logo} alt="Logo 1" className="login-logo" />
            <img src={logo2} alt="Logo 2" className="login-logo" />
          </div>

          <div className="input-field">
            <FaUser className="icon" />
            <input type="text" placeholder="Username" />
          </div>

          <div className="input-field">
            <FaLock className="icon" />
            <input type="password" placeholder="Password" />
          </div>

          <div className="forgot">
            <a href="#">Forgot Password?</a>
          </div>

          <button className="login-btn">Login</button>
        </div>
      </div>
      <div className="wave-bottom"></div>
    </div>
  );
}

export default App;
