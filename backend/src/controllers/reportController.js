const Incident = require('../models/Incident');
const Report = require('../models/Report');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { sendSuccess } = require('../utils/response');
const SuccessCodes = require('../utils/constants/successCodes');
const AppError = require('../middleware/AppError');
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');

exports.generateIncidentReport = async (req, res, next) => {
    try {
        // 1. Lấy dữ liệu từ DB
        const incidents = await Incident.find()
            .populate('reportedBy', 'name phone')
            .populate('assignedTeam', 'name')
            .sort('-createdAt');

        // 2. Khởi tạo Workbook & Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách sự cố');

        // 3. Định nghĩa Header
        worksheet.columns = [
            { header: 'Mã vụ', key: 'code', width: 20 },
            { header: 'Tiêu đề', key: 'title', width: 30 },
            { header: 'Loại sự cố', key: 'type', width: 15 },
            { header: 'Mức độ', key: 'severity', width: 12 },
            { header: 'Trạng thái', key: 'status', width: 15 },
            { header: 'Địa chỉ', key: 'address', width: 40 },
            { header: 'Người báo cáo', key: 'reporter', width: 20 },
            { header: 'Đội cứu hộ', key: 'team', width: 20 },
            { header: 'Ngày tạo', key: 'createdAt', width: 20 },
        ];

        // Format Header
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '0088FF' }
        };

        // 4. Đổ dữ liệu vào hàng
        incidents.forEach(inc => {
            worksheet.addRow({
                code: inc.code,
                title: inc.title,
                type: inc.type,
                severity: inc.severity,
                status: inc.status,
                address: inc.location?.address || 'N/A',
                reporter: inc.reportedBy?.name || 'N/A',
                team: inc.assignedTeam?.name || 'Chưa gán',
                createdAt: inc.createdAt.toLocaleString('vi-VN'),
            });
        });

        // 5. Lưu file vật lý
        const fileName = `Bao_cao_Su_Co_${Date.now()}.xlsx`;
        const dir = path.join(__dirname, '../../uploads/reports');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        const filePath = path.join(dir, fileName);
        await workbook.xlsx.writeFile(filePath);

        // 6. Lưu vào lịch sử Report
        const stats = fs.statSync(filePath);
        const newReport = await Report.create({
            reportId: `REP-${Date.now().toString().slice(-6)}`,
            name: fileName,
            type: 'Sự cố',
            size: `${(stats.size / 1024).toFixed(1)} KB`,
            url: `/uploads/reports/${fileName}`,
            createdBy: req.user._id
        });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, newReport);
    } catch (err) {
        next(err);
    }
};

exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await Report.find().populate('createdBy', 'name').sort('-createdAt');
        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, reports);
    } catch (err) {
        next(err);
    }
};

// 🔥 HÀM MỚI: XÓA BÁO CÁO
exports.deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Tìm báo cáo trong DB
        const report = await Report.findById(id);
        if (!report) {
            return next(new AppError(404, 'Không tìm thấy báo cáo này.'));
        }

        // Xóa file vật lý trong thư mục uploads
        const filePath = path.join(__dirname, '../../', report.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Xóa record trong DB
        await Report.findByIdAndDelete(id);

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, { message: 'Đã xóa báo cáo' });
    } catch (err) {
        next(err);
    }
};

exports.getHeatmapData = async (req, res, next) => {
    try {
        const { days, type } = req.query;
        
        // 1. Build Filter
        let filter = { status: { $ne: INCIDENT_STATUS.CANCELLED } }; // Bỏ qua báo cáo rác
        
        if (days) {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - parseInt(days));
            filter.createdAt = { $gte: pastDate };
        }
        if (type) filter.type = type;

        // 2. Query dữ liệu
        const incidents = await Incident.find(filter).select('location severity type');

        // 3. Quy đổi Mức độ nghiêm trọng thành Trọng số nhiệt (Intensity)
        const intensityMap = {
            'LOW': 0.3,
            'MEDIUM': 0.6,
            'HIGH': 0.8,
            'CRITICAL': 1.0
        };

        // 4. Format chuẩn cho leaflet.heat: [lat, lng, intensity]
        const heatmapData = incidents.map(inc => {
            const [lng, lat] = inc.location.coordinates;
            const intensity = intensityMap[inc.severity] || 0.5;
            return [lat, lng, intensity];
        });

        return sendSuccess(res, SuccessCodes.DEFAULT_SUCCESS, heatmapData);
    } catch (err) {
        next(err);
    }
};