const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const Device = sequelize.define('devices', {
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    comment: {
        type: DataTypes.STRING
    },
    connectTo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    snmpCommunity: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'public'
    },
    os: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'other'
    },
    wireless: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    latitude: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    longitude: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    connectedTo: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

exports.Device = Device;