const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Division = require('./Division');

class Person extends Model {}

Person.init(
  {
    fullName: { type: DataTypes.STRING(150), unique: true, allowNull: false },
    shortName: { type: DataTypes.STRING(50), allowNull: false },
    divisionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Division,
        key: 'id',
      },
    },
    hierarchyLevel: {
      type: DataTypes.ENUM(
        'XI: Camiseta',
        'X: PP',
        'IX: Meio Colete',
        'VIII: Full',
        'VI: Diretor',
        'VI: Sub-Diretor',
        'VI: Social',
        'VI: ADM',
        'VI: Sargento de Armas'
      ),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { sequelize, modelName: 'Person', tableName: 'persons' },
);

try {
  Person.belongsTo(Division, { foreignKey: 'divisionId' });
} catch (e) {
  // Ignore association errors in test/mock environments where Division may be mocked
}

module.exports = Person;
