const {
    Device
} = require('../../model/device');
const {
    Op
} = require('sequelize');
const { logger } = require('../../config/logger');

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
    await Device.findAndCountAll({
        where: {
            [Op.or]: [{
                name: {
                    [Op.like]: `%${keyword}%`
                }
            }, {
                comment: {
                    [Op.like]: `%${keyword}%`
                }
            }],
            serverId: req.session.serverId
        },
        ...paging
    }).then(result => {
        res.jsend.success({
            count: result.count,
            rows: result.rows
        })
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
    });
}

exports.create = async (req, res) => {
    const data = req.body
    data.latitude = parseFloat(req.body.latitude) ? parseFloat(req.body.latitude) : 0;
    data.longitude = parseFloat(req.body.longitude) ? parseFloat(req.body.longitude) : 0;
    data.wireless = req.body.wireless ? true : false;
    await Device.create(data).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}

exports.update = async (req, res) => {
    const data = req.body
    data.latitude = parseFloat(req.body.latitude) ? parseFloat(req.body.latitude) : 0;
    data.longitude = parseFloat(req.body.longitude) ? parseFloat(req.body.longitude) : 0;
    data.wireless = req.body.wireless ? true : false;
    await Device.update(data, {
        where: {
            id: req.params.deviceId
        }
    }).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}

exports.destroy = async (req, res) => {
    await Device.destroy({
        where: {
            id: req.params.deviceId
        }
    }).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}