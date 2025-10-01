// server/src/services/exportService.js
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class ExportService {
    // تصدير إلى Excel
    static async exportToExcel(data, columns, fileName) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // إضافة العناوين
        worksheet.addRow(columns.map(col => col.header));

        // إضافة البيانات
        data.forEach(row => {
            const rowData = columns.map(col => row[col.key] || '');
            worksheet.addRow(rowData);
        });

        // ضبط عرض الأعمدة
        columns.forEach((col, index) => {
            worksheet.getColumn(index + 1).width = col.width || 20;
        });

        // إنشاء المجلد إذا لم يكن موجودًا
        const exportDir = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const filePath = path.join(exportDir, fileName);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    // تصدير إلى PDF
    static async exportToPDF(data, columns, fileName, title = 'تقرير') {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 30, right: 30 }
            });

            const exportDir = path.join(process.cwd(), 'exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            const filePath = path.join(exportDir, fileName);
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // العنوان
            doc.fontSize(20).text(title, { align: 'center' });
            doc.moveDown();

            const tableTop = 100;
            const rowHeight = 25;
            const colWidth = 120;

            // رسم العناوين
            doc.fillColor('#007bff');
            columns.forEach((col, index) => {
                const x = 30 + (index * colWidth);
                doc.rect(x, tableTop, colWidth, rowHeight).fill();
                doc.fillColor('white').text(col.header, x + 5, tableTop + 5, {
                    width: colWidth - 10,
                    align: 'center'
                });
            });

            // رسم البيانات
            doc.fillColor('black');
            data.forEach((row, rowIndex) => {
                const y = tableTop + rowHeight + (rowIndex * rowHeight);
                columns.forEach((col, colIndex) => {
                    const x = 30 + (colIndex * colWidth);
                    doc.rect(x, y, colWidth, rowHeight).stroke('#ddd');
                    const cellText = row[col.key] !== undefined ? row[col.key].toString() : '';
                    doc.text(cellText, x + 5, y + 5, {
                        width: colWidth - 10,
                        align: 'right' // RTL
                    });
                });
            });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
}

export default ExportService;