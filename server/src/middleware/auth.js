// server/src/middleware/auth.js

/**
 * Middleware للتحقق من أن المستخدم لديه جلسة نشطة
 * يُستخدم لحماية جميع الـ routes الحساسة
 */
export const authenticateSession = (req, res, next) => {
    // التحقق من وجود جلسة نشطة
    if (req.session && req.session.isLoggedIn) {
        // تمرير الطلب إلى الدالة التالية
        next();
    } else {
        // إرجاع خطأ 401 إذا لم تكن هناك جلسة نشطة
        res.status(401).json({ 
            error: 'غير مصرح بالوصول. يرجى تسجيل الدخول.' 
        });
    }
};

/**
 * Middleware للتحقق من صلاحيات المستخدم
 * يُستخدم للتحقق من أن المستخدم لديه دور محدد
 * @param {string[]} allowedRoles - قائمة الأدوار المسموح بها
 */
export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        // التحقق أولاً من وجود جلسة نشطة
        if (!req.session || !req.session.isLoggedIn) {
            return res.status(401).json({ 
                error: 'غير مصرح بالوصول. يرجى تسجيل الدخول.' 
            });
        }

        // التحقق من أن دور المستخدم مسموح به
        const userRole = req.session.userRole;
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ 
                error: 'ليس لديك صلاحية للوصول لهذه الميزة.' 
            });
        }
    };
};