import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب مؤشرات الأداء الرئيسية
export const getKPIs = async (req, res) => {
    try {
        // استخدام قيم افتراضية إذا لم توجد البيانات لتجنب فشل الاستعلام
        const [
            totalPatients,
            pendingTransfers,
            totalHospitals,
            occupiedIcuBeds,
            totalIcuBedsResult
        ] = await Promise.all([
            prisma.patient.count().catch(() => 0),
            prisma.transferRequest.count({ where: { status: 'pending' } }).catch(() => 0),
            prisma.hospital.count().catch(() => 0),
            prisma.patient.count({ where: { transferToOther: false, status: { not: 'discharged' } } }).catch(() => 0),
            prisma.hospital.aggregate({ _sum: { icuBeds: true } }).catch(() => ({ _sum: { icuBeds: 0 } }))
        ]);

        const totalIcuBeds = totalIcuBedsResult._sum?.icuBeds || 0;
        const icuOccupancyRate = totalIcuBeds > 0 
            ? Math.round((occupiedIcuBeds / totalIcuBeds) * 100)
            : 0;

        res.json({
            totalPatients,
            pendingTransfers,
            totalHospitals,
            icuOccupancyRate,
            occupiedIcuBeds,
            totalIcuBeds
        });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({ error: 'فشل في جلب مؤشرات الأداء' });
    }
};

// جلب بيانات المرضى الجدد حسب اليوم
export const getDailyPatients = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const dailyData = await prisma.patient.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: startDate } },
            _count: { id: true },
            orderBy: { createdAt: 'asc' }
        });

        const formattedData = dailyData.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            count: item._count.id
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching daily patients:', error);
        res.status(500).json({ error: 'فشل في جلب بيانات المرضى اليومية' });
    }
};

// جلب بيانات المرضى حسب المحافظة
export const getPatientsByGovernorate = async (req, res) => {
    try {
        const data = await prisma.patient.groupBy({
            by: ['governorate'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        });

        res.json(data.map(item => ({
            governorate: item.governorate || 'غير محدد',
            count: item._count.id
        })));
    } catch (error) {
        console.error('Error fetching patients by governorate:', error);
        res.status(500).json({ error: 'فشل في جلب بيانات التوزيع الجغرافي' });
    }
};

// جلب بيانات التحويلات حسب المستشفى
export const getTransfersByHospital = async (req, res) => {
    try {
        const data = await prisma.transferRequest.groupBy({
            by: ['fromHospital'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        });

        res.json(data.map(item => ({
            hospital: item.fromHospital || 'غير محدد',
            count: item._count.id
        })));
    } catch (error) {
        console.error('Error fetching transfers by hospital:', error);
        res.status(500).json({ error: 'فشل في جلب بيانات التحويلات' });
    }
};
