import React, { createContext, useContext, useState, useEffect } from 'react';
import authServices from '../services/authServices';

const { 
    getTokens, 
    setupTokenMaintenance, 
    validateSessionService,
    logoutService,
    clearTokens 
} = authServices;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        
        // Setup token maintenance jika user ada
        if (user) {
            const cleanup = setupTokenMaintenance();
            return () => {
                if (cleanup) cleanup();
            };
        }
    }, [user]);

    const initializeAuth = async () => {
        try {
            const tokens = getTokens();
            
            if (!tokens.access_token && !tokens.refresh_token) {
                // Cek token lama
                const oldToken = localStorage.getItem('token');
                if (oldToken) {
                    await validateSession();
                } else {
                    setLoading(false);
                }
                return;
            }
            
            await validateSession();
            setLoading(false);
            
        } catch (err) {
            console.error('Auth initialization error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const validateSession = async () => {
        try {
            const response = await validateSessionService();
            
            let userData;
            
            if (response.data?.user) {
                userData = response.data.user;
            } else if (response.user) {
                userData = response.user;
            } else if (response.data) {
                userData = response.data;
            } else {
                userData = response;
            }
            
            if (userData && (userData.id || userData.email)) {
                setUser(userData);
                setIsAuthenticated(true);
                setError(null);
                
                // Simpan ke localStorage untuk kompatibilitas
                const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
                
                return true;
            } else {
                throw new Error('Invalid user data');
            }
        } catch (error) {
            console.error('Session validation error:', error);
            
            if (error.message.includes('User not found') || 
                error.message.includes('USER_NOT_FOUND') ||
                error.message.includes('SESSION_EXPIRED') ||
                error.message.includes('Invalid token') ||
                error.message.includes('No token')) {
                
                clearTokens();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            }
            
            setError(error.message);
            throw error;
        }
    };

    const login = (tokens, userData) => {
        // Handle kedua format token
        if (typeof tokens === 'string') {
            // Format lama: token sebagai string
            localStorage.setItem('token', tokens);
            localStorage.setItem('user', JSON.stringify(userData));
        } else if (tokens && tokens.access_token) {
            // Format baru: tokens sebagai object
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            localStorage.setItem('token', tokens.access_token); // Simpan juga untuk kompatibilitas
            localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        setError(null);
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await logoutService();
        } catch (error) {
            console.error('Logout service error:', error);
            // Continue dengan logout lokal meski service gagal
        } finally {
            // Clear semua storage
            clearTokens();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            setLoading(false);
            
            // Redirect ke login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    };

    const updateUser = (updatedUserData) => {
        setUser(prev => ({
            ...prev,
            ...updatedUserData
        }));
        
        // Update localStorage juga
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
            ...currentUserData,
            ...updatedUserData
        }));
    };

    // Fungsi untuk mengecek apakah user authenticated
    const checkIsAuthenticated = () => {
        const tokens = getTokens();
        const hasNewTokens = !!(user && tokens.access_token);
        const hasOldToken = !!localStorage.getItem('token');
        
        return isAuthenticated || hasNewTokens || hasOldToken;
    };

    const value = {
        isAuthenticated: checkIsAuthenticated(),
        user,
        loading,
        error,
        login,
        logout: handleLogout,
        checkAuth,
        updateUser,
        clearTokens: () => {
            clearTokens();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

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