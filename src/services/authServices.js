import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
        
        const encryptedTokens = encryptData({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || '',
            expires_at: tokens.expires_at || Math.floor(authTimestamp / 1000) + 3600,
            session_id: sessionId
        });

        if (encryptedTokens) {
            localStorage.setItem('auth_tokens_enc', encryptedTokens);
        }

        localStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
            localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        if (tokens.expires_at) {
            localStorage.setItem('token_expires_at', tokens.expires_at);
        }
        
        localStorage.setItem('session_id', sessionId);
        localStorage.setItem('auth_timestamp', authTimestamp.toString());
        
        lastRefreshTime = authTimestamp;
    } catch {
        //
    }
};

export const getTokens = () => {
    try {
        const individualTokens = {
            access_token: localStorage.getItem('access_token'),
            refresh_token: localStorage.getItem('refresh_token'),
            expires_at: localStorage.getItem('token_expires_at'),
            session_id: localStorage.getItem('session_id')
        };

        const encryptedTokens = localStorage.getItem('auth_tokens_enc');
        if (encryptedTokens) {
            const decrypted = decryptData(encryptedTokens);
            if (decrypted && decrypted.access_token) {
                return decrypted;
            }
        }

        return individualTokens;
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
                !config.url.includes('/auth/register')) {
                config.headers.Authorization = `Bearer ${tokens.access_token}`;
            }
            
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => {
            if (response.data?.tokens) {
                saveTokens(response.data.tokens);
                delete response.data.tokens;
            }
            return response.data;
        },
        async (error) => {
            if (error.code === 'ERR_CANCELED' || error.message.includes('canceled')) {
                return Promise.reject(new Error('Request cancelled'))
            }
            const originalRequest = error.config;
            
            if (originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/auth/register')) {
                return Promise.reject(error);
            }

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
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
                    
                    if (tokens.access_token) {
                        originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
                        return instance(originalRequest);
                    }
                } catch {
                    clearTokens();
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('auth:session-expired'));
                        setTimeout(() => {
                            if (window.location.pathname !== '/login') {
                                window.location.href = '/login?session=expired';
                            }
                        }, 100);
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

            if (!error.response && originalRequest._retryCount < 2) {
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                const delay = Math.pow(2, originalRequest._retryCount) * 1000;
                return new Promise(resolve => {
                    setTimeout(() => resolve(instance(originalRequest)), delay);
                });
            }

            let errorMessage = 'Terjadi kesalahan pada server';

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 400:
                        errorMessage = data?.message || 'Permintaan tidak valid';
                        break;
                    case 404:
                        errorMessage = data?.message || 'Resource tidak ditemukan';
                        break;
                    case 429:
                        errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
                        break;
                    case 500:
                        errorMessage = 'Kesalahan server internal';
                        break;
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = 'Server sedang dalam pemeliharaan';
                        break;
                    default:
                        errorMessage = data?.message || `Error ${status}`;
                }
            } else if (error.request) {
                errorMessage = 'Tidak ada respon dari server. Periksa koneksi internet Anda.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Koneksi timeout. Silakan coba lagi.';
            }

            return Promise.reject(new Error(errorMessage));
        }
    );

    return instance;
};

export const authApi = createAuthApi();

export const loginService = async (credentials) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            {
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password
            },
            {
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 30000,
                validateStatus: (status) => status < 500
            }
        );
        
        if (response.status === 200 && response.data?.success) {
            const responseData = response.data.data;

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
                    message: response.data?.message || 'Login successful'
                };
                return successResponse;
                
            } else {
                console.error('Invalid user data:', userData);
                console.error('User data validation failed:', {
                    hasUserData: !!userData,
                    isObject: userData && typeof userData === 'object',
                    hasId: userData?.id,
                    fullData: userData
                });
                throw new Error('Invalid user data in response: missing required fields');
            }
        } else {
            const errorData = response.data;
            let errorMessage = errorData?.message || errorData?.error || 'Login failed';
            
            console.error('Login failed with message:', errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('=== LOGIN SERVICE CATCH ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        let errorMessage = error.message || 'Login failed';
        
        if (errorMessage !== 'Login failed') {
            throw error;
        }
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            if (status === 401) {
                errorMessage = data?.message || 'Email atau password salah';
            } else if (status === 403) {
                errorMessage = data?.error || 'Access denied';
            } else if (status === 429) {
                errorMessage = 'Too many attempts. Please wait before trying again.';
            } else if (data?.error) {
                errorMessage = data.error;
            } else if (data?.message) {
                errorMessage = data.message;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Connection timeout. Please check your internet connection.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Cannot connect to server';
        }

        throw new Error(errorMessage);
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
        
        await Promise.race([
            authApi.post('/auth/logout', {
                refresh_token: tokens.refresh_token,
                session_id: tokens.session_id,
                logout_reason: options.reason || 'user_initiated',
                logout_all: options.logout_all || false
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Logout timeout')), 5000)
            )
        ]);
        
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
            return {
                success: true,
                tokens: response.data.data
            };
        }

        throw new Error('Invalid refresh response');
    } catch (error) {
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
                const newTokens = getTokens();
                if (!newTokens.access_token) {
                    throw new Error('Failed to refresh token');
                }
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
            
            const isAuth = !!tokens.access_token && !!tokens.refresh_token;
            
            return isAuth;
        } catch (error) {
            console.error('isAuthenticated error:', error);
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
    getSessionInfo
};

export default authServices;