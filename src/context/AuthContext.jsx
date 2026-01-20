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
            checkAuth 
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

export { AuthContext }