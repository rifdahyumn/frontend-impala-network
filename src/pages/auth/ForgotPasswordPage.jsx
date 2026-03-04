import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import '../../App.css';
import logo from '../../assets/impalalogo.png';
import logo2 from '../../assets/heterologo.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Email harus diisi');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Format email tidak valid');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email.trim(),
                    reset_url: `${window.location.origin}/reset-password`
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Terjadi kesalahan. Coba lagi.');
            }
        } catch (err) {
            console.error('Network/Server error:', err);
            setError('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="wave-top"></div>
            <div className="login-container">
                <div className="login-box">
                    <div className="logo-group mb-6">
                        <img src={logo} alt="Logo Impala" className="login-logo" />
                        <img src={logo2} alt="Logo Hetero" className="login-logo" />
                    </div>

                    <button 
                        onClick={() => navigate('/login')}
                        className="flex items-center text-blue-500 hover:text-blue-700 mb-6 text-sm"
                        disabled={loading}
                    >
                        <FaArrowLeft className="mr-2" /> Back to Login
                    </button>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot the password?</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Enter your email address. We will send you a link to reset your password.
                    </p>
                    
                    {success ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-green-700 font-medium">✓ Email Terkirim!</p>
                            <p className="text-green-600 text-sm mt-2">
                                Password reset link has been sent to <strong>{email}</strong>.
                                Please check your inbox or spam folder.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-4 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition duration-200"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="input-field">
                                <FaEnvelope className="icon" />
                                <input
                                    type="email"
                                    placeholder="Email Anda"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    disabled={loading}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {error && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="login-btn mt-6"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </div>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <div className="wave-bottom"></div>
        </div>
    );
}