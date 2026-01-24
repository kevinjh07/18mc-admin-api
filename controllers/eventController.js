const EventService = require('../services/eventService');

const createEvent = async (req, res) => {
  try {
    const event = await EventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar evento.', details: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await EventService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).send('Evento não encontrado');
    }
    res.json(event);
  } catch (error) {
    res.status(500).send('Erro ao buscar evento');
  }
};

const getAllEvents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  try {
    const events = await EventService.getAllEvents(
      page,
      limit,
      req.query.regionalId,
      req.query.divisionId,
      req.query.eventType,
    );
    res.json(events);
  } catch (error) {
    res.status(500).send('Erro ao buscar eventos');
  }
};

const updateEvent = async (req, res) => {
  try {
    await EventService.updateEvent(req.body);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar evento.', details: error.message });
  }
};

const getPersonsByEventId = async (req, res) => {
  try {
    const persons = await EventService.getPersonsByEventId(req.params.id);
    if (!persons || persons.length === 0) {
      return res.status(404).send('Nenhuma pessoa encontrada para este evento');
    }
    res.json(persons);
  } catch (error) {
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
