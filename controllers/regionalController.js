const RegionalService = require('../services/regionalService');
const ValidationError = require('../exceptions/ValidationError');
const logger = require('../services/loggerService');

const createRegional = async (req, res) => {
  logger.info('Iniciando criação de regional', { body: req.body });
  try {
    const regional = await RegionalService.createRegional(req.body);
    logger.info('Regional criada com sucesso', { regionalId: regional.id });
    res.status(201).json(regional);
  } catch (error) {
    logger.error('Erro ao criar regional', { error: error.message });
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao criar regional.', details: error.message });
  }
};

const getRegionalById = async (req, res) => {
  logger.info('Buscando regional por ID', { regionalId: req.params.id });
  try {
    const regional = await RegionalService.getRegionalById(req.params.id);
    if (!regional) {
      logger.warn('Regional não encontrada', { regionalId: req.params.id });
      return res.status(404).send('Regional not found');
    }
    logger.info('Regional encontrada', { regionalId: req.params.id });
    res.json(regional);
  } catch (error) {
    logger.error('Erro ao buscar regional por ID', { error: error.message });
    res.status(500).send('Error fetching regional');
  }
};

const getAllRegionals = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const commandId = req.query.commandId ? parseInt(req.query.commandId) : null;
  logger.info('Buscando todas as regionais', { page, limit, commandId });
  try {
    const regionals = await RegionalService.getAllRegionals(page, limit, commandId);
    logger.info('Regionais encontradas', { count: regionals.length });
    res.json(regionals);
  } catch (error) {
    logger.error('Erro ao carregar lista de regionais', { error: error.message });
    res.status(500).json({ message: 'Erro ao carregar lista de regionais.', details: error.message });

  }
};

const updateRegional = async (req, res) => {
  logger.info('Iniciando atualização de regional', { regionalId: req.params.id, body: req.body });
  try {
    const { id } = req.params;
    const regional = await RegionalService.updateRegional(id, req.body);
    logger.info('Regional atualizada com sucesso', { regionalId: regional.id });
    res.status(200).json(regional);
  } catch (error) {
    logger.error('Erro ao atualizar regional', { error: error.message });
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao atualizar regional.', details: error.message });
  }
};

module.exports = {
  createRegional,
  updateRegional,
  getRegionalById,
  getAllRegionals,
};
