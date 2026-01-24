require('dotenv').config();

const {
  createDivision,
  getDivisionById,
  getAllDivisions,
  getAllDivisionsByRegionalId,
  updateDivision,
  deleteDivision,
} = require('../services/divisionService');
const Division = require('../models/Division');
const Regional = require('../models/Regional');

jest.mock('../models/Division');
jest.mock('../models/Regional');

describe('Division Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDivision', () => {
    it('should create a division successfully', async () => {
      const mockRegional = { id: 1 };
      const mockDivision = { id: 1, name: 'Division A', regionalId: 1 };

      Regional.findByPk.mockResolvedValue(mockRegional);
      Division.create.mockResolvedValue(mockDivision);

      const result = await createDivision('Division A', 1);

      expect(Regional.findByPk).toHaveBeenCalledWith(1);
      expect(Division.create).toHaveBeenCalledWith({ name: 'Division A', regionalId: 1 });
      expect(result).toEqual(mockDivision);
    });

    it('should throw error if regional not found', async () => {
      Regional.findByPk.mockResolvedValue(null);

      await expect(createDivision('Division A', 1)).rejects.toThrow('Regional not found');
    });
  });

  describe('getDivisionById', () => {
    it('should return division by id', async () => {
      const mockDivision = { id: 1, name: 'Division A', Regional: { name: 'Regional A', commandId: 1 } };

      Division.findByPk.mockResolvedValue(mockDivision);

      const result = await getDivisionById(1);

      expect(Division.findByPk).toHaveBeenCalledWith(1, {
        include: { model: Regional, attributes: ['name', 'commandId'] },
      });
      expect(result).toEqual(mockDivision);
    });

    it('should return null if division not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      const result = await getDivisionById(1);

      expect(result).toBeNull();
    });
  });

  describe('getAllDivisions', () => {
    it('should return paginated divisions', async () => {
      const mockDivisions = {
        count: 2,
        rows: [{ id: 1, name: 'Division A' }, { id: 2, name: 'Division B' }],
      };

      Division.findAndCountAll.mockResolvedValue(mockDivisions);

      const result = await getAllDivisions(1, 10, 1);

      expect(Division.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        where: { regionalId: 1 },
      });
      expect(result).toEqual({
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        data: mockDivisions.rows,
      });
    });

    it('should return all divisions if no regionalId', async () => {
      const mockDivisions = {
        count: 1,
        rows: [{ id: 1, name: 'Division A' }],
      };

      Division.findAndCountAll.mockResolvedValue(mockDivisions);

      const result = await getAllDivisions(1, 10);

      expect(Division.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        where: {},
      });
      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: mockDivisions.rows,
      });
    });
  });

  describe('getAllDivisionsByRegionalId', () => {
    it('should return divisions by regionalId', async () => {
      const mockDivisions = [{ id: 1, name: 'Division A', regionalId: 1 }];

      Division.findAll.mockResolvedValue(mockDivisions);

      const result = await getAllDivisionsByRegionalId(1);

      expect(Division.findAll).toHaveBeenCalledWith({
        where: { regionalId: 1 },
        attributes: ['id', 'name', 'regionalId'],
      });
      expect(result).toEqual(mockDivisions);
    });

    it('should return all divisions if no regionalId', async () => {
      const mockDivisions = [{ id: 1, name: 'Division A' }];

      Division.findAll.mockResolvedValue(mockDivisions);

      const result = await getAllDivisionsByRegionalId();

      expect(Division.findAll).toHaveBeenCalledWith({
        where: {},
        attributes: ['id', 'name', 'regionalId'],
      });
      expect(result).toEqual(mockDivisions);
    });
  });

  describe('updateDivision', () => {
    it('should update division successfully', async () => {
      const mockRegional = { id: 1 };
      const mockDivision = { id: 1, update: jest.fn() };
      const mockUpdatedDivision = { id: 1, name: 'Updated Division', Regional: {} };

      Regional.findByPk.mockResolvedValue(mockRegional);
      Division.findByPk.mockResolvedValueOnce(mockDivision).mockResolvedValueOnce(mockUpdatedDivision);

      const result = await updateDivision(1, 'Updated Division', 1);

      expect(Regional.findByPk).toHaveBeenCalledWith(1);
      expect(Division.findByPk).toHaveBeenCalledTimes(2);
      expect(mockDivision.update).toHaveBeenCalledWith({ name: 'Updated Division', regionalId: 1 });
      expect(result).toEqual(mockUpdatedDivision);
    });

    it('should throw error if regional not found', async () => {
      Regional.findByPk.mockResolvedValue(null);

      await expect(updateDivision(1, 'Updated Division', 1)).rejects.toThrow('Regional not found');
    });

    it('should return null if division not found', async () => {
      const mockRegional = { id: 1 };

      Regional.findByPk.mockResolvedValue(mockRegional);
      Division.findByPk.mockResolvedValue(null);

      const result = await updateDivision(1, 'Updated Division', 1);

      expect(result).toBeNull();
    });
  });

  describe('deleteDivision', () => {
    it('should delete division successfully', async () => {
      const mockDivision = { id: 1, destroy: jest.fn() };

      Division.findByPk.mockResolvedValue(mockDivision);

      const result = await deleteDivision(1);

      expect(Division.findByPk).toHaveBeenCalledWith(1);
      expect(mockDivision.destroy).toHaveBeenCalled();
      expect(result).toEqual(mockDivision);
    });

    it('should return null if division not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      const result = await deleteDivision(1);

      expect(result).toBeNull();
    });
  });
});
