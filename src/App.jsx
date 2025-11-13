// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ImpalaManagement from './pages/ImpalaManagement';
import './App.css';
import Sidebar from './components/Layout/Sidebar';
import Home from './pages/Home';
import ProgramClient from './pages/ProgramClient';
import Program from './pages/Program';
import HeteroManagement from './pages/HeteroManagement';
import FormBuilder from './pages/FormBuilder';
import Account from './pages/Account';
import Header from './components/Layout/Header';
import LoginPage from './components/Login';
import HeteroBanyumas from './pages/HeteroManagement';
import HeteroSemarang from './pages/HeteroSemarang';
import HeteroSurakarta from './pages/HeteroSurakarta';
import PublicForm from './pages/PublicForm'; // TAMBAH IMPORT INI

// Main Layout Component
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

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute:', { 
    isAuthenticated, 
    path: location.pathname 
  });

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
    console.log('❌ Redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  console.log('🔓 PublicRoute:', { isAuthenticated });

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('✅ Already auth, redirecting to home...');
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Form Route - TANPA AUTH & LAYOUT
const PublicFormRoute = ({ children }) => {
  return children; // Langsung render tanpa auth check dan layout
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES (tanpa layout & auth) */}
          <Route 
            path="/register" 
            element={
              <PublicFormRoute>
                <PublicForm />
              </PublicFormRoute>
            } 
          />
          
          {/* AUTH ROUTES (dengan login check) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          {/* PROTECTED ROUTES (dengan layout & auth) */}
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
    </AuthProvider>
  );
}

export default App;