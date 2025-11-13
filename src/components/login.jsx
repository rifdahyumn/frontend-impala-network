// src/components/Login.jsx
import React, { useState } from "react";
import "../App.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import dari context folder
import logo from "../assets/impalalogo.png";
import logo2 from "../assets/heterologo.png";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Login Failed');
            }

            // Gunakan login function dari context
            login(data.token, data.user);

            // Redirect to intended page
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
            
        } catch (err) {
            setError(err.message);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="wave-top"></div>
            <div className="login-container">
                <div className="login-box">
                    <div className="logo-group">
                        <img src={logo} alt="Logo 1" className="login-logo" />
                        <img src={logo2} alt="Logo 2" className="login-logo" />
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="input-field">
                            <FaUser className="icon" />
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-field">
                            <FaLock className="icon" />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                <p className="text-red-500 text-sm mb-3">{error}</p>
                            </div>
                        )}

                        <div className="forgot">
                            <a href="#" className="text-blue-500 hover:text-blue-700">
                                Forgot Password?
                            </a>
                        </div>

                        <button 
                            type="submit" 
                            className="login-btn" 
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </div>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <div className="wave-bottom"></div>
        </div>
    );
}