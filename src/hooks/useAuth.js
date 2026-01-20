import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    const { user, loading, error, initialized, ...authFunctions } = context;
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        if (initialized && !loading) {
            setIsAuthChecked(true);
        }
    }, [initialized, loading]);

    return {
        user,
        loading,
        error,
        initialized: isAuthChecked,
        isAuthenticated: () => {
            if (!isAuthChecked) return false;
            return authFunctions.isAuthenticated();
        },
        ...authFunctions
    };
};