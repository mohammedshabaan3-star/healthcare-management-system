// server/src/middleware/fileUpload.js
import multer from 'multer';
import path from 'path';

// إعداد تخزين الملفات في الذاكرة (نعالج الملفات فورًا ونكتب المرفقات إلى القرص يدويًا)
const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg'
]);

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('نوع الملف غير مدعوم. مسموح: Excel, PDF, PNG, JPG'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        // زيادة الحد للسماح بمرفقات أكبر قليلاً
        fileSize: 20 * 1024 * 1024 // 20MB كحد أقصى لكل ملف
    }
});