const User = require('../models/User');
const bcrypt = require('bcrypt');
const {USER_ROLES} = require('../utils/constants/userConstants')

const initApp = async (req, res,next) => {
    try {
        const adminExists = await User.findOne({ role: USER_ROLES.ADMIN });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            await User.create({
                name: 'SA',
                username: 'admin', 
                passwordHash: hashedPassword,
                phone: '0000000000',
                email: 'admin@gmai.com',
                role: USER_ROLES.ADMIN,
            });

            console.log('[WARNING] Default Admin created! (Username: admin / Pass: admin). Please change it!');
        } else {
            console.log('Admin account already exists.');
        }

    } catch (err) {
        console.error('Error during application initialization:', err);
    }
};

module.exports = initApp;