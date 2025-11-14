// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔐 Checking auth:', { 
      token: !!token, 
      userData: !!userData 
    });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
        console.log('✅ User authenticated:', parsedUser.email);
      } catch {
        console.log('❌ Error parsing user data');
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      console.log('❌ No authentication data found');
    }
  };

  // Login function
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    console.log('✅ Login successful:', userData.email);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ Logout successful');
  };

  useEffect(() => {
    checkAuth();
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

// Custom hook untuk menggunakan auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};