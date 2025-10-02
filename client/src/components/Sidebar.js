// client/src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    // ✅ قراءة بيانات المستخدم من localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.activeRole || 'system_admin'; // افتراضي لمدير النظام

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // ✅ تحديد العناصر المسموح بها حسب الدور
    const getMenuItems = () => {
       const items = [
        { path: '/dashboard', label: '📊 لوحة التحكم', icon: '📊' }
    ];

    if (role === 'system_admin') {
        items.push(
            { path: '/hospitals', label: '🏥 المستشفيات', icon: '🏥' },
            { path: '/patients', label: '👥 المرضى', icon: '👥' },
            { path: '/patients/register', label: '➕ تسجيل مريض جديد', icon: '➕' },
            { path: '/transfers', label: '🔄 طلبات التحويل', icon: '🔄' }
        );
    }
    else if (role === 'hospital_admin') {
        items.push(
            { path: '/hospitals', label: '🏥 المستشفى', icon: '🏥' },
            { path: '/patients', label: '👥 المرضى', icon: '👥' }
        );
    }
    else if (['doctor', 'nurse'].includes(role)) {
        items.push(
            { path: '/patients', label: '👥 المرضى', icon: '👥' },
            { path: '/patients/register', label: '➕ تسجيل مريض جديد', icon: '➕' }
        );
    }
    else if (role === 'data_officer') {
        items.push({ path: '/transfers', label: '🔄 طلبات التحويل', icon: '🔄' });
    }

    return items;
};

    const menuItems = getMenuItems();

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            position: 'fixed',
            left: 0,
            top: 0,
            overflowY: 'auto',
            direction: 'rtl',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '20px 0',
                borderBottom: '1px solid #34495e',
                marginBottom: '30px'
            }}>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
                    🏥 نظام الرعاية الصحية
                </h3>
                <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
                    {user?.name} - {getRoleLabel(role)}
                </p>
            </div>

            <nav>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item, index) => (
                        <li key={index} style={{ marginBottom: '10px' }}>
                            <Link 
                                to={item.path} 
                                style={{
                                    display: 'block',
                                    padding: '12px 18px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: isActive(item.path) ? '#3498db' : 'transparent',
                                    fontWeight: isActive(item.path) ? 'bold' : 'normal',
                                    fontSize: '15px'
                                }}
                            >
                                {item.icon} {item.label}
                            </Link>
                        </li>
                    ))}

                    {/* رابط تغيير كلمة المرور */}
                    <li style={{ marginBottom: '10px' }}>
                        <Link 
                            to="/change-password"
                            style={{
                                display: 'block',
                                padding: '12px 18px',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontSize: '15px'
                            }}
                        >
                            🔐 تغيير كلمة المرور
                        </Link>
                    </li>
                </ul>
            </nav>

            <div style={{
                position: 'absolute',
                bottom: '20px',
                width: '100%',
                textAlign: 'center',
                borderTop: '1px solid #34495e',
                paddingTop: '15px',
                fontSize: '13px'
            }}>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        width: '100%',
                        marginTop: '10px'
                    }}
                >
                    🚪 تسجيل الخروج
                </button>
                <p style={{ marginTop: '12px', opacity: 0.7 }}>
                    نظام إدارة الرعاية الصحية
                </p>
                <p style={{ margin: 0, opacity: 0.7 }}>
                    © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

// ✅ دالة لعرض اسم الدور بالعربية
const getRoleLabel = (role) => {
    switch(role) {
        case 'system_admin': return 'مدير النظام';
        case 'hospital_admin': return 'مدير مستشفى';
        case 'doctor': return 'طبيب';
        case 'nurse': return 'ممرض';
        case 'data_officer': return 'مسؤول بيانات';
        default: return 'مستخدم';
    }
};

export default Sidebar;
