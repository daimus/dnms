const {
    Server
} = require('../model/server');
const {
    Device
} = require('../model/device');
const {
    Subnetwork
} = require('../model/subnetwork');
const {
    Op
} = require('sequelize');

exports.server = async (req, res) => {
    const servers = await Server.findAll();
    res.render('monitor/server', {
        servers: servers
    });
}

exports.device = async (req, res) => {
    const serverId = req.session.serverId;
    const subnetworks = await Subnetwork.findAll({
        where: {
            enabled: true,
            serverId: serverId
        }
    });
    let deviceList = [];
    if (parseInt(req.query.subnetwork) > 0) {
        subnetworks.map(sn => {
            if (sn.id == parseInt(req.query.subnetwork)) {
                deviceList = JSON.parse(sn.deviceId);
            }
        })
    }
    let filter = {
        where: {
            serverId: serverId
        }
    };
    if (deviceList.length > 0) {
        filter = {
            where: {
                id: {
                    [Op.or]: deviceList
                },
                serverId: serverId
            }
        }
    }
    const devices = await Device.findAll(filter);
    res.render('monitor/device', {
        subnetworks: subnetworks,
        devices: devices
    });
}

exports.detail = async (req, res) => {
    const snmp = require('../util/snmp');
    const device = await Device.findOne({
        raw: true,
        where: {
            id: req.params.deviceId
        }
    });
    let wireless = {};
    if (device.wireless) {
        wireless = await snmp.getSections(['ssid', 'mode', 'frequency'], {
            id: device.id,
            host: device.connectTo,
            os: device.os,
            community: device.snmpCommunity,
            wireless: device.wireless
        }).catch(error => {
            logger.error(`snmp error ${JSON.stringify(error)}`);
        });
    }
    res.render('monitor/detail', {
        device: device,
        wireless: wireless
    });
}

exports.diagram = async (req, res) => {
    const serverId = req.session.serverId;
    const subnetworks = await Subnetwork.findAll({
        where: {
            enabled: true,
            serverId: serverId
        }
    });
    let deviceList = [];
    if (parseInt(req.query.subnetwork) > 0) {
        subnetworks.map(sn => {
            if (sn.id == parseInt(req.query.subnetwork)) {
                deviceList = JSON.parse(sn.deviceId);
            }
        })
    }
    let filter = {
        where: {
            serverId: serverId
        }
    };
    if (deviceList.length > 0) {
        filter = {
            where: {
                id: {
                    [Op.or]: deviceList
                },
                serverId: serverId
            }
        }
    }
    const devices = await Device.findAll(filter);
    res.render('monitor/diagram', {
        subnetworks: subnetworks,
        devices: devices
    });
}

exports.map = async (req, res) => {
    const serverId = req.session.serverId;
    const devices = await Device.findAll({
        where: {
            serverId: serverId
        }
    });
    const server = await Server.findByPk(serverId);
    res.render('monitor/map', {
        server: server,
        devices: devices,
        mapbox_token: process.env.MAPBOX_TOKEN
    });
}

exports.scanner = async (req, res) => {
    res.render('monitor/scanner');
}