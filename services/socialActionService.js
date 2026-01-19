const SocialAction = require('../models/SocialAction');
const Division = require('../models/Division');
const Person = require('../models/Person');
const Regional = require('../models/Regional');

const createSocialAction = async (socialAction) => {
  const { title, date, description, divisionId, actionType } = socialAction;
  const division = await Division.findByPk(divisionId);
  if (!division) {
    throw new Error('Divisão inválida');
  }
  return await SocialAction.create({
    title,
    date,
    description,
    divisionId,
    actionType,
  });
};

const getSocialActionById = async (id) => {
  return await SocialAction.findByPk(id, {
    include: [
      {
        model: Division,
        attributes: ['id', 'name'],
        include: {
          model: Regional,
          attributes: ['id'],
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

const getAllSocialActions = async (page, limit, regionalId, divisionId) => {
  const offset = (page - 1) * limit;

  const whereCondition =
    !isNaN(divisionId) && divisionId
      ? { id: divisionId }
      : regionalId
        ? { regionalId: regionalId }
        : {};

  const socialActions = await SocialAction.findAndCountAll({
    limit,
    offset,
    order: [['date', 'DESC']],
    include: [
      {
        model: Division,
        attributes: ['name', 'regionalId'],
        where: whereCondition,
      },
    ],
  });

  return {
    totalItems: socialActions.count,
    totalPages: Math.ceil(socialActions.count / limit),
    currentPage: page,
    data: socialActions.rows,
  };
};

const updateSocialAction = async (socialAcion) => {
  const { id, title, date, description, divisionId, personIds, actionType } = socialAcion;
  const division = await Division.findByPk(divisionId);
  if (!division) {
    throw new Error('Divisão inválida');
  }

  const socialAction = await SocialAction.findByPk(id);
  if (!socialAction) {
    return new Error ('Ação social não encontrada');
  }

  await socialAction.update({
    title,
    date,
    description,
    divisionId,
    actionType,
  });

  if (personIds && personIds.length > 0) {
    const persons = await Person.findAll({ where: { id: personIds } });
    if (persons.length !== personIds.length) {
      return null;
    }
    await socialAction.setPeople(persons);
  } else {
    await socialAction.setPeople([]);
  }

  return socialAction;
};

const getPersonsBySocialActionId = async (socialActionId) => {
  const socialAction = await SocialAction.findByPk(socialActionId, {
    include: [
      {
        model: Person,
        attributes: ['shortName'],
        through: { attributes: [] },
      },
    ],
  });

  if (!socialAction) {
    throw new Error('Ação social não encontrada');
  }

  return socialAction.People.map((person) => person.shortName);
};

module.exports = {
  createSocialAction,
  getSocialActionById,
  getAllSocialActions,
  updateSocialAction,
  getPersonsBySocialActionId,
};
