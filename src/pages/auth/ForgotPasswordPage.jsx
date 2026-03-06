import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { HiOutlineMail } from 'react-icons/hi';
import '../../App.css';
import logo from '../../assets/impalalogo.png';
import logo2 from '../../assets/heterologo.png';
import { forgotPasswordService } from '../../services/authServices';

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
    const [notification, setNotification] = useState({
        show: false,
        type: '',
        message: '',
        email: ''
    });

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
        setNotification({ show: false, type: '', message: '', email: '' });

        try {
            const response = await forgotPasswordService(email.trim());
            
            setNotification({
                show: true,
                type: 'success',
                message: response.message || 'Password reset link has been sent to your email',
                email: email.trim()
            });
            
        } catch (err) {
            console.error('Error:', err);
            
            if (err.status === 404 || err.code === 'EMAIL_NOT_REGISTERED') {
                setNotification({
                    show: true,
                    type: 'error',
                    message: err.message || 'Email is not registered in our system',
                    email: email.trim()
                });
            } else if (err.status === 403) {
                setNotification({
                    show: true,
                    type: 'error',
                    message: err.message || 'Your account is not active',
                    email: email.trim()
                });
            } else {
                setNotification({
                    show: true,
                    type: 'error',
                    message: err.message || 'An error occurred. Please try again.',
                    email: email.trim()
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setNotification({ show: false, type: '', message: '', email: '' });
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="bg-white rounded-2xl shadow-xl p-8">

                    <div className="flex justify-center items-center space-x-4 mb-8">
                        <img src={logo} alt="Logo Impala" className="h-10 w-auto" />
                        <img src={logo2} alt="Logo Hetero" className="h-10 w-auto" />
                    </div>

                    <button 
                        onClick={() => navigate('/login')}
                        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 text-sm transition-colors"
                        disabled={loading}
                    >
                        <FaArrowLeft className="mr-2" size={12} /> 
                        Back To Login
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Forgot Password?
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Enter your email, we will send you a password reset link
                        </p>
                    </div>
                    
                    {notification.show ? (
                        <div className="mb-6">
                            {notification.type === 'success' ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <FaCheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-green-800 mb-2">
                                                Email Sent!
                                            </h3>
                                            <p className="text-sm text-green-700 mb-3">
                                                Reset link has been sent to:
                                            </p>
                                            <p className="bg-white p-2 rounded-lg text-sm text-green-800 font-mono mb-3">
                                                {notification.email}
                                            </p>
                                            <p className="text-xs text-green-600">
                                                Check your inbox or spam folder
                                            </p>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    Log In
                                                </button>
                                                <button
                                                    onClick={resetForm}
                                                    className="flex-1 py-2 bg-white border border-green-600 text-green-600 hover:bg-green-50 text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    Other Email
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <FaExclamationCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-red-800 mb-2">
                                                Email not Found
                                            </h3>
                                            <p className="bg-white p-2 rounded-lg text-sm text-red-800 font-mono mb-3">
                                                {notification.email}
                                            </p>
                                            <p className="text-sm text-red-600 mb-4">
                                                Email not registered. Please check again.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={resetForm}
                                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    Try Again
                                                </button>
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiOutlineMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                        placeholder="nama@email.com"
                                        className={`w-full pl-10 pr-3 py-2.5 border ${
                                            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                        disabled={loading}
                                    />
                                </div>
                                {error && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center">
                                        <FaExclamationCircle className="h-3 w-3 mr-1" />
                                        {error}
                                    </p>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    'Kirim Link Reset'
                                )}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}