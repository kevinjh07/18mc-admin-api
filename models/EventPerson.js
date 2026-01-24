const sequelize = require('../config/database');
const Event = require('./Event');
const Person = require('./Person');

const EventPerson = sequelize.define(
  'EventPerson',
  {},
  { timestamps: false, tableName: 'event_has_person' },
);

Event.belongsToMany(Person, { through: EventPerson });
Person.belongsToMany(Event, { through: EventPerson });

module.exports = EventPerson;
