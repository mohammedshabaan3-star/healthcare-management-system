// client/src/utils/api.js
import axios from 'axios';

// ✅ إنشاء نسخة مخصصة من Axios للتعامل مع API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', // 🔗 نقطة الأساس للـ API
  withCredentials: true, // ✅ إرسال الكوكيز (الجلسات) مع كل الطلبات
  timeout: 15000,        // ⏱️ زيادة المهلة إلى 15 ثانية للتعامل مع الطلبات الثقيلة
  headers: {
    'Content-Type': 'application/json', // 📝 ضمان إرسال البيانات كـ JSON
    'Accept': 'application/json'
  }
});

// ✅ معالج للردود (Responses)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔹 إذا انتهت الجلسة أو غير مصرح
    if (error.response && error.response.status === 401) {
      console.warn('🚨 انتهت الجلسة أو غير مصرح بالوصول. سيتم تحويل المستخدم لتسجيل الدخول.');
      // ممكن تضيف هنا إعادة توجيه للـ login إذا أردت
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
