const DivisionService = require('../services/divisionService');
const ValidationError = require('../exceptions/ValidationError');
const logger = require('../services/loggerService');

const createDivision = async (req, res) => {
  logger.info('Iniciando criação de divisão', { body: req.body });
  try {
    const { name, regionalId } = req.body;
    const division = await DivisionService.createDivision(name, regionalId);
    logger.info('Divisão criada com sucesso', { divisionId: division.id });
    res.status(201).json(division);
  } catch (error) {
    logger.error('Erro ao criar divisão', { error: error.message });
    res.status(500).json({ message: 'Erro ao criar divisão.', details: error.message });
  }
};

const getDivisionById = async (req, res) => {
  logger.info('Buscando divisão por ID', { divisionId: req.params.id });
  try {
    const division = await DivisionService.getDivisionById(req.params.id);
    if (!division) {
      logger.warn('Divisão não encontrada', { divisionId: req.params.id });
      return res.status(404).send('Division not found');
    }
    logger.info('Divisão encontrada', { divisionId: req.params.id });
    res.json(division);
  } catch (error) {
    logger.error('Erro ao buscar divisão por ID', { error: error.message });
    res.status(500).send('Error fetching division');
  }
};

const getAllDivisions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  logger.info('Buscando todas as divisões', { page, limit });
  try {
    const divisions = await DivisionService.getAllDivisions(
      page,
      limit,
      req.query.regionalId,
    );
    logger.info('Divisões encontradas', { count: divisions.length });
    res.json(divisions);
  } catch (error) {
    logger.error('Erro ao buscar divisões', { error: error.message });
    res.status(500).send('Error fetching divisions');
  }
};

const getAllDivisionsByRegionalId = async (req, res) => {
  try {
    const divisions = await DivisionService.getAllDivisionsByRegionalId(
      req.query.regionalId,
    );
    res.json(divisions);
  } catch (error) {
    res.status(500).send('Error fetching divisions');
  }
};

const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, regionalId } = req.body;
    const division = await DivisionService.updateDivision(id, name, regionalId);
    res.status(200).json(division);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar divisão.', details: error.message });
  }
};

module.exports = {
  createDivision,
  getDivisionById,
  getAllDivisions,
  getAllDivisionsByRegionalId,
  updateDivision,
};
