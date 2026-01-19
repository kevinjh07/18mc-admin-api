const DivisionService = require('../services/divisionService');
const ValidationError = require('../exceptions/ValidationError');

const createDivision = async (req, res) => {
  try {
    const { name, regionalId } = req.body;
    const division = await DivisionService.createDivision(name, regionalId);
    res.status(201).json(division);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar divisão.', details: error.message });
  }
};

const getDivisionById = async (req, res) => {
  try {
    const division = await DivisionService.getDivisionById(req.params.id);
    if (!division) {
      return res.status(404).send('Division not found');
    }
    res.json(division);
  } catch (error) {
    res.status(500).send('Error fetching division');
  }
};

const getAllDivisions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  try {
    const divisions = await DivisionService.getAllDivisions(
      page,
      limit,
      req.query.regionalId,
    );
    res.json(divisions);
  } catch (error) {
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
