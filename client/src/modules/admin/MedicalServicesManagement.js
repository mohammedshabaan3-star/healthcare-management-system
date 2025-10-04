// client/src/modules/admin/MedicalServicesManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../utils/api';

const MedicalServicesManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'medical',
        description: ''
    });
    const [message, setMessage] = useState('');
    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services', { withCredentials: true });
            setServices(response.data);
            setLoading(false);
        } catch (error) {
            console.error('فشل في جلب الخدمات:', error);
            setMessage('حدث خطأ أثناء جلب الخدمات. يرجى المحاولة مرة أخرى.');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;

            if (editingService) {
                response = await api.put(`/services/${editingService.id}`, formData, { withCredentials: true });
                setMessage('✅ تم تحديث الخدمة بنجاح');
            } else {
                response = await api.post('/services', formData, { withCredentials: true });
                setMessage('✅ تم إضافة الخدمة بنجاح');
            }

            setShowAddModal(false);
            setEditingService(null);
            setFormData({ name: '', code: '', type: 'medical', description: '' });
            fetchServices();
        } catch (error) {
            console.error('فشل في حفظ الخدمة:', error);
            setMessage('حدث خطأ أثناء حفظ الخدمة. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleDelete = async (serviceId) => {
        if (!window.confirm('هل أنت متأكد من أنك تريد حذف هذه الخدمة؟')) {
            return;
        }

        try {
            await api.delete(`/services/${serviceId}`);
            setMessage('✅ تم حذف الخدمة بنجاح');
            fetchServices();
        } catch (error) {
            setMessage(`❌ فشل في حذف الخدمة: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleToggleStatus = async (service) => {
        try {
            await api.patch(`/services/${service.id}/toggle-status`);
            setMessage(`✅ تم ${service.isActive ? 'إلغاء تفعيل' : 'تفعيل'} الخدمة بنجاح`);
            fetchServices();
        } catch (error) {
            setMessage(`❌ فشل في تغيير حالة الخدمة: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            code: service.code,
            type: service.type,
            description: service.description || ''
        });
        setShowAddModal(true);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
                🏥 إدارة الخدمات الطبية والإدارية
            </h2>

            {message && (
                <div style={{
                    padding: '15px',
                    margin: '20px 0',
                    backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' : '#721c24',
                    border: '1px solid',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    {message}
                </div>
            )}

            <div style={{ 
                backgroundColor: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'left'
            }}>
                {currentRole === 'system_admin' ? (
                    <button
                        onClick={() => {
                            setEditingService(null);
                            setFormData({ name: '', code: '', type: 'medical', description: '' });
                            setShowAddModal(true);
                        }}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ➕ إضافة خدمة جديدة
                    </button>
                ) : (
                    <div style={{ color: '#6c757d' }}>محجوز للصلاحيات</div>
                )}
            </div>

            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>📋 قائمة الخدمات</h3>
                {services.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد خدمات</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>#</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم الخدمة</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الكود</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>النوع</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الوصف</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الحالة</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service, index) => (
                                    <tr key={service.id} style={{ 
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                        borderBottom: '1px solid #dee2e6'
                                    }}>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{index + 1}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{service.name}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{service.code}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: service.type === 'medical' ? '#dc3545' : '#007bff',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {service.type === 'medical' ? 'طبية' : 'إدارية'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                            {service.description || '-'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: service.isActive ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {service.isActive ? 'مفعلة' : 'معطلة'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            {currentRole === 'system_admin' ? (
                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => handleEdit(service)}
                                                        style={{
                                                            backgroundColor: '#ffc107',
                                                            color: '#212529',
                                                            border: 'none',
                                                            padding: '5px 10px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        ✏️ تعديل
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(service)}
                                                        style={{
                                                            backgroundColor: service.isActive ? '#6c757d' : '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '5px 10px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {service.isActive ? '🚫 تعطيل' : '✅ تفعيل'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        style={{
                                                            backgroundColor: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '5px 10px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        🗑️ حذف
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#6c757d' }}>محجوز للصلاحيات</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* نافذة إضافة/تعديل خدمة */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        width: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        direction: 'rtl'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                            {editingService ? '✏️ تعديل خدمة' : '➕ إضافة خدمة جديدة'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    اسم الخدمة:
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    كود الخدمة (بالإنجليزية - فريد):
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                                    مثال: ICU_ADVANCED, DIALYSIS, BLOOD_TRANSFUSION
                                </small>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    النوع:
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="medical">طبية</option>
                                    <option value="administrative">إدارية</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    الوصف (اختياري):
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {editingService ? '💾 حفظ التغييرات' : '➕ إضافة الخدمة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingService(null);
                                    }}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ❌ إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalServicesManagement;