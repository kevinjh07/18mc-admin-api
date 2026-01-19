'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('social_actions', 'actionType', {
      type: Sequelize.ENUM('internal', 'external', 'fundraising'),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('social_actions', 'actionType', {
      type: Sequelize.ENUM('internal', 'external'),
      allowNull: false,
    });
  },
};
