import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * ✅ جلب جميع المستشفيات مع دعم Pagination + Filters + Search
 */
export const getHospitals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const {
            search = '',
            governorate = '',
            icuBeds = '',
            pediatricBeds = '',
            incubators = '',
            newbornBeds = '',
            mediumCareBeds = ''
        } = req.query;

        // بناء شروط البحث والفلاتر
        const where = {
            AND: [
                search
                    ? {
                        OR: [
                            { code: { contains: search } },
                            { name: { contains: search } },
                            { governorate: { name: { contains: search } } }
                        ]
                    }
                    : {},
                governorate ? { governorate: { name: governorate } } : {},
                icuBeds ? { icuBeds: { gte: Number(icuBeds) } } : {},
                pediatricBeds ? { pediatricBeds: { gte: Number(pediatricBeds) } } : {},
                incubators ? { incubators: { gte: Number(incubators) } } : {},
                newbornBeds ? { newbornBeds: { gte: Number(newbornBeds) } } : {},
                mediumCareBeds ? { mediumCareBeds: { gte: Number(mediumCareBeds) } } : {}
            ]
        };

        const [hospitals, totalFiltered, totalAll] = await Promise.all([
            prisma.hospital.findMany({
                where,
                include: { governorate: true },
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.hospital.count({ where }),
            prisma.hospital.count()
        ]);

        const formatted = hospitals.map(h => ({
            id: h.id,
            code: h.code || '',
            name: h.name || '',
            governorate: h.governorate?.name || '-',
            icuBeds: h.icuBeds || 0,
            pediatricBeds: h.pediatricBeds || 0,
            incubators: h.incubators || 0,
            newbornBeds: h.newbornBeds || 0,
            mediumCareBeds: h.mediumCareBeds || 0
        }));

        res.json({
            data: formatted,
            totalFiltered, // عدد المستشفيات بعد الفلترة
            totalAll,      // إجمالي كل المستشفيات
            page,
            totalPages: Math.ceil(totalFiltered / limit)
        });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({ error: 'فشل في جلب المستشفيات' });
    }
};

/**
 * ✅ إنشاء مستشفى جديد
 */
export const createHospital = async (req, res) => {
    const { name, code, governorateId, icuBeds, pediatricBeds, incubators, newbornBeds, mediumCareBeds } = req.body;

    try {
        const hospital = await prisma.hospital.create({
            data: {
                name: name || '',
                code: code || `HOSP-${Math.floor(Math.random() * 1000000)}`,
                icuBeds: icuBeds || 0,
                pediatricBeds: pediatricBeds || 0,
                incubators: incubators || 0,
                newbornBeds: newbornBeds || 0,
                mediumCareBeds: mediumCareBeds || 0,
                ...(governorateId ? { governorate: { connect: { id: Number(governorateId) } } } : {})
            }
        });
        res.status(201).json({ success: true, hospital });
    } catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).json({ error: 'فشل في إنشاء المستشفى' });
    }
};

/**
 * ✅ تحديث بيانات مستشفى
 */
export const updateHospital = async (req, res) => {
    const { id } = req.params;
    const { name, code, governorateId, icuBeds, pediatricBeds, incubators, newbornBeds, mediumCareBeds } = req.body;

    try {
        const hospital = await prisma.hospital.update({
            where: { id: Number(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(code !== undefined && { code }),
                ...(icuBeds !== undefined && { icuBeds }),
                ...(pediatricBeds !== undefined && { pediatricBeds }),
                ...(incubators !== undefined && { incubators }),
                ...(newbornBeds !== undefined && { newbornBeds }),
                ...(mediumCareBeds !== undefined && { mediumCareBeds }),
                ...(governorateId ? { governorate: { connect: { id: Number(governorateId) } } } : {})
            }
        });
        res.json({ success: true, hospital });
    } catch (error) {
        console.error('Error updating hospital:', error);
        res.status(500).json({ error: 'فشل في تحديث بيانات المستشفى' });
    }
};

/**
 * ✅ حذف مستشفى
 */
export const deleteHospital = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.hospital.delete({ where: { id: Number(id) } });
        res.json({ success: true, message: 'تم حذف المستشفى بنجاح' });
    } catch (error) {
        console.error('Error deleting hospital:', error);
        res.status(500).json({ error: 'فشل في حذف المستشفى' });
    }
};
