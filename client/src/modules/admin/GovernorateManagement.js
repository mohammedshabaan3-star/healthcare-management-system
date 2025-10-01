import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const GovernorateManagement = () => {
    const [governorates, setGovernorates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGovernorates();
    }, []);

    const fetchGovernorates = async () => {
        try {
            const response = await api.get('/governorates');
            setGovernorates(response.data);
        } catch (error) {
            console.error('فشل في جلب المحافظات:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff' }}>🌍 إدارة المحافظات والمراكز</h2>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                    📊 إجمالي المحافظات: {governorates.length}
                </p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم المحافظة</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>عدد المراكز</th>
                            </tr>
                        </thead>
                        <tbody>
                            {governorates.map((gov, index) => (
                                <tr key={gov.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{gov.name}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{gov.districts?.length || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GovernorateManagement;
