const Division = require('../models/Division');
const Event = require('../models/Event');
const Person = require('../models/Person');
const { Op } = require('sequelize');

const generateDivisionReport = async (regionalId, startDate, endDate) => {
  const eventWhere = { eventType: 'social_action' };
  const divisionWhere = regionalId ? { regionalId } : {};

  if (startDate) {
    eventWhere.date = { [Op.gte]: new Date(startDate) };
  }

  if (endDate) {
    eventWhere.date = { ...eventWhere.date, [Op.lte]: new Date(endDate) };
  }

  const events = await Event.findAll({
    where: eventWhere,
    include: [
      {
        model: Division,
        where: divisionWhere,
        attributes: ['id', 'name'],
      },
      {
        model: Person,
        as: 'People',
        attributes: ['id', 'shortName', 'hierarchyLevel'],
        through: { attributes: [] },
      },
    ],
    order: [['date', 'DESC']],
  });

  const divisionMap = {};

  events.forEach((event) => {
    const divisionId = event.divisionId;
    if (!divisionMap[divisionId]) {
      divisionMap[divisionId] = {
        'divisionId': event.Division.id,
        'divisionName': event.Division.name,
        socialActions: {
          internal: [],
          external: [],
          fundraising: [],
        },
      };
    }

    const actionData = {
      id: event.id,
      name: event.title,
      date: event.date,
      participants: event.People.map((participant) => ({
        'id': participant.id,
        'shortName': participant.shortName,
        'hierarchyLevel': participant.hierarchyLevel,
      })),
    };

    if (event.actionType === 'internal') {
      divisionMap[divisionId].socialActions.internal.push(actionData);
    } else if (event.actionType === 'external') {
      divisionMap[divisionId].socialActions.external.push(actionData);
    } else if (event.actionType === 'fundraising') {
      divisionMap[divisionId].socialActions.fundraising.push(actionData);
    }
  });

  return Object.values(divisionMap);
};

module.exports = {
  generateDivisionReport,
};
