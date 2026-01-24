const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Division = require('./Division');

const Event = sequelize.define(
  'Event',
  {
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    divisionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Division,
        key: 'id',
      },
    },
    eventType: {
      type: DataTypes.ENUM('social_action', 'other', 'poll'),
      allowNull: false,
      defaultValue: 'social_action',
    },
    actionType: {
      type: DataTypes.ENUM('internal', 'external', 'fundraising'),
      allowNull: true,
    },
  },
  {
    tableName: 'events',
  },
);

Event.belongsTo(Division, { foreignKey: 'divisionId' });

module.exports = Event;
