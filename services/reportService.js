const Division = require('../models/Division');
const Event = require('../models/Event');
const Person = require('../models/Person');
const LatePayment = require('../models/LatePayment');
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

const getGraduationScores = async (divisionId, startDate, endDate) => {
  const division = await Division.findByPk(divisionId);
  if (!division) {
    return null;
  }

  // Busca integrantes ativos da divisão
  const persons = await Person.findAll({
    where: { divisionId, isActive: true },
    attributes: ['id', 'fullName', 'shortName'],
  });

  if (persons.length === 0) {
    return { period: { start: startDate, end: endDate }, data: [] };
  }

  const personIds = persons.map((p) => p.id);

  const events = await Event.findAll({
    where: {
      divisionId,
      date: { [Op.between]: [startDate, endDate] },
    },
    include: [{ model: Person, where: { id: { [Op.in]: personIds } }, required: false }],
    order: [['date', 'ASC']],
  });

  const months = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    months.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }

  const latePayments = await LatePayment.findAll({
    where: {
      personId: { [Op.in]: personIds },
      [Op.or]: months.map((m) => ({ year: m.year, month: m.month })),
    },
  });

  const latePaymentsByPerson = {};
  latePayments.forEach((lp) => {
    if (!latePaymentsByPerson[lp.personId]) {
      latePaymentsByPerson[lp.personId] = [];
    }
    latePaymentsByPerson[lp.personId].push(lp);
  });

  const data = persons.map((person) => {
    const participations = { social_action: false, poll: false, other: false };

    const personEvents = events.map((event) => {
      const participated = event.People && event.People.some((p) => p.id === person.id);
      if (participated) {
        participations[event.eventType] = true;
      }
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        eventType: event.eventType,
        participated,
      };
    });

    const personLatePayments = latePaymentsByPerson[person.id] || [];
    const hasLatePayment = personLatePayments.length > 0;

    const scores = {
      socialAction: participations.social_action ? 1 : 0,
      poll: participations.poll ? 1 : 0,
      otherEvents: participations.other ? 1 : 0,
      payments: hasLatePayment ? 0 : 1,
    };

    return {
      personId: person.id,
      fullName: person.fullName,
      shortName: person.shortName,
      scores,
      totalScore: scores.socialAction + scores.poll + scores.otherEvents + scores.payments,
      events: personEvents,
      latePayments: personLatePayments.map((lp) => ({
        year: lp.year,
        month: lp.month,
        paidAt: lp.paidAt,
      })),
    };
  });

  data.sort((a, b) => a.shortName.localeCompare(b.shortName, 'pt-BR'));

  return {
    period: { start: startDate, end: endDate },
    data,
  };
};

module.exports = {
  generateDivisionReport,
  getGraduationScores,
};
