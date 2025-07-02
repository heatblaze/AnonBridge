import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminPanel from './pages/AdminPanel';
import ContactSupport from './pages/ContactSupport';
import './App.css';

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-900">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/contact-support" element={<ContactSupport />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;