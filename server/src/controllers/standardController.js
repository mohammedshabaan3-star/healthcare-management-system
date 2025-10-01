// server/src/controllers/standardController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب جميع المعايير
export const getStandards = async (req, res) => {
    try {
        const standards = await prisma.medicalStandard.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(standards);
    } catch (error) {
        console.error('Error fetching standards:', error);
        res.status(500).json({ error: 'فشل في جلب المعايير' });
    }
};

// إنشاء معيار جديد
export const createStandard = async (req, res) => {
    const { name, category, description, criteria } = req.body;

    if (!name || !category || !criteria) {
        return res.status(400).json({ error: 'الاسم، الفئة، والمعايير مطلوبة' });
    }

    try {
        // ✅ إنشاء كائن منفصل
        const standardData = {
            name,
            category,
            description,
            criteria,
            isActive: true
        };

        const standard = await prisma.medicalStandard.create({
             standardData
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة المعيار بنجاح',
            standard
        });

    } catch (error) {
        console.error('Error creating standard:', error);
        res.status(500).json({ error: 'فشل في إضافة المعيار' });
    }
};

// تحديث معيار
export const updateStandard = async (req, res) => {
    const { id } = req.params;
    const { name, category, description, criteria, isActive } = req.body;

    try {
        // ✅ إنشاء كائن منفصل
        const standardData = {
            name,
            category,
            description,
            criteria,
            isActive
        };

        const standard = await prisma.medicalStandard.update({
            where: { id: parseInt(id) },
             standardData
        });

        res.json({
            success: true,
            message: 'تم تحديث المعيار بنجاح',
            standard
        });

    } catch (error) {
        console.error('Error updating standard:', error);
        res.status(500).json({ error: 'فشل في تحديث المعيار' });
    }
};

// حذف معيار
export const deleteStandard = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.medicalStandard.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'تم حذف المعيار بنجاح'
        });

    } catch (error) {
        console.error('Error deleting standard:', error);
        res.status(500).json({ error: 'فشل في حذف المعيار' });
    }
};

// تفعيل/إلغاء تفعيل معيار
export const toggleStandardStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const standard = await prisma.medicalStandard.findUnique({ where: { id: parseInt(id) } });
        if (!standard) {
            return res.status(404).json({ error: 'المعيار غير موجود' });
        }

        // ✅ إنشاء كائن منفصل
        const standardData = {
            isActive: !standard.isActive
        };

        const updatedStandard = await prisma.medicalStandard.update({
            where: { id: parseInt(id) },
             standardData
        });

        res.json({
            success: true,
            message: `تم ${updatedStandard.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المعيار بنجاح`,
            standard: updatedStandard
        });

    } catch (error) {
        console.error('Error toggling standard status:', error);
        res.status(500).json({ error: 'فشل في تغيير حالة المعيار' });
    }
};