const CommandService = require('../services/commandService');

const getAllCommands = async (req, res) => {
  try {
    const commands = await CommandService.getAllCommands();
    res.json(commands);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar lista de comandos.', details: error.message });
  }
};

module.exports = {
  getAllCommands,
};
