import * as XLSX from 'xlsx';

// قراءة ملف المحافظات
export const processGovernorateFile = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = jsonData[0]; // ['المحافظة', 'المركز / الحي']
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

// قراءة ملف المستشفيات
export const processHospitalFile = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // تخطي الصف الأول (العناوين)
    const rows = jsonData.slice(1);

    const hospitals = rows.map(row => ({
        code: row[0]?.toString().trim() || '',
        name: row[1]?.toString().trim() || '',
        governorate: row[2]?.toString().trim() || '',
        icuBeds: parseInt(row[3]) || 0,
        pediatricBeds: parseInt(row[4]) || 0,
        incubators: parseInt(row[5]) || 0,
        newbornBeds: parseInt(row[6]) || 0,
    })).filter(h => h.code && h.name);

    return hospitals;
};
