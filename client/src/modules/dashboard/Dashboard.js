// client/src/modules/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
    LineChart, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [dailyPatients, setDailyPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpisRes, dailyRes] = await Promise.all([
                    api.get('/analytics/kpis', { withCredentials: true }),
                    api.get('/analytics/daily-patients?days=7', { withCredentials: true })
                ]);
                setKpis(kpisRes.data);
                setDailyPatients(dailyRes.data);
                setLoading(false);
            } catch (error) {
                console.error('فشل في جلب البيانات:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>
                جارٍ التحميل...
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
                📊 لوحة التحكم الإحصائية
            </h2>
            
            {/* مؤشرات الأداء */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px', 
                marginBottom: '40px' 
            }}>
                <div style={{ backgroundColor: '#007bff', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>إجمالي المستشفيات</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis?.totalHospitals || 0}</p>
                </div>
                <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>إجمالي المرضى</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis?.totalPatients || 0}</p>
                </div>
                <div style={{ backgroundColor: '#ffc107', color: '#212529', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>طلبات التحويل المعلقة</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis?.pendingTransfers || 0}</p>
                </div>
                <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>معدل إشغال العناية المركزة</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpis?.icuOccupancyRate || 0}%</p>
                </div>
            </div>

            {/* الرسم البياني */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📈 المرضى الجدد (آخر 7 أيام)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyPatients}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#007bff" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* زر إدارة المستشفيات */}
            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/admin/hospitals')}
                    style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    🏥 إدارة المستشفيات
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
