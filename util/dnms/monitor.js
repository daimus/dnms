const ping = require("../ping");
const snmp = require("../snmp");
const mikrotikApi = require("../mikrotik-api");
const parseDuration = require('parse-duration');
const {
  logger
} = require('../../config/logger');
const {
  Server
} = require("../../model/server");
const {
  Device
} = require('../../model/device');

module.exports.server = async (socket, payload) => {
  while (socket.connected) {
    for (const server of payload.servers) {
      let pingResult = await ping.ping(server.host);
      socket.emit("PING_SERVER", {
        serverId: server.id,
        host: server.host,
        isAlive: pingResult.alive,
      });
      await sleep(500);
    }
  }
};

module.exports.device = async (socket, payload) => {
  if (payload.device.length <= 0){
    return;
  }
  const serverId = socket.handshake.session.serverId;
  const server = await Server.findOne({
    where: {
      id: serverId,
    },
  });
  const conn = {
    host: server.connectTo,
    user: server.username,
    password: server.password,
    port: server.apiPort,
    keepalive: true,
  };
  const connection = mikrotikApi.createConnection(conn);
  let i = 0;
  connection.connect().then(async () => {
    while (i < 10) {
      i++;
      for (const device of payload.devices) {
        let pingResult = await mikrotikApi.write(connection, [
          "/ping",
          "=address=" + device.host,
          "=count=1",
        ]);

        let trafficResult = {};
        let tempTrafficResult = await mikrotikApi.write(connection, [
          "/queue/simple/print",
          "?target=" + device.host + "/32",
        ]);
        if (tempTrafficResult.length > 0) {
          let rate = tempTrafficResult[0]["rate"].split("/");
          let maxRate = tempTrafficResult[0]["max-limit"].split("/");
          trafficResult.rxRate = bytesToSize(rate[0]);
          trafficResult.txRate = bytesToSize(rate[1]);
          trafficResult.maxRxRate = bytesToSize(maxRate[0]);
          trafficResult.maxTxRate = bytesToSize(maxRate[1]);
        }

        let snmpResult = {};
        if (device.wireless) {
          snmpResult = await snmp.getSections(["radioName", "signalStrength", "mode"], device, {
            retries: 1,
            timeout: 100,
          }).catch((error) => {
            logger.error(`snmp error ${JSON.stringify(error)}`);
            // socket.emit("ALERT", {
            //   status: "error",
            //   message: "SNMP Error: " + error.toString(),
            // });
          });
        }

        socket.emit("MONITOR_DEVICE", {
          ...device,
          isAlive: parseInt(pingResult[0]["received"]) > 0 ? true : false,
          avg: parseInt(pingResult[0]["avg-rtt"]),
          status: pingResult[0]["status"],
          ...snmpResult,
          ...trafficResult,
        });
        // await sleep(500);
      }
      await sleep(1000);
    }
    connection.close();
  }).catch((err) => {
    logger.error(`mikrotik connection error ${JSON.stringify(err)}`);
    return socket.emit("ALERT", {
      status: "error",
      message: "Server unreachable",
    });
  });
};

exports.offlineScanner = async (socket, payload) => {
  if (payload.devices === undefined) {
    payload.devices = await Device.findAll({
      where: {
        serverId: socket.handshake.session.serverId
      }
    })
  }
  if (payload.devices.length === 0){
    if (socket === null){
      return {
        deviceScanned: payload.devices.length,
        offlineDevice: Array(),
      }
    }
    return socket.emit("OFFLINE_SCANNER", {
      deviceScanned: payload.devices.length,
      offlineDevice: Array(),
      done: true
    });
  }
  if (payload.live === undefined) {
    payload.live = false;
  }
  if (payload.return === undefined) {
    payload.return = false;
  }
  let condition = true;
  let i = 1;
  let offlineDevice = Array();
  while (condition) {
    offlineDevice = Array();
    for (const device of payload.devices) {
      let pingResult = await ping.ping(device.connectTo);
      if (!pingResult.alive) {
        if (payload.live === true && payload.return === false) {
          socket.emit("OFFLINE_SCANNER", {
            deviceScanned: payload.devices.length,
            offlineDevice: device
          });
        } else {
          offlineDevice.push(device);
        }
      }
    }
    if (payload.live === false && payload.return === false) {
      socket.emit("OFFLINE_SCANNER", {
        deviceScanned: payload.devices.length,
        offlineDevice: offlineDevice
      });
    }
    // await sleep(3000);
    if (payload.count > 0) {
      i++;
      condition = i <= payload.count;
    } else {
      condition = socket.connected;
    }
  }
  if (payload.return === true) {
    return offlineDevice;
  }
  socket.emit("OFFLINE_SCANNER", {
    deviceScanned: payload.devices.length,
    offlineDevice: offlineDevice,
    done: true
  });
}

exports.dashboard = async (socket, payload) => {
  const serverId = socket.handshake.session.serverId;
  const server = await Server.findOne({
    where: {
      id: serverId,
    },
    raw: true
  });
  const conn = {
    host: server.connectTo,
    user: server.username,
    password: server.password,
    port: server.apiPort,
    keepalive: true,
  };
  const connection = mikrotikApi.createConnection(conn);
  connection.connect().then(async () => {
      let i = 0;
      while (socket.connected) {
        let result = {};
        if (i === 0) {
          const health = await mikrotikApi.write(connection, [
            "/system/health/print",
          ]);
          if (health.length === 1) {
            result.temperature = parseInt(health[0]['temperature']);
            result.voltage = parseInt(health[0]['voltage']);
          }
          const routerboard = await mikrotikApi.write(connection, [
            "/system/routerboard/print",
          ]);
          result.model = routerboard[0]["model"];
        }
        const clock = await mikrotikApi.write(connection, [
          "/system/clock/print",
        ]);
        const resource = await mikrotikApi.write(connection, [
          "/system/resource/print",
        ]);
        const traffic = await mikrotikApi.write(connection, [
          "/interface/monitor-traffic",
          "=interface=" + payload.interface,
          "=once",
        ]);

        result.uptime = parseDuration(resource[0]["uptime"], 's');
        result.version = resource[0]["version"];
        result.usedMemory =
          parseInt(resource[0]["total-memory"]) -
          parseInt(resource[0]["free-memory"]);
        result.totalMemory = parseInt(resource[0]["total-memory"]);
        result.cpuLoad = parseInt(resource[0]["cpu-load"]);
        result.time = clock[0]["time"];
        result.date = clock[0]["date"];
        result.interface = traffic[0]["name"];
        result.rxBitsPerSecond = traffic[0]["rx-bits-per-second"];
        result.txBitsPerSecond = traffic[0]["tx-bits-per-second"];
        socket.emit("DASHBOARD", result);
        await sleep(1000);
        i++;
      }
      connection.close();
    }).catch((error) => {
      logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
    });
};

exports.traffic = async (socket, payload) => {
  const serverId = socket.handshake.session.serverId;
  const server = await Server.findOne({
    where: {
      id: serverId,
    },
  });
  const conn = {
    host: server.connectTo,
    user: server.username,
    password: server.password,
    port: server.apiPort,
    keepalive: true,
  };
  const connection = mikrotikApi.createConnection(conn);
  connection.connect().then(async () => {
    while (socket.connected) {
      let tempTrafficResult = await mikrotikApi.write(connection, [
        "/queue/simple/print",
        "?target=" + payload.host + "/32",
      ]);
      let trafficResult = {};
      if (tempTrafficResult.length > 0) {
        let rate = tempTrafficResult[0]["rate"].split("/");
        let maxRate = tempTrafficResult[0]["max-limit"].split("/");
        trafficResult.rxRate = rate[0];
        trafficResult.txRate = rate[1];
        trafficResult.maxRxRate = maxRate[0];
        trafficResult.maxTxRate = maxRate[1];
      } else {
        break;
      }
      socket.emit("TRAFFIC", {
        ...trafficResult,
      });
      await sleep(1000);
    }
  })
}

exports.registrationTable = async (socket, payload) => {
  let errorCount = 0;
  while (socket.connected) {
    let snmpResult = {};
    snmpResult = await snmp.getSections(["radioName", "signalStrength", "overallCcq", "uptime", "txRate", "rxRate", "noiseFloor"], {
      host: payload.connectTo,
      os: payload.os,
      community: payload.snmpCommunity,
    }, {
      retries: 1,
      timeout: 100,
    }).catch((error) => {
      logger.error(`snmp error ${JSON.stringify(error)}`);
      errorCount++;
    });
    socket.emit("REGISTRATION_TABLE", {
      ...snmpResult,
    });
    if (errorCount > 10) {
      break;
    }
    await sleep(1000);
  }
}

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const bytesToSize = (bytes, unit = "bps") => {
  let sizes = Array();
  switch (unit) {
    case "bit":
      sizes = ["Bit", "Kb", "Mb", "Gb", "Tb"];
      break;
    case "byte":
      sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      break;
    case "bps":
      sizes = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
      break;
    case "Bps":
      sizes = ["Bps", "KBps", "MBps", "GBps", "TBps"];
      break;
  }
  if (bytes == 0) return "0 " + sizes[0];
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
};