// client/src/modules/admin/ProtocolsManagement.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// This page exists to provide a dedicated route for managing protocols.
// MedicalStandardsManagement already supports category 'protocol', so
// redirecting to the standards page is the simplest fix.

const ProtocolsManagement = () => {
    return <Navigate to="/admin/standards" replace />;
};

export default ProtocolsManagement;
