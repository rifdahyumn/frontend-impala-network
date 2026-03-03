import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const APP_SECRET = import.meta.env.VITE_APP_SECRET || 'dashboard-secret-2024';

let refreshPromise = null;
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 30000;

const encryptData = (data) => {
    try {
        return CryptoJS.AES.encrypt(JSON.stringify(data), APP_SECRET).toString();
    } catch {
        return null;
    }
};

const decryptData = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, APP_SECRET);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted ? JSON.parse(decrypted) : null;
    } catch {
        return null;
    }
};

const generateSessionId = () => {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
};

export const saveTokens = (tokens) => {
    if (!tokens?.access_token) return;

    try {
        const sessionId = tokens.session_id || generateSessionId();
        const authTimestamp = Date.now();
        
        localStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
            localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        if (tokens.expires_at) {
            localStorage.setItem('token_expires_at', tokens.expires_at);
        } else {
            const expiresAt = Math.floor(Date.now() / 1000) + 3600;
            localStorage.setItem('token_expires_at', expiresAt.toString());
        }
        
        localStorage.setItem('session_id', sessionId);
        localStorage.setItem('auth_timestamp', authTimestamp.toString());

        sessionStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
            sessionStorage.setItem('refresh_token', tokens.refresh_token);
        }

        const encryptedTokens = encryptData({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || '',
            expires_at: tokens.expires_at || Math.floor(authTimestamp / 1000) + 3600,
            session_id: sessionId
        });

        if (encryptedTokens) {
            localStorage.setItem('auth_tokens_enc', encryptedTokens);
        }
        
        lastRefreshTime = authTimestamp;
        
    } catch (error) {
        console.error('Error saving tokens:', error);
    }
};

export const getTokens = () => {
    try {
        const tokens = {
            access_token: localStorage.getItem('access_token') || sessionStorage.getItem('access_token'),
            refresh_token: localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token'),
            expires_at: localStorage.getItem('token_expires_at'),
            session_id: localStorage.getItem('session_id')
        };

        const encryptedTokens = localStorage.getItem('auth_tokens_enc');
        if (encryptedTokens) {
            const decrypted = decryptData(encryptedTokens);
            if (decrypted && decrypted.access_token) {
                if (!tokens.access_token) tokens.access_token = decrypted.access_token;
                if (!tokens.refresh_token) tokens.refresh_token = decrypted.refresh_token;
                if (!tokens.expires_at) tokens.expires_at = decrypted.expires_at;
                if (!tokens.session_id) tokens.session_id = decrypted.session_id;
            }
        }

        return tokens;
    } catch {
        return {
            access_token: null,
            refresh_token: null,
            expires_at: null,
            session_id: null
        };
    }
};

export const clearTokens = () => {
    const items = [
        'auth_tokens_enc', 'access_token', 'refresh_token', 
        'token_expires_at', 'user', 'user_encrypted',
        'session_id', 'auth_timestamp'
    ];
    
    items.forEach(item => {
        try {
            localStorage.removeItem(item);
            sessionStorage.removeItem(item);
        } catch {
            // 
        }
    });
};

export const isTokenExpiringSoon = () => {
    try {
        const tokens = getTokens();
        if (!tokens.expires_at) return true;

        const expiryTime = parseInt(tokens.expires_at) * 1000;
        const timeLeft = expiryTime - Date.now();
        return timeLeft < 5 * 60 * 1000;
    } catch {
        return true;
    }
};

const createAuthApi = () => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    instance.interceptors.request.use(
        (config) => {
            const tokens = getTokens();
            
            if (tokens.access_token && 
                !config.url.includes('/auth/login') &&
                !config.url.includes('/auth/register') &&
                !config.url.includes('/auth/forgot-password') &&
                !config.url.includes('/auth/reset-password')) {
                
                config.headers.Authorization = `Bearer ${tokens.access_token}`;
            } else if (!tokens.access_token && !config.url.includes('/auth/')) {
                console.warn('No token available for request to:', config.url);
            }
            
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }
            
            return config;
        },
        (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    );

instance.interceptors.response.use(
    (response) => {      
        if (response.data?.tokens) {
            saveTokens(response.data.tokens);
            delete response.data.tokens;
        }
        
        if (response.data === null || response.data === 'null' || response.data === '') {
            return { success: true, message: 'Operation successful' };
        }
        
        return response.data;
    },
        async (error) => {
            console.error('Response error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message
            });

            if (error.code === 'ERR_CANCELED' || error.message.includes('canceled')) {
                return Promise.reject(new Error('Request cancelled'));
            }
            
            const originalRequest = error.config;
            
            if (originalRequest?.url?.includes('/auth/login') ||
                originalRequest?.url?.includes('/auth/register') ||
                originalRequest?.url?.includes('/auth/forgot-password') ||
                originalRequest?.url?.includes('/auth/reset-password')) {
                return Promise.reject(error);
            }

            if (error.response?.status === 401 && !originalRequest?._retry) {               
                if (originalRequest) {
                    originalRequest._retry = true;
                }
                
                const now = Date.now();
                if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
                    return Promise.reject(new Error('Too many refresh attempts'));
                }
                
                if (!refreshPromise) {
                    refreshPromise = refreshTokenService().finally(() => {
                        refreshPromise = null;
                    });
                }
                
                try {
                    await refreshPromise;
                    const tokens = getTokens();
                    
                    if (tokens.access_token && originalRequest) {
                        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
                        return instance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Refresh token failed:', refreshError);
                    clearTokens();
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('auth:session-expired'));
                        if (window.location.pathname !== '/login') {
                            setTimeout(() => {
                                window.location.href = '/login?session=expired';
                            }, 100);
                        }
                    }
                    return Promise.reject(new Error('Session expired'));
                }
            }
            
            if (error.response?.status === 403) {
                clearTokens();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login?error=unauthorized';
                }
                return Promise.reject(new Error('Access denied'));
            }

            if (!error.response && originalRequest && originalRequest._retryCount < 2) {
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                const delay = Math.pow(2, originalRequest._retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return instance(originalRequest);
            }

            let errorMessage = 'Terjadi kesalahan pada server';
            let statusCode = error.response?.status;

            if (error.response) {
                const data = error.response.data;

                switch (statusCode) {
                    case 400:
                        errorMessage = data?.message || data?.error || 'Permintaan tidak valid';
                        if (data?.errors) {
                            console.warn('Validation errors:', data.errors);
                        }
                        break;
                    case 401:
                        errorMessage = data?.message || 'Sesi telah berakhir';
                        break;
                    case 403:
                        errorMessage = data?.message || 'Akses ditolak';
                        break;
                    case 404:
                        errorMessage = data?.message || 'Resource tidak ditemukan';
                        break;
                    case 409:
                        errorMessage = data?.message || 'Data sudah ada';
                        break;
                    case 422:
                        errorMessage = data?.message || 'Data tidak valid';
                        if (data?.errors) {
                            console.warn('Validation errors:', data.errors);
                        }
                        break;
                    case 429:
                        errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
                        break;
                    case 500:
                        errorMessage = data?.message || 'Kesalahan server internal';
                        break;
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = 'Server sedang dalam pemeliharaan';
                        break;
                    default:
                        errorMessage = data?.message || data?.error || `Error ${statusCode}`;
                }
            } else if (error.request) {
                errorMessage = 'Tidak ada respon dari server. Periksa koneksi internet Anda.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Koneksi timeout. Silakan coba lagi.';
            }

            const enhancedError = new Error(errorMessage);
            enhancedError.status = statusCode;
            enhancedError.originalError = error;
            
            return Promise.reject(enhancedError);
        }
    );

    return instance;
};

export const authApi = createAuthApi();

export const loginService = async (credentials) => {
    try {
        const response = await authApi.post('/auth/login', {
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password
        });
        
        if (response?.success) {
            const responseData = response.data;

            const userData = responseData?.user || responseData;
            const tokens = responseData?.tokens;

            if (userData && typeof userData === 'object' && userData.id) {
                if (tokens) {
                    saveTokens(tokens);
                } else {
                    console.warn('No tokens in response');
                }
                
                try {
                    const encryptedUser = encryptData(userData);
                    if (encryptedUser) {
                        localStorage.setItem('user_encrypted', encryptedUser);
                    }
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('user_role', userData.role || 'user');
                } catch (storageError) {
                    console.error('Storage error:', storageError);
                }
                
                const successResponse = {
                    success: true,
                    data: userData,
                    tokens: tokens,
                    requiresMFA: responseData?.requires_mfa || false,
                    message: response?.message || 'Login successful'
                };
                return successResponse;
                
            } else {
                console.error('Invalid user data in response');
                throw new Error('Invalid user data in response: missing required fields');
            }
        } else {
            const errorMsg = response?.error || response?.message || 'Login failed';
            console.error('Login failed:', errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('Login service error:', error);
        
        let errorMessage = error.message || 'Login failed';
        
        if (error.status === 403) {
            if (error.message.includes('dinonaktifkan')) {
                errorMessage = 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.';
            } else {
                errorMessage = 'Akses ditolak';
            }
        } else if (error.status === 401) {
            errorMessage = 'Email atau password salah';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Koneksi timeout. Silakan coba lagi.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }
        
        const enhancedError = new Error(errorMessage);
        enhancedError.status = error.status;
        enhancedError.code = error.code;
        throw enhancedError;
    }
};

export const forgotPasswordService = async (email) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/forgot-password`,
            { 
                email: email.trim(),
                reset_url: `${window.location.origin}/reset-password`
            },
            {
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        if (response.data?.success) {
            return {
                success: true,
                message: response.data.message || 'Reset password link sent successfully'
            };
        }
        
        throw new Error(response.data?.message || 'Failed to send reset link');
    } catch (error) {
        console.error('Forgot password error:', error);
        
        let errorMessage = 'Failed to send reset link';
        
        if (error.response) {
            const data = error.response.data;
            errorMessage = data?.message || data?.error || `Error ${error.response.status}`;
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Connection timeout. Please try again.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Cannot connect to server. Check your internet connection.';
        }
        
        throw new Error(errorMessage);
    }
};

export const resetPasswordService = async (token, email, newPassword, confirmPassword) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/reset-password`,
            { 
                token: token,              
                email: email,                
                newPassword: newPassword,  
                confirmPassword: confirmPassword 
            },
            {
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        if (response.data?.success) {
            return {
                success: true,
                message: response.data.message || 'Password reset successfully'
            };
        }
        
        throw new Error(response.data?.message || 'Failed to reset password');
    } catch (error) {
        console.error('Reset password error:', error);
        
        let errorMessage = 'Failed to reset password';
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 400) {
                errorMessage = data?.message || 'Invalid or expired token';
            } else if (status === 401) {
                errorMessage = 'Token has expired. Please request a new reset link.';
            } else {
                errorMessage = data?.message || data?.error || `Error ${status}`;
            }
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Connection timeout. Please try again.';
        }
        
        throw new Error(errorMessage);
    }
};

export const logoutService = async (options = {}) => {
    try {
        const tokens = getTokens();
        
        const logoutPromise = authApi.post('/auth/logout', {
            refresh_token: tokens.refresh_token,
            session_id: tokens.session_id,
            logout_reason: options.reason || 'user_initiated',
            logout_all: options.logout_all || false
        });
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Logout timeout')), 5000)
        );
        
        await Promise.race([logoutPromise, timeoutPromise]).catch(() => {
        });
        
        return { success: true, message: 'Logout berhasil' };
    } catch {
        return { success: true, message: 'Logged out locally' };
    } finally {
        clearTokens();
    }
};

export const refreshTokenService = async () => {
    try {
        const tokens = getTokens();
        
        if (!tokens.refresh_token) {
            throw new Error('No refresh token');
        }

        const now = Date.now();
        if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
            throw new Error('Refresh too frequent');
        }

        const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { 
                refresh_token: tokens.refresh_token,
                session_id: tokens.session_id
            },
            {
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        if (response.data?.data?.access_token) {
            saveTokens(response.data.data);
            lastRefreshTime = Date.now();
            return {
                success: true,
                tokens: response.data.data
            };
        }

        throw new Error('Invalid refresh response');
    } catch (error) {
        console.error('Refresh token error:', error);
        
        if (error.response?.status === 400 || error.response?.status === 401) {
            throw new Error('Refresh token expired or invalid');
        } else if (error.response?.status === 429) {
            throw new Error('Too many refresh attempts');
        } else {
            throw new Error('Failed to refresh token');
        }
    }
};

export const validateSessionService = async () => {
    try {
        const tokens = getTokens();

        if (!tokens.access_token) {
            throw new Error('No access token available');
        }

        const authTimestamp = parseInt(localStorage.getItem('auth_timestamp') || '0');
        const sessionDuration = Date.now() - authTimestamp;
        
        if (sessionDuration > 4 * 60 * 60 * 1000) {
            throw new Error('Session max duration exceeded');
        }

        if (isTokenExpiringSoon() && tokens.refresh_token) {
            try {
                await refreshTokenService();
            } catch {
                // 
            }
        }

        const response = await authApi.get('/auth/validate', {
            timeout: 10000
        });

        return response;
    } catch (error) {
        if (error.response?.status === 401) {
            try {
                const tokens = getTokens();
                if (tokens.refresh_token) {
                    await refreshTokenService();
                    return await authApi.get('/auth/validate');
                }
            } catch {
                clearTokens();
                throw new Error('Session expired. Please login again.');
            }
        }
        throw error;
    }
};

export const setupTokenMaintenance = () => {
    let checkInterval;
    let errorCount = 0;
    const MAX_ERRORS = 3;

    const checkAndRefresh = async () => {
        try {
            const tokens = getTokens();

            if (!tokens.access_token || !tokens.refresh_token) {
                return;
            }

            const authTimestamp = parseInt(localStorage.getItem('auth_timestamp') || '0');
            const sessionDuration = Date.now() - authTimestamp;
            
            if (sessionDuration > 8 * 60 * 60 * 1000) {
                clearTokens();
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login?session=max_duration';
                }
                return;
            }

            if (isTokenExpiringSoon()) {
                await refreshTokenService();
                errorCount = 0;
            }
        } catch (err) {
            errorCount++;
            if (errorCount >= MAX_ERRORS ||
                err.message.includes('expired') ||
                err.message.includes('invalid')) {

                clearTokens();
                clearInterval(checkInterval);

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('auth:auto-logout'));
                    setTimeout(() => {
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login?session=auto_logout';
                        }
                    }, 1000);
                }
            }
        }
    };

    checkInterval = setInterval(checkAndRefresh, 60 * 1000);

    const handleVisibilityChange = () => {
        if (!document.hidden) {
            checkAndRefresh();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleStorageChange = (e) => {
        if (e.key === 'access_token' && !e.newValue) {
            clearTokens();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        clearInterval(checkInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('storage', handleStorageChange);
    };
};

export const ensureValidToken = async () => {
    try {
        const tokens = getTokens();

        if (!tokens.access_token) {
            throw new Error('No access token');
        }

        if (isTokenExpiringSoon() && tokens.refresh_token) {
            try {
                await refreshTokenService();
            } catch {
                throw new Error('Failed to refresh token');
            }
        }

        return tokens.access_token;
    } catch (error) {
        if (typeof window !== 'undefined') {
            clearTokens();
            window.location.href = '/login?error=token_invalid';
        }
        throw error;
    }
};

export const getSessionInfo = () => {
    try {
        const tokens = getTokens();
        const authTimestamp = localStorage.getItem('auth_timestamp');
        const userRole = localStorage.getItem('user_role');
        
        return {
            sessionId: tokens.session_id,
            authTimestamp: authTimestamp ? parseInt(authTimestamp) : null,
            userRole: userRole,
            sessionDuration: authTimestamp ? Date.now() - parseInt(authTimestamp) : 0
        };
    } catch {
        return null;
    }
};

export const checkAuthStatus = () => {
    const tokens = getTokens();

    return tokens;
};

const authServices = {
    authApi,
    loginService,
    forgotPasswordService,
    resetPasswordService, 
    logoutService,
    refreshTokenService,
    validateSessionService,
    setupTokenMaintenance,
    isAuthenticated: () => {
        try {
            const tokens = getTokens();
            return !!tokens.access_token && !!tokens.refresh_token;
        } catch {
            return false;
        }
    },
    getAccessToken: () => getTokens().access_token,
    getRefreshToken: () => getTokens().refresh_token,
    getTokens,
    saveTokens,
    clearTokens,
    isTokenExpiringSoon,
    ensureValidToken,
    getSessionInfo,
    checkAuthStatus
};

export default authServices;