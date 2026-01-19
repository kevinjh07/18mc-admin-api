'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove a constraint única do campo `fullName`
    await queryInterface.removeConstraint('persons', 'fullName');

    // Adiciona uma nova constraint única em `shortName` e `divisionId`
    await queryInterface.addConstraint('persons', {
      fields: ['shortName', 'divisionId'],
      type: 'unique',
      name: 'unique_shortName_divisionId',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Reverte a constraint única em `shortName` e `divisionId`
    await queryInterface.removeConstraint(
      'persons',
      'unique_shortName_divisionId',
    );

    // Recria a constraint única original no campo `fullName`
    await queryInterface.addConstraint('persons', {
      fields: ['fullName'],
      type: 'unique',
      name: 'persons_fullName_key',
    });
  },
};
