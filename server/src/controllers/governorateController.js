import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ جلب جميع المحافظات
export const getGovernorates = async (req, res) => {
    try {
        const governorates = await prisma.governorate.findMany({
            include: { districts: true }
        });
        res.json(governorates);
    } catch (error) {
        console.error('Error fetching governorates:', error);
        res.status(500).json({ error: 'فشل في جلب المحافظات' });
    }
};

// ✅ إنشاء محافظة جديدة
export const createGovernorate = async (req, res) => {
    const { name, code } = req.body;

    if (!name || !code) {
        return res.status(400).json({ error: 'الاسم والكود مطلوبان' });
    }

    try {
        const governorate = await prisma.governorate.create({
            data: { name, code }
        });
        res.status(201).json({ success: true, governorate });
    } catch (error) {
        console.error('Error creating governorate:', error);
        res.status(500).json({ error: 'فشل في إنشاء المحافظة' });
    }
};

// ✅ تحديث محافظة
export const updateGovernorate = async (req, res) => {
    const { id } = req.params;
    const { name, code } = req.body;

    try {
        const governorate = await prisma.governorate.update({
            where: { id: Number(id) },
            data: {
                ...(name && { name }),
                ...(code && { code })
            }
        });
        res.json({ success: true, governorate });
    } catch (error) {
        console.error('Error updating governorate:', error);
        res.status(500).json({ error: 'فشل في تحديث المحافظة' });
    }
};

// ✅ حذف محافظة
export const deleteGovernorate = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.governorate.delete({
            where: { id: Number(id) }
        });
        res.json({ success: true, message: 'تم حذف المحافظة بنجاح' });
    } catch (error) {
        console.error('Error deleting governorate:', error);
        res.status(500).json({ error: 'فشل في حذف المحافظة' });
    }
};
