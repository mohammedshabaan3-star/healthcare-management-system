// client/src/modules/uploads/ExcelUpload.js
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelUpload = ({ onDataProcessed }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            // إرسال البيانات للخلفية للمعالجة والتحقق
            processExcelData(data);
        };
        reader.readAsBinaryString(file);
    };

    const processExcelData = async (rawData) => {
        // إرسال البيانات إلى الخلفية
        const response = await fetch('/api/upload/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({  rawData }),
        });

        const result = await response.json();
        if (result.success) {
            alert('تم رفع ومعالجة الملف بنجاح');
            if (onDataProcessed) onDataProcessed(result.processedData);
        } else {
            alert('فشل في معالجة الملف: ' + result.message);
        }
    };

    return (
        <div>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleUpload}>رفع ومعالجة</button>
        </div>
    );
};

export default ExcelUpload;