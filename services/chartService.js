const { Sequelize, Op } = require('sequelize');
const sequelize = require('../config/database');
const SocialAction = require('../models/SocialAction');
const Division = require('../models/Division');
const Regional = require('../models/Regional');

const parseDateString = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getSocialActionCountByDateRange = async (
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

  const socialActions = await SocialAction.findAll({
    attributes: [
      'divisionId',
      [Sequelize.fn('COUNT', Sequelize.col('SocialAction.id')), 'actionCount'],
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

  socialActions.forEach((action) => {
    if (divisionMap[action.divisionId]) {
      divisionMap[action.divisionId].value = action.get('actionCount');
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

const getSocialActionInternalExternalCountByDateRange = async (
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

  const socialActions = await SocialAction.findAll({
    attributes: [
      'divisionId',
      'actionType',
      [Sequelize.fn('COUNT', Sequelize.col('SocialAction.id')), 'actionCount'],
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

  socialActions.forEach((action) => {
    const division = divisionMap[action.divisionId];
    if (division) {
      const type = action.actionType;
      const seriesItem = division.series.find((item) => {
        if (type === 'internal') return item.name === 'Interna';
        if (type === 'external') return item.name === 'Externa';
        if (type === 'fundraising') return item.name === 'Arrecadação';
      });
      if (seriesItem) {
        seriesItem.value = action.get('actionCount');
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

const getSocialActionsByPersonAndDivisionRaw = async (
  divisionId,
  startDate,
  endDate,
) => {
  startDate = parseDateString(startDate);
  endDate = parseDateString(endDate);

  const query = `
    SELECT p.id as personId, p.shortName as name, d.name as divisionName, COUNT(sap.SocialActionId) as value
    FROM persons p
    JOIN social_action_has_person sap ON p.id = sap.PersonId
    JOIN social_actions sa ON sa.id = sap.SocialActionId
    JOIN divisions d ON d.id = sa.divisionId
    WHERE d.id = :divisionId AND sa.date BETWEEN :startDate AND :endDate
    GROUP BY p.id, p.shortName, d.name
    ORDER BY value, name
  `;

  const socialActions = await sequelize.query(query, {
    replacements: { divisionId, startDate, endDate },
    type: Sequelize.QueryTypes.SELECT,
  });

  return socialActions;
};

module.exports = {
  getSocialActionCountByDateRange,
  getSocialActionInternalExternalCountByDateRange,
  getSocialActionsByPersonAndDivisionRaw,
};
