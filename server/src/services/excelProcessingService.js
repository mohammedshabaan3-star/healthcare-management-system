// server/src/services/excelProcessingService.js
export const processHospitalData = (rawData) => {
    // تخطي الصف الأول (العناوين)
    const headers = rawData[0];
    const rows = rawData.slice(1);

    const processedHospitals = rows.map(row => {
        const hospital = {};
        headers.forEach((header, index) => {
            hospital[header.trim()] = row[index];
        });

        // التحقق من الصحة
        if (!hospital['كود المستشفى'] || !hospital['المستشفيات']) {
            throw new Error(`بيانات المستشفى غير مكتملة: ${JSON.stringify(hospital)}`);
        }

        return {
            code: hospital['كود المستشفى'],
            name: hospital['المستشفيات'],
            governorate: hospital['محافظة المستشفى'] || 'غير محدد',
            icuBeds: parseInt(hospital['اسرة رعايه مركزه']) || 0,
            pediatricBeds: parseInt(hospital['اسرة رعايه أطفال']) || 0,
            // ... باقي الحقول
        };
    });

    return processedHospitals;
};

export const processGovernorateData = (rawData) => {
    // معالجة بيانات المحافظات والحى من الملف الأول
    const headers = rawData[0];
    const rows = rawData.slice(2); // تخطي الصفوف الأولى غير الضرورية

    const governorates = new Set();
    const districts = [];

    rows.forEach(row => {
        if (row[0] && row[1]) { // التأكد من وجود بيانات
            governorates.add(row[0].trim());
            districts.push({
                governorate: row[0].trim(),
                district: row[1].trim()
            });
        }
    });

    return { governorates: Array.from(governorates), districts };
};