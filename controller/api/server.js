const {
    Server
} = require('../../model/server');
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
    await Server.findAndCountAll({
        where: {
            [Op.or]: [{
                name: {
                    [Op.like]: `%${keyword}%`
                }
            }, {
                comment: {
                    [Op.like]: `%${keyword}%`
                }
            }]
        },
        raw: true,
        ...paging
    }).then(result => {
        const currentServerId = req.session.serverId;
        if (currentServerId !== undefined) {
            result.rows.forEach((value) => {
                if (value.id == currentServerId) {
                    value.selected = true;
                }
            });
        } else {
            result.rows[0].selected = true;
            req.session.serverId = result.rows[0].id;
        }
        res.jsend.success({
            count: result.count,
            rows: result.rows
        })
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
    });
}

exports.selectSite = (req, res) => {
    logger.info(`server changed to ${req.body.serverId}`);
    req.session.serverId = req.body.serverId;
    res.jsend.success(true);
}

exports.create = async (req, res) => {
    const data = req.body;
    data.latitude = parseFloat(req.body.latitude) ? parseFloat(req.body.latitude) : 0;
    data.longitude = parseFloat(req.body.longitude) ? parseFloat(req.body.longitude) : 0,
    await Server.create(data).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}

exports.update = async (req, res) => {
    const data = req.body;
    data.latitude = parseFloat(req.body.latitude) ? parseFloat(req.body.latitude) : 0;
    data.longitude = parseFloat(req.body.longitude) ? parseFloat(req.body.longitude) : 0,
    await Server.update(data, {
        where: {
            id: req.params.serverId
        }
    }).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}

exports.destroy = async (req, res) => {
    await Server.destroy({
        where: {
            id: req.params.serverId
        }
    }).then(result => {
        res.jsend.success(result);
    }).catch(error => {
        logger.error(`error query ${JSON.stringify(error)}`);
        res.jsend.fail(error);
    });
}