const fs = require('fs').promises;
const path = require('path');
const Incident = require('../models/Incident');

const cleanupOrphanPhotos = async () => {
    try {
        console.log('Đang bắt đầu quét ảnh mồ côi');
        
        const uploadDir = path.join(__dirname, '../../uploads');
        
        const filesOnDisk = await fs.readdir(uploadDir);

        // flatMap giúp biến mảng lồng [[a,b], [c]] thành [a,b,c]
        const incidents = await Incident.find({}, 'photos');
        const photosInDb = incidents.flatMap(incident => incident.photos);

        // Tìm các file có trên đĩa nhưng không có trong DB
        const orphanFiles = filesOnDisk.filter(file => {
            // Chỉ xử lý các file ảnh (tránh xóa các file hệ thống như .gitignore nếu có)
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
            return isImage && !photosInDb.includes(file);
        });

        // Xóa các file mồ côi
        if (orphanFiles.length > 0) {
            console.log(`Tìm thấy ${orphanFiles.length} ảnh rác. Đang tiến hành xóa...`);
            for (const file of orphanFiles) {
                await fs.unlink(path.join(uploadDir, file));
                console.log(`Đã xóa rác: ${file}`);
            }
        } else {
            console.log('Không có ảnh rác nào.');
        }

    } catch (err) {
        console.error('Lỗi trong quá trình dọn dẹp:', err);
    }
};

module.exports = cleanupOrphanPhotos;