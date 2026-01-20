import React, { useEffect, useState } from "react";
import "../App.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/impalalogo.png";
import logo2 from "../assets/heterologo.png";
import { validateEmail } from "../utils/validation";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [authError, setAuthError] = useState("");
    
    const isDevelopment = import.meta.env.DEV;
    const appUrl = import.meta.env.VITE_APP_URL;

    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || getRedirectPath(user.role);
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = "Email harus diisi";
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Format email tidak valid";
        }
        
        if (!formData.password) {
            newErrors.password = "Password harus diisi";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getRedirectPath = (role) => {
        switch (role) {
            case 'komunitas':
                return '/hetero/banyumas';
            case 'admin':
            case 'manajer_program': 
                return '/';
            default:
                return '/';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        if (authError) setAuthError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setAuthError("");

        try {
            const result = await login(formData.email.trim(), formData.password);
            
            if (result.success) {
                const redirectPath = getRedirectPath(result.user.role);
                
                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 100);
            } else {
                throw new Error(result.error || 'Login failed');
            }
            
        } catch (err) {
            console.error('Login error:', err);
            setAuthError(err.message.includes('credentials') ? 'Email atau password salah' : 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            setFormData({ email: "", password: "" });
            setErrors({});
            setAuthError("");
        };
    }, []);

    return (
        <div className="login-page">
            <div className="wave-top"></div>
            <div className="login-container">
                <div className="login-box">
                    <div className="logo-group">
                        <img src={logo} alt="Logo Impala" className="login-logo" />
                        <img src={logo2} alt="Logo Hetero" className="login-logo" />
                    </div>

                    {isDevelopment && (
                        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-center">
                            <p className="text-xs text-yellow-800">
                                Development Mode - {appUrl}
                            </p>
                            <p className="text-xs text-yellow-800 mt-1">
                                Backend: {import.meta.env.VITE_API_BASE_URL}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} noValidate>
                        <div className="input-field">
                            <FaUser className="icon" />
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Email" 
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                autoComplete="email"
                                aria-label="Email"
                                className={errors.email ? "border-red-500" : ""}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 ml-8">{errors.email}</p>
                        )}

                        <div className="input-field mt-4">
                            <FaLock className="icon" />
                            <input 
                                type="password" 
                                name="password"
                                placeholder="Password" 
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                autoComplete="current-password"
                                aria-label="Password"
                                className={errors.password ? "border-red-500" : ""}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 ml-8">{errors.password}</p>
                        )}

                        {authError && (
                            <div className="error-message mt-4 p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-600 text-sm">{authError}</p>
                            </div>
                        )}

                        <div className="forgot mt-4">
                            <a 
                                href={`${appUrl}/forgot-password`}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/forgot-password');
                                }}
                            >
                                Lupa Password?
                            </a>
                        </div>

                        <button 
                            type="submit" 
                            className="login-btn mt-6" 
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Loading...
                                </div>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <div className="wave-bottom"></div>
        </div>
    );
}