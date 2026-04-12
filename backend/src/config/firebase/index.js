const admin = require("firebase-admin");

require('dotenv').config();

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});
console.log("Firebase Admin: Đã kết nối thành công!");

module.exports = admin;