const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Person = require('./Person');

class LatePayment extends Model {}

LatePayment.init(
  {
    personId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Person,
        key: 'id',
      },
    },
    year: { type: DataTypes.INTEGER, allowNull: false },
    month: { type: DataTypes.INTEGER, allowNull: false },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    modelName: 'LatePayment',
    tableName: 'late_payments',
    indexes: [
      {
        unique: true,
        fields: ['personId', 'year', 'month'],
      },
    ],
  },
);

try {
  LatePayment.belongsTo(Person, { foreignKey: 'personId' });
} catch (e) {
  // Ignore association errors in test/mock environments where Person may be mocked
}

module.exports = LatePayment;
