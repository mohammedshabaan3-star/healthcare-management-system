// client/src/modules/admin/MedicalStandardsManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MedicalStandardsManagement = () => {
    const [standards, setStandards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStandard, setEditingStandard] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'discharge',
        description: '',
        criteria: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchStandards();
    }, []);

    const fetchStandards = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/standards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStandards(response.data);
            setLoading(false);
        } catch (error) {
            console.error('فشل في جلب المعايير:', error);
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
            const token = localStorage.getItem('token');
            let response;

            if (editingStandard) {
                response = await axios.put(`http://localhost:5000/api/standards/${editingStandard.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('✅ تم تحديث المعيار بنجاح');
            } else {
                response = await axios.post('http://localhost:5000/api/standards', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('✅ تم إضافة المعيار بنجاح');
            }

            setShowAddModal(false);
            setEditingStandard(null);
            setFormData({ name: '', category: 'discharge', description: '', criteria: '' });
            fetchStandards();
        } catch (error) {
            setMessage(`❌ فشل في ${editingStandard ? 'تحديث' : 'إضافة'} المعيار: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDelete = async (standardId) => {
        if (!window.confirm('هل أنت متأكد من أنك تريد حذف هذا المعيار؟')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/standards/${standardId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('✅ تم حذف المعيار بنجاح');
            fetchStandards();
        } catch (error) {
            setMessage(`❌ فشل في حذف المعيار: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleToggleStatus = async (standard) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/standards/${standard.id}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`✅ تم ${standard.isActive ? 'إلغاء تفعيل' : 'تفعيل'} المعيار بنجاح`);
            fetchStandards();
        } catch (error) {
            setMessage(`❌ فشل في تغيير حالة المعيار: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEdit = (standard) => {
        setEditingStandard(standard);
        setFormData({
            name: standard.name,
            category: standard.category,
            description: standard.description || '',
            criteria: standard.criteria
        });
        setShowAddModal(true);
    };

    const getCategoryLabel = (category) => {
        switch(category) {
            case 'discharge': return 'معايير الخروج';
            case 'admission': return 'معايير القبول';
            case 'protocol': return 'بروتوكولات العلاج';
            case 'quality': return 'مؤشرات الجودة';
            default: return category;
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;
    }

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
                📋 إدارة المعايير الطبية
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
                <button
                    onClick={() => {
                        setEditingStandard(null);
                        setFormData({ name: '', category: 'discharge', description: '', criteria: '' });
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
                    ➕ إضافة معيار طبي جديد
                </button>
            </div>

            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>📋 قائمة المعايير الطبية</h3>
                {standards.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد معايير طبية</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>#</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم المعيار</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الفئة</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الوصف</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>المعايير</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الحالة</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standards.map((standard, index) => (
                                    <tr key={standard.id} style={{ 
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                        borderBottom: '1px solid #dee2e6'
                                    }}>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{index + 1}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{standard.name}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: standard.category === 'discharge' ? '#007bff' :
                                                               standard.category === 'admission' ? '#28a745' :
                                                               standard.category === 'protocol' ? '#ffc107' : '#dc3545',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {getCategoryLabel(standard.category)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                            {standard.description || '-'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                            <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                                                {standard.criteria}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: standard.isActive ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {standard.isActive ? 'مفعل' : 'معطل'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleEdit(standard)}
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
                                                    onClick={() => handleToggleStatus(standard)}
                                                    style={{
                                                        backgroundColor: standard.isActive ? '#6c757d' : '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '5px 10px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {standard.isActive ? '🚫 تعطيل' : '✅ تفعيل'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(standard.id)}
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* نافذة إضافة/تعديل معيار */}
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
                        width: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        direction: 'rtl'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                            {editingStandard ? '✏️ تعديل معيار طبي' : '➕ إضافة معيار طبي جديد'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    اسم المعيار:
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
                                    الفئة:
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="discharge">معايير الخروج</option>
                                    <option value="admission">معايير القبول</option>
                                    <option value="protocol">بروتوكولات العلاج</option>
                                    <option value="quality">مؤشرات الجودة</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    الوصف (اختياري):
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    المعايير (اكتب كل معيار في سطر منفصل):
                                </label>
                                <textarea
                                    name="criteria"
                                    value={formData.criteria}
                                    onChange={handleInputChange}
                                    rows="6"
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="مثال:
- Cardiovascular System assessment
- stable Hemodynamics (vital data)
- Systolic blood pressure ≥ 90 mmHg"
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
                                    {editingStandard ? '💾 حفظ التغييرات' : '➕ إضافة المعيار'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingStandard(null);
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

export default MedicalStandardsManagement;