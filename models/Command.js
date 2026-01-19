const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Command extends Model {}

Command.init(
  {
    number: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Command',
    tableName: 'commands',
  },
);

module.exports = Command;
