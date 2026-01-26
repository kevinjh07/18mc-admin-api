const EventService = require('../services/eventService');
const logger = require('../services/loggerService');

const createEvent = async (req, res) => {
  logger.info('Iniciando criação de evento', { body: req.body });
  try {
    const event = await EventService.createEvent(req.body);
    logger.info('Evento criado com sucesso', { eventId: event.id });
    res.status(201).json(event);
  } catch (error) {
    logger.error('Erro ao criar evento', { error: error.message });
    res.status(500).json({ message: 'Erro ao criar evento.', details: error.message });
  }
};

const getEventById = async (req, res) => {
  logger.info('Buscando evento por ID', { eventId: req.params.id });
  try {
    const event = await EventService.getEventById(req.params.id);
    if (!event) {
      logger.warn('Evento não encontrado', { eventId: req.params.id });
      return res.status(404).send('Evento não encontrado');
    }
    logger.info('Evento encontrado', { eventId: req.params.id });
    res.json(event);
  } catch (error) {
    logger.error('Erro ao buscar evento por ID', { error: error.message });
    res.status(500).send('Erro ao buscar evento');
  }
};

const getAllEvents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  logger.info('Buscando todos os eventos', { page, limit });
  try {
    const events = await EventService.getAllEvents(
      page,
      limit,
      req.query.regionalId,
      req.query.divisionId,
      req.query.eventType,
    );
    logger.info('Eventos encontrados', { count: events.length });
    res.json(events);
  } catch (error) {
    logger.error('Erro ao buscar eventos', { error: error.message });
    res.status(500).send('Erro ao buscar eventos');
  }
};

const updateEvent = async (req, res) => {
  logger.info('Iniciando atualização de evento', { body: req.body });
  try {
    await EventService.updateEvent(req.body);
    logger.info('Evento atualizado com sucesso', { eventId: req.body.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Erro ao atualizar evento', { error: error.message });
    res.status(500).json({ message: 'Erro ao atualizar evento.', details: error.message });
  }
};

const getPersonsByEventId = async (req, res) => {
  logger.info('Buscando pessoas por ID do evento', { eventId: req.params.id });
  try {
    const persons = await EventService.getPersonsByEventId(req.params.id);
    if (!persons || persons.length === 0) {
      logger.warn('Nenhuma pessoa encontrada para este evento', { eventId: req.params.id });
      return res.status(404).send('Nenhuma pessoa encontrada para este evento');
    }
    logger.info('Pessoas encontradas para o evento', { eventId: req.params.id, count: persons.length });
    res.json(persons);
  } catch (error) {
    logger.error('Erro ao buscar pessoas do evento', { error: error.message });
    res.status(500).send('Erro ao buscar pessoas do evento');
  }
};

module.exports = {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  getPersonsByEventId,
};
