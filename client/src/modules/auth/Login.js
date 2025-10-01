import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. تسجيل الدخول
            await api.post('/auth/login', formData);

            // 2. التحقق من حالة الجلسة فورًا
            const authResponse = await api.get('/auth/check');
            const user = authResponse.data.user;

            // 3. حفظ بيانات المستخدم فقط (بدون التوكن)
            localStorage.setItem('user', JSON.stringify(user));

            // 4. إعادة التوجيه حسب الدور
            redirectToDashboard(user.activeRole);
        } catch (err) {
            setError(err.response?.data?.error || 'فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const redirectToDashboard = (role) => {
        switch(role) {
            case 'system_admin':
                navigate('/dashboard');
                break;
            case 'hospital_admin':
                navigate('/hospitals');
                break;
            case 'doctor':
                navigate('/patients');
                break;
            case 'nurse':
                navigate('/patients');
                break;
            case 'data_officer':
                navigate('/transfers');
                break;
            default:
                navigate('/dashboard');
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            direction: 'rtl'
        }}>
            <div style={{ 
                width: '100%',
                maxWidth: '450px',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ 
                        color: '#007bff',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '10px'
                    }}>
                        🏥 نظام الرعاية الصحية
                    </h1>
                    <p style={{ color: '#6c757d', fontSize: '16px' }}>
                        سجل الدخول لإدارة النظام
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #f5c6cb'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '25px', textAlign: 'right' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            📧 البريد الإلكتروني:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                backgroundColor: '#f8f9fa'
                            }}
                            placeholder="أدخل بريدك الإلكتروني"
                        />
                    </div>

                    <div style={{ marginBottom: '25px', textAlign: 'right' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            🔐 كلمة المرور:
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                backgroundColor: '#f8f9fa'
                            }}
                            placeholder="أدخل كلمة المرور"
                        />
                    </div>

                    <div style={{ marginBottom: '30px', textAlign: 'right' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 'bold',
                            color: '#333'
                        }}>
                            👤 نوع المستخدم:
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                backgroundColor: '#f8f9fa',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'6\' viewBox=\'0 0 12 6\'%3E%3Cpath fill=\'%23333\' d=\'M6 6L0 0h12z\'/%3E%3C/svg%3E")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 15px center',
                                paddingRight: '40px'
                            }}
                        >
                            <option value="">اختر نوع المستخدم</option>
                            <option value="system_admin">مدير النظام</option>
                            <option value="hospital_admin">مدير مستشفى</option>
                            <option value="doctor">طبيب</option>
                            <option value="nurse">ممرض</option>
                            <option value="data_officer">مسؤول بيانات</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
                        onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
                    >
                        {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>
                        © {new Date().getFullYear()} نظام إدارة الرعاية الصحية
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
