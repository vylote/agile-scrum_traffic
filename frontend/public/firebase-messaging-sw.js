importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyD61euRhXy2EW0COo9M869IeyeGt-n0Axo",
    authDomain: "incident-management-e0ec1.firebaseapp.com",
    projectId: "incident-management-e0ec1",
    storageBucket: "incident-management-e0ec1.firebasestorage.app",
    messagingSenderId: "937030266561",
    appId: "1:937030266561:web:01ea6bd694f257271d2e40",
    measurementId: "G-8BFJEJNGTE"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

/**
 * 3. Xử lý nhận tin nhắn khi App đang chạy ngầm (Background)
 * Payload này chính là dữ liệu mà hàm sendPushNotification từ Backend gửi qua
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Nhận thông báo chạy ngầm:', payload);

    const notificationTitle = payload.notification.title || "Cứu hộ Khẩn cấp";
    const notificationOptions = {
        body: payload.notification.body || "Bạn có cập nhật mới về sự cố.",
        icon: '/logo192.png',      // Đường dẫn ảnh icon (nằm trong public)
        badge: '/favicon.ico',    // Icon nhỏ hiện trên thanh trạng thái Android
        tag: 'incident-alert',    // Các thông báo cùng tag sẽ ghi đè nhau, tránh làm phiền
        data: payload.data,       // Chứa incidentId, trackingCode...
        vibrate: [200, 100, 200], // Rung máy (chỉ Android)
        actions: [                // Nút bấm nhanh trên thông báo
            { action: 'open_url', title: 'Xem chi tiết' }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * 4. Xử lý khi người dùng nhấn vào Thông báo
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Đóng thông báo ngay sau khi click

    // Lấy dữ liệu đính kèm (Ví dụ mã tracking hoặc ID vụ việc)
    const data = event.notification.data;
    let targetUrl = '/';

    if (data.type === 'RESCUE_ASSIGNMENT' || data.type === 'BROADCAST') {
        targetUrl = '/rescue/home'; // Cứu hộ thì về màn hình trực đơn
    } else if (data.trackingCode) {
        targetUrl = `/track/${data.trackingCode}`; // Người dân thì vào trang theo dõi
    }

    // Logic: Nếu đang có tab app mở thì focus vào, nếu không thì mở tab mới
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});