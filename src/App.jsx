import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { getTokens, clearTokens } from './services/authServices';
import ImpalaManagement from './pages/ImpalaManagement';
import './App.css';
import Sidebar from './components/Layout/Sidebar';
import Home from './pages/Home';
import ProgramClient from './pages/ProgramClient';
import Program from './pages/Program';
import HeteroManagement from './pages/HeteroBanyumas';
import FormBuilder from './pages/FormBuilder';
import Account from './pages/Account';
import Header from './components/Layout/Header';
import LoginPage from './components/Login';
import HeteroBanyumas from './pages/HeteroBanyumas';
import HeteroSemarang from './pages/HeteroSemarang';
import HeteroSurakarta from './pages/HeteroSurakarta';
import PublicForm from './components/PublicForm';
import UserAccountSettings from "./components/UserAccountSettings/UserAccountSettings";
import { LoadingSpinner } from './components/Loading';

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

const MinimalLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className='h-screen overflow-y-auto main-content-scroll animated-main-scroll glow-main-scroll'>
                {children}
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const tokens = getTokens();
        if (tokens.access_token && !user && !loading) {
            clearTokens();
        }
    }, [user, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-pink-600 flex items-center justify-center shadow-xl animate-pulse">
                            <svg 
                                className="w-10 h-10 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-md animate-ping"></div>
                    </div>
                </div>

                <div className="relative z-10 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        Loading IMPALA Dashboard
                    </h3>
                    
                    <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-loadingBar"></div>
                    </div>
                    
                    <p className="text-sm text-gray-500 animate-pulse">
                        Preparing your workspace...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const tokens = getTokens();
        if (tokens.access_token) {
            clearTokens();
        }
        
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role === 'komunitas' && location.pathname === '/') {
        return <Navigate to="/hetero/semarang" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
};

const ProtectedRouteMinimal = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        if (user?.role === 'komunitas') {
            return <Navigate to="/hetero/semarang" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

const PublicRoute = ({ children }) => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
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
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route 
                        path="/register/:slug" 
                        element={
                            <PublicFormRoute>
                                <PublicForm />
                            </PublicFormRoute>
                        } 
                    />
                    
                    <Route 
                        path="/register" 
                        element={
                            <ProtectedRoute>
                                <div className="p-6">
                                    <h1>Register Page Lainnya</h1>
                                    <p>Halaman register untuk keperluan internal</p>
                                </div>
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/account-settings" 
                        element={
                            <ProtectedRouteMinimal>
                                <UserAccountSettings />
                            </ProtectedRouteMinimal>
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
                    
                    <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h1>
                                <p className="text-gray-600">URL yang Anda cari tidak ada.</p>
                            </div>
                        </div>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;