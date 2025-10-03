import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ جلب جميع المرضى
export const getPatients = async (req, res) => {
    try {
        let where = {};
        // إذا كان المستخدم ليس مدير النظام، يعرض فقط المرضى المرتبطين بمستشفاه
        if (['doctor', 'nurse', 'hospital_admin'].includes(req.session.userRole)) {
            if (!req.session.hospitalId) {
                return res.status(403).json({ error: 'لا توجد صلاحية مستشفى للمستخدم.' });
            }
            where = { hospitalId: req.session.hospitalId };
        }
        const patients = await prisma.patient.findMany({
            where,
            include: { hospital: true }
        });
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'فشل في جلب المرضى' });
    }
};

// ✅ إنشاء مريض جديد
export const createPatient = async (req, res) => {
    const { name, nationalId, phone, hospitalId } = req.body;

    if (!name || !nationalId || !phone || !hospitalId) {
        return res.status(400).json({ error: 'الاسم والرقم القومي والتليفون والمستشفى مطلوبة' });
    }

    try {
        // تحقق من صلاحية المستشفى
        if (['doctor', 'nurse', 'hospital_admin'].includes(req.session.userRole)) {
            if (Number(hospitalId) !== req.session.hospitalId) {
                return res.status(403).json({ error: 'لا يمكنك إضافة مريض لمستشفى آخر.' });
            }
        }
        const patient = await prisma.patient.create({
            data: {
                name,
                nationalId,
                phone,
                hospital: { connect: { id: Number(hospitalId) } }
            }
        });
        res.status(201).json({ success: true, patient });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ error: 'فشل في إنشاء المريض' });
    }
};

// ✅ تحديث بيانات مريض
export const updatePatient = async (req, res) => {
    const { id } = req.params;
    const { name, nationalId, phone, hospitalId } = req.body;

    try {
        // تحقق من صلاحية المستشفى
        const patientData = await prisma.patient.findUnique({ where: { id: Number(id) } });
        if (!patientData) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }
        if (['doctor', 'nurse', 'hospital_admin'].includes(req.session.userRole)) {
            if (patientData.hospitalId !== req.session.hospitalId) {
                return res.status(403).json({ error: 'لا يمكنك تعديل بيانات مريض من مستشفى آخر.' });
            }
        }
        const patient = await prisma.patient.update({
            where: { id: Number(id) },
            data: {
                ...(name && { name }),
                ...(nationalId && { nationalId }),
                ...(phone && { phone }),
                ...(hospitalId && { hospital: { connect: { id: Number(hospitalId) } } })
            }
        });
        res.json({ success: true, patient });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'فشل في تحديث المريض' });
    }
};

// ✅ حذف مريض
export const deletePatient = async (req, res) => {
    const { id } = req.params;

    try {
        // تحقق من صلاحية المستشفى
        const patientData = await prisma.patient.findUnique({ where: { id: Number(id) } });
        if (!patientData) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }
        if (['doctor', 'nurse', 'hospital_admin'].includes(req.session.userRole)) {
            if (patientData.hospitalId !== req.session.hospitalId) {
                return res.status(403).json({ error: 'لا يمكنك حذف مريض من مستشفى آخر.' });
            }
        }
        await prisma.patient.delete({
            where: { id: Number(id) }
        });
        res.json({ success: true, message: 'تم حذف المريض بنجاح' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'فشل في حذف المريض' });
    }
};
