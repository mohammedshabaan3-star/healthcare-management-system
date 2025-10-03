import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PerformanceReports = () => {
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            const response = await api.get('/analytics/performance');
            setPerformance(response.data);
        } catch (error) {
            console.error('فشل في جلب تقارير الأداء:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;
    }

    if (!['system_admin', 'hospital_admin'].includes(currentRole)) {
        return (
            <div style={{ padding: '20px', direction: 'rtl', textAlign: 'center' }}>
                <h3>غير مصرح بالوصول إلى هذه الصفحة</h3>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#17a2b8' }}>📈 تقارير الأداء</h2>
            {performance.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد بيانات أداء متاحة</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#17a2b8', color: 'white' }}>
                            <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>المستشفى</th>
                            <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>عدد المرضى</th>
                            <th style={{ padding: '10px', border: '1px solid #dee2e6' }}>معدل الإشغال</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performance.map((item, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.hospital}</td>
                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.patients}</td>
                                <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.icuRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PerformanceReports;
