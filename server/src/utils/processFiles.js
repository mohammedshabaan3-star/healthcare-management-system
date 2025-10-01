import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

/**
 * 🔹 قراءة ملف المحافظات تلقائيًا من مجلد uploads
 */
export const loadGovernoratesFile = () => {
    const filePath = path.join(process.cwd(), 'uploads', 'المحافظات.xlsx');

    if (!fs.existsSync(filePath)) {
        console.error('❌ ملف المحافظات غير موجود:', filePath);
        return { governorates: [], districts: [] };
    }

    const buffer = fs.readFileSync(filePath);
    return processGovernorateFile(buffer);
};

/**
 * 🔹 قراءة ملف المستشفيات تلقائيًا من مجلد uploads
 */
export const loadHospitalFile = () => {
    const filePath = path.join(process.cwd(), 'uploads', 'المستشفيات.xlsx');

    if (!fs.existsSync(filePath)) {
        console.error('❌ ملف المستشفيات غير موجود:', filePath);
        return [];
    }

    const buffer = fs.readFileSync(filePath);
    return processHospitalFile(buffer);
};

/**
 * 🔹 معالجة بيانات المحافظات من buffer
 */
export const processGovernorateFile = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const rows = jsonData.slice(1); // تخطي الصف الأول (رؤوس الأعمدة)

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

/**
 * 🔹 معالجة بيانات المستشفيات من buffer
 */
export const processHospitalFile = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const rows = jsonData.slice(1); // تخطي الصف الأول (رؤوس الأعمدة)

    const hospitals = rows.map(row => ({
        code: row[0]?.toString().trim() || '',
        name: row[1]?.toString().trim() || '',
        governorate: row[2]?.toString().trim() || '',
        icuBeds: parseInt(row[3]) || 0,
        pediatricBeds: parseInt(row[4]) || 0,
        incubators: parseInt(row[5]) || 0,
        newbornBeds: parseInt(row[6]) || 0,
        mediumCareBeds: parseInt(row[7]) || 0,
    })).filter(h => h.name); // نقبل حتى لو الكود فاضي (يتولد تلقائي لاحقًا)

    return hospitals;
};
