// client/src/components/RoleBasedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // For session-based auth the server sets a cookie; client keeps minimal user info in localStorage.
    // If there's no user payload locally we consider the client unauthenticated and redirect to login.
    const isAuthenticated = !!user;

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user?.activeRole)) {
        // إعادة التوجيه إلى أول صفحة مسموح بها حسب الدور
        return <Navigate to={getAllowedPath(user?.activeRole)} />;
    }

    return children;
};

// دالة للحصول على المسار المسموح به حسب الدور
const getAllowedPath = (role) => {
    switch(role) {
        case 'system_admin':
            return '/dashboard';
        case 'hospital_admin':
            return '/hospitals';
        case 'doctor':
        case 'nurse':
            return '/patients';
        case 'data_officer':
            return '/transfers';
        default:
            return '/login';
    }
};

export default RoleBasedRoute;