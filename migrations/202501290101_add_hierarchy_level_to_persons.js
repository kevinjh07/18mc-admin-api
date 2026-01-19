'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('persons', 'hierarchyLevel', {
      type: Sequelize.ENUM(
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('persons', 'hierarchyLevel');
  },
};
