const PersonService = require('../services/personService');
const PersonAlreadyExistsError = require('../exceptions/PersonAlreadyExistsError');
const { logger } = require('sequelize/lib/utils/logger');

const createPerson = async (req, res) => {
  const { fullName, shortName, divisionId, hierarchyLevel, isActive } = req.body;

  try {
    const person = await PersonService.createPerson(
      fullName,
      shortName,
      divisionId,
      hierarchyLevel,
      isActive,
    );
    res.status(201).json(person);
  } catch (error) {
    if (error instanceof PersonAlreadyExistsError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).send('Error creating person');
    }
  }
};

const getPersonById = async (req, res) => {
  try {
    const person = await PersonService.getPersonById(req.params.id);
    if (!person) {
      return res.status(404).send();
    }
    res.json(person);
  } catch (error) {
    res.status(500).send('Error fetching person');
  }
};

const getAllPersons = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  try {
    const persons = await PersonService.getAllPersons(page, limit, req.query.divisionId);
    res.json(persons);
  } catch (error) {
    console.error('Error in getAllPersons controller:', error);
    res.status(500).send('Error fetching persons');
  }
};

const updatePerson = async (req, res) => {
  const { fullName, shortName, divisionId, hierarchyLevel, isActive } = req.body;

  try {
    const updatedPerson = await PersonService.updatePerson(
      req.params.id,
      fullName,
      shortName,
      divisionId,
      hierarchyLevel,
      isActive,
    );
    if (!updatedPerson) {
      return res.status(404).send();
    }
    res.json(updatedPerson);
  } catch (error) {
    if (error instanceof PersonAlreadyExistsError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).send('Error updating person');
    }
  }
};

const getPersonsByDivision = async (req, res) => {
  try {
    const persons = await PersonService.getPersonsByDivision(req.params.divisionId, req.query.isActive);
    if (persons.length === 0) {
      return res.status(404).send();
    }
    res.json(persons);
  } catch (error) {
    res.status(500).send('Error fetching persons by division');
  }
};

const addMonthlyPayment = async (req, res) => {
  const { year, month, paidOnTime, paidAt } = req.body;
  try {
    const record = await PersonService.recordMonthlyPayment(
      parseInt(req.params.id),
      parseInt(year),
      parseInt(month),
      Boolean(paidOnTime),
      paidAt ? new Date(paidAt) : null,
    );
    res.status(201).json(record);
  } catch (error) {
    if (error.message && error.message.includes('Pessoa não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).send('Error recording monthly payment');
  }
};

const getMonthlyPayments = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const payments = await PersonService.getMonthlyPayments(parseInt(req.params.id), year);
    if (payments === null) {
      return res.status(404).send();
    }
    res.json(payments);
  } catch (error) {
    res.status(500).send('Error fetching monthly payments');
  }
};

module.exports = {
  createPerson,
  getPersonById,
  getAllPersons,
  updatePerson,
  getPersonsByDivision,
  addMonthlyPayment,
  getMonthlyPayments,
};
