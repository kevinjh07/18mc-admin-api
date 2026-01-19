const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Command = require('./Command');

class Regional extends Model {}

Regional.init(
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    commandId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'commands',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Regional',
    tableName: 'regionals',
  },
);

try {
  Regional.belongsTo(Command, { foreignKey: 'commandId', as: 'command' });
} catch (e) {
  // Ignore association errors in test/mock environments
}

module.exports = Regional;
