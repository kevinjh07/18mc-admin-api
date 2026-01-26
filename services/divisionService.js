const Division = require('../models/Division');
const Regional = require('../models/Regional');
const ValidationError = require('../exceptions/ValidationError');
const logger = require('../services/loggerService');

const createDivision = async (name, regionalId) => {
  logger.info('Iniciando criação de divisão', { name, regionalId });
  try {
    const regional = await Regional.findByPk(regionalId);
    if (!regional) {
      logger.warn('Regional não encontrada', { regionalId });
      throw new Error('Regional not found');
    }
    const division = await Division.create({ name, regionalId });
    logger.info('Divisão criada com sucesso', { divisionId: division.id });
    return division;
  } catch (error) {
    logger.error('Erro ao criar divisão', { error: error.message });
    throw error;
  }
};

const getDivisionById = async (id) => {
  logger.info('Buscando divisão por ID', { divisionId: id });
  try {
    const division = await Division.findByPk(id, {
      include: { model: Regional, attributes: ['name', 'commandId'] },
    });
    if (!division) {
      logger.warn('Divisão não encontrada', { divisionId: id });
    } else {
      logger.info('Divisão encontrada', { divisionId: id });
    }
    return division;
  } catch (error) {
    logger.error('Erro ao buscar divisão por ID', { error: error.message });
    throw error;
  }
};

const getAllDivisions = async (page, limit, regionalId) => {
  const offset = (page - 1) * limit;

  const whereCondition = regionalId ? { regionalId } : {};

  const divisions = await Division.findAndCountAll({
    limit,
    offset,
    where: whereCondition
  });

  return {
    totalItems: divisions.count,
    totalPages: Math.ceil(divisions.count / limit),
    currentPage: page,
    data: divisions.rows,
  };
};

const getAllDivisionsByRegionalId = async (regionalId) => {
  const whereCondition = regionalId ? { regionalId } : {};

  const divisions = await Division.findAll({
    where: whereCondition,
    attributes: ['id', 'name', 'regionalId'],
  });

  return divisions;
};

const updateDivision = async (id, name, regionalId) => {
  const regional = await Regional.findByPk(regionalId);
  if (!regional) {
    throw new Error('Regional not found');
  }

  const division = await Division.findByPk(id);
  if (!division) {
    return null;
  }

  await division.update({ name, regionalId });
  return await Division.findByPk(id, { include: [Regional] });
};

const deleteDivision = async (id) => {
  const division = await Division.findByPk(id);
  if (!division) {
    return null;
  }
  await division.destroy();
  return division;
};

module.exports = {
  createDivision,
  getDivisionById,
  getAllDivisions,
  getAllDivisionsByRegionalId,
  updateDivision,
  deleteDivision,
};
