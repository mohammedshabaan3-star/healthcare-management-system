// client/src/modules/admin/FileUploadManager.js
import React, { useState } from 'react';
import api from '../../utils/api'; // ✅ بدل axios

const FileUploadManager = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const currentRole = JSON.parse(localStorage.getItem('user') || 'null')?.activeRole;

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile || !fileType) {
            alert('يرجى اختيار الملف ونوعه');
            return;
        }

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            let endpoint = '';
            switch(fileType) {
                case 'hospitals':
                    endpoint = '/upload/hospitals';
                    break;
                case 'governorates':
                    endpoint = '/upload/governorates';
                    break;
                case 'patients':
                    endpoint = '/upload/patients';
                    break;
                default:
                    throw new Error('نوع الملف غير مدعوم');
            }

            // ✅ استخدام api.js اللي فيه withCredentials
            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setMessage('✅ تم رفع الملف ومعالجته بنجاح');
                setUploadHistory(prev => [{
                    fileName: selectedFile.name,
                    fileType: fileType,
                    status: 'نجاح',
                    timestamp: new Date().toLocaleString('ar-EG'),
                    details: response.data.message || 'تمت المعالجة بنجاح'
                }, ...prev]);
            } else {
                throw new Error(response.data.error || 'فشل في معالجة الملف');
            }
        } catch (error) {
            setMessage(`❌ فشل في رفع الملف: ${error.response?.data?.error || error.message}`);
            setUploadHistory(prev => [{
                fileName: selectedFile.name,
                fileType: fileType,
                status: 'فشل',
                timestamp: new Date().toLocaleString('ar-EG'),
                details: error.response?.data?.error || error.message
            }, ...prev]);
        } finally {
            setUploading(false);
            setSelectedFile(null);
            setFileType('');
        }
    };

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>
                📤 إدارة رفع الملفات
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
                padding: '30px', 
                borderRadius: '8px', 
                marginBottom: '30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>رفع ملف جديد</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            📁 اختر الملف:
                        </label>
                        <input 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            onChange={handleFileChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        {selectedFile && (
                            <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                                الملف المختار: {selectedFile.name}
                            </small>
                        )}
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            🏷️ نوع الملف:
                        </label>
                        <select 
                            value={fileType} 
                            onChange={(e) => setFileType(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="">اختر نوع الملف</option>
                            <option value="hospitals">المستشفيات</option>
                            <option value="governorates">المحافظات والمراكز</option>
                            <option value="patients">تسجيل المرضى</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    {currentRole === 'system_admin' || currentRole === 'data_officer' ? (
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !selectedFile || !fileType}
                            style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                minWidth: '200px'
                            }}
                        >
                            {uploading ? 'جارٍ الرفع...' : 'رفع الملف'}
                        </button>
                    ) : (
                        <div style={{ color: '#6c757d' }}>محجوز للصلاحيات</div>
                    )}
                </div>
            </div>

            {/* سجل عمليات الرفع */}
            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>📋 سجل عمليات الرفع</h3>
                {uploadHistory.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#6c757d' }}>لا توجد عمليات رفع سابقة</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>اسم الملف</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>نوع الملف</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الحالة</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>الوقت</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6' }}>التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadHistory.map((upload, index) => (
                                    <tr key={index} style={{ 
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                        borderBottom: '1px solid #dee2e6'
                                    }}>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{upload.fileName}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            {upload.fileType === 'hospitals' && 'المستشفيات'}
                                            {upload.fileType === 'governorates' && 'المحافظات'}
                                            {upload.fileType === 'patients' && 'المرضى'}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                backgroundColor: upload.status === 'نجاح' ? '#28a745' : '#dc3545',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}>
                                                {upload.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{upload.timestamp}</td>
                                        <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                                            <small>{upload.details}</small>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploadManager;
