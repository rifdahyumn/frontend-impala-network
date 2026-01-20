import { createContext, useState, useEffect, useCallback } from 'react'
import authServices from '../services/authServices'

const { 
    getTokens, 
    saveTokens,
    setupTokenMaintenance, 
    validateSessionService,
    loginService,
    logoutService,
    clearTokens, 
    getProfileService,
    refreshTokenService 
} = authServices

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [initialized, setInitialized] = useState(false);

    // Fungsi untuk mengecek token expired
    const isTokenExpired = (token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();

            return currentTime > expirationTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    };

    // Fungsi untuk mengecek auth dari localStorage
    const checkAuth = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                if (isTokenExpired(token)) {
                    handleLogout();
                    return false;
                }

                const parsedUser = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUser);
                return true;
            } catch (error) {
                console.error('Error parsing user data:', error);
                handleLogout();
                return false;
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    };

    // Initialize auth
    useEffect(() => {
        initializeAuth();
    }, []);

    useEffect(() => {
        let cleanup;
        
        // Setup token maintenance jika user ada
        if (user) {
            cleanup = setupTokenMaintenance();
        }
        
        return () => {
            if (cleanup) cleanup();
        };
    }, [user]);

    const initializeAuth = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const tokens = getTokens();
            
            if (!tokens.access_token || !tokens.refresh_token) {
                setLoading(false);
                setInitialized(true);
                return;
            }
            
            const isValid = await validateSession();
            
            if (!isValid) {
                const refreshed = await refreshSession();
                if (!refreshed) {
                    clearAuth();
                }
            }
            
        } catch (err) {
            console.error('Auth initialization error:', err);
            setError(err.message);
            clearAuth();
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    };

    const validateSession = async () => {
        try {
            const response = await validateSessionService();
            
            let userData = null;
            
            if (response.data?.user) {
                userData = response.data.user;
            } else if (response.user) {
                userData = response.user;
            } else if (response.data) {
                userData = response.data;
            } else {
                userData = response;
            }
            
            if (userData && (userData.id || userData.email || userData.user_id)) {
                setUser(userData);
                setError(null);
                return true;
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Session validation error:', error);
            
            const errorMsg = error.message || error.toString();
            
            if (errorMsg.includes('User not found') || 
                errorMsg.includes('USER_NOT_FOUND') ||
                errorMsg.includes('SESSION_EXPIRED') ||
                errorMsg.includes('Invalid token') ||
                errorMsg.includes('No token') ||
                errorMsg.includes('401') ||
                errorMsg.includes('expired')) {
                
                return false;
            }
            
            setError(errorMsg);
            return false;
        }
    };

    const refreshSession = async () => {
        try {
            const tokens = getTokens();
            
            if (!tokens.refresh_token) {
                throw new Error('No refresh token available');
            }
            
            const response = await refreshTokenService(tokens.refresh_token);
            
            if (response.success && response.tokens?.access_token) {
                saveTokens(response.tokens);
                
                const profileResponse = await getProfileService();
                
                if (profileResponse.data) {
                    setUser(profileResponse.data);
                    setError(null);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Session refresh error:', error);
            return false;
        }
    };

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await loginService({ email, password });     
            
            if (result.success) {
                let userData = null;
                let tokens = null;
                
                if (result.user && result.tokens) {
                    userData = result.user;
                    tokens = result.tokens;
                } else if (result.data?.user && result.data?.tokens) {
                    userData = result.data.user;
                    tokens = result.data.tokens;
                } else if (result.data) {
                    userData = result.data.user || result.data;
                    tokens = result.data.tokens || result.data.session;
                } else if (result.token) {
                    userData = result.user;
                    tokens = {
                        access_token: result.token,
                        refresh_token: result.refresh_token || '',
                        expires_at: result.expires_at || Math.floor(Date.now() / 1000) + 3600
                    };
                }
                
                if (tokens?.access_token) {
                    saveTokens(tokens);
                    setUser(userData);
                    
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    setError(null);
                    return { success: true, user: userData };
                } else {
                    throw new Error('No access token received');
                }
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            const errorMsg = error.message || 'Login failed. Please check your credentials.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await logoutService();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuth();
            
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            setLoading(false);
            
            // Redirect ke login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    }, []);

    const clearAuth = () => {
        setUser(null);
        setError(null);
        setLoading(false);
        clearTokens();
    };

    const updateUser = (updatedUserData) => {
        setUser(prev => ({
            ...prev,
            ...updatedUserData
        }));
    };

    const updateProfile = async (userData) => {
        try {
            if (userData) {
                localStorage.setItem('user_profile', JSON.stringify(userData));
            }
            
            setUser(prev => ({
                ...prev,
                ...userData
            }));
            
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    };

    const isAuthenticated = () => {
        const tokens = getTokens();
        return !!(user && tokens.access_token);
    };

    const getAuthHeaders = () => {
        const tokens = getTokens();
        
        if (!tokens.access_token) {
            throw new Error('No access token available');
        }
        
        return {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json'
        };
    };

    const value = {
        isAuthenticated: checkIsAuthenticated(),
        user,
        loading,
        error,
        initialized,
        login,
        logout: handleLogout,
        checkAuth,
        updateUser,
        updateProfile,
        // isAuthenticated,
        getAuthHeaders,
        clearAuth,
        refreshSession,
        setError
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};