const ping = require('ping');

exports.ping = async (host) => {
    let result = await ping.promise.probe(host);
    return result;
}