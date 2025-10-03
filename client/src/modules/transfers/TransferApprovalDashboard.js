// client/src/modules/transfers/TransferApprovalDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ExportButtons from '../../components/ExportButtons';

const TransferApprovalDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const isHospitalAdmin = user?.activeRole === 'hospital_admin';

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await api.get('/transfers/pending');
                setRequests(response.data);
                setLoading(false);
            } catch (error) {
                console.error('فشل في جلب الطلبات:', error);
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter(req => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            req.patient?.fullName?.toLowerCase().includes(term) ||
            req.patient?.nationalId?.includes(term) ||
            req.fromHospital?.toLowerCase().includes(term) ||
            req.toHospital?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff' }}>📋 لوحة تحكم الموافقات</h2>
            <ExportButtons type="transfers" />
            {/* شريط البحث */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <label>🔍 البحث النصي:</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث عن اسم المريض أو الرقم القومي أو المستشفى..."
                                style={{ width: '100%', padding: '10px 15px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {searchTerm && <button onClick={() => setSearchTerm('')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>}
                        </div>
                    </div>
                </div>
            </div>

            {/* الجدول */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>📊 طلبات التحويل المعلقة: {filteredRequests.length}</p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم المريض</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الرقم القومي</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>من مستشفى</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>إلى مستشفى</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الحالة</th>
                                {isHospitalAdmin && <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>إجراءات</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((req, index) => (
                                <tr key={req.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{req.patient?.fullName}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{req.patient?.nationalId}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{req.fromHospital}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{req.toHospital}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '20px',
                                            backgroundColor: '#ffc107',
                                            color: 'white'
                                        }}>
                                            معلق
                                        </span>
                                    </td>
                                    {isHospitalAdmin && (
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <button
                                                style={{ backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', marginRight: '8px', cursor: 'pointer' }}
                                                onClick={async () => {
                                                    try {
                                                        await api.post(`/transfers/${req.id}/approve`);
                                                        setRequests(requests.filter(r => r.id !== req.id));
                                                    } catch (error) {
                                                        alert('فشل في الموافقة على التحويل');
                                                    }
                                                }}
                                            >موافقة</button>
                                            <button
                                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}
                                                onClick={async () => {
                                                    try {
                                                        await api.post(`/transfers/${req.id}/reject`);
                                                        setRequests(requests.filter(r => r.id !== req.id));
                                                    } catch (error) {
                                                        alert('فشل في رفض التحويل');
                                                    }
                                                }}
                                            >رفض</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransferApprovalDashboard;