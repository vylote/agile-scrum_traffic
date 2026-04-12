import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig"; 
import api from "./api"; 

export const setupFCM = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Người dùng từ chối nhận thông báo.");
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: "BNUEzQfPDthf_0JTbTWDbayvN5EFJOmldjRuljrb2a3baoXK1rjaE-X0gp59m7s7Ll6d62KEzf2LxQFbVwvmZiI",
      serviceWorkerRegistration: registration, 
    });

    if (token) {
      console.log("FCM Token:", token);
      
      await api.patch('/users/fcm-token', { fcmToken: token });
      console.log("Token đã được lưu vào hệ thống.");
      return token;
    }
  } catch (error) {
    console.error("Lỗi setup FCM:", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Nhận thông báo mới:", payload);
      resolve(payload);
    });
  });