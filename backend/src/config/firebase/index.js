const admin = require("firebase-admin");
require('dotenv').config();

let credential;

if (process.env.NODE_ENV === 'production') {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.error("LỖI: Thiếu biến môi trường FIREBASE_SERVICE_ACCOUNT");
    } else {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            // Sửa lỗi format key cực kỳ quan trọng
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            credential = admin.credential.cert(serviceAccount);
        } catch (e) {
            console.error("LỖI: JSON Firebase không hợp lệ!");
        }
    }
} else {
    const serviceAccount = require('./firebase-service-account.json');
    credential = admin.credential.cert(serviceAccount);
}

if (credential && !admin.apps.length) {
    admin.initializeApp({ credential });
    console.log("Firebase Admin: Kết nối thành công!");
}

module.exports = admin;