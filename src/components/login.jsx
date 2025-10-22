import React, { useState } from "react";
import "../App.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/impalalogo.png";
import logo2 from "../assets/heterologo.png";

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Login Failed')

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            if (data.user.role === 'admin') navigate('/')
            else if (data.user.role === 'manajer_program') navigate('/')
            else navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    } 

  return (
    <div className="login-page">
      <div className="wave-top"></div>
      <div className="login-container">
        <div className="login-box">

          <div className="logo-group">
            <img src={logo} alt="Logo 1" className="login-logo" />
            <img src={logo2} alt="Logo 2" className="login-logo" />
          </div>

          <div className="input-field">
            <FaUser className="icon" />
            <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-field">
            <FaLock className="icon" />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-red-500 mb-3">{error}</p>}

          <div className="forgot">
            <a href="#" className="text-blue-500">Forgot Password?</a>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
      <div className="wave-bottom"></div>
    </div>
  );
}
