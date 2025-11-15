import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ImpalaManagement from './pages/ImpalaManagement';
import './App.css';
import Sidebar from './components/Layout/Sidebar';
import Home from './pages/Home';
import ProgramClient from './pages/ProgramClient';
import Program from './pages/Program';
import FormBuilder from './pages/FormBuilder';
import Account from './pages/Account';
import Header from './components/Layout/Header';
import LoginPage from './components/Login';
import HeteroBanyumas from './pages/HeteroManagement';
import HeteroSemarang from './pages/HeteroSemarang';
import HeteroSurakarta from './pages/HeteroSurakarta';
import PublicForm from './pages/PublicForm';
import { useAutoLogout } from './hooks/useAutoLogout';


const AppContent = () => {

    return (
        <Router>
            <Routes>
                <Route 
                    path="/register" 
                    element={
                        <PublicFormRoute>
                        <PublicForm />
                        </PublicFormRoute>
                    } 
                />
            
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                        <LoginPage />
                        </PublicRoute>
                    } 
                />
                
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                        <Home />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/client" 
                    element={
                        <ProtectedRoute>
                        <ProgramClient />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/program" 
                    element={
                        <ProtectedRoute>
                        <Program />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/impala" 
                    element={
                        <ProtectedRoute>
                        <ImpalaManagement />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/hetero/semarang" 
                    element={
                        <ProtectedRoute>
                        <HeteroSemarang />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/hetero/banyumas" 
                    element={
                        <ProtectedRoute>
                        <HeteroBanyumas />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/hetero/surakarta" 
                    element={
                        <ProtectedRoute>
                        <HeteroSurakarta />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/form-builder" 
                    element={
                        <ProtectedRoute>
                        <FormBuilder />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/user" 
                    element={
                        <ProtectedRoute>
                        <Account />
                        </ProtectedRoute>
                    } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className='flex-shrink-0 fixed left-0 top-0 h-screen z-40'>
                <Sidebar />
            </div>

            <div className='flex-1 flex flex-col min-w-0 ml-80'>
                <Header />
                <div className='h-screen overflow-y-auto main-content-scroll animated-main-scroll glow-main-scroll'>
                    {children}
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();

    useAutoLogout()

    useEffect(() => {
        const checkTokenValidity = () => {
            const token = localStorage.getItem('token')
            if (!token) return false

            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                const expirationTime = payload.exp * 1000
                const isExpired = Date.now() > expirationTime

                if (isExpired) {
                    logout()
                    return false
                }
                return true
            } catch (error) {
                console.error('Error checking token in ProtectedRoute:', error);
                logout()
                return false
            }
        }

        if (isAuthenticated === true && !checkTokenValidity()) {
            return
        }
    }, [isAuthenticated, logout])

    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <MainLayout>{children}</MainLayout>;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const PublicFormRoute = ({ children }) => {
    return children; 
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;