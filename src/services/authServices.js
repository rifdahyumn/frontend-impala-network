import axios from 'axios'

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL 

const authApiBase = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    if (refreshToken) {
        headers['X-Refresh-Token'] = refreshToken;
    }
    
    return headers;
};

authApiBase.interceptors.request.use(
    (config) => {
        if (!config.url.includes('/auth/login') && 
            !config.url.includes('/auth/register')) {
            
            const headers = getAuthHeaders();
            config.headers = {
                ...config.headers,
                ...headers
            };
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

authApiBase.interceptors.response.use(
    (response) => {
        if (response.data?.tokens) {
            saveTokens(response.data.tokens);
        }
        
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/refresh')) {
            
            originalRequest._retry = true;
            
            try {
                const refreshToken = getRefreshToken();
                
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                if (refreshResponse.data?.data?.access_token) {
                    saveTokens(refreshResponse.data.data);
                    
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.access_token}`;
                    
                    return authApiBase(originalRequest);
                }
                
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                
                clearTokens();
                
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login?session=expired';
                }
                
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
        }
        
        if (error.response) {
            const errorMessage = error.response.data?.error || 
                               error.response.data?.message || 
                               error.response.data?.detail ||
                               `Server error: ${error.response.status}`;
            
            return Promise.reject(new Error(errorMessage));
            
        } else if (error.request) {
            return Promise.reject(new Error('No response from server. Check your internet connection.'));
            
        } else {
            return Promise.reject(new Error('Connection error'));
        }
    }
);

export const authApi = authApiBase;

export const saveTokens = (tokens) => {
    if (tokens.access_token) {
        localStorage.setItem('access_token', tokens.access_token)
    }
    if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token)
    }
    if (tokens.expires_at) {
        localStorage.setItem('token_expires_at', tokens.expires_at)
    }
}

export const getTokens = () => {
    return {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token'),
        expires_at: localStorage.getItem('token_expires_at')
    }
}

export const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
}

export const isTokenExpiringSoon = () => {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return true
    
    const expiryTime = parseInt(expiresAt) * 1000 
    const now = Date.now()
    const timeLeft = expiryTime - now

    return timeLeft < 10 * 60 * 1000
}

export const isAuthenticated = () => {
    const tokens = getTokens()
    return !!(tokens.access_token && tokens.refresh_token)
}

export const getAccessToken = () => {
    return localStorage.getItem('access_token')
}

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token')
}

authApi.interceptors.request.use(
    (config) => {
        const tokens = getTokens()
        
        if (tokens.access_token) {
            config.headers.Authorization = `Bearer ${tokens.access_token}`
        }
        
        if (tokens.refresh_token) {
            config.headers['X-Refresh-Token'] = tokens.refresh_token
        }
        
        return config
    },
    (error) => Promise.reject(error)
)

authApi.interceptors.response.use(
    (response) => {
        if (response.data?.tokens) {
            saveTokens(response.data.tokens)
            delete response.data.tokens
        }
        
        return response.data
    },
    async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/refresh')) {
            
            originalRequest._retry = true
            
            try {
                const tokens = getTokens()
                
                if (!tokens.refresh_token) {
                    throw new Error('No refresh token available')
                }
                
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: tokens.refresh_token },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
                
                if (refreshResponse.data?.data) {
                    saveTokens(refreshResponse.data.data)
                    
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.access_token}`
                    originalRequest.headers['X-Refresh-Token'] = refreshResponse.data.data.refresh_token || tokens.refresh_token
                    
                    return authApi(originalRequest)
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError)
                clearTokens()
                
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login?session=expired'
                }
                
                throw new Error('Session expired. Please login again.')
            }
        }
        
        if (error.response) {
            const errorMessage = error.response.data?.error || 
                               error.response.data?.message || 
                               'Terjadi kesalahan pada server'
            throw new Error(errorMessage)
        } else if (error.request) {
            throw new Error('Tidak ada respon dari server. Periksa koneksi internet.')
        } else {
            throw new Error('Kesalahan koneksi')
        }
    }
)

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
                timeout: 15000
            }
        );
        
        if (response.data?.success && response.data?.data) {
            const userData = response.data.data.user;
            const tokens = response.data.data.tokens; 
            
            if (!tokens?.access_token) {
                console.error('No access_token in tokens:', tokens);
                throw new Error('No access token received');
            }
            
            saveTokens(tokens);
            
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
            
            return {
                success: true,
                user: userData,
                tokens: tokens
            };
        } else if (response.data?.user && response.data?.tokens) {
            const userData = response.data.user;
            const tokens = response.data.tokens;
            
            saveTokens(tokens);
            if (userData) localStorage.setItem('user', JSON.stringify(userData));
            
            return {
                success: true,
                user: userData,
                tokens: tokens
            };
        }
        else {
            console.error('[loginService] Invalid response format:', response.data);
            throw new Error(response.data?.error || 'Invalid response format from server');
        }
        
    } catch (error) {
        console.error('[loginService] Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });
        
        let errorMessage = 'Login failed';
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            
            if (status === 401) {
                errorMessage = data?.error || 'Invalid email or password';
            }
            else if (status === 403) {
                if (data?.code === 'ACCOUNT_INACTIVE') {
                    errorMessage = 'Account is inactive';
                } else if (data?.code === 'USER_NOT_REGISTERED') {
                    errorMessage = 'Account not registered in system';
                } else {
                    errorMessage = data?.error || 'Access denied';
                }
            }
            else if (status === 400) {
                errorMessage = data?.error || 'Invalid request';
            }
            else if (data?.error) {
                errorMessage = data.error;
            }
            else if (data?.message) {
                errorMessage = data.message;
            }
        } 
        else if (error.message.includes('timeout')) {
            errorMessage = 'Connection timeout';
        }
        else if (error.message.includes('Network')) {
            errorMessage = 'Cannot connect to server';
        }
        
        throw new Error(errorMessage);
    }
};

export const logoutService = async () => {
    try {
        await authApi.post('/auth/logout')
        clearTokens()
        return { success: true, message: 'Logout berhasil' }
    } catch (error) {
        clearTokens()
        console.error('Logout error:', error)
        return { success: true, message: 'Logout berhasil (local)' }
    }
}

export const registerService = async (userData) => {
    try {
        const response = await authApi.post('/auth/register', userData)
        return response
    } catch (error) {
        throw new Error(error.message || 'Registrasi gagal')
    }
}

export const refreshTokenService = async (refreshToken) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        
        if (response.data?.data) {
            saveTokens(response.data.data)
            return { success: true, tokens: response.data.data }
        }
        
        return { success: false }
    } catch {
        throw new Error('Failed to refresh token')
    }
}

export const getProfileService = async () => {
    try {
        const response = await authApi.get('/auth/profile')
        return response
    } catch (error) {
        throw new Error(error.message || 'Gagal mengambil profil')
    }
}

export const validateSessionService = async () => {
    try {
        const tokens = getTokens()
        
        if (!tokens.access_token) {
            throw new Error('No access token available')
        }
        
        if (isTokenExpiringSoon()) {
            try {
                if (tokens.refresh_token) {
                    await refreshTokenService(tokens.refresh_token)
                }
            } catch {
               //
            }
        }
        
        const response = await authApi.get('/auth/validate')
        
        return response
        
    } catch (error) {
        console.error('Error:', error.message)
        console.error('Error response data:', error.response?.data)
        
        if (error.response?.status === 401) {
            try {
                const tokens = getTokens()
                if (tokens.refresh_token) {
                    await refreshTokenService(tokens.refresh_token)
                    
                    const retryResponse = await authApi.get('/auth/validate')
                    return retryResponse
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError.message)
                clearTokens()
                throw new Error('Session expired. Please login again.')
            }
        }
        
        throw error
    }
}

export const setupTokenMaintenance = () => {
    const checkInterval = setInterval(() => {
        const tokens = getTokens()
        
        if (!tokens.access_token || !tokens.refresh_token) {
            return
        }
        
        if (isTokenExpiringSoon()) {
            
            refreshTokenService(tokens.refresh_token)
                .catch(err => {
                    console.error('Auto-refresh failed:', err)
                    if (err.message.includes('expired') || err.message.includes('invalid')) {
                        clearTokens()
                        window.location.href = '/login?session=auto_logout'
                    }
                })
        }
    }, 30 * 1000) 
    
    return () => clearInterval(checkInterval)
}

export const ensureValidToken = async () => {
    try {
        const tokens = getTokens();
        
        if (!tokens.access_token) {
            throw new Error('No access token');
        }
        
        if (isTokenExpiringSoon() && tokens.refresh_token) {
            try {
                await refreshTokenService(tokens.refresh_token);
            } catch (refreshError) {
                console.warn('Failed to refresh token:', refreshError);
            }
        }
        
        return tokens.access_token;
        
    } catch (error) {
        console.error('Token validation failed:', error);
        
        if (typeof window !== 'undefined') {
            clearTokens();
            window.location.href = '/login?error=token_invalid';
        }
        
        throw error;
    }
};



const authServices = {
    authApi,
    loginService,
    logoutService,
    registerService,
    refreshTokenService,
    getProfileService,
    validateSessionService,
    setupTokenMaintenance,
    isAuthenticated,
    getAccessToken,
    getRefreshToken,
    getTokens,
    saveTokens,
    clearTokens,
    isTokenExpiringSoon,
    ensureValidToken 
}

export default authServices