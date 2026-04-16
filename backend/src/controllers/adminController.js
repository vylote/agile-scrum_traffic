const Incident = require('../models/Incident');
const RescueTeam = require('../models/RescueTeam');
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');
const { sendSuccess } = require('../utils/response');
const SuccessCodes = require('../utils/constants/successCodes');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Thống kê KPI
        const totalIncidentsMonth = await Incident.countDocuments({ createdAt: { $gte: startOfMonth } });
        const activeTeams = await RescueTeam.countDocuments({ status: { $ne: 'OFFLINE' } });
        const totalTeams = await RescueTeam.countDocuments();

        // 2. Tần suất sự cố 7 ngày gần nhất (Dữ liệu cho biểu đồ cột)
        const dailyStatsRaw = await Incident.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Map lại format cho Frontend dễ vẽ (Ví dụ: 2024-06-01 -> T2)
        const daysMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const dailyStats = dailyStatsRaw.map(item => ({
            day: daysMap[new Date(item._id).getDay()],
            count: item.count
        }));

        // 3. Điểm nóng sự cố (Hotspots) theo Zone
        const hotspots = await Incident.aggregate([
            { $group: { _id: "$zone", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 4. Tính thời gian phản hồi trung bình (phút)
        const responseStats = await Incident.aggregate([
            { $match: { status: { $ne: 'PENDING' }, createdAt: { $gte: startOfMonth } } },
            {
                $project: {
                    responseTime: { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 60000] }
                }
            },
            { $group: { _id: null, avgTime: { $avg: "$responseTime" } } }
        ]);

        const realData = {
            kpis: {
                totalIncidentsMonth: totalIncidentsMonth.toLocaleString(),
                activeTeams: `${activeTeams}/${totalTeams}`,
                avgResponseTime: (responseStats[0]?.avgTime || 0).toFixed(1),
                satisfaction: "4.8/5.0" // Tạm thời để tĩnh nếu chưa có bảng Feedback
            },
            dailyStats,
            hotspots: hotspots.map(h => ({
                name: h._id || "Ngoại thành",
                count: h.count
            }))
        };

        return sendSuccess(res, SuccessCodes.GET_DASHBOARD_STATS_SUCCESS, realData);
    } catch (err) { next(err); }
};