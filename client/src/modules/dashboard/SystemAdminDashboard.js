// client/src/modules/dashboard/SystemAdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const SystemAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalHospitals: 0,
        totalPatients: 0,
        totalUsers: 0,
        pendingTransfers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get('/analytics/kpis', { withCredentials: true });
                setStats({
                    totalHospitals: response.data.totalHospitals || 0,
                    totalPatients: response.data.totalPatients || 0,
                    totalUsers: response.data.totalUsers || 0,
                    pendingTransfers: response.data.pendingTransfers || 0
                });
                setError('');
            } catch (err) {
                console.error('فشل في جلب إحصائيات لوحة التحكم:', err.response?.data || err.message);
                setError('حدث خطأ أثناء جلب الإحصائيات، الرجاء المحاولة لاحقاً.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const adminSections = [
        {
            title: '🔧 إدارة النظام',
            icon: '⚙️',
            items: [
                { name: 'رفع الملفات', path: '/admin/upload', description: 'رفع وتحديث ملفات المستشفيات والمرضى' },
                { name: 'إدارة المستخدمين', path: '/admin/users', description: 'إضافة وتعديل وحذف المستخدمين' },
                { name: 'إدارة الأدوار', path: '/admin/roles', description: 'إنشاء أدوار مخصصة وتخصيص الصلاحيات' },
                { name: 'إعادة تعيين كلمات المرور', path: '/admin/password-reset', description: 'إدارة كلمات مرور المستخدمين' }
            ]
        },
        {
            title: '⚙️ إدارة الخدمات والمعايير',
            icon: '🏥',
            items: [
                { name: 'إدارة المستشفيات', path: '/admin/hospitals', description: 'إضافة وتعديل وحذف المستشفيات' },
                { name: 'إدارة المحافظات', path: '/admin/governorates', description: 'إضافة وتحديث بيانات المحافظات والمراكز' },
                { name: 'إدارة الخدمات الطبية', path: '/admin/services', description: 'إضافة وتعديل الخدمات الطبية' },
                { name: 'إدارة المعايير الطبية', path: '/admin/standards', description: 'إدارة معايير القبول والجودة' },
                { name: 'إدارة البروتوكولات', path: '/admin/protocols', description: 'إدارة بروتوكولات العلاج' }
            ]
        },
        {
            title: '📊 التقارير والإحصائيات',
            icon: '📈',
            items: [
                { name: 'تقارير النظام', path: '/admin/reports', description: 'تقارير شاملة عن أداء النظام' },
                { name: 'سجل النشاط', path: '/admin/activity-log', description: 'سجل نشاط المستخدمين' },
                { name: 'تقارير الأداء', path: '/admin/performance', description: 'تقارير أداء المستشفيات والمستخدمين' }
            ]
        }
    ];

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
                👑 لوحة تحكم مدير النظام
            </h2>

            {/* عرض خطأ إذا حدث */}
            {error && (
                <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* مؤشرات الأداء الرئيسية */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px', 
                marginBottom: '40px'
            }}>
                <div style={cardStyle('#007bff', 'white')}>
                    <h3>إجمالي المستشفيات</h3>
                    <p style={statStyle}>{stats.totalHospitals}</p>
                </div>
                <div style={cardStyle('#28a745', 'white')}>
                    <h3>إجمالي المرضى</h3>
                    <p style={statStyle}>{stats.totalPatients}</p>
                </div>
                <div style={cardStyle('#ffc107', '#212529')}>
                    <h3>إجمالي المستخدمين</h3>
                    <p style={statStyle}>{stats.totalUsers}</p>
                </div>
                <div style={cardStyle('#dc3545', 'white')}>
                    <h3>طلبات التحويل المعلقة</h3>
                    <p style={statStyle}>{stats.pendingTransfers}</p>
                </div>
            </div>

            {/* أقسام لوحة التحكم */}
            {adminSections.map((section, index) => (
                <div key={index} style={sectionStyle}>
                    <h3 style={titleStyle}>
                        {section.icon} {section.title}
                    </h3>
                    <div style={itemsGrid}>
                        {section.items.map((item, itemIndex) => (
                            <Link 
                                key={itemIndex} 
                                to={item.path}
                                style={linkStyle}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h4 style={itemTitle}>{item.name}</h4>
                                <p style={itemDesc}>{item.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

            {/* زر العودة إلى لوحة التحكم الرئيسية */}
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Link 
                    to="/dashboard" 
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                    }}
                >
                    🔄 العودة إلى لوحة التحكم الرئيسية
                </Link>
            </div>
        </div>
    );
};

// 🔹 Styles
const cardStyle = (bg, color) => ({
    backgroundColor: bg,
    color: color,
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
});

const statStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '10px 0'
};

const sectionStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const titleStyle = {
    color: '#2c3e50',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
};

const itemsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
};

const linkStyle = {
    display: 'block',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#2c3e50',
    transition: 'all 0.3s ease',
    border: '1px solid #e9ecef'
};

const itemTitle = { margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' };
const itemDesc = { margin: 0, fontSize: '14px', color: '#6c757d' };

export default SystemAdminDashboard;
