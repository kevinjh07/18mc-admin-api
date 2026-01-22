require('dotenv').config();

jest.mock('../models/SocialAction', () => ({
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../models/Division', () => ({
  findByPk: jest.fn(),
}));
jest.mock('../models/Person', () => ({
  findAll: jest.fn(),
}));
jest.mock('../models/Regional');

const {
  createSocialAction,
  getSocialActionById,
  getAllSocialActions,
  updateSocialAction,
  getPersonsBySocialActionId,
} = require('../services/socialActionService');
const SocialAction = require('../models/SocialAction');
const Division = require('../models/Division');
const Person = require('../models/Person');
const Regional = require('../models/Regional');

describe('Social Action Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSocialAction', () => {
    it('should create social action successfully', async () => {
      const mockDivision = { id: 1 };
      const mockSocialAction = { id: 1, title: 'Action 1', divisionId: 1 };

      Division.findByPk.mockResolvedValue(mockDivision);
      SocialAction.create.mockResolvedValue(mockSocialAction);

      const result = await createSocialAction({
        title: 'Action 1',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        actionType: 'internal',
      });

      expect(Division.findByPk).toHaveBeenCalledWith(1);
      expect(SocialAction.create).toHaveBeenCalledWith({
        title: 'Action 1',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        actionType: 'internal',
      });
      expect(result).toEqual(mockSocialAction);
    });

    it('should throw error if division not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      await expect(createSocialAction({
        title: 'Action 1',
        divisionId: 1,
      })).rejects.toThrow('Divisão inválida');
    });
  });

  describe('getSocialActionById', () => {
    it('should return social action by id', async () => {
      const mockSocialAction = {
        id: 1,
        Division: { id: 1, name: 'Division A', Regional: { id: 1 } },
        People: [{ id: 1, shortName: 'Person A' }],
      };

      SocialAction.findByPk.mockResolvedValue(mockSocialAction);

      const result = await getSocialActionById(1);

      expect(SocialAction.findByPk).toHaveBeenCalledWith(1, {
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
      expect(result).toEqual(mockSocialAction);
    });

    it('should return null if social action not found', async () => {
      SocialAction.findByPk.mockResolvedValue(null);

      const result = await getSocialActionById(1);

      expect(result).toBeNull();
    });
  });

  describe('getAllSocialActions', () => {
    it('should return paginated social actions by divisionId', async () => {
      const mockSocialActions = {
        count: 1,
        rows: [{ id: 1, title: 'Action 1' }],
      };

      SocialAction.findAndCountAll.mockResolvedValue(mockSocialActions);

      const result = await getAllSocialActions(1, 10, null, 1);

      expect(SocialAction.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['date', 'DESC']],
        include: [
          {
            model: Division,
            attributes: ['name', 'regionalId'],
            where: { id: 1 },
          },
        ],
      });
      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: mockSocialActions.rows,
      });
    });

    it('should return paginated social actions by regionalId', async () => {
      const mockSocialActions = {
        count: 1,
        rows: [{ id: 1, title: 'Action 1' }],
      };

      SocialAction.findAndCountAll.mockResolvedValue(mockSocialActions);

      const result = await getAllSocialActions(1, 10, 1, null);

      expect(SocialAction.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['date', 'DESC']],
        include: [
          {
            model: Division,
            attributes: ['name', 'regionalId'],
            where: { regionalId: 1 },
          },
        ],
      });
      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: mockSocialActions.rows,
      });
    });

    it('should return all social actions if no filters', async () => {
      const mockSocialActions = {
        count: 1,
        rows: [{ id: 1, title: 'Action 1' }],
      };

      SocialAction.findAndCountAll.mockResolvedValue(mockSocialActions);

      const result = await getAllSocialActions(1, 10, null, null);

      expect(SocialAction.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['date', 'DESC']],
        include: [
          {
            model: Division,
            attributes: ['name', 'regionalId'],
            where: {},
          },
        ],
      });
      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: mockSocialActions.rows,
      });
    });
  });

  describe('updateSocialAction', () => {
    it('should update social action successfully', async () => {
      const mockDivision = { id: 1 };
      const mockSocialAction = {
        id: 1,
        update: jest.fn(),
        setPeople: jest.fn(),
      };
      const mockPersons = [{ id: 1 }, { id: 2 }];

      Division.findByPk.mockResolvedValue(mockDivision);
      SocialAction.findByPk.mockResolvedValue(mockSocialAction);
      Person.findAll.mockResolvedValue(mockPersons);

      const result = await updateSocialAction({
        id: 1,
        title: 'Updated Action',
        date: '2026-01-01',
        description: 'Updated Description',
        divisionId: 1,
        personIds: [1, 2],
        actionType: 'internal',
      });

      expect(Division.findByPk).toHaveBeenCalledWith(1);
      expect(SocialAction.findByPk).toHaveBeenCalledWith(1);
      expect(mockSocialAction.update).toHaveBeenCalledWith({
        title: 'Updated Action',
        date: '2026-01-01',
        description: 'Updated Description',
        divisionId: 1,
        actionType: 'internal',
      });
      expect(Person.findAll).toHaveBeenCalledWith({ where: { id: [1, 2] } });
      expect(mockSocialAction.setPeople).toHaveBeenCalledWith(mockPersons);
      expect(result).toEqual(mockSocialAction);
    });

    it('should update social action without persons', async () => {
      const mockDivision = { id: 1 };
      const mockSocialAction = {
        id: 1,
        update: jest.fn(),
        setPeople: jest.fn(),
      };

      Division.findByPk.mockResolvedValue(mockDivision);
      SocialAction.findByPk.mockResolvedValue(mockSocialAction);

      const result = await updateSocialAction({
        id: 1,
        title: 'Updated Action',
        divisionId: 1,
        personIds: [],
      });

      expect(mockSocialAction.setPeople).toHaveBeenCalledWith([]);
      expect(result).toEqual(mockSocialAction);
    });

    it('should throw error if division not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      await expect(updateSocialAction({
        id: 1,
        divisionId: 1,
      })).rejects.toThrow('Divisão inválida');
    });

    it('should return error if social action not found', async () => {
      const mockDivision = { id: 1 };

      Division.findByPk.mockResolvedValue(mockDivision);
      SocialAction.findByPk.mockResolvedValue(null);

      const result = await updateSocialAction({
        id: 1,
        divisionId: 1,
      });

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Ação social não encontrada');
    });

    it('should return null if some persons not found', async () => {
      const mockDivision = { id: 1 };
      const mockSocialAction = { id: 1, update: jest.fn() };

      Division.findByPk.mockResolvedValue(mockDivision);
      SocialAction.findByPk.mockResolvedValue(mockSocialAction);
      Person.findAll.mockResolvedValue([{ id: 1 }]); // Only one found

      const result = await updateSocialAction({
        id: 1,
        divisionId: 1,
        personIds: [1, 2],
      });

      expect(result).toBeNull();
    });
  });

  describe('getPersonsBySocialActionId', () => {
    it('should return persons by social action id', async () => {
      const mockSocialAction = {
        id: 1,
        People: [
          { shortName: 'Person A' },
          { shortName: 'Person B' },
        ],
      };

      SocialAction.findByPk.mockResolvedValue(mockSocialAction);

      const result = await getPersonsBySocialActionId(1);

      expect(SocialAction.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Person,
            attributes: ['shortName'],
            through: { attributes: [] },
          },
        ],
      });
      expect(result).toEqual(['Person A', 'Person B']);
    });

    it('should throw error if social action not found', async () => {
      SocialAction.findByPk.mockResolvedValue(null);

      await expect(getPersonsBySocialActionId(1)).rejects.toThrow('Ação social não encontrada');
    });
  });
});
