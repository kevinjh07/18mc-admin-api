const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Regional = require('./Regional');

class Division extends Model {}

Division.init(
  {
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    regionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Regional, key: 'id' },
    },
  },
  { sequelize, modelName: 'Division', tableName: 'divisions' },
);

try {
  Division.belongsTo(Regional, { foreignKey: 'regionalId' });
} catch (e) {
  // Ignore association errors in test/mock environments where Regional may be mocked
}
module.exports = Division;
