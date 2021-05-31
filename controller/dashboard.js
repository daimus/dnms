const {logger} = require('../config/logger');
const {
    Server
} = require('../model/server');
const mikrotikApi = require('../util/mikrotik-api');

exports.index = async (req, res) => {
    const server = await Server.findOne({
        where: {
            id: req.session.serverId
        },
        raw: true
    });
    let interfaces = Array();
    const conn = {
        host: server.connectTo,
        user: server.username,
        password: server.password,
        port: server.apiPort
    };
    console.log('conn :>> ', conn);
    const connection = mikrotikApi.createConnection(conn);
    await connection.connect().then(async () => {
        interfaces = await mikrotikApi.write(connection, ['/interface/print']);
        connection.close();
    }).catch((err) => {
        logger.error(`mikrotik connection error ${JSON.stringify(err)}`);
        req.flash('alert', {
            title: 'Server Unreachable!',
            status: 'error',
            message: '',
        });
    });
    res.render('dashboard', {
        server: server,
        interfaces: interfaces,
        alert: req.flash('alert')
    });
}

exports.selectServer = async (req, res) => {
    let action = 'NOTHING';
    const servers = await Server.findAll();
    let serverCount = servers.length;
    let enabledServerCount = 0;
    servers.map(server => {
        if (server.enabled) enabledServerCount++;
    });
    if (servers.length == 1 && enabledServerCount == 1) {
        req.session.serverId = servers[0].id;
        return res.redirect('/');
    }
    if (serverCount == 0) {
        action = 'CREATE';
    }
    if (serverCount > 1 && enabledServerCount == 0) {
        action = 'ENABLE';
    }
    if (serverCount > 1 && enabledServerCount > 1) {
        action = 'SELECT';
    }
    res.render('select-server', {
        servers: servers,
        action: action
    });
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}