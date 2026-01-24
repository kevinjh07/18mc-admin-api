const Person = require('../models/Person');
const Division = require('../models/Division');
const Regional = require('../models/Regional');
const MonthlyPayment = require('../models/MonthlyPayment');
const PersonAlreadyExistsError = require('../exceptions/PersonAlreadyExistsError');
const PaymentAlreadyExistsError = require('../exceptions/PaymentAlreadyExistsError');
const { Op } = require('sequelize');

const createPerson = async (fullName, shortName, divisionId, hierarchyLevel, isActive) => {
  const division = await Division.findByPk(divisionId, {
    include: {
      model: Regional,
      attributes: ['id'],
    },
  });
  if (!division) {
    throw new Error('Divisão inválida. A divisão especificada não foi encontrada.');
  }

  const existingPerson = await Person.findOne({ where: { shortName, divisionId } });
  if (existingPerson) {
    throw new PersonAlreadyExistsError('Já existe um membro com o mesmo nome de colete e regional.');
  }

  return await Person.create({ fullName, shortName, divisionId, hierarchyLevel, isActive });
};

const getPersonById = async (id) => {
  return await Person.findByPk(id, {
    include: {
      model: Division,
      attributes: ['id', 'name'],
      include: {
        model: Regional,
        attributes: ['id', 'commandId'],
      },
    },
  });
};

const getAllPersons = async (page, limit, divisionId) => {
  const offset = (page - 1) * limit;
  const whereCondition = divisionId ? { divisionId } : {};
  const persons = await Person.findAndCountAll({
    limit,
    offset,
    where: whereCondition,
    include: {
      model: Division,
      attributes: ['name'],
    },
  });

  return {
    totalItems: persons.count,
    totalPages: Math.ceil(persons.count / limit),
    currentPage: page,
    data: persons.rows,
  };
};

const updatePerson = async (id, fullName, shortName, divisionId, hierarchyLevel, isActive) => {
  const division = await Division.findByPk(divisionId, {
    include: {
      model: Regional,
      attributes: ['id'],
    },
  });
  if (!division) {
    throw new Error('Divisão inválida. A divisão especificada não foi encontrada.');
  }

  const existingPerson = await Person.findOne({ where: { shortName, divisionId, id: { [Op.ne]: id } } });
  if (existingPerson) {
    throw new PersonAlreadyExistsError('Já existe um membro com o mesmo nome de colete e divisão.');
  }

  const person = await Person.findByPk(id);
  if (!person) {
    return null;
  }

  await person.update({ fullName, shortName, divisionId, hierarchyLevel, isActive });
  return person;
};

const getPersonsByDivision = async (divisionId, isActive) => {
  const whereCondition = { divisionId };
  if (isActive !== undefined) {
    whereCondition.isActive = isActive === 'true';
  }
  return await Person.findAll({
    where: whereCondition,
    attributes: ['id', 'shortName'],
  });
};

const recordMonthlyPayment = async (personId, year, month, paidOnTime, paidAt = null) => {
  const person = await Person.findByPk(personId);
  if (!person) {
    throw new Error('Pessoa não encontrada.');
  }

  const existing = await MonthlyPayment.findOne({ where: { personId, year, month } });
  if (existing) {
    throw new PaymentAlreadyExistsError('Já existe um pagamento mensal para este integrante no ano e mês especificados.');
  }

  const created = await MonthlyPayment.create({ personId, year, month, paidOnTime, paidAt });
  return created;
};

const getMonthlyPayments = async (personId, year) => {
  const person = await Person.findByPk(personId);
  if (!person) {
    return null;
  }

  const whereCondition = { personId };
  if (year !== undefined && year !== null) {
    whereCondition.year = year;
  }

  return await MonthlyPayment.findAll({
    where: whereCondition,
    order: [['year', 'ASC'], ['month', 'ASC']],
  });
};

module.exports = {
  createPerson,
  getPersonById,
  getAllPersons,
  updatePerson,
  getPersonsByDivision,
  recordMonthlyPayment,
  getMonthlyPayments,
};
