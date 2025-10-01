import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const hospitalsFilePath = path.join(process.cwd(), 'uploads', 'المستشفيات.xlsx');

// قراءة ملف المحافظات
export const processGovernorateFile = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const rows = jsonData.slice(1);
    const governoratesMap = new Map();
    const districts = [];

    rows.forEach(row => {
        const governorateName = row[0]?.toString().trim();
        const districtName = row[1]?.toString().trim();

        if (governorateName && districtName) {
            if (!governoratesMap.has(governorateName)) {
                governoratesMap.set(governorateName, []);
            }
            governoratesMap.get(governorateName).push(districtName);
            districts.push({ governorateName, districtName });
        }
    });

    return {
        governorates: Array.from(governoratesMap.keys()),
        districts
    };
};

// قراءة ملف المستشفيات (حتى لو فارغ)
export const processHospitalFile = () => {
    if (!fs.existsSync(hospitalsFilePath)) {
        console.warn('❌ ملف المستشفيات غير موجود، سيتم إنشاء ملف فارغ تلقائي.');
        const wb = XLSX.utils.book_new();
        const wsData = [['كود المستشفى','اسم المستشفى','المحافظة','R.I.C.U','Pediatric','Incubators','Newborn']];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'المستشفيات');
        XLSX.writeFile(wb, hospitalsFilePath);
        return [];
    }

    const workbook = XLSX.readFile(hospitalsFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const rows = jsonData.slice(1);

    const hospitals = rows.map(row => ({
        code: row[0]?.toString().trim() || '',
        name: row[1]?.toString().trim() || '',
        governorate: row[2]?.toString().trim() || '',
        icuBeds: parseInt(row[3]) || 0,
        pediatricBeds: parseInt(row[4]) || 0,
        incubators: parseInt(row[5]) || 0,
        newbornBeds: parseInt(row[6]) || 0,
    }));

    return hospitals;
};
