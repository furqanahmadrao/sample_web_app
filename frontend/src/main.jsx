import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route index element={<Login />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);