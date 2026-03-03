import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    const { 
        user: contextUser, 
        loading, 
        error, 
        initialized, 
        isAuthenticated: authStatus, 
        ...authFunctions 
    } = context;
    
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [localUser, setLocalUser] = useState(contextUser);

    useEffect(() => {
        setLocalUser(contextUser);
    }, [contextUser]);

    useEffect(() => {
        if (initialized && !loading) {
            setIsAuthChecked(true);
        }
    }, [initialized, loading]);

    const updateUser = (updatedUserData) => {
        setLocalUser(updatedUserData);
        
        try {
            localStorage.setItem('user_data', JSON.stringify(updatedUserData));
            
            if (authFunctions.updateUser) {
                authFunctions.updateUser(updatedUserData);
            }
            
            window.dispatchEvent(new CustomEvent('userUpdated', { 
                detail: updatedUserData 
            }));
            
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'user_data',
                newValue: JSON.stringify(updatedUserData)
            }));
            
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    useEffect(() => {
        const handleUserUpdate = (event) => {
            setLocalUser(event.detail);
        };

        const handleStorageChange = (e) => {
            if (e.key === 'user_data' && e.newValue) {
                try {
                    const updatedUser = JSON.parse(e.newValue);
                    setLocalUser(updatedUser);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        };

        window.addEventListener('userUpdated', handleUserUpdate);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await authFunctions.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            setLocalUser(null);
        }
    };

    return {
        user: localUser,
        loading,
        error,
        initialized: isAuthChecked,
        isAuthenticated: authStatus,
        logout: handleLogout,
        login: authFunctions.login,
        checkAuthStatus: authFunctions.checkAuthStatus,
        updateUser
    };
};