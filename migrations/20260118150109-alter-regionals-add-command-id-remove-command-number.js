'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adicionar coluna commandId
    await queryInterface.addColumn('regionals', 'commandId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'commands',
        key: 'id',
      },
    });

    // Remover coluna commandNumber
    await queryInterface.removeColumn('regionals', 'commandNumber');
  },

  async down (queryInterface, Sequelize) {
    // Adicionar de volta commandNumber
    await queryInterface.addColumn('regionals', 'commandNumber', {
      type: Sequelize.SMALLINT,
      allowNull: true,
      unique: true,
    });

    // Remover commandId
    await queryInterface.removeColumn('regionals', 'commandId');
  }
};
