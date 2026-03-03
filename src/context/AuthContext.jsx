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

            if (result?.success) {
                const userData = result.data || result.user;
                
                if (!userData) {
                    throw new Error('No user data in response');
                }
                
                const completeUserData = {
                    id: userData.id || '',
                    email: userData.email || email,
                    full_name: userData.full_name || userData.fullName || '',
                    position: userData.position || '',
                    role: userData.role || '',
                    status: userData.status || '',
                    phone: userData.phone || '',
                    avatar: userData.avatar || ''
                };
                
                setUser(completeUserData);
                localStorage.setItem('user', JSON.stringify(completeUserData));
                
                setError(null);
                setLoading(false);

                return {
                    success: true,
                    user: completeUserData
                };
            } else {
                const errorMsg = result?.message || result?.error || 'Login failed';
                console.error('Login failed:', errorMsg);
                setError(errorMsg);
                setLoading(false);
                return { 
                    success: false, 
                    error: errorMsg,
                    code: result?.code,
                    status: result?.status
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMsg = error.message || 'Login failed';
            let status = error.status;
            let code = error.code;
            
            if (status === 403) {
                if (errorMsg.includes('dinonaktifkan')) {
                    errorMsg = 'Akun Anda telah dinonaktifkan. Silakan hubungi admin.';
                } else {
                    errorMsg = 'Akses ditolak';
                }
            } else if (status === 401) {
                errorMsg = 'Email atau password salah';
            }
            
            console.error('Setting error:', errorMsg);
            setError(errorMsg);
            setLoading(false);
            
            return { 
                success: false, 
                error: errorMsg,
                status,
                code
            };
        }
    }, []);

    const updateUser = useCallback((updatedData) => {
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