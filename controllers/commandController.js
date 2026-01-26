const CommandService = require('../services/commandService');
const logger = require('../services/loggerService');

const getAllCommands = async (req, res) => {
  logger.info('Buscando todos os comandos');
  try {
    const commands = await CommandService.getAllCommands();
    logger.info('Comandos encontrados', { count: commands.length });
    res.json(commands);
  } catch (error) {
    logger.error('Erro ao carregar lista de comandos', { error: error.message });
    res.status(500).json({ message: 'Erro ao carregar lista de comandos.', details: error.message });
  }
};

module.exports = {
  getAllCommands,
};
