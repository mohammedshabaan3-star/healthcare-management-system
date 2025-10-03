// client/src/modules/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [rolesList, setRolesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: ['doctor'],
        activeRole: 'doctor',
        hospitalId: '',
        isActive: true
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchHospitals();
        fetchRoles();
    }, []);

    // ✅ جلب المستخدمين
    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('فشل في جلب المستخدمين:', error);
            setMessage('❌ فشل في تحميل قائمة المستخدمين.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ جلب المستشفيات
    const fetchHospitals = async () => {
        try {
            const response = await api.get('/hospitals');
            // السيرفر بيرجع { data, total, page } → ناخد data فقط
            const hospitalsData = response.data?.data || response.data || [];
            setHospitals(Array.isArray(hospitalsData) ? hospitalsData : []);
        } catch (error) {
            console.error('فشل في جلب المستشفيات:', error);
            setMessage('❌ فشل في تحميل قائمة المستشفيات.');
        }
    };

    // ✅ جلب الأدوار من الخادم
    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRolesList(response.data);
        } catch (error) {
            console.error('فشل في جلب الأدوار:', error);
            // قائمة افتراضية
            setRolesList([
                { name: 'system_admin', displayName: 'مدير النظام' },
                { name: 'hospital_admin', displayName: 'مدير مستشفى' },
                { name: 'doctor', displayName: 'طبيب' },
                { name: 'nurse', displayName: 'ممرض' },
                { name: 'data_officer', displayName: 'مسؤول بيانات' }
            ]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoleChange = (e) => {
        const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            roles: selectedRoles,
            activeRole: selectedRoles[0] || 'doctor'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingUser && (!formData.password || formData.password.length < 8)) {
            setMessage('❌ كلمة المرور مطلوبة (8 أحرف على الأقل)');
            return;
        }

        const requiresHospital = !formData.roles.includes('system_admin');
        if (requiresHospital && !formData.hospitalId) {
            setMessage('❌ يُرجى اختيار مستشفى لهذا الدور');
            return;
        }

        try {
            if (editingUser) {
                const { password, ...updateData } = formData;
                await api.put(`/users/${editingUser.id}`, updateData);
                setMessage('✅ تم تحديث المستخدم بنجاح');
                // تحديث بيانات المستخدم الحالي إذا كان هو نفسه الذي تم تعديله
                if (editingUser.id === (JSON.parse(localStorage.getItem('user'))?.id)) {
                    try {
                        const response = await api.get('/auth/check', { withCredentials: true });
                        if (response.data?.user) {
                            localStorage.setItem('user', JSON.stringify(response.data.user));
                        }
                    } catch (err) {}
                }
            } else {
                await api.post('/users', formData);
                setMessage('✅ تم إضافة المستخدم بنجاح');
            }
            setShowAddUserModal(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            setMessage(`❌ فشل في ${editingUser ? 'تحديث' : 'إضافة'} المستخدم: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            roles: user.roles,
            activeRole: user.activeRole,
            hospitalId: user.hospitalId || '',
            isActive: user.isActive
        });
        setShowAddUserModal(true);
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        try {
            await api.delete(`/users/${userId}`);
            setMessage('✅ تم حذف المستخدم بنجاح');
            fetchUsers();
        } catch (error) {
            setMessage(`❌ فشل في حذف المستخدم: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleToggleActive = async (user) => {
        try {
            await api.patch(`/users/${user.id}/toggle-active`);
            setMessage(`✅ تم ${user.isActive ? 'تعطيل' : 'تفعيل'} المستخدم`);
            fetchUsers();
        } catch (error) {
            setMessage(`❌ فشل في تغيير حالة المستخدم: ${error.response?.data?.error || error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            roles: ['doctor'],
            activeRole: 'doctor',
            hospitalId: '',
            isActive: true
        });
    };

    const getRoleDisplayName = (roleName) => {
        const role = rolesList.find(r => r.name === roleName);
        return role ? role.displayName : roleName;
    };

    if (loading) {
        return <div style={{ padding: 20, textAlign: 'center' }}>⏳ جارٍ التحميل...</div>;
    }

    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>👥 إدارة المستخدمين</h2>

            {message && (
                <div style={{
                    padding: '15px', marginBottom: '20px',
                    backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' : '#721c24',
                    borderRadius: '8px', textAlign: 'center', fontWeight: 'bold'
                }}>
                    {message}
                </div>
            )}

            {currentRole === 'system_admin' && (
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <button
                        onClick={() => { setEditingUser(null); resetForm(); setShowAddUserModal(true); }}
                        style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', borderRadius: '6px' }}
                    >
                        ➕ إضافة مستخدم جديد
                    </button>
                </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                {Array.isArray(users) && users.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f1f1f1' }}>
                                    <th>#</th>
                                    <th>الاسم</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الأدوار</th>
                                    <th>الدور النشط</th>
                                    <th>المستشفى</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.roles.map(r => getRoleDisplayName(r)).join(', ')}</td>
                                        <td>{getRoleDisplayName(user.activeRole)}</td>
                                        <td>{user.hospital?.name || '-'}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                backgroundColor: user.isActive ? '#28a745' : '#dc3545',
                                                color: 'white'
                                            }}>
                                                {user.isActive ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td>
                                            {currentRole === 'system_admin' ? (
                                                <>
                                                    <button onClick={() => handleEditUser(user)} style={{ backgroundColor: '#ffc107', margin: '0 5px' }}>✏️ تعديل</button>
                                                    <button onClick={() => handleToggleActive(user)} style={{ backgroundColor: user.isActive ? '#dc3545' : '#28a745', color: 'white', margin: '0 5px' }}>
                                                        {user.isActive ? '🚫 تعطيل' : '✅ تفعيل'}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user.id)} style={{ backgroundColor: '#6c757d', color: 'white', margin: '0 5px' }}>🗑️ حذف</button>
                                                </>
                                            ) : (
                                                <span style={{ color: '#6c757d' }}>محجوز للصلاحيات</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد بيانات مستخدمين</p>
                )}
            </div>

            {/* نافذة إضافة / تعديل المستخدم */}
            {showAddUserModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px' }}>
                        <h3>{editingUser ? '✏️ تعديل مستخدم' : '➕ إضافة مستخدم جديد'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>الاسم:</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label>البريد الإلكتروني:</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label>كلمة المرور:</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                                </div>
                            )}
                            <div>
                                <label>الأدوار:</label>
                                <select multiple value={formData.roles} onChange={handleRoleChange}>
                                    {rolesList.map(role => (
                                        <option key={role.name} value={role.name}>{role.displayName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>الدور النشط:</label>
                                <select name="activeRole" value={formData.activeRole} onChange={handleInputChange}>
                                    {formData.roles.map(roleName => (
                                        <option key={roleName} value={roleName}>{getRoleDisplayName(roleName)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>المستشفى:</label>
                                <select name="hospitalId" value={formData.hospitalId} onChange={handleInputChange}>
                                    <option value="">-- اختر مستشفى --</option>
                                    {Array.isArray(hospitals) && hospitals.map(hospital => (
                                        <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                    الحساب نشط
                                </label>
                            </div>
                            <div>
                                <button type="submit">{editingUser ? '💾 حفظ' : '➕ إضافة'}</button>
                                <button type="button" onClick={() => setShowAddUserModal(false)}>❌ إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
