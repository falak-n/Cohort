import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Patients from './components/Patients';
import Samples from './components/Samples';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import './index.css';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Dashboard
      </Link>
      <Link to="/patients" className={location.pathname === '/patients' ? 'active' : ''}>
        Patients
      </Link>
      <Link to="/samples" className={location.pathname === '/samples' ? 'active' : ''}>
        Samples
      </Link>
      <Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>
        Upload Data
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <header className="header">
          <h1>Cohort Management System</h1>
          <Navigation />
        </header>
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

