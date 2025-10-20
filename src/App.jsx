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

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <div className='flex-1'>
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
    </Router>
  );
}

export default App;