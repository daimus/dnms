const {
    DataTypes
} = require('sequelize');
const {
    sequelize
} = require('../config/database');

const Extra = sequelize.define('extras', {
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

exports.Extra = Extra;