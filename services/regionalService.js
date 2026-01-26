const Regional = require('../models/Regional');
const Command = require('../models/Command');
const ValidationError = require('../exceptions/ValidationError');
const logger = require('../services/loggerService');

const createRegional = async (data) => {
  logger.info('Iniciando criação de regional', { data });
  try {
    const { commandId } = data;

    if (commandId) {
      const command = await Command.findByPk(commandId);
      if (!command) {
        logger.warn('Comando não encontrado', { commandId });
        throw new ValidationError('Comando não encontrado.');
      }
    }

    const regional = await Regional.create(data);
    logger.info('Regional criada com sucesso', { regionalId: regional.id });
    return regional;
  } catch (error) {
    logger.error('Erro ao criar regional', { error: error.message });
    throw error;
  }
};

const getRegionalById = async (id) => {
  logger.info('Buscando regional por ID', { regionalId: id });
  try {
    const regional = await Regional.findByPk(id, {
      include: [{ model: Command, as: 'command', attributes: ['id', 'name'] }],
    });
    if (!regional) {
      logger.warn('Regional não encontrada', { regionalId: id });
    } else {
      logger.info('Regional encontrada', { regionalId: id });
    }
    return regional;
  } catch (error) {
    logger.error('Erro ao buscar regional por ID', { error: error.message });
    throw error;
  }
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
