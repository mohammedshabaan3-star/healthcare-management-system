import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MedicalStandardsManagement = () => {
    const [standards, setStandards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStandard, setEditingStandard] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'discharge', description: '', criteria: '' });
    const [message, setMessage] = useState('');

    useEffect(() => { fetchStandards(); }, []);

    const fetchStandards = async () => {
        try {
            const res = await api.get('/standards');
            setStandards(res.data || []);
        } catch (err) {
            console.error('fetch standards error', err);
            setMessage('فشل في جلب المعايير');
        } finally {
            setLoading(false);
        }
    };

    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStandard) await api.put(`/standards/${editingStandard.id}`, formData);
            else await api.post('/standards', formData);
            setMessage('تم الحفظ');
            setShowAddModal(false);
            setEditingStandard(null);
            setFormData({ name: '', category: 'discharge', description: '', criteria: '' });
            fetchStandards();
        } catch (err) {
            setMessage(err.response?.data?.error || err.message || 'خطأ');
        }
    };

    const handleEdit = (standard) => {
        setEditingStandard(standard);
        setFormData({ name: standard.name, category: standard.category, description: standard.description || '', criteria: standard.criteria });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد؟')) return;
        try { await api.delete(`/standards/${id}`); setMessage('تم الحذف'); fetchStandards(); }
        catch (err) { setMessage(err.response?.data?.error || err.message || 'خطأ'); }
    };

    const handleToggleStatus = async (standard) => {
        try { await api.patch(`/standards/${standard.id}/toggle-status`); fetchStandards(); }
        catch (err) { setMessage(err.response?.data?.error || err.message || 'خطأ'); }
    };

    const getCategoryLabel = (category) => {
        switch (category) {
            case 'discharge': return 'معايير الخروج';
            case 'admission': return 'معايير القبول';
            case 'protocol': return 'بروتوكولات العلاج';
            case 'quality': return 'مؤشرات الجودة';
            default: return category;
        }
    };

    if (loading) return <div style={{ padding: 20, textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;

    return (
        <div style={{ padding: 20, direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: 20 }}>📋 إدارة المعايير الطبية</h2>

            {message && (
                <div style={{ padding: 12, margin: '12px 0', backgroundColor: '#f1f1f1', borderRadius: 6, textAlign: 'center' }}>{message}</div>
            )}

            {currentRole === 'system_admin' && (
                <div style={{ marginBottom: 16, textAlign: 'left' }}>
                    <button onClick={() => { setEditingStandard(null); setFormData({ name: '', category: 'discharge', description: '', criteria: '' }); setShowAddModal(true); }} style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 14px', borderRadius: 6 }}>إضافة معيار جديد</button>
                </div>
            )}

            <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {standards.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد معايير طبية</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>#</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>اسم المعيار</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>الفئة</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>الوصف</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>المعايير</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>الحالة</th>
                                    <th style={{ padding: 8, border: '1px solid #eee' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standards.map((standard, index) => (
                                    <tr key={standard.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                                        <td style={{ padding: 8 }}>{index + 1}</td>
                                        <td>{standard.name}</td>
                                        <td>{getCategoryLabel(standard.category)}</td>
                                        <td>{standard.description || '-'}</td>
                                        <td>{standard.criteria}</td>
                                        <td>{standard.isActive ? 'مفعل' : 'معطل'}</td>
                                        <td>
                                            {currentRole === 'system_admin' ? (
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                    <button onClick={() => handleEdit(standard)} style={{ padding: '6px 8px' }}>✏️</button>
                                                    <button onClick={() => handleToggleStatus(standard)} style={{ padding: '6px 8px' }}>{standard.isActive ? '🚫' : '✅'}</button>
                                                    <button onClick={() => handleDelete(standard.id)} style={{ padding: '6px 8px' }}>🗑️</button>
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

            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 600, direction: 'rtl' }}>
                        <h3 style={{ textAlign: 'center' }}>{editingStandard ? 'تعديل معيار' : 'إضافة معيار'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 8 }}>
                                <label>اسم المعيار</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: 8 }} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>الفئة</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: 8 }}>
                                    <option value="discharge">معايير الخروج</option>
                                    <option value="admission">معايير القبول</option>
                                    <option value="protocol">بروتوكولات العلاج</option>
                                    <option value="quality">مؤشرات الجودة</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>الوصف</label>
                                <input name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', padding: 8 }} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>المعايير</label>
                                <textarea name="criteria" value={formData.criteria} onChange={handleInputChange} rows={6} style={{ width: '100%', padding: 8 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button type="submit" style={{ padding: '8px 12px' }}>{editingStandard ? 'حفظ' : 'إضافة'}</button>
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingStandard(null); }} style={{ padding: '8px 12px' }}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalStandardsManagement;