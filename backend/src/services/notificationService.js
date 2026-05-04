const admin = require("../config/firebase");
const User = require("../models/User");

const folderFriendlyTopic = (topicName) => {
  return topicName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
};

exports.sendPushNotification = async (fcmToken, title, body, payload = {}) => {
  if (!fcmToken) return null;

  const stringPayload = {
    title: String(title),
    body: String(body),
    targetUrl: payload.type === 'CITIZEN_UPDATE' 
        ? '/citizen/dashboard' 
        : '/rescue/dashboard',
    ...Object.fromEntries(Object.entries(payload).map(([key, val]) => [key, String(val)]))
  };

  const message = {
    data: stringPayload,
    token: fcmToken,
    android: { priority: "HIGH" }
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

exports.sendPushNotificationToTopic = async (topicName, title, body, payload = {}) => {
  const safeTopic = folderFriendlyTopic(topicName);
  
  const stringPayload = {
    title: String(title),
    body: String(body),
    targetUrl: `/rescue/dashboard`,
    ...Object.fromEntries(Object.entries(payload).map(([key, val]) => [key, String(val)]))
  };

  const message = {
    data: stringPayload,
    topic: safeTopic, // Gửi theo chủ đề
    android: { priority: "HIGH" }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(`Đã phát loa tới vùng: ${safeTopic}`);
    return response;
  } catch (error) {
    console.error("Lỗi phát loa FCM:", error);
    return null;
  }
};

exports.notifyCitizenStatus = async (user, incident, statusLabel) => {
  const title = "Cập nhật cứu hộ";
  const body = `Sự cố [${incident.code}] của bạn: ${statusLabel}`;
  
  return this.sendPushNotification(user.fcmToken, title, body, {
    incidentId: incident._id.toString(),
    type: "CITIZEN_UPDATE"
  });
};

exports.notifyRescueAssignment = async (teamLeader, incident) => {
  const title = "LỆNH ĐIỀU ĐỘNG MỚI";
  const body = `Đội của bạn vừa được gán vụ: ${incident.title}. Kiểm tra ngay!`;
  
  return this.sendPushNotification(teamLeader.fcmToken, title, body, {
    incidentId: incident._id.toString(),
    type: "RESCUE_ASSIGNMENT"
  });
};