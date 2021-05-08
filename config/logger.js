const winston = require('winston');
const logConfiguration = {
    level: process.env.APP_ENV !== 'production' ? 'silly' : 'warn',
    'transports': [
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        })
    ],
    format: winston.format.json()
}


const logger = winston.createLogger(logConfiguration);

if (process.env.APP_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

module.exports.logger = logger;