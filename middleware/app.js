const {logger} = require('../config/logger');

exports.redirectUnauthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    logger.error(`user not authenticated`);
    res.redirect('/login');
}

exports.redirectAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        logger.warn("user is allready authenticated");
        return res.redirect('/');
    }
    next();
}

exports.ensureServerSelected = (req, res, next) => {
    const serverId = req.session.serverId;
    logger.silly(`selected server id: ${serverId}`);
    if (serverId === undefined) {
        logger.error(`server id is undefined`);
        return res.redirect('/select');
    }
    next();
}