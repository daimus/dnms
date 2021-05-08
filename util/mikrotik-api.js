const RosApi = require('node-routeros').RouterOSAPI;
const {logger} = require('../config/logger');

exports.createConnection = (host) => {
    const connection = new RosApi(host);
    return connection;
}

exports.write = async (connection, command) => {
    return new Promise ((resolve, reject) => {
        connection.write(...command).then((data) => {
            resolve(data);
        }).catch(err => {
            logger.error(`snmp error ${JSON.stringify(err)}`);
            reject(err);
        })
    });
}

exports.ping = async (conn, payload, cb) => {
    const connection = new RosApi(conn);
    connection.connect().then(() => {
        let i = 0;
        const addressStream = connection.stream(['/ping', '=address='+payload.host], (error, packet) => {
            if (!error) {
                i++;
                if (i === parseInt(payload.count)) {
                    addressStream.stop().then(() => {
                        connection.close();
                    }).catch((err) => {
                        logger.error(`mikrotik stream error ${JSON.stringify(err)}`);
                        cb(err.toString());
                    });
                }
            } else {
                logger.error(`stream error ${JSON.stringify(error)}`);
                cb(error);
            }
            cb(false, packet);
        });
    }).catch(error => {
        logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
        cb(`${error.name}: ${error.message}`);
    });
}