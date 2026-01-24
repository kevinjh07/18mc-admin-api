const Regional = require('../models/Regional');
const Command = require('../models/Command');
const ValidationError = require('../exceptions/ValidationError');

const createRegional = async (data) => {
  const { commandId } = data;

  if (commandId) {
    const command = await Command.findByPk(commandId);
    if (!command) {
      throw new ValidationError('Comando não encontrado.');
    }
  }

  return Regional.create(data);
};

const getRegionalById = async (id) => {
  return await Regional.findByPk(id, {
    include: [{ model: Command, as: 'command', attributes: ['id', 'name'] }],
  });
};

const getAllRegionals = async (page, limit, commandId) => {
  const offset = (page - 1) * limit;
  if (!commandId) {
    throw new ValidationError('commandId é obrigatório.');
  }

  const where = { commandId };

  const command = await Command.findByPk(commandId);
  if (!command) {
    throw new ValidationError('Comando não encontrado.');
  }
  const regionals = await Regional.findAndCountAll({
    where,
    limit,
    offset,
    include: [{ model: Command, as: 'command', attributes: ['id', 'name'] }],
  });
  return {
    totalItems: regionals.count,
    totalPages: Math.ceil(regionals.count / limit),
    currentPage: page,
    data: regionals.rows,
  };
};

const updateRegional = async (id, updates) => {
  const { commandId } = updates;

  if (commandId) {
    const command = await Command.findByPk(commandId);
    if (!command) {
      throw new ValidationError('Comando não encontrado.');
    }
  }

  const regional = await Regional.findByPk(id);
  if (!regional) {
    throw new ValidationError('Regional não encontrada.');
  }

  return regional.update(updates);
};

module.exports = {
  createRegional,
  getRegionalById,
  getAllRegionals,
  updateRegional,
};
