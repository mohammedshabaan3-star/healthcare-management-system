import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ جلب جميع المرضى
export const getPatients = async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
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
        await prisma.patient.delete({
            where: { id: Number(id) }
        });
        res.json({ success: true, message: 'تم حذف المريض بنجاح' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'فشل في حذف المريض' });
    }
};
