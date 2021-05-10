const netSnmp = require('net-snmp');

const oids = {
    routeros: [{
            name: 'ssid',
            oid: '1.3.6.1.4.1.14988.1.1.1.3.1.4'
        },
        {
            name: 'frequency',
            oid: '1.3.6.1.4.1.14988.1.1.1.3.1.7',
        },
        {
            name: 'radioName',
            oid: '1.3.6.1.4.1.14988.1.1.1.2.1.20',
        },
        {
            name: 'signalStrength',
            oid: '1.3.6.1.4.1.14988.1.1.1.2.1.3',
        },
        {
            name: 'overallCcq',
            oid: '1.3.6.1.4.1.14988.1.1.1.3.1.10',
        },
        {
            name: 'txRate',
            oid: '1.3.6.1.4.1.14988.1.1.1.2.1.8',
        },
        {
            name: 'rxRate',
            oid: '1.3.6.1.4.1.14988.1.1.1.2.1.9',
        },
        {
            name: 'uptime',
            oid: '1.3.6.1.4.1.14988.1.1.1.2.1.11',
        },
        {
            name: 'clientCount',
            oid: '1.3.6.1.4.1.14988.1.1.1.3.1.6',
        },
        {
            name: 'noiseFloor',
            oid: '1.3.6.1.4.1.14988.1.1.1.3.1.9',
        },
        {
            name: 'mode',
            fn: 'findOutMode'
        }
    ],
    airos: [{
            name: 'ssid',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.2'
        },
        {
            name: 'frequency',
            oid: '1.3.6.1.4.1.41112.1.4.1.1.4'
        },
        {
            name: 'radioName',
            oid: '1.3.6.1.4.1.41112.1.4.7.1.2',
        },
        {
            name: 'signalStrength',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.5',
        },
        {
            name: 'overallCcq',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.7',
        },
        {
            name: 'txRate',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.9',
        },
        {
            name: 'rxRate',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.10',
        },
        {
            name: 'uptime',
            oid: '1.3.6.1.4.1.41112.1.4.7.1.15',
        },
        {
            name: 'clientCount',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.15',
        },
        {
            name: 'noiseFloor',
            oid: '1.3.6.1.4.1.41112.1.4.5.1.8',
        },
        {
            name: 'mode',
            fn: 'findOutMode'
        }
    ]
};

module.exports.getSections = async (sections, device, options = {}) => {
    let result = {};
    if (device.os !== 'routeros' && device.os !== 'airos'){
        return result;
    }
    for (const oid of oids[device.os]) {
        if (sections.indexOf(oid.name) != -1) {
            if (oid.oid !== undefined) {
                let value = Array();
                let snmpResult = await getByOid(oid.oid, device, options);
                snmpResult.forEach(element => {
                    value.push(element.value);
                });
                result[oid.name] = value;
            } else {
                result[oid.name] = await global[oid.fn](result, device);
            }
        }
    }
    return result;
}

global.findOutMode = async (tempResult, device) => {
    if (device.os == 'airos') {
        const oid = '1.3.6.1.4.1.41112.1.4.1.1.2';
        let wirelessMode = 'unknown';
        let snmpResult = await getByOid(oid, device);
        if (snmpResult) {
            switch (snmpResult[0].value) {
                case '1':
                    wirelessMode = 'station';
                    break;
                case '2':
                    wirelessMode = 'ap';
                    break;
                case '3':
                    wirelessMode = 'aprepeater';
                    break;
                case '4':
                    wirelessMode = 'apwds';
                    break;
                default:
                    wirelessMode = 'unknown';
                    break;
            }
        }
        return wirelessMode;
    }

    let totalClientCount = 0;
    let totalSignalStrength = 0;
    let wirelessMode = 'unknown';

    if (tempResult.signalStrength !== undefined) {
        totalSignalStrength += parseInt(tempResult.signalStrength.length);
    } else {
        for (const oid of oids.routeros) {
            if (oid.name == 'signalStrength') {
                let snmpResult = await getByOid(oid.oid, device);
                if (snmpResult) {
                    totalSignalStrength += parseInt(snmpResult.length);
                }
            }
        }
    }

    if (totalSignalStrength == 1) {
        if (tempResult.clientCount !== undefined) {
            tempResult.clientCount.map(clientCount => {
                totalClientCount += parseInt(clientCount);
            });
        } else {
            for (const oid of oids.routeros) {
                if (oid.name == 'clientCount') {
                    let snmpResult = await getByOid(oid.oid, device);
                    if (snmpResult) {
                        snmpResult.map(value => {
                            totalClientCount += parseInt(value.value);
                        });
                    }
                }
            }
        }
    }

    if (totalSignalStrength > 1) {
        wirelessMode = 'ap';
    } else if (totalSignalStrength == 1 && totalClientCount == 1) {
        wirelessMode = 'ap';
    } else if (totalSignalStrength == 1 && totalClientCount == 0) {
        wirelessMode = 'station';
    }

    return wirelessMode;
}

global.getUbntMode = (device) => {

}

const getByOid = (oid, device, options = {}) => {
    const session = netSnmp.createSession(device.host, device.snmpCommunity, options);

    return new Promise((resolve, reject) => {
        let results = new Array();

        function doneCb(error) {
            if (error) {
                logger.error(`snmp error ${JSON.stringify(error)}`);
                reject(error);
            } else {
                resolve(results);
            }
        }

        function feedCb(varbinds) {
            for (var i = 0; i < varbinds.length; i++) {
                if (netSnmp.isVarbindError(varbinds[i])) {
                    logger.error(`snmp error ${JSON.stringify(netSnmp.varbindError(varbinds[i]))}`);
                    reject(netSnmp.varbindError(varbinds[i]));
                } else {
                    let result = varbinds[i];
                    result.value = varbinds[i].value.toString();
                    results.push(result);
                }
            }
        }

        var maxRepetitions = 20;
        session.subtree(oid, maxRepetitions, feedCb, doneCb);
    });
}