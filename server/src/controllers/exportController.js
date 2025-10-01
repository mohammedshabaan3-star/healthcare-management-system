// server/src/controllers/exportController.js
import ExportService from '../services/exportService.js';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// تصدير المستشفيات
export const exportHospitals = async (req, res) => {
    try {
        const hospitals = await prisma.hospital.findMany({
            include: {
                governorate: true
            }
        });

        const formattedData = hospitals.map(h => ({
            code: h.code,
            name: h.name,
            governorate: h.governorate?.name || '',
            icuBeds: h.icuBeds,
            pediatricBeds: h.pediatricBeds,
            mediumCareBeds: h.mediumCareBeds,
            incubators: h.incubators,
            newbornBeds: h.newbornBeds
        }));

        const columns = [
            { header: 'كود المستشفى', key: 'code', width: 15 },
            { header: 'اسم المستشفى', key: 'name', width: 40 },
            { header: 'المحافظة', key: 'governorate', width: 20 },
            { header: 'أسرة رعاية مركزه', key: 'icuBeds', width: 15 },
            { header: 'أسرة رعاية أطفال', key: 'pediatricBeds', width: 15 },
            { header: 'رعاية متوسطة', key: 'mediumCareBeds', width: 15 },
            { header: 'حضانات', key: 'incubators', width: 15 },
            { header: 'حديثي الولادة', key: 'newbornBeds', width: 15 }
        ];

        if (req.query.format === 'pdf') {
            const fileName = `hospitals_${Date.now()}.pdf`;
            const filePath = await ExportService.exportToPDF(formattedData, columns, fileName, 'تقرير المستشفيات');
            res.download(filePath, fileName);
        } else {
            const fileName = `hospitals_${Date.now()}.xlsx`;
            const filePath = await ExportService.exportToExcel(formattedData, columns, fileName);
            res.download(filePath, fileName);
        }
    } catch (error) {
        console.error('Error exporting hospitals:', error);
        res.status(500).json({ error: 'فشل في تصدير بيانات المستشفيات' });
    }
};

// تصدير المرضى
export const exportPatients = async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
            include: {
                hospital: true
            }
        });

        const formattedData = patients.map(p => ({
            reportNumber: p.reportNumber || '',
            fullName: p.fullName || '',
            nationalId: p.nationalId || '',
            age: p.age || '',
            gender: p.gender || '',
            governorate: p.governorate || '',
            phone1: p.phone1 || '',
            referralSource: p.referralSource || '',
            admissionDate: p.admissionDate ? new Date(p.admissionDate).toLocaleDateString('ar-EG') : '',
            initialDiagnosis: p.initialDiagnosis || '',
            transferToOther: p.transferToOther ? 'نعم' : 'لا',
            dischargeStatus: p.dischargeStatus || '',
            dischargeDate: p.dischargeDate ? new Date(p.dischargeDate).toLocaleDateString('ar-EG') : ''
        }));

        const columns = [
            { header: 'رقم البلاغ', key: 'reportNumber', width: 15 },
            { header: 'اسم المريض', key: 'fullName', width: 25 },
            { header: 'الرقم القومي', key: 'nationalId', width: 20 },
            { header: 'العمر', key: 'age', width: 10 },
            { header: 'النوع', key: 'gender', width: 10 },
            { header: 'المحافظة', key: 'governorate', width: 20 },
            { header: 'التليفون', key: 'phone1', width: 15 },
            { header: 'مصدر التحويل', key: 'referralSource', width: 25 },
            { header: 'تاريخ الدخول', key: 'admissionDate', width: 15 },
            { header: 'التشخيص المبدئي', key: 'initialDiagnosis', width: 30 },
            { header: 'تحويل لمستشفى أخرى', key: 'transferToOther', width: 15 },
            { header: 'حالة الخروج', key: 'dischargeStatus', width: 20 },
            { header: 'تاريخ الخروج', key: 'dischargeDate', width: 15 }
        ];

        if (req.query.format === 'pdf') {
            const fileName = `patients_${Date.now()}.pdf`;
            const filePath = await ExportService.exportToPDF(formattedData, columns, fileName, 'تقرير المرضى');
            res.download(filePath, fileName);
        } else {
            const fileName = `patients_${Date.now()}.xlsx`;
            const filePath = await ExportService.exportToExcel(formattedData, columns, fileName);
            res.download(filePath, fileName);
        }
    } catch (error) {
        console.error('Error exporting patients:', error);
        res.status(500).json({ error: 'فشل في تصدير بيانات المرضى' });
    }
};

// تصدير طلبات التحويل
export const exportTransfers = async (req, res) => {
    try {
        const transfers = await prisma.transferRequest.findMany({
            include: {
                patient: {
                    select: {
                        fullName: true,
                        nationalId: true
                    }
                },
                approver: {
                    select: {
                        name: true
                    }
                },
                requester: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const formattedData = transfers.map(t => ({
            patientName: t.patient?.fullName || '',
            nationalId: t.patient?.nationalId || '',
            fromHospital: t.fromHospital || '',
            toHospital: t.toHospital || '',
            reason: t.reason || '',
            status: t.status === 'pending' ? 'معلق' : t.status === 'approved' ? 'موافق عليه' : 'مرفوض',
            requestedBy: t.requester?.name || '',
            approvedBy: t.approver?.name || '',
            createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString('ar-EG') : ''
        }));

        const columns = [
            { header: 'اسم المريض', key: 'patientName', width: 25 },
            { header: 'الرقم القومي', key: 'nationalId', width: 20 },
            { header: 'من مستشفى', key: 'fromHospital', width: 25 },
            { header: 'إلى مستشفى', key: 'toHospital', width: 25 },
            { header: 'سبب التحويل', key: 'reason', width: 30 },
            { header: 'الحالة', key: 'status', width: 15 },
            { header: 'طلب بواسطة', key: 'requestedBy', width: 20 },
            { header: 'تم بواسطة', key: 'approvedBy', width: 20 },
            { header: 'تاريخ الطلب', key: 'createdAt', width: 15 }
        ];

        if (req.query.format === 'pdf') {
            const fileName = `transfers_${Date.now()}.pdf`;
            const filePath = await ExportService.exportToPDF(formattedData, columns, fileName, 'تقرير طلبات التحويل');
            res.download(filePath, fileName);
        } else {
            const fileName = `transfers_${Date.now()}.xlsx`;
            const filePath = await ExportService.exportToExcel(formattedData, columns, fileName);
            res.download(filePath, fileName);
        }
    } catch (error) {
        console.error('Error exporting transfers:', error);
        res.status(500).json({ error: 'فشل في تصدير بيانات التحويلات' });
    }
};