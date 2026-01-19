const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Person = require('./Person');

class MonthlyPayment extends Model {}

MonthlyPayment.init(
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
    paidOnTime: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    paidAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'MonthlyPayment', tableName: 'monthly_payments' },
);

try {
  MonthlyPayment.belongsTo(Person, { foreignKey: 'personId' });
} catch (e) {
  // Ignore association errors in test/mock environments where Person may be mocked
}

module.exports = MonthlyPayment;
