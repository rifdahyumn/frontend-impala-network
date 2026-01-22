import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authServices from '../services/authServices';

const { 
    loginService,
    logoutService,
    clearTokens,
    isAuthenticated: authServicesIsAuthenticated
} = authServices;

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {  
            try {
                if (authServicesIsAuthenticated()) {
                    
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            console.log('Loaded user from localstorage:', userData)
                            setUser(userData);
                        } catch (e) {
                            console.error('Error parsing user:', e);
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await loginService({ email, password });
            
            if (result?.success && result?.user) {

                const completeUserData = {
                    ...result.user,
                    full_name: result.user.full_name || result.user.fullName || '',
                    phone: result.user.phone || '',
                    position: result.user.position || '',
                    avatar: result.user.avatar || '',
                    email: result.user.email || email
                }

                setUser(completeUserData)
                localStorage.setItem('user', JSON.stringify(completeUserData))

                setError(null)
                setLoading(false)

                return {
                    success: true,
                    user: completeUserData
                }
            } else {
                const errorMsg = result?.error || 'Login failed';
                console.error('Login failed:', errorMsg);
                setError(errorMsg);
                setLoading(false);
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            const errorMsg = error.message || 'Login failed';
            console.error('Login error:', errorMsg);
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    }, []);

    const updateUser = useCallback((updatedData) => {
        console.log('Updating user with:', updatedData)

        setUser(prevUser => {
            const newUser = { ...prevUser, ...updatedData }
            localStorage.setItem('user', JSON.stringify(newUser))
            return newUser
        })
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            setLoading(true)
            const storedUser = localStorage.getItem('user')
            if (storedUser) {
                const userData = JSON.parse(storedUser)
                console.log('Refreshed user data:', userData)
                setUser(userData)
            }
        } catch (error) {
            console.error('Error refreshing user:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await logoutService();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setLoading(false);
            setError(null);
            window.location.href = '/login';
        }
    }, []);

    const checkAuthStatus = useCallback(() => {
        return authServicesIsAuthenticated();
    }, []);

    const value = {
        isAuthenticated: !!user,
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        refreshUser,
        checkAuthStatus,
        clearAuth: () => {
            setUser(null);
            clearTokens();
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};