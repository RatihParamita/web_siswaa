import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentAddForm from './forms/StudentAddForm';
import StudentEditForm from './forms/StudentEditForm';
import StudentDetailForm from './forms/StudentDetailForm';
import StudentDeleteForm from './forms/StudentDeleteForm';
import CityList from './pages/CityList';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('auth_token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
                <Route path="/students/add" element={<ProtectedRoute><StudentAddForm /></ProtectedRoute>} />
                <Route path="/students/edit/:id" element={<ProtectedRoute><StudentEditForm /></ProtectedRoute>} />
                <Route path="/students/detail/:id" element={<ProtectedRoute><StudentDetailForm /></ProtectedRoute>} />
                <Route path="/students/delete/:id" element={<ProtectedRoute><StudentDeleteForm /></ProtectedRoute>} />
                <Route path="/cities" element={<ProtectedRoute><CityList /></ProtectedRoute>} /> 
                <Route path="*" element={<Navigate to={localStorage.getItem('auth_token') ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;