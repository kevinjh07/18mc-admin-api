const { Sequelize, Op } = require('sequelize');
const sequelize = require('../config/database');
const Event = require('../models/Event');
const Division = require('../models/Division');
const Regional = require('../models/Regional');

const parseDateString = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getEventCountByDateRange = async (
  startDate,
  endDate,
  regionalId,
) => {
  startDate = parseDateString(startDate);
  endDate = parseDateString(endDate);

  const divisions = await Division.findAll({
    where: { regionalId },
    attributes: ['id', 'name'],
    include: {
      model: Regional,
      attributes: ['id'],
    },
  });

  const events = await Event.findAll({
    attributes: [
      'divisionId',
      [Sequelize.fn('COUNT', Sequelize.col('Event.id')), 'actionCount'],
    ],
    where: {
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: ['divisionId'],
  });

  const divisionMap = divisions.reduce((acc, division) => {
    acc[division.id] = {
      id: division.id,
      name: division.name,
      value: 0,
    };
    return acc;
  }, {});

  events.forEach((event) => {
    if (divisionMap[event.divisionId]) {
      divisionMap[event.divisionId].value = event.get('actionCount');
    }
  });

  const sortedDivisions = Object.values(divisionMap).sort((a, b) => {
    if (a.value === b.value) {
      return a.name.localeCompare(b.name);
    }
    return a.value - b.value;
  });

  return sortedDivisions;
};

const getEventInternalExternalCountByDateRange = async (
  startDate,
  endDate,
  regionalId,
) => {
  startDate = parseDateString(startDate);
  endDate = parseDateString(endDate);

  const divisions = await Division.findAll({
    where: { regionalId },
    attributes: ['id', 'name'],
    include: {
      model: Regional,
      attributes: ['id'],
    },
  });

  const events = await Event.findAll({
    attributes: [
      'divisionId',
      'actionType',
      [Sequelize.fn('COUNT', Sequelize.col('Event.id')), 'actionCount'],
    ],
    where: {
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: ['divisionId', 'actionType'],
  });

  const divisionMap = divisions.reduce((acc, division) => {
    acc[division.id] = {
      id: division.id,
      name: division.name,
      series: [
        { name: 'Interna', value: 0 },
        { name: 'Externa', value: 0 },
        { name: 'Arrecadação', value: 0 },
      ],
    };
    return acc;
  }, {});

  events.forEach((event) => {
    const division = divisionMap[event.divisionId];
    if (division) {
      const type = event.actionType;
      const seriesItem = division.series.find((item) => {
        if (type === 'internal') return item.name === 'Interna';
        if (type === 'external') return item.name === 'Externa';
        if (type === 'fundraising') return item.name === 'Arrecadação';
      });
      if (seriesItem) {
        seriesItem.value = event.get('actionCount');
      }
    }
  });

  const sortedDivisions = Object.values(divisionMap).sort((a, b) => {
    const aTotal = a.series.reduce((sum, item) => sum + item.value, 0);
    const bTotal = b.series.reduce((sum, item) => sum + item.value, 0);
    if (aTotal === bTotal) {
      return a.name.localeCompare(b.name);
    }
    return aTotal - bTotal;
  });

  return sortedDivisions;
};

const getEventsByPersonAndDivisionRaw = async (
  divisionId,
  startDate,
  endDate,
) => {
  startDate = parseDateString(startDate);
  endDate = parseDateString(endDate);

  const query = `
    SELECT p.id as personId, p.shortName as name, d.name as divisionName, COUNT(ehp.EventId) as value
    FROM persons p
    JOIN event_has_person ehp ON p.id = ehp.PersonId
    JOIN events e ON e.id = ehp.EventId
    JOIN divisions d ON d.id = e.divisionId
    WHERE d.id = :divisionId AND e.date BETWEEN :startDate AND :endDate
    GROUP BY p.id, p.shortName, d.name
    ORDER BY value, name
  `;

  const events = await sequelize.query(query, {
    replacements: { divisionId, startDate, endDate },
    type: Sequelize.QueryTypes.SELECT,
  });

  return events;
};

// Backward compatibility exports
const getSocialActionCountByDateRange = getEventCountByDateRange;
const getSocialActionInternalExternalCountByDateRange = getEventInternalExternalCountByDateRange;
const getSocialActionsByPersonAndDivisionRaw = getEventsByPersonAndDivisionRaw;

module.exports = {
  getEventCountByDateRange,
  getEventInternalExternalCountByDateRange,
  getEventsByPersonAndDivisionRaw,
  getSocialActionCountByDateRange,
  getSocialActionInternalExternalCountByDateRange,
  getSocialActionsByPersonAndDivisionRaw,
};
