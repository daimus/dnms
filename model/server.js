const {
  DataTypes
} = require('sequelize');
const {
  sequelize
} = require('../config/database');


const Server = sequelize.define('servers', {
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
  apiPort: {
    type: DataTypes.INTEGER,
    defaultValue: 8278,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    defaultValue: 'admin',
    allowNull: false
  },
  password: {
    type: DataTypes.STRING
  },
  mainInterface: {
    type: DataTypes.STRING,
    defaultValue: 'ether1'
  },
  latitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0
  },
  longitude: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: 1
  }
}, {
  timestamps: true,
});

exports.Server = Server;