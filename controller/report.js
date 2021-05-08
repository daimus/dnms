const mikrotikApi = require("../util/mikrotik-api");
const {
  Server
} = require("../model/server");
const {
  logger
} = require('../config/logger');

exports.statistic = async (req, res) => {
  const serverId = req.session.serverId;
  let usageStat = {};
  const server = await Server.findOne({
    where: {
      id: serverId,
    },
  });
  const conn = {
    host: server.connectTo,
    user: server.username,
    password: server.password,
    keepalive: true,
  };
  const connection = mikrotikApi.createConnection(conn);
  await connection.connect().then(async () => {
    const queues = await mikrotikApi.write(connection, [
      "/queue/simple/print",
    ]);
    connection.close();
    let data = Array();
    queues.map((queue) => {
      if (!queue["name"].includes("X_") && !queue["name"].includes("hs-")) {
        const maxLimit = queue["max-limit"].split("/");
        const bytes = queue["bytes"].split("/");
        data.push({
          name: queue["name"],
          target: queue["target"],
          maxTxLimit: parseInt(maxLimit[0]),
          maxRxLimit: parseInt(maxLimit[1]),
          txBytes: parseInt(bytes[0]),
          rxBytes: parseInt(bytes[1]),
          totalBytes: parseInt(bytes[0]) + parseInt(bytes[1]),
        });
      }

      data.sort(function (a, b) {
        return b.totalBytes - a.totalBytes;
      });
    });
    usageStat = data;
  }).catch((error) => {
    logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
    req.flash('alert', {
      title: 'Server Unreachable!',
      message: '',
      status: 'error'
    });
  });
  res.render("report/statistic", {
    usageStat: usageStat,
    server: server,
    alert: req.flash('alert')
  });
};