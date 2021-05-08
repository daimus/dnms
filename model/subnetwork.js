const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const Subnetwork = sequelize.define('subnetworks', {
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deviceId: {
        type: DataTypes.STRING
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true
});

exports.Subnetwork = Subnetwork;