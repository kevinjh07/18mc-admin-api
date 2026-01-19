require('dotenv').config();

const {
  createRegional,
  getRegionalById,
  getAllRegionals,
  updateRegional,
} = require('../services/regionalService');
const Regional = require('../models/Regional');
const Command = require('../models/Command');

jest.mock('../models/Regional');
jest.mock('../models/Command');

describe('Regional Service', () => {
  beforeAll(() => {
    process.env.JAWSDB_URL = 'mysql://user:password@localhost:3306/mydb';
  });

  describe('createRegional', () => {
    it('should create a regional successfully', async () => {
      const mockRegional = { id: 1, name: 'North' };
      Regional.create.mockResolvedValue(mockRegional);

      const result = await createRegional({ name: 'North' });
      expect(Regional.create).toHaveBeenCalledWith({ name: 'North' });
      expect(result).toEqual(mockRegional);
    });

    it('should throw an error if creation fails', async () => {
      Regional.create.mockRejectedValue(new Error('Error creating regional'));

      await expect(createRegional('North')).rejects.toThrow(
        'Error creating regional',
      );
    });

    it('should throw an error if commandId is invalid', async () => {
      Command.findByPk.mockResolvedValue(null);

      await expect(createRegional({ name: 'North', commandId: 1 })).rejects.toThrow(
        'Comando não encontrado.',
      );
    });
  });

  describe('getRegionalById', () => {
    it('should return a regional by ID', async () => {
      const mockRegional = { id: 1, name: 'North' };
      Regional.findByPk.mockResolvedValue(mockRegional);

      const result = await getRegionalById(1);
      expect(Regional.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: expect.any(Function), as: 'command', attributes: ['id', 'name'] }],
      });
      expect(result).toEqual(mockRegional);
    });

    it('should return null if regional is not found', async () => {
      Regional.findByPk.mockResolvedValue(null);

      const result = await getRegionalById(1);
      expect(Regional.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: expect.any(Function), as: 'command', attributes: ['id', 'name'] }],
      });
      expect(result).toBeNull();
    });

    it('should throw an error if fetching fails', async () => {
      Regional.findByPk.mockRejectedValue(new Error('Error fetching regional'));

      await expect(getRegionalById(1)).rejects.toThrow(
        'Error fetching regional',
      );
    });
  });

  describe('getAllRegionals', () => {
    it('should return a list of regionals with pagination', async () => {
      const mockRegionals = {
        count: 2,
        rows: [
          { id: 1, name: 'North' },
          { id: 2, name: 'South' },
        ],
      };
      Regional.findAndCountAll.mockResolvedValue(mockRegionals);

      const result = await getAllRegionals(1, 10);
      expect(Regional.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        include: [{ model: expect.any(Function), as: 'command', attributes: ['id', 'name'] }],
      });
      expect(result).toEqual({
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        data: mockRegionals.rows,
      });
    });

    it('should return a list of regionals filtered by commandId', async () => {
      const mockRegionals = {
        count: 1,
        rows: [{ id: 1, name: 'North', commandId: 1 }],
      };
      Regional.findAndCountAll.mockResolvedValue(mockRegionals);

      const result = await getAllRegionals(1, 10, 1);
      expect(Regional.findAndCountAll).toHaveBeenCalledWith({
        where: { commandId: 1 },
        limit: 10,
        offset: 0,
        include: [{ model: expect.any(Function), as: 'command', attributes: ['id', 'name'] }],
      });
      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: mockRegionals.rows,
      });
    });

    it('should throw an error if fetching fails', async () => {
      Regional.findAndCountAll.mockRejectedValue(
        new Error('Error fetching regionals'),
      );

      await expect(getAllRegionals(1, 10)).rejects.toThrow(
        'Error fetching regionals',
      );
    });
  });

  describe('updateRegional', () => {
    it('should update a regional successfully', async () => {
      const mockRegional = {
        id: 1,
        name: 'North',
        update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated North' }), // Adicionando o método update
      };

      Regional.findByPk.mockResolvedValue(mockRegional);

      const result = await updateRegional(1, { name: 'Updated North' });

      expect(Regional.findByPk).toHaveBeenCalledWith(1);
      expect(mockRegional.update).toHaveBeenCalledWith({ name: 'Updated North' });
      expect(result).toEqual({ id: 1, name: 'Updated North' });
    });

    it('should throw a ValidationError if regional is not found', async () => {
      Regional.findByPk.mockResolvedValue(null);

      await expect(updateRegional(1, 'Updated North')).rejects.toThrow('Regional não encontrada.');
      expect(Regional.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw an error if updating fails', async () => {
      Regional.findByPk.mockRejectedValue(new Error('Error updating regional'));

      await expect(updateRegional(1, 'Updated North')).rejects.toThrow(
        'Error updating regional',
      );
    });
  });
});
