const Division = require('../models/Division');
const Regional = require('../models/Regional');
const ValidationError = require('../exceptions/ValidationError');

const createDivision = async (name, regionalId) => {
  const regional = await Regional.findByPk(regionalId);
  if (!regional) {
    throw new Error('Regional not found');
  }
  return await Division.create({ name, regionalId });
};

const getDivisionById = async (id) => {
  return await Division.findByPk(id, {
    include: { model: Regional, attributes: ['name'] },
  });
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
