// client/src/modules/admin/RoleManagement.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        permissions: {
            patients: { view: false, create: false, edit: false, delete: false, export: false, print: false },
            hospitals: { view: false, create: false, edit: false, delete: false, export: false, print: false },
            transfers: { view: false, create: false, approve: false, reject: false, edit: false, delete: false },
            users: { view: false, create: false, edit: false, delete: false, deactivate: false, resetPassword: false },
            reports: { view: false, create: false, export: false, schedule: false },
            system: { uploadFiles: false, manageRoles: false, manageServices: false, manageStandards: false }
        }
    });
    const [message, setMessage] = useState('');
    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            const rolesWithParsedPermissions = response.data.map(role => ({
                ...role,
                permissions: typeof role.permissions === 'string'
                    ? JSON.parse(role.permissions)
                    : role.permissions
            }));
            setRoles(rolesWithParsedPermissions);
            setLoading(false);
        } catch (error) {
            console.error('فشل في جلب الأدوار:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (category, permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [category]: {
                    ...prev.permissions[category],
                    [permission]: !prev.permissions[category][permission]
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name.trim(),
                displayName: formData.displayName.trim(),
                description: formData.description.trim(),
                permissions: formData.permissions
            };

            if (!payload.name || !payload.displayName || !payload.permissions) {
                setMessage('❌ الحقول name و displayName و permissions مطلوبة');
                return;
            }

            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, payload);
                setMessage('✅ تم تحديث الدور بنجاح');
            } else {
                await api.post('/roles', payload);
                setMessage('✅ تم إضافة الدور بنجاح');
            }

            setShowAddRoleModal(false);
            setEditingRole(null);
            resetForm();
            fetchRoles();
        } catch (error) {
            console.error('Error submitting role:', error.response?.data || error.message);
            setMessage(`❌ فشل في ${editingRole ? 'تحديث' : 'إضافة'} الدور: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEditRole = (role) => {
        const permissions = typeof role.permissions === 'string'
            ? JSON.parse(role.permissions)
            : role.permissions;

        setEditingRole(role);
        setFormData({
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            permissions
        });
        setShowAddRoleModal(true);
    };

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('هل أنت متأكد من أنك تريد حذف هذا الدور؟')) return;

        try {
            await api.delete(`/roles/${roleId}`);
            setMessage('✅ تم حذف الدور بنجاح');
            fetchRoles();
        } catch (error) {
            setMessage(`❌ فشل في حذف الدور: ${error.response?.data?.error || error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            displayName: '',
            description: '',
            permissions: {
                patients: { view: false, create: false, edit: false, delete: false, export: false, print: false },
                hospitals: { view: false, create: false, edit: false, delete: false, export: false, print: false },
                transfers: { view: false, create: false, approve: false, reject: false, edit: false, delete: false },
                users: { view: false, create: false, edit: false, delete: false, deactivate: false, resetPassword: false },
                reports: { view: false, create: false, export: false, schedule: false },
                system: { uploadFiles: false, manageRoles: false, manageServices: false, manageStandards: false }
            }
        });
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>جارٍ التحميل...</div>;

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>🎭 إدارة الأدوار والصلاحيات</h2>

            {message && (
                <div style={{
                    padding: '15px', margin: '20px 0',
                    backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' : '#721c24',
                    border: '1px solid', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold'
                }}>
                    {message}
                </div>
            )}

            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'left'
            }}>
                {currentRole === 'system_admin' ? (
                    <button
                        onClick={() => { setEditingRole(null); resetForm(); setShowAddRoleModal(true); }}
                        style={{
                            backgroundColor: '#28a745', color: 'white', border: 'none',
                            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '16px', fontWeight: 'bold', display: 'inline-flex',
                            alignItems: 'center', gap: '8px'
                        }}
                    >
                        ➕ إضافة دور جديد
                    </button>
                ) : (
                    <div style={{ color: '#6c757d' }}>محجوز للصلاحيات</div>
                )}
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>📋 قائمة الأدوار</h3>
                {roles.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد أدوار</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>#</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم الدور</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الاسم المعروض</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الوصف</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>عدد الصلاحيات</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role, index) => {
                                    const totalPermissions = Object.values(role.permissions).reduce((sum, category) =>
                                        sum + Object.values(category).filter(Boolean).length, 0
                                    );

                                    return (
                                        <tr key={role.id} style={{
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                            borderBottom: '1px solid #dee2e6'
                                        }}>
                                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{role.name}</td>
                                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{role.displayName}</td>
                                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{role.description}</td>
                                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '20px', backgroundColor: '#007bff', color: 'white', fontSize: '12px' }}>
                                                    {totalPermissions}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                                {currentRole === 'system_admin' ? (
                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                        <button onClick={() => handleEditRole(role)} style={{ backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️ تعديل</button>
                                                        <button onClick={() => handleDeleteRole(role.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ حذف</button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#6c757d' }}>محجوز للصلاحيات</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showAddRoleModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '12px',
                        width: '600px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', direction: 'rtl'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                            {editingRole ? '✏️ تعديل دور' : '➕ إضافة دور جديد'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label>اسم الدور (بالإنجليزية - للنظام):</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}/>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>الاسم المعروض (بالعربية):</label>
                                <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}/>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>الوصف:</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '8px', marginTop: '5px' }}/>
                            </div>

                            {Object.entries(formData.permissions).map(([category, perms]) => (
                                <div key={category} style={{ marginBottom: '20px' }}>
                                    <h4>صلاحيات {category}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                                        {Object.keys(perms).map(permission => (
                                            <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input type="checkbox" checked={perms[permission]} onChange={() => handlePermissionChange(category, permission)} />
                                                {permission}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
                                    {editingRole ? 'حفظ التعديلات' : 'إضافة الدور'}
                                </button>
                                <button type="button" onClick={() => { setShowAddRoleModal(false); resetForm(); }} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
