const RegionalService = require('../services/regionalService');
const ValidationError = require('../exceptions/ValidationError');

const createRegional = async (req, res) => {
  try {
    const regional = await RegionalService.createRegional(req.body);
    res.status(201).json(regional);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao criar regional.', details: error.message });
  }
};

const getRegionalById = async (req, res) => {
  try {
    const regional = await RegionalService.getRegionalById(req.params.id);
    if (!regional) {
      return res.status(404).send('Regional not found');
    }
    res.json(regional);
  } catch (error) {
    res.status(500).send('Error fetching regional');
  }
};

const getAllRegionals = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const commandId = req.query.commandId ? parseInt(req.query.commandId) : null;
  try {
    const regionals = await RegionalService.getAllRegionals(page, limit, commandId);
    res.json(regionals);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar lista de regionais.', details: error.message });

  }
};

const updateRegional = async (req, res) => {
  try {
    const { id } = req.params;
    const regional = await RegionalService.updateRegional(id, req.body);
    res.status(200).json(regional);
  } catch (error) {
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
