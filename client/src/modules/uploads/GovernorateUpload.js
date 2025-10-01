// client/src/modules/uploads/GovernorateUpload.js
import React, { useState } from 'react';

const GovernorateUpload = () => {
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
            const response = await fetch('http://localhost:5000/api/upload/governorates', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
                alert('تم رفع ملف المحافظات بنجاح!');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            alert('فشل في الرفع: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2>رفع ملف المحافظات والمراكز</h2>
            <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
                disabled={uploading}
            />
            <button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                style={{ marginTop: '10px' }}
            >
                {uploading ? 'جاري الرفع...' : 'رفع الملف'}
            </button>
            
            {result && (
                <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
                    <h3>نتيجة الرفع:</h3>
                    <p>محافظات مضافة/محدثة: {result.data.governorates}</p>
                    <p>مراكز/أحياء مضافة: {result.data.districts}</p>
                </div>
            )}
        </div>
    );
};

export default GovernorateUpload;