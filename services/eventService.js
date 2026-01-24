const Event = require('../models/Event');
const Division = require('../models/Division');
const Person = require('../models/Person');
const Regional = require('../models/Regional');

const createEvent = async (event) => {
  const { title, date, description, divisionId, eventType, actionType } = event;

  const division = await Division.findByPk(divisionId);
  if (!division) {
    throw new Error('Divisão inválida');
  }

  if (eventType === 'social_action' && !actionType) {
    throw new Error('O tipo de ação (actionType) é obrigatório para eventos do tipo "ação social"');
  }

  if (eventType !== 'social_action' && actionType) {
    throw new Error('O tipo de ação (actionType) é válido apenas para eventos do tipo "ação social"');
  }

  return await Event.create({
    title,
    date,
    description,
    divisionId,
    eventType,
    actionType: eventType === 'social_action' ? actionType : null,
  });
};

const getEventById = async (id) => {
  return await Event.findByPk(id, {
    include: [
      {
        model: Division,
        attributes: ['id', 'name'],
        include: {
          model: Regional,
          attributes: ['id', 'commandId'],
        },
      },
      {
        model: Person,
        attributes: ['id', 'shortName'],
        through: { attributes: [] },
      },
    ],
  });
};

const getAllEvents = async (page, limit, regionalId, divisionId, eventType) => {
  const offset = (page - 1) * limit;

  const whereCondition =
    !isNaN(divisionId) && divisionId
      ? { id: divisionId }
      : regionalId
        ? { regionalId: regionalId }
        : {};

  const eventWhereCondition = eventType ? { eventType } : {};

  const events = await Event.findAndCountAll({
    limit,
    offset,
    order: [['date', 'DESC']],
    where: eventWhereCondition,
    include: [
      {
        model: Division,
        attributes: ['name', 'regionalId'],
        where: whereCondition,
      },
    ],
  });

  return {
    totalItems: events.count,
    totalPages: Math.ceil(events.count / limit),
    currentPage: page,
    data: events.rows,
  };
};

const updateEvent = async (eventData) => {
  const { id, title, date, description, divisionId, personIds, eventType, actionType } = eventData;

  const division = await Division.findByPk(divisionId);
  if (!division) {
    throw new Error('Divisão inválida');
  }

  const event = await Event.findByPk(id);
  if (!event) {
    throw new Error('Evento não encontrado');
  }

  // Validar que actionType é fornecido apenas para social_action
  if (eventType === 'social_action' && !actionType) {
    throw new Error('O tipo de ação (actionType) é obrigatório para eventos do tipo "ação social"');
  }

  if (eventType && eventType !== 'social_action' && actionType) {
    throw new Error('O tipo de ação (actionType) é válido apenas para eventos do tipo "ação social"');
  }

  await event.update({
    title,
    date,
    description,
    divisionId,
    eventType,
    actionType: (eventType || event.eventType) === 'social_action' ? actionType : null,
  });

  if (personIds && personIds.length > 0) {
    const persons = await Person.findAll({ where: { id: personIds } });
    if (persons.length !== personIds.length) {
      throw new Error('Uma ou mais pessoas não foram encontradas');
    }
    await event.setPeople(persons);
  } else {
    await event.setPeople([]);
  }

  return event;
};

const getPersonsByEventId = async (eventId) => {
  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: Person,
        attributes: ['shortName'],
        through: { attributes: [] },
      },
    ],
  });

  if (!event) {
    throw new Error('Evento não encontrado');
  }

  return event.People.map((person) => person.shortName);
};

module.exports = {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  getPersonsByEventId,
};
