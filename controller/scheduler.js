const {
    Device
} = require('../model/device');
const {
    Extra
} = require('../model/extra');
const {Server} = require('../model/server');
const {
    Op
} = require("sequelize");
const { logger } = require('../config/logger');

exports.radar = async (req, res) => {
    const devices = await Device.findAll();
    const radarTelegramReport = await Extra.findOne({
        where: {
            key: 'radarTelegramReport'
        },
        raw: true
    });
    res.render('scheduler/radar', {
        devices: devices,
        radarTelegramReport: radarTelegramReport
    });
}

exports.configureRadar = async (req, res) => {
    await Device.update({
        visible: true
    }, {
        where: {
            visible: false
        }
    });
    await Device.update({
        visible: false
    }, {
        where: {
            id: {
                [Op.in]: req.body.invisible
            }
        }
    });
    await Extra.update({
        value: req.body['radar-telegram-report'] ? 1 : 0
    }, {
        where: {
            key: 'radarTelegramReport'
        }
    })
    res.redirect('/scheduler/radar');
}

exports.runRadar = async (req, res) => {
    const monitor = require('../util/dnms/monitor');
    const servers = await Server.findAll({
        where: {
            enabled: true
        }
    });
    const radarTelegramReport = await Extra.findOne({
        where: {
            key: 'radarTelegramReport'
        },
        raw: true
    });
    let totalOffline = 0;
    let message = 'OFFLINE REPORT %0A';
    for (const server of servers) {
        const devices = await Device.findAll({
            where: {
                serverId: server.id,
                visible: true
            },
            raw: true
        });
        const offlineDevice = await monitor.offlineScanner(null, {
            devices: devices,
            return: true,
            count: 1
        });
        totalOffline += offlineDevice.length;
        if (offlineDevice.length > 0) {
            message += `%0A ${server.name} - ${server.comment}: %0A`
            for (let i = 0; i < offlineDevice.length; i++) {
                message += `${i + 1}. ${offlineDevice[i].name} %0A`;
            }
        }
    }

    if (totalOffline > 0 && radarTelegramReport.value === '1') {
        const https = require('https');
        const options = new URL(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHATID}&text=${message}`);

        const request = https.get(options, (response) => {
            logger.silly('send webhook telegram success');
        });
        request.on('error', (e) => {
            logger.error(`error send webhook ${JSON.stringify(e)}`);
        })
    }

    res.jsend.success(true);
}