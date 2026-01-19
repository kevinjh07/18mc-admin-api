const Command = require('../models/Command');

const getAllCommands = async () => {
  return await Command.findAll({
    attributes: ['id', 'name'],
  });
};

module.exports = {
  getAllCommands,
};
