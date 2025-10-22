// src/App.jsx
import React from 'react';
import ImpalaManagement from './pages/ImpalaManagement';
import './App.css';
import Sidebar from './components/Layout/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProgramClient from './pages/ProgramClient';
import Program from './pages/Program';
import HeteroManagement from './pages/HeteroManagement';
import FormBuilder from './pages/FormBuilder';
import Account from './pages/Account';
import Header from './components/Layout/Header';
import LoginPage from './components/login';

function App() {
  return (
    <Router>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/*' element={
            <div className="flex min-h-screen bg-gray-50">
          <div className='flex-shrink-0 fixed left-0 top-0 h-screen z-40'>
            <Sidebar />
          </div>

          <div className='flex-1 flex flex-col min-w-0 ml-64'>
            <Header />
            <div className='h-screen overflow-y-auto main-content-scroll animated-main-scroll glow-main-scroll'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/client' element={<ProgramClient />} />
                <Route path='/program' element={<Program />} />
                <Route path='/impala' element={<ImpalaManagement />} />
                <Route path='/hetero' element={<HeteroManagement />} />
                <Route path='/form' element={<FormBuilder />} />
                <Route path='/user' element={<Account />} />
              </Routes>
            </div>
          </div>
</div>
          } />
        </Routes>
      
    </Router>
  );
}

export default App;