// client/src/modules/admin/PasswordResetAdmin.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // ✅ بدل axios

const PasswordResetAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users'); // ✅ الكوكيز هتتبعت تلقائيًا
      setUsers(response.data);
    } catch (error) {
      console.error('فشل في جلب المستخدمين:', error);
      setMessage('❌ غير مصرح. يرجى تسجيل الدخول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('هل أنت متأكد من إعادة تعيين كلمة المرور لهذا المستخدم؟')) return;
    try {
      await api.post('/auth/reset-password', { userId });
      setMessage('✅ تم إعادة تعيين كلمة المرور بنجاح');
    } catch (error) {
      setMessage(`❌ فشل في إعادة التعيين: ${error.response?.data?.error || error.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>جارٍ التحميل...</div>;
  }

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
        🔑 إدارة إعادة تعيين كلمات المرور
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>لا يوجد مستخدمون</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>#</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>البريد الإلكتروني</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الدور</th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{index + 1}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{user.email}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{user.role}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🔄 إعادة التعيين
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PasswordResetAdmin;
