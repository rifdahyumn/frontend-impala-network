// File: src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { resetPasswordService } from '../../services/authServices'; // Import yang benar
import '../../App.css';
import logo from '../../assets/impalalogo.png';
import logo2 from '../../assets/heterologo.png';

const validatePassword = (password) => {
  return password.length >= 6;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token reset password tidak valid atau sudah kadaluarsa.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // PERBAIKAN: Tambahkan ASYNC di sini
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token tidak valid');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Password harus diisi');
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setError('Password minimal 6 karakter');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Gunakan service yang sudah ada
      await resetPasswordService(token, formData.password);
      setSuccess(true);
      
      // Auto redirect ke login setelah 3 detik
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Gagal reset password. Token mungkin sudah kadaluarsa.');
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
            <FaArrowLeft className="mr-2" /> Kembali ke Login
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-600 text-sm mb-6">
            Masukkan password baru Anda.
          </p>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <p className="text-green-700 font-medium">✓ Password Berhasil Direset!</p>
              </div>
              <p className="text-green-600 text-sm mt-2">
                Password Anda telah berhasil diubah. Anda akan dialihkan ke halaman login dalam 3 detik.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field mb-4">
                <FaLock className="icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password baru"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="input-field mb-6">
                <FaLock className="icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="login-btn mt-2"
                disabled={loading || !token}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengatur ulang...
                  </div>
                ) : (
                  'Reset Password'
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