const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Division = require('./Division');

const SocialAction = sequelize.define(
  'SocialAction',
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
    actionType: {
      type: DataTypes.ENUM('internal', 'external', 'fundraising'),
      allowNull: false,
    },
  },
  {
    tableName: 'social_actions',
  },
);

SocialAction.belongsTo(Division, { foreignKey: 'divisionId' });

module.exports = SocialAction;
