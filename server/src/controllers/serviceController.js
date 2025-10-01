// server/src/controllers/serviceController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب جميع الخدمات
export const getServices = async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'فشل في جلب الخدمات' });
    }
};

// إنشاء خدمة جديدة
export const createService = async (req, res) => {
    const { name, code, type, description } = req.body;

    if (!name || !code || !type) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    try {
        // التحقق من تفرد الكود
        const existingService = await prisma.service.findUnique({ where: { code } });
        if (existingService) {
            return res.status(400).json({ error: 'كود الخدمة موجود مسبقًا' });
        }

        // ✅ إنشاء كائن منفصل
        const serviceData = {
            name,
            code,
            type,
            description,
            isActive: true
        };

        const service = await prisma.service.create({
             serviceData
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة الخدمة بنجاح',
            service
        });

    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'فشل في إضافة الخدمة' });
    }
};

// تحديث خدمة
export const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, code, type, description, isActive } = req.body;

    try {
        // التحقق من تفرد الكود (إذا تم تغييره)
        if (code) {
            const existingService = await prisma.service.findFirst({
                where: { code, NOT: { id: parseInt(id) } }
            });
            if (existingService) {
                return res.status(400).json({ error: 'كود الخدمة موجود مسبقًا' });
            }
        }

        // ✅ إنشاء كائن منفصل
        const serviceData = {
            name,
            code,
            type,
            description,
            isActive
        };

        const service = await prisma.service.update({
            where: { id: parseInt(id) },
             serviceData
        });

        res.json({
            success: true,
            message: 'تم تحديث الخدمة بنجاح',
            service
        });

    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'فشل في تحديث الخدمة' });
    }
};

// حذف خدمة
export const deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.service.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'تم حذف الخدمة بنجاح'
        });

    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'فشل في حذف الخدمة' });
    }
};

// تفعيل/إلغاء تفعيل خدمة
export const toggleServiceStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
        if (!service) {
            return res.status(404).json({ error: 'الخدمة غير موجودة' });
        }

        // ✅ إنشاء كائن منفصل
        const serviceData = {
            isActive: !service.isActive
        };

        const updatedService = await prisma.service.update({
            where: { id: parseInt(id) },
             serviceData
        });

        res.json({
            success: true,
            message: `تم ${updatedService.isActive ? 'تفعيل' : 'إلغاء تفعيل'} الخدمة بنجاح`,
            service: updatedService
        });

    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({ error: 'فشل في تغيير حالة الخدمة' });
    }
};