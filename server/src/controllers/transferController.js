// server/src/controllers/transferController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// جلب الطلبات المعلقة مع بيانات المريض والمستخدمين
export const getPendingTransfers = async (req, res) => {
    try {
        const requests = await prisma.transferRequest.findMany({
            where: {
                status: 'pending'
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        nationalId: true
                    }
                },
                approver: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching pending transfers:', error);
        res.status(500).json({ error: 'فشل في جلب الطلبات' });
    }
};

// الموافقة على طلب التحويل
export const approveTransfer = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'غير مصرح بالوصول' });
    }

    try {
        const existingRequest = await prisma.transferRequest.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        if (existingRequest.status !== 'pending') {
            return res.status(400).json({ error: 'هذا الطلب تم معالجته مسبقًا' });
        }

        // ✅ إنشاء كائن منفصل للتحديث
        const updateData = {
            status: 'approved',
            approvedBy: userId,
            notes: 'تمت الموافقة على طلب التحويل',
            updatedAt: new Date()
        };

        const updatedRequest = await prisma.transferRequest.update({
            where: { id: parseInt(id) },
             updateData,
            include: {
                patient: true,
                requester: {
                    select: { name: true, email: true }
                }
            }
        });

        // تحديث حالة المريض
        const patientUpdateData = {
            transferToOther: true,
            status: 'transferred',
            updatedAt: new Date()
        };

        await prisma.patient.update({
            where: { id: updatedRequest.patientId },
             patientUpdateData
        });

        console.log(`✅ [موافقة] تم الموافقة على طلب تحويل المريض: ${updatedRequest.patient.fullName}`);
        console.log(`   📩 إشعار للمستخدم: ${updatedRequest.requester?.email || 'غير محدد'}`);

        res.json({
            success: true,
            message: 'تم الموافقة على طلب التحويل بنجاح',
            request: updatedRequest
        });

    } catch (error) {
        console.error('Error approving transfer:', error);
        res.status(500).json({ error: 'فشل في الموافقة على الطلب' });
    }
};

// رفض طلب التحويل
export const rejectTransfer = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'غير مصرح بالوصول' });
    }

    if (!notes || notes.trim().length === 0) {
        return res.status(400).json({ error: 'يرجى إدخال سبب الرفض' });
    }

    try {
        const existingRequest = await prisma.transferRequest.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingRequest) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        if (existingRequest.status !== 'pending') {
            return res.status(400).json({ error: 'هذا الطلب تم معالجته مسبقًا' });
        }

        // ✅ إنشاء كائن منفصل للتحديث
        const updateData = {
            status: 'rejected',
            approvedBy: userId,
            notes: notes.trim(),
            updatedAt: new Date()
        };

        const updatedRequest = await prisma.transferRequest.update({
            where: { id: parseInt(id) },
             updateData,
            include: {
                patient: true,
                requester: {
                    select: { name: true, email: true }
                }
            }
        });

        // تحديث حالة المريض
        const patientUpdateData = {
            status: 'transfer_rejected',
            updatedAt: new Date()
        };

        await prisma.patient.update({
            where: { id: updatedRequest.patientId },
             patientUpdateData
        });

        console.log(`❌ [رفض] تم رفض طلب تحويل المريض: ${updatedRequest.patient.fullName}`);
        console.log(`   📝 السبب: ${notes}`);
        console.log(`   📩 إشعار للمستخدم: ${updatedRequest.requester?.email || 'غير محدد'}`);

        res.json({
            success: true,
            message: 'تم رفض طلب التحويل بنجاح',
            request: updatedRequest
        });

    } catch (error) {
        console.error('Error rejecting transfer:', error);
        res.status(500).json({ error: 'فشل في رفض الطلب' });
    }
};