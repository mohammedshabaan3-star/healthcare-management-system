import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ReportsManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/analytics/reports');
            setReports(response.data);
        } catch (error) {
            console.error('فشل في جلب التقارير:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#28a745' }}>📊 تقارير النظام</h2>
            {reports.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد تقارير متاحة</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {reports.map((report, index) => (
                        <li key={index} style={{ padding: '15px', background: '#f8f9fa', marginBottom: '10px', borderRadius: '6px' }}>
                            <h4>{report.title}</h4>
                            <p>{report.summary}</p>
                            <small>📅 {new Date(report.date).toLocaleDateString('ar-EG')}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ReportsManagement;
