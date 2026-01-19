require('dotenv').config();

const { getAllCommands } = require('../services/commandService');
const Command = require('../models/Command');

jest.mock('../models/Command');

describe('Command Service', () => {
  beforeAll(() => {
    process.env.JAWSDB_URL = 'mysql://user:password@localhost:3306/mydb';
  });

  describe('getAllCommands', () => {
    it('should return a list of commands', async () => {
      const mockCommands = [
        { id: 1, name: 'Command 1' },
        { id: 2, name: 'Command 2' },
      ];
      Command.findAll.mockResolvedValue(mockCommands);

      const result = await getAllCommands();
      expect(Command.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name'],
      });
      expect(result).toEqual(mockCommands);
    });

    it('should throw an error if fetching fails', async () => {
      Command.findAll.mockRejectedValue(new Error('Error fetching commands'));

      await expect(getAllCommands()).rejects.toThrow('Error fetching commands');
    });
  });
});
