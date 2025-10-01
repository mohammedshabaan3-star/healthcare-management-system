// server/src/middleware/fileUpload.js
import multer from 'multer';
import path from 'path';

// إعداد تخزين الملفات في الذاكرة (لأننا نعالجها مباشرة)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('يجب أن يكون الملف من نوع Excel'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB كحد أقصى
    }
});