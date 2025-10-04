import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import api from './utils/api';

// الصفحات الأساسية
import Login from './modules/auth/Login';
import ChangePassword from './modules/auth/ChangePassword';
import Dashboard from './modules/dashboard/Dashboard';

// صفحات البيانات
import HospitalsList from './modules/hospitals/HospitalsList';
import PatientsList from './modules/patients/PatientsList';
import TransferApprovalDashboard from './modules/transfers/TransferApprovalDashboard';

// صفحات مدير النظام
import SystemAdminDashboard from './modules/dashboard/SystemAdminDashboard';
import PatientRegistrationForm from './modules/patients/PatientRegistrationForm';
import FileUploadManager from './modules/admin/FileUploadManager';
import UserManagement from './modules/admin/UserManagement';
import RoleManagement from './modules/admin/RoleManagement';
import PasswordResetAdmin from './modules/admin/PasswordResetAdmin';
import MedicalServicesManagement from './modules/admin/MedicalServicesManagement';
import MedicalStandardsManagement from './modules/admin/MedicalStandardsManagement';
import ProtocolsManagement from './modules/admin/ProtocolsManagement';
import HospitalManagement from './modules/admin/HospitalManagement';
import GovernorateManagement from './modules/admin/GovernorateManagement';
import ReportsManagement from './modules/admin/ReportsManagement';
import ActivityLog from './modules/admin/ActivityLog';
import PerformanceReports from './modules/admin/PerformanceReports';

const futureConfig = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
};

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/check', { withCredentials: true });
                if (response.data?.user) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("فشل في التحقق من الجلسة:", error);
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const hasRole = (allowedRoles) => user && allowedRoles.includes(user.activeRole);

    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>جارٍ التحميل...</div>;
        if (!user) return <Navigate to="/login" />;
        if (allowedRoles && !hasRole(allowedRoles)) return <Navigate to="/dashboard" />;
        return children;
    };

    if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>جارٍ التحميل...</div>;

    return (
        <Router future={futureConfig}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                <Route element={<MainLayout />}>
                    <Route path="dashboard" element={
                        <ProtectedRoute allowedRoles={["system_admin","hospital_admin","doctor","nurse","data_officer"]}>
                            {hasRole(["system_admin"]) ? <SystemAdminDashboard /> : <Dashboard />}
                        </ProtectedRoute>
                    }/>
                    <Route path="hospitals" element={
                        <ProtectedRoute allowedRoles={["system_admin","hospital_admin"]}>
                            <HospitalsList />
                        </ProtectedRoute>
                    }/>
                    <Route path="patients" element={
                        <ProtectedRoute allowedRoles={["system_admin","doctor","nurse"]}>
                            <PatientsList />
                        </ProtectedRoute>
                    }/>
                    <Route path="patients/register" element={
                        <ProtectedRoute allowedRoles={["system_admin","doctor","nurse"]}>
                            <PatientRegistrationForm />
                        </ProtectedRoute>
                    }/>
                    <Route path="transfers" element={
                        <ProtectedRoute allowedRoles={["system_admin","data_officer","hospital_admin"]}>
                            <TransferApprovalDashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="admin/upload" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><FileUploadManager /></ProtectedRoute>
                    }/>
                    <Route path="admin/users" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><UserManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/roles" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><RoleManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/password-reset" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><PasswordResetAdmin /></ProtectedRoute>
                    }/>
                    <Route path="admin/hospitals" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><HospitalManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/governorates" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><GovernorateManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/services" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><MedicalServicesManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/standards" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><MedicalStandardsManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/protocols" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><ProtocolsManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/reports" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><ReportsManagement /></ProtectedRoute>
                    }/>
                    <Route path="admin/activity-log" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><ActivityLog /></ProtectedRoute>
                    }/>
                    <Route path="admin/performance" element={
                        <ProtectedRoute allowedRoles={["system_admin"]}><PerformanceReports /></ProtectedRoute>
                    }/>
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
