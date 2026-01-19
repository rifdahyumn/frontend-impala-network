// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);

    const isTokenExpired = (token) => {
        if (!token) return true

        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const expirationTime = payload.exp * 1000
            const currentTime = Date.now()

            return currentTime > expirationTime
        } catch (error) {
            console.error('Error checking token expiration:', error)
            return true
        }
    }

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                if (isTokenExpired(token)) {
                    logout()
                    return
                }

                const parsedUser = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUser);
                
            } catch { 
                logout();
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
    };

    // NEW: Update user function for profile updates
    const updateUser = (updatedUserData) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            ...updatedUserData,
            // Ensure both full_name and fullName are updated
            full_name: updatedUserData.full_name || updatedUserData.fullName || user.full_name,
            fullName: updatedUserData.full_name || updatedUserData.fullName || user.fullName
        };
        
        // Update state
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
    };

    // NEW: Update user profile via API
    const updateUserProfile = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:3000/api/user/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Note: Don't set Content-Type for FormData, browser will set it automatically
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            const data = await response.json();
            
            // Update local user state with new data
            if (data.user) {
                const updatedUser = updateUser(data.user);
                return { success: true, data, user: updatedUser };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: error.message };
        }
    };

    // NEW: Change password function
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:3000/api/user/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: error.message };
        }
    };

    // NEW: Check user role
    const hasRole = (requiredRole) => {
        if (!user || !user.role) return false;
        return user.role === requiredRole;
    };

    // NEW: Check if user has any of the required roles
    const hasAnyRole = (requiredRoles) => {
        if (!user || !user.role) return false;
        return requiredRoles.includes(user.role);
    };

    useEffect(() => {
        checkAuth();

        const interval = setInterval(() => {
            const token = localStorage.getItem('token')
            if (token && isTokenExpired(token)) {
                logout()
            }
        }, 60000)
        return () => clearInterval(interval)

    }, []);

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            login, 
            logout, 
            checkAuth,
            updateUser,           // NEW
            updateUserProfile,    // NEW
            changePassword,       // NEW
            hasRole,              // NEW
            hasAnyRole            // NEW
        }}>
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

export { AuthContext };