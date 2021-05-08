const bcrypt = require('bcrypt');
const {logger} = require('../config/logger');

exports.passwordHash = async (password) => {
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                logger.error(`gen salt error ${JSON.stringify(err)}`);
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    logger.error(`hash error ${JSON.stringify(err)}`);
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
    return hashedPassword;
}