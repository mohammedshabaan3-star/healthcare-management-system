// client/src/components/ExportButtons.js
import React from 'react';
import api from '../utils/api';

const ExportButtons = ({ type }) => {
    const handleExport = async (format) => {
        try {
            const endpoint = type === 'hospitals' ? '/hospitals' :
                           type === 'patients' ? '/patients' :
                           '/transfers';

            const response = await api.get(`/export${endpoint}?format=${format}`, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('فشل في التصدير:', error);
            alert('فشل في التصدير. يرجى المحاولة مرة أخرى.');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'flex-end', 
            marginBottom: '20px',
            direction: 'rtl'
        }}>
            <button
                onClick={() => handleExport('xlsx')}
                style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                📊 تصدير إلى Excel
            </button>
            <button
                onClick={() => handleExport('pdf')}
                style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                📄 تصدير إلى PDF
            </button>
        </div>
    );
};

export default ExportButtons;