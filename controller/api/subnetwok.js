const {
    Subnetwork
} = require('../../model/subnetwork');
const {
    Device
} = require('../../model/device');
const {
    Op
} = require('sequelize');
const {logger} = require('../../config/logger');

exports.get = async (req, res) => {
    let paging = {};
    if (parseInt(req.query.size) > 0) {
        const limit = parseInt(req.query.size);
        const offset = parseInt(req.query.page) ? (parseInt(req.query.page) - 1) * limit : 0;
        paging = {
            offset: offset,
            limit: limit
        }
    }
    const keyword = req.query.keyword ? req.query.keyword : '';
    await Subnetwork.findAndCountAll({
        where: {
            [Op.or]: [{
                name: {
                    [Op.like]: `%${keyword}%`
                }
            }],
            serverId: req.session.serverId
        },
        ...paging
    }).then(async (result) => {
        const count = result.count;
        const rows = result.rows;
        for (const row of rows) {
            row.dataValues.member = await Device.findAll({
                where: {
                    id: {
                        [Op.or]: JSON.parse(row.deviceId)
                    },
                    serverId: req.session.serverId
                }
            });
        }

        res.jsend.success({
            count: count,
            rows: rows
        })
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
    });
}

exports.create = async (req, res) => {
    const data = {
        serverId: req.session.serverId,
        name: req.body.name,
        deviceId: JSON.stringify(req.body.deviceId),
        enabled: req.body.enabled
    }
    await Subnetwork.create(data).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}

exports.update = async (req, res) => {
    const data = {
        serverId: req.session.serverId,
        name: req.body.name,
        deviceId: JSON.stringify(req.body.deviceId),
        enabled: req.body.enabled
    }
    await Subnetwork.update(data, {
        where: {
            id: req.params.subnetworkId
        }
    }).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}

exports.destroy = async (req, res) => {
    await Subnetwork.destroy({
        where: {
            id: req.params.subnetworkId
        }
    }).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}