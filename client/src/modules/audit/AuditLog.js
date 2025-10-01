// client/src/modules/audit/AuditLog.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/audit-logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error('فشل في جلب سجل التدقيق:', error);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const getActionColor = (action) => {
        switch (action) {
            case 'APPROVE_TRANSFER': return '#28a745';
            case 'REJECT_TRANSFER': return '#dc3545';
            case 'REQUEST_MORE_INFO': return '#ffc107';
            default: return '#007bff';
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff' }}>سجل التدقيق</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                            <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>#</th>
                            <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الإجراء</th>
                            <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الوصف</th>
                            <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>المستخدم</th>
                            <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>التاريخ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => (
                            <tr key={log.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{index + 1}</td>
                                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: getActionColor(log.action),
                                        color: 'white',
                                        fontSize: '12px'
                                    }}>
                                        {log.action === 'APPROVE_TRANSFER' && 'موافقة'}
                                        {log.action === 'REJECT_TRANSFER' && 'رفض'}
                                        {log.action === 'REQUEST_MORE_INFO' && 'مزيد معلومات'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>{log.description}</td>
                                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{log.user?.name || 'نظام'}</td>
                                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                    {new Date(log.createdAt).toLocaleDateString('ar-EG')}<br/>
                                    {new Date(log.createdAt).toLocaleTimeString('ar-EG')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLog;