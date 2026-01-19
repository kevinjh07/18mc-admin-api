const Division = require('../models/Division');
const SocialAction = require('../models/SocialAction');
const Person = require('../models/Person');
const { Op } = require('sequelize');

const generateDivisionReport = async (regionalId, startDate, endDate) => {
  const actionWhere = {};
  const divisionWhere = regionalId ? { regionalId } : {};

  if (startDate) {
    actionWhere.date = { [Op.gte]: new Date(startDate) };
  }

  if (endDate) {
    actionWhere.date = { ...actionWhere.date, [Op.lte]: new Date(endDate) };
  }

  const socialActions = await SocialAction.findAll({
    where: actionWhere,
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

  socialActions.forEach((action) => {
    const divisionId = action.divisionId;
    if (!divisionMap[divisionId]) {
      divisionMap[divisionId] = {
        'divisionId': action.Division.id,
        'divisionName': action.Division.name,
        socialActions: {
          internal: [],
          external: [],
          fundraising: [],
        },
      };
    }

    const actionData = {
      id: action.id,
      name: action.title,
      date: action.date,
      participants: action.People.map((participant) => ({
        'id': participant.id,
        'shortName': participant.shortName,
        'hierarchyLevel': participant.hierarchyLevel,
      })),
    };

    if (action.actionType === 'internal') {
      divisionMap[divisionId].socialActions.internal.push(actionData);
    } else {
      divisionMap[divisionId].socialActions.external.push(actionData);
    }
  });

  return Object.values(divisionMap);
};

module.exports = {
  generateDivisionReport,
};
