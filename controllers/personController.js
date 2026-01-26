const PersonService = require('../services/personService');
const PersonAlreadyExistsError = require('../exceptions/PersonAlreadyExistsError');
const LatePaymentAlreadyExistsError = require('../exceptions/LatePaymentAlreadyExistsError');
const logger = require('../services/loggerService');

const createPerson = async (req, res) => {
  const { fullName, shortName, divisionId, hierarchyLevel, isActive } = req.body;
  logger.info('Iniciando criação de pessoa', { fullName, shortName, divisionId, hierarchyLevel, isActive });

  try {
    const person = await PersonService.createPerson(
      fullName,
      shortName,
      divisionId,
      hierarchyLevel,
      isActive,
    );
    logger.info('Pessoa criada com sucesso', { personId: person.id });
    res.status(201).json(person);
  } catch (error) {
    logger.error('Erro ao criar pessoa', { error: error.message });
    if (error instanceof PersonAlreadyExistsError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).send('Error creating person');
    }
  }
};

const getPersonById = async (req, res) => {
  logger.info('Buscando pessoa por ID', { personId: req.params.id });
  try {
    const person = await PersonService.getPersonById(req.params.id);
    if (!person) {
      logger.warn('Pessoa não encontrada', { personId: req.params.id });
      return res.status(404).send();
    }
    logger.info('Pessoa encontrada', { personId: req.params.id });
    res.json(person);
  } catch (error) {
    logger.error('Erro ao buscar pessoa por ID', { error: error.message });
    res.status(500).send('Error fetching person');
  }
};

const getAllPersons = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  logger.info('Buscando todas as pessoas', { page, limit });
  try {
    const persons = await PersonService.getAllPersons(page, limit, req.query.divisionId);
    logger.info('Pessoas encontradas', { count: persons.length });
    res.json(persons);
  } catch (error) {
    logger.error('Erro ao buscar todas as pessoas', { error: error.message });
    res.status(500).send('Error fetching persons');
  }
};

const updatePerson = async (req, res) => {
  const { fullName, shortName, divisionId, hierarchyLevel, isActive } = req.body;
  logger.info('Atualizando pessoa', { personId: req.params.id, fullName, shortName, divisionId, hierarchyLevel, isActive });

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
      logger.warn('Pessoa não encontrada para atualização', { personId: req.params.id });
      return res.status(404).send();
    }
    logger.info('Pessoa atualizada com sucesso', { personId: updatedPerson.id });
    res.json(updatedPerson);
  } catch (error) {
    logger.error('Erro ao atualizar pessoa', { error: error.message });
    if (error instanceof PersonAlreadyExistsError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).send('Error updating person');
    }
  }
};

const getPersonsByDivision = async (req, res) => {
  logger.info('Buscando pessoas por divisão', { divisionId: req.params.divisionId, isActive: req.query.isActive });
  try {
    const persons = await PersonService.getPersonsByDivision(req.params.divisionId, req.query.isActive);
    if (persons.length === 0) {
      logger.warn('Nenhuma pessoa encontrada para a divisão', { divisionId: req.params.divisionId });
      return res.status(404).send();
    }
    logger.info('Pessoas encontradas para a divisão', { divisionId: req.params.divisionId, count: persons.length });
    res.json(persons);
  } catch (error) {
    logger.error('Erro ao buscar pessoas por divisão', { error: error.message });
    res.status(500).send('Error fetching persons by division');
  }
};

const addLatePayment = async (req, res) => {
  const { year, month, paidAt, notes } = req.body;
  logger.info('Registrando atraso de pagamento', { personId: req.params.id, year, month, paidAt, notes });

  try {
    const record = await PersonService.recordLatePayment(
      parseInt(req.params.id),
      parseInt(year),
      parseInt(month),
      paidAt ? new Date(paidAt) : null,
      notes || null,
    );
    logger.info('Atraso de pagamento registrado com sucesso', { recordId: record.id });
    res.status(201).json(record);
  } catch (error) {
    logger.error('Erro ao registrar atraso de pagamento', { error: error.message });
    if (error.message && error.message.includes('Pessoa não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof LatePaymentAlreadyExistsError) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).send('Error recording late payment');
  }
};

const getLatePayments = async (req, res) => {
  logger.info('Buscando atrasos de pagamento', { personId: req.params.id });
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const payments = await PersonService.getLatePayments(parseInt(req.params.id), page, limit);
    if (payments === null) {
      logger.warn('Nenhum atraso de pagamento encontrado', { personId: req.params.id });
      return res.status(404).send();
    }
    logger.info('Atrasos de pagamento encontrados', { personId: req.params.id, count: payments.length });
    res.json(payments);
  } catch (error) {
    logger.error('Erro ao buscar atrasos de pagamento', { error: error.message });
    res.status(500).send('Error fetching late payments');
  }
};

module.exports = {
  createPerson,
  getPersonById,
  getAllPersons,
  updatePerson,
  getPersonsByDivision,
  addLatePayment,
  getLatePayments,
};
