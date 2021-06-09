const express = require('express');
const router = express.Router();

const {
    redirectUnauthenticated,
    redirectAuthenticated,
    ensureServerSelected
} = require('./middleware/app');

const dashboard = require('./controller/dashboard');
const manage = require('./controller/manage');
const authentication = require('./controller/authentication');
const tool = require('./controller/tool');
const monitor = require('./controller/monitor');
const report = require('./controller/report');
const setting = require('./controller/setting');
const scheduler = require('./controller/scheduler');

// API CONTROLLER 
const server = require('./controller/api/server');
const device = require('./controller/api/device');
const subnetwork = require('./controller/api/subnetwok');
const user = require('./controller/api/user');

let routes = (app) => {
    // AUTHENTICATION
    router.get('/login', redirectAuthenticated, authentication.login);
    router.post('/login', redirectAuthenticated, authentication.signin);
    router.get('/logout', authentication.logout);


    const RAS = [redirectUnauthenticated, ensureServerSelected];
    // MANAGE
    router.get('/', RAS, dashboard.index);
    router.get('/select', dashboard.selectServer);
    router.get('/manage/server', RAS, manage.server);
    router.get('/manage/device', RAS, manage.device);
    router.get('/manage/subnetwork', RAS, manage.subnetwork);

    // MONITOR
    router.get('/monitor/server', RAS, monitor.server);
    router.get('/monitor/device', RAS, monitor.device);
    router.get('/monitor/device/:deviceId', RAS, monitor.detail);
    router.get('/monitor/diagram', RAS, monitor.diagram);
    router.get('/monitor/scanner', RAS, monitor.scanner);
    router.get('/monitor/map', RAS, monitor.map);

    // REPORT 
    router.get('/report/statistic', RAS, report.statistic);

    // TOOL
    router.get('/tool/ping', RAS, tool.ping);
    router.get('/tool/log', RAS, tool.log);
    router.get('/tool/arp', RAS, tool.arp);
    router.get('/tool/neighbor', RAS, tool.neighbor);
    router.get('/tool/lease', RAS, tool.lease);
    router.get('/tool/host', RAS, tool.host);
    
    // SETTING
    router.get('/setting/user', RAS, setting.user);
    
    // CRON / SCHEDULER
    router.get('/scheduler/radar', RAS, scheduler.radar);
    router.patch('/scheduler/radar/configure', RAS, scheduler.configureRadar);
    router.get('/scheduler/radar/run', scheduler.runRadar);

    // API ROUTES 
    router.get('/api/server', RAS, server.get);
    router.post('/api/server/selectSite', server.selectSite);
    router.post('/api/server/create', redirectUnauthenticated, server.create);
    router.patch('/api/server/:serverId', RAS, server.update);
    router.delete('/api/server/:serverId', RAS, server.destroy);

    router.get('/api/device', RAS, device.get);
    router.post('/api/device/create', RAS, device.create);
    router.patch('/api/device/:deviceId', RAS, device.update);
    router.delete('/api/device/:deviceId', RAS, device.destroy);

    router.get('/api/subnetwork', RAS, subnetwork.get);
    router.post('/api/subnetwork/create', RAS, subnetwork.create);
    router.patch('/api/subnetwork/:subnetworkId', RAS, subnetwork.update);
    router.delete('/api/subnetwork/:subnetworkId', RAS, subnetwork.destroy);

    router.patch('/api/user/:userId', RAS, user.update);

    app.use(router);
}

module.exports = routes;