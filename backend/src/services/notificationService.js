const admin = require("../config/firebase");
const User = require("../models/User");

/**
 * Hàm hỗ trợ chuẩn hóa tên Topic (Xóa dấu, thay khoảng trắng bằng gạch dưới)
 * Ví dụ: "Sóc Sơn" -> "Soc_Son"
 */
const folderFriendlyTopic = (topicName) => {
  return topicName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
};

/**
 * 1. Gửi tới 1 Token cụ thể (Giao việc đích danh)
 */
exports.sendPushNotification = async (fcmToken, title, body, payload = {}) => {
  if (!fcmToken) return null;

  const stringPayload = Object.fromEntries(
    Object.entries(payload).map(([key, val]) => [key, String(val)])
  );

  const message = {
    notification: { title, body },
    data: stringPayload,
    token: fcmToken,
    android: { priority: "high" },
    webpush: {
      fcm_options: {
        link: payload.incidentId ? `http://localhost:5173/incidents/${payload.incidentId}` : "http://localhost:5173/dashboard"
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(error.code)) {
      await User.findOneAndUpdate({ fcmToken }, { $unset: { fcmToken: "" } });
    }
    return null;
  }
};

/**
 * 2. 🔥 HÀM MỚI: Phát loa theo Topic (Dành cho SOS/Broadcast vùng)
 */
exports.sendPushNotificationToTopic = async (topicName, title, body, payload = {}) => {
  const safeTopic = folderFriendlyTopic(topicName);
  
  const stringPayload = Object.fromEntries(
    Object.entries(payload).map(([key, val]) => [key, String(val)])
  );

  const message = {
    notification: { title, body },
    data: stringPayload,
    topic: safeTopic, // Gửi theo chủ đề
    webpush: {
      fcm_options: {
        link: payload.incidentId ? `http://localhost:5173/incidents/${payload.incidentId}` : "http://localhost:5173/dashboard"
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`📢 Đã phát loa tới vùng: ${safeTopic}`);
    return response;
  } catch (error) {
    console.error("❌ Lỗi phát loa FCM:", error);
    return null;
  }
};

/**
 * US-12: Thông báo trạng thái cho Người dân
 */
exports.notifyCitizenStatus = async (user, incident, statusLabel) => {
  const title = "🚑 Cập nhật cứu hộ";
  const body = `Sự cố [${incident.code}] của bạn: ${statusLabel}`;
  
  return this.sendPushNotification(user.fcmToken, title, body, {
    incidentId: incident._id.toString(),
    type: "CITIZEN_UPDATE"
  });
};

/**
 * US-04: Lệnh điều động đích danh cho Đội cứu hộ
 */
exports.notifyRescueAssignment = async (teamLeader, incident) => {
  if (!teamLeader?.fcmToken) return;
  
  const title = "🚨 LỆNH ĐIỀU ĐỘNG MỚI";
  const body = `Đội của bạn vừa được gán vụ: ${incident.title}. Kiểm tra ngay!`;
  
  return this.sendPushNotification(teamLeader.fcmToken, title, body, {
    incidentId: incident._id.toString(),
    type: "RESCUE_ASSIGNMENT"
  });
};