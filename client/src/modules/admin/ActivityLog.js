import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/analytics/activity-log');
            setLogs(response.data);
        } catch (error) {
            console.error('فشل في جلب سجل النشاط:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;
    }

    if (currentRole !== 'system_admin') {
        return (
            <div style={{ padding: '20px', direction: 'rtl', textAlign: 'center' }}>
                <h3>غير مصرح بالوصول إلى هذه الصفحة</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#dc3545' }}>📝 سجل النشاط</h2>
            {logs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6c757d' }}>لا يوجد نشاط مسجل</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                            <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>المستخدم</th>
                            <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>النشاط</th>
                            <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>الوقت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{log.user}</td>
                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{log.action}</td>
                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ActivityLog;
