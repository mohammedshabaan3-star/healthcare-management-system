// client/src/modules/patients/PatientsList.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ExportButtons from '../../components/ExportButtons';

const PatientsList = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/patients');
                setPatients(response.data);
                setFilteredPatients(response.data);
                setLoading(false);
            } catch (error) {
                console.error('فشل في جلب المرضى:', error);
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPatients(patients);
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = patients.filter(p => 
            p.fullName?.toLowerCase().includes(term) ||
            p.nationalId?.includes(term) ||
            p.governorate?.toLowerCase().includes(term) ||
            p.referralSource?.toLowerCase().includes(term)
        );
        setFilteredPatients(filtered);
    }, [searchTerm, patients]);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff' }}>📋 قائمة المرضى</h2>
            <ExportButtons type="patients" />
            
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
                                placeholder="ابحث عن اسم المريض أو الرقم القومي أو المحافظة..."
                                style={{ width: '100%', padding: '10px 15px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {searchTerm && <button onClick={() => setSearchTerm('')} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>}
                        </div>
                    </div>
                </div>
            </div>

            {/* الجدول */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>📊 إجمالي المرضى: {filteredPatients.length}</p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم المريض</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الرقم القومي</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>المحافظة</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>مصدر التحويل</th>
                                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>حالة التحويل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map((patient, index) => (
                                <tr key={patient.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{patient.fullName}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{patient.nationalId}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{patient.governorate}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{patient.referralSource}</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '20px',
                                            backgroundColor: patient.directTransfer ? '#ffc107' : 
                                                           patient.transferToOther ? '#dc3545' : '#28a745',
                                            color: 'white'
                                        }}>
                                            {patient.directTransfer ? 'تحويل مباشر' : 
                                             patient.transferToOther ? 'محول' : 'داخل المستشفى'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientsList;