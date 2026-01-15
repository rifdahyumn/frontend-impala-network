import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (isAuthenticated === null) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role === 'komunitas' && location.pathname === '/') {
        return <Navigate to="/hetero/semarang" replace />
    }

  return <MainLayout>{children}</MainLayout>;
};

const ProtectedRouteMinimal = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated === null) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        if (user?.role === 'komunitas') {
            return <Navigate to="/hetero/semarang" replace />
        }

        return <Navigate to='/' replace />
    }

    return children
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