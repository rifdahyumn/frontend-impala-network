import { createContext, useState, useEffect } from 'react'
import authServices from '../services/authServices'

const { 
    getTokens, 
    setupTokenMaintenance, 
    validateSessionService,
    logoutService,
    clearTokens 
} = authServices

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        initializeAuth()
        
        if (user) {
            const cleanup = setupTokenMaintenance()
            return () => {
                if (cleanup) cleanup()
            }
        }
    }, [user])

    const initializeAuth = async () => {
        try {
            const tokens = getTokens()
            
            if (!tokens.access_token || !tokens.refresh_token) {
                setLoading(false)
                return
            }
            
            await validateSession()
            setLoading(false)
            
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const validateSession = async () => {
        try {
            const response = await validateSessionService()
            
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
                setUser(userData)
                setError(null)
                return true
            } else {
                throw new Error('Invalid user data')
            }
        } catch (error) {
            if (error.message.includes('User not found') || 
                error.message.includes('USER_NOT_FOUND') ||
                error.message.includes('SESSION_EXPIRED') ||
                error.message.includes('Invalid token') ||
                error.message.includes('No token')) {
                
                clearTokens()
                setUser(null)
            }
            
            setError(error.message)
            throw error
        }
    }

    const login = (tokens, userData) => {
        if (tokens && tokens.access_token) {
            localStorage.setItem('access_token', tokens.access_token)
            localStorage.setItem('refresh_token', tokens.refresh_token)
        }
        
        setUser(userData)
        setError(null)
        setLoading(false)
    }

    const logout = async () => {
        try {
            await logoutService()
        } catch {
            // 
        } finally {
            setUser(null)
            setError(null)
            clearTokens()
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
    }

    const updateUser = (updatedUserData) => {
        setUser(prev => ({
            ...prev,
            ...updatedUserData
        }))
    }

    const isAuthenticated = () => {
        const tokens = getTokens()
        return !!(user && tokens.access_token)
    }

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        updateUser,
        isAuthenticated,
        clearTokens
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
