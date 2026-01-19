'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('regionals', 'commandNumber', {
      type: Sequelize.SMALLINT,
      allowNull: true,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('regionals', 'commandNumber');
  },
};
