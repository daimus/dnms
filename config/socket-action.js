// const test = require('../util/test');
const tool = require('../util/dnms/tool');
const monitor = require('../util/dnms/monitor');

const types = {
    PING: 'PING'
}

exports.init = ((socket) => {
    socket.on(types.PING, (payload) => {
        tool.ping(socket, payload);
    });
    socket.on('LOG', () => {
        tool.log(socket);
    });
    socket.on('PING_SERVER', (payload) => {
        monitor.server(socket, payload);
    });
    socket.on('MONITOR_DEVICE', (payload) => {
        monitor.device(socket, payload);
    });
    socket.on('DASHBOARD', (payload) => {
        monitor.dashboard(socket, payload);
    });
    socket.on('OFFLINE_SCANNER', (payload = {
        count: 1
    }) => {
        monitor.offlineScanner(socket, payload);
    });
    socket.on('TRAFFIC', (payload) => {
        monitor.traffic(socket, payload);
    });
    socket.on('REGISTRATION_TABLE', (payload) => {
        monitor.registrationTable(socket, payload);
    })
});