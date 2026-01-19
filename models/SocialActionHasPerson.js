const sequelize = require('../config/database');
const SocialAction = require('./SocialAction');
const Person = require('./Person');

const SocialActionPerson = sequelize.define(
  'SocialActionPerson',
  {},
  { timestamps: false, tableName: 'social_action_has_person' },
);

SocialAction.belongsToMany(Person, { through: SocialActionPerson });
Person.belongsToMany(SocialAction, { through: SocialActionPerson });

module.exports = SocialActionPerson;
