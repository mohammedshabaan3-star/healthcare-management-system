import React, { useState } from 'react';

const HospitalUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);

        try {
            const response = await fetch('http://localhost:5000/api/upload/hospitals', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
                alert('✅ تم رفع ملف المستشفيات بنجاح!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert('❌ فشل في الرفع: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3>📤 رفع ملف المستشفيات (Excel)</h3>
            <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
                disabled={uploading}
            />
            <button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
                {uploading ? '⏳ جاري الرفع...' : '📥 رفع الملف'}
            </button>
            
            {result && (
                <div style={{ marginTop: '20px', padding: '10px', background: '#e9ecef', borderRadius: '6px' }}>
                    <h4>📊 نتيجة الرفع:</h4>
                    <p>✅ مستشفيات مضافة/محدثة: {result.data?.successCount}</p>
                    <p>⚠️ أخطاء في المعالجة: {result.data?.errorCount}</p>
                </div>
            )}
        </div>
    );
};

export default HospitalUpload;
