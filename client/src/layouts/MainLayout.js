// client/src/layouts/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div 
                style={{ 
                    flex: 1, 
                    marginLeft: '280px', 
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    direction: 'rtl'
                }}
            >
                {/* هنا هيظهر محتوى أي صفحة فرعية حسب الـ Route */}
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
