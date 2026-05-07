const Incident = require('../models/Incident');
const RescueTeam = require('../models/RescueTeam');
const { INCIDENT_STATUS } = require('../utils/constants/incidentConstants');
const { sendSuccess } = require('../utils/response');
const SuccessCodes = require('../utils/constants/successCodes');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const { timeRange = 'week' } = req.query; // week | month | year
        const now = new Date();
        
        // Mốc thời gian
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const startOfThisYear = new Date(now.getFullYear(), 0, 1);

        // ==========================================
        // 1. TÍNH TOÁN KPI VÀ SỰ THAY ĐỔI (Tháng này vs Tháng trước)
        // ==========================================
        
        // A. Tổng sự cố
        const totalIncidentsMonth = await Incident.countDocuments({ createdAt: { $gte: startOfThisMonth } });
        const totalIncidentsLastMonth = await Incident.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
        const incidentChangeVal = totalIncidentsLastMonth === 0 ? (totalIncidentsMonth > 0 ? 100 : 0) : ((totalIncidentsMonth - totalIncidentsLastMonth) / totalIncidentsLastMonth) * 100;
        
        // B. Thời gian phản hồi
        const getAvgTime = async (start, end) => {
            const query = { status: { $ne: INCIDENT_STATUS.PENDING }, createdAt: { $gte: start } };
            if (end) query.createdAt.$lte = end;
            const stats = await Incident.aggregate([
                { $match: query },
                { $project: { responseTime: { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 60000] } } },
                { $group: { _id: null, avgTime: { $avg: "$responseTime" } } }
            ]);
            return stats[0]?.avgTime || 0;
        };
        const avgResponseThisMonth = await getAvgTime(startOfThisMonth);
        const avgResponseLastMonth = await getAvgTime(startOfLastMonth, endOfLastMonth);
        const responseChangeVal = avgResponseThisMonth - avgResponseLastMonth;

        // C. Tỉ lệ hoàn thành
        const getResRate = async (start, end, total) => {
            if (total === 0) return 100;
            const query = { status: INCIDENT_STATUS.COMPLETED, createdAt: { $gte: start } };
            if (end) query.createdAt.$lte = end;
            const resolved = await Incident.countDocuments(query);
            return Math.round((resolved / total) * 100);
        };
        const resRateThisMonth = await getResRate(startOfThisMonth, null, totalIncidentsMonth);
        const resRateLastMonth = await getResRate(startOfLastMonth, endOfLastMonth, totalIncidentsLastMonth);
        const rateChangeVal = resRateThisMonth - resRateLastMonth;

        // D. Đội cứu hộ
        const activeTeams = await RescueTeam.countDocuments({ status: { $ne: 'OFFLINE' } });
        const totalTeams = await RescueTeam.countDocuments();
        const newTeamsThisMonth = await RescueTeam.countDocuments({ createdAt: { $gte: startOfThisMonth } });

        // Đóng gói KPI
        const kpis = {
            totalIncidentsMonth: {
                value: totalIncidentsMonth.toLocaleString(),
                change: `${incidentChangeVal > 0 ? '+' : ''}${incidentChangeVal.toFixed(1)}%`,
                isPositive: incidentChangeVal <= 0 // Ít sự cố hơn là tốt
            },
            avgResponseTime: {
                value: `${avgResponseThisMonth.toFixed(1)}`,
                change: `${responseChangeVal > 0 ? '+' : ''}${responseChangeVal.toFixed(1)} phút`,
                isPositive: responseChangeVal <= 0 // Phản hồi nhanh hơn (giảm) là tốt
            },
            activeTeams: {
                value: `${activeTeams}/${totalTeams}`,
                change: `+${newTeamsThisMonth} đội mới`,
                isPositive: newTeamsThisMonth > 0
            },
            resolutionRate: {
                value: `${resRateThisMonth}%`,
                change: `${rateChangeVal > 0 ? '+' : ''}${rateChangeVal}%`,
                isPositive: rateChangeVal >= 0 // Tỉ lệ hoàn thành tăng là tốt
            }
        };

        // ==========================================
        // 2. BIỂU ĐỒ THEO TIME RANGE (Tuần / Tháng / Năm)
        // ==========================================
        let startDate, groupByFormat, mapDataFunc;

        if (timeRange === 'year') {
            startDate = startOfThisYear;
            groupByFormat = "%Y-%m"; // Gom theo tháng
            mapDataFunc = (item) => ({ day: `Tháng ${item._id.split('-')[1]}`, count: item.count });
        } else if (timeRange === 'month') {
            startDate = startOfThisMonth;
            groupByFormat = "%Y-%m-%d"; // Gom theo ngày
            mapDataFunc = (item) => {
                const dateParts = item._id.split('-');
                return { day: `${dateParts[2]}/${dateParts[1]}`, count: item.count };
            };
        } else { // week
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            groupByFormat = "%Y-%m-%d";
            const daysMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
            mapDataFunc = (item) => ({ day: daysMap[new Date(item._id).getDay()], count: item.count });
        }

        const dailyStatsRaw = await Incident.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt", timezone: "+07:00" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const dailyStats = dailyStatsRaw.map(mapDataFunc);

        // ==========================================
        // 3. ĐIỂM NÓNG
        // ==========================================
        const hotspots = await Incident.aggregate([
            { $match: { createdAt: { $gte: startDate } } }, // Điểm nóng cũng lọc theo timeRange
            { $group: { _id: "$zone", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const realData = {
            kpis,
            dailyStats,
            hotspots: hotspots.map(h => ({ name: h._id || "Ngoại thành", count: h.count }))
        };

        return sendSuccess(res, SuccessCodes.GET_DASHBOARD_STATS_SUCCESS, realData);
    } catch (err) { next(err); }
};