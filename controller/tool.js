const mikrotikApi = require("../util/mikrotik-api");
const {
	Server
} = require("../model/server");
const {
	Device
} = require('../model/device');
const {
	Op,
	where
} = require("sequelize");
const {logger} = require('../config/logger');

exports.ping = (req, res) => {
	res.render("tool/ping");
};

exports.log = async (req, res) => {
	const serverId = req.session.serverId;
	const server = await Server.findOne({
		where: {
			id: serverId
		}
	});
	const conn = {
		host: server.connectTo,
		user: server.username,
		password: server.password,
	};
	const connection = mikrotikApi.createConnection(conn);
	let result = {};
	await connection.connect().then(async () => {
		const logs = await mikrotikApi.write(connection, ["/log/print"]);
		connection.close();
		result = {
			status: "success",
			data: logs,
		};
	}).catch((error) => {
		logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
		result = {
			status: "fail",
			message: "Error Connection: " + error.toString(),
		};
	});
	res.render("tool/log", {
		result: result,
	});
};

exports.arp = async (req, res) => {
	const serverId = req.session.serverId;
	const server = await Server.findOne({
		where: {
			id: serverId
		}
	});
	const conn = {
		host: server.connectTo,
		user: server.username,
		password: server.password,
	};
	const connection = mikrotikApi.createConnection(conn);
	let result = {};
	await connection.connect().then(async () => {
		const arps = await mikrotikApi.write(connection, ["/ip/arp/print"]);
		connection.close();
		result = {
			status: "success",
			data: arps,
		};
	}).catch((error) => {
		logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
		result = {
			status: "fail",
			message: "Error Connection: " + error.toString(),
		};
	});
	if (req.query.json) {
		return res.jsend.success(result);
	}
	res.render("tool/arp", {
		result: result,
	});
};

exports.neighbor = async (req, res) => {
	const serverId = req.session.serverId;
	const server = await Server.findOne({
		where: {
			id: serverId
		}
	});
	const conn = {
		host: server.connectTo,
		user: server.username,
		password: server.password,
	};
	const connection = mikrotikApi.createConnection(conn);
	let result = {};
	await connection.connect().then(async () => {
		const arps = await mikrotikApi.write(connection, ["/ip/neighbor/print"]);
		connection.close();
		result = {
			status: "success",
			data: arps,
		};
	}).catch((error) => {
		logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
		result = {
			status: "fail",
			message: "Error Connection: " + error.toString(),
		};
	});
	if (req.query.json) {
		return res.jsend.success(result);
	}
	res.render("tool/neighbor", {
		result: result,
	});
};

exports.lease = async (req, res) => {
	const serverId = req.session.serverId;
	const server = await Server.findOne({
		where: {
			id: serverId
		}
	});
	const conn = {
		host: server.connectTo,
		user: server.username,
		password: server.password,
	};
	const connection = mikrotikApi.createConnection(conn);
	let result = {};
	await connection.connect().then(async () => {
		const leases = await mikrotikApi.write(connection, ["/ip/dhcp-server/lease/print"]);
		connection.close();
		result = {
			status: "success",
			data: leases,
		};
	}).catch((error) => {
		logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
		result = {
			status: "fail",
			message: "Error Connection: " + error.toString(),
		};
	});

	if (req.query.json) {
		return res.jsend.success(result);
	}
	res.render("tool/lease", {
		result: result,
	});
};

exports.host = async (req, res) => {
	const serverId = req.session.serverId;
	const server = await Server.findOne({
		where: {
			id: serverId
		}
	});
	const conn = {
		host: server.connectTo,
		user: server.username,
		password: server.password,
	};
	const connection = mikrotikApi.createConnection(conn);
	let result = {};
	await connection.connect().then(async () => {
		const leases = await mikrotikApi.write(connection, ["/ip/hotspot/host/print"]);
		connection.close();
		result = {
			status: "success",
			data: leases,
		};
	}).catch((error) => {
		logger.error(`mikrotik connection error ${JSON.stringify(error)}`);
		result = {
			status: "fail",
			message: "Error Connection: " + error.toString(),
		};
	});

	if (req.query.json) {
		return res.jsend.success(result);
	}
	res.render("tool/host", {
		result: result,
	});
};