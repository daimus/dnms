const {Server} = require("../../model/server");
const mikrotikApi = require("../mikrotik-api");
const {logger} = require('../../config/logger');

exports.ping = async (socket, payload) => {
  const serverId = socket.handshake.session.serverId;
  const server = await Server.findOne({where: {id: serverId}});
  const conn = {
    host: server.connectTo,
    user: server.username,
    password: server.password,
  };
  const cb = (error, data) => {
    if (error) {
      logger.error(`cb error ${JSON.stringify(error)}`);
      return socket.emit("ALERT", {status: "fail", message: error});
    }
    socket.emit("PING", data);
  };
  mikrotikApi.ping(conn, payload, cb);
};

exports.log = async (socket) => {
  const serverId = socket.handshake.session.serverId;
  const server = await Server.findOne({where: {id: serverId}});
  const conn = {
    host: server.connectTo,
    user: server.username,
    password: server.password,
  };
  const connection = mikrotikApi.createConnection(conn);
  connection.connect().then(async () => {
    const logs = await mikrotikApi.write(connection, ['/log/print']);
    socket.emit('LOG', {logs: logs});
    connection.close();
  }).catch(error => {
    return socket.emit("ALERT", {
        status: "error",
        message: "Error Connection: " + error.toString(),
      });
  })
};
