import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    // Not logged in → redirect to login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    const userRole = localStorage.getItem('userRole');
    const needsProfileCompletion = localStorage.getItem('needsProfileCompletion') === 'true';
    const approvalStatus = localStorage.getItem('approvalStatus');
    const currentPath = location.pathname;

    // --- Role-based route guards ---
    // Block students from accessing guide/operator/dean routes
    if (userRole === 'STUDENT') {
        if (currentPath.startsWith('/guide') || currentPath.startsWith('/operator') || currentPath.startsWith('/dean')) {
            return <Navigate to="/student/dashboard" replace />;
        }
    }
    // Block guides from accessing student/operator/dean routes
    if (userRole === 'GUIDE') {
        if (currentPath.startsWith('/student') || currentPath.startsWith('/operator') || currentPath.startsWith('/dean')) {
            return <Navigate to="/guide/dashboard" replace />;
        }
    }
    // Block operators from accessing student/guide/dean routes
    if (userRole === 'OPERATOR') {
        if (currentPath.startsWith('/student') || currentPath.startsWith('/guide') || currentPath.startsWith('/dean')) {
            return <Navigate to="/operator/dashboard" replace />;
        }
    }
    // Block deans from accessing student/guide/operator routes
    if (userRole === 'DEAN') {
        if (currentPath.startsWith('/student') || currentPath.startsWith('/guide') || currentPath.startsWith('/operator')) {
            return <Navigate to="/dean/dashboard" replace />;
        }
    }

    // --- Student-specific flow guards ---
    if (userRole === 'STUDENT' || !userRole) {
        // If profile is incomplete, only allow access to the StudentForm page
        if (needsProfileCompletion && currentPath !== '/student/StudentForm') {
            return <Navigate to="/student/StudentForm" replace />;
        }

        // If profile is complete but not yet approved, only allow pending-approval page
        if (!needsProfileCompletion && approvalStatus && approvalStatus !== 'APPROVED'
            && !currentPath.startsWith('/student/pending-approval')) {
            return <Navigate to="/student/pending-approval" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
