const Command = require('../models/Command');
const logger = require('../services/loggerService');

const getAllCommands = async () => {
  logger.info('Buscando todos os comandos');
  try {
    const commands = await Command.findAll({
      attributes: ['id', 'name'],
    });
    logger.info('Comandos encontrados', { count: commands.length });
    return commands;
  } catch (error) {
    logger.error('Erro ao buscar comandos', { error: error.message });
    throw error;
  }
};

module.exports = {
  getAllCommands,
};
