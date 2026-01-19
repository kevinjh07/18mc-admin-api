'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('social_actions', 'actionType', {
      type: Sequelize.ENUM('internal', 'external'),
      allowNull: false,
      defaultValue: 'internal',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('social_actions', 'actionType');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_social_actions_actionType";',
    );
  },
};
