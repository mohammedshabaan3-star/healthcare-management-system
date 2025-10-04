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

// قراءة ملف تسجيل المرضى (Sheet2)
export const processPatientFile = (buffer) => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    // حاول الحصول على الورقة المسماة 'Sheet2' أو الورقة الأولى إذا لم توجد
    const sheetName = workbook.SheetNames.includes('Sheet2') ? 'Sheet2' : workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    // تنظيف الصفوف: إزالة الصفوف التي لا تحتوي على رقم قومي
    const rows = jsonData.filter(r => r['الرقم القومي'] || r['nationalId'] || r['National ID']);

    const patients = rows.map(row => {
        // مرونة في أسماء الأعمدة: حاول استخدام المفاتيح العربية أو الإنجليزية
        const nationalId = (row['الرقم القومي'] || row['nationalId'] || row['National ID'] || '').toString().trim();
        const fullName = (row['الاسم الثلاثي'] || row['Full Name'] || row['name'] || '').toString().trim();
        const birthOrAge = row['العمر'] || row['Age'] || row['birthdate'] || '';
        // حاول حساب العمر إن كان هناك تاريخ
        let age = parseInt(birthOrAge) || null;
        if (!age && typeof birthOrAge === 'string' && birthOrAge.includes('-')) {
            const year = new Date(birthOrAge).getFullYear();
            const now = new Date().getFullYear();
            age = now - year;
        }

        const gender = (row['النوع'] || row['gender'] || '').toString().trim();
        const governorate = (row['المحافظة'] || row['governorate'] || '').toString().trim();
        const address = (row['محل الإقامة'] || row['address'] || '').toString().trim();
        const phone1 = (row['التليفون 1'] || row['phone1'] || row['phone'] || '').toString().trim();
        const phone2 = (row['التليفون 2'] || row['phone2'] || '').toString().trim();
        const admissionDate = row['تاريخ الدخول'] || row['admissionDate'] || null;
        const admissionTime = row['وقت الدخول'] || row['admissionTime'] || null;
        const initialDiagnosis = (row['التشخيص المبدئي'] || row['initialDiagnosis'] || '').toString().trim();
        const finalDiagnosis = (row['التشخيص النهائي'] || row['finalDiagnosis'] || '').toString().trim();
        const careType = (row['نوع الرعاية'] || row['careType'] || '').toString().trim();
        const source = (row['مصدر التحويل'] || row['referralSource'] || '').toString().trim();
        const doctorName = (row['اسم الطبيب'] || row['doctorName'] || '').toString().trim();
        const apache = row['APACHE II'] || row['APACHE'] || row['apache'] || null;

        return {
            nationalId,
            fullName,
            age: age || null,
            gender,
            governorate,
            address,
            phone1,
            phone2,
            admissionDate,
            admissionTime,
            initialDiagnosis,
            finalDiagnosis,
            careType,
            source,
            doctorName,
            apache
        };
    });

    return patients;
};
