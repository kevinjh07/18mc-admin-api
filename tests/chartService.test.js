require('dotenv').config();

jest.mock('../models/Division', () => ({
  findAll: jest.fn(),
}));
jest.mock('../models/Regional', () => ({}));
jest.mock('../models/SocialAction', () => ({
  findAll: jest.fn(),
}));
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const {
  getSocialActionCountByDateRange,
  getSocialActionInternalExternalCountByDateRange,
  getSocialActionsByPersonAndDivisionRaw,
} = require('../services/chartService');
const Division = require('../models/Division');
const Regional = require('../models/Regional');
const SocialAction = require('../models/SocialAction');
const sequelize = require('../config/database');

describe('Chart Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSocialActionCountByDateRange', () => {
    it('should return divisions with action counts sorted by value and name', async () => {
      const mockDivisions = [
        { id: 1, name: 'Division A', Regional: { id: 1 } },
        { id: 2, name: 'Division B', Regional: { id: 1 } },
      ];
      const mockSocialActions = [
        { divisionId: 1, get: jest.fn(() => 5) },
        { divisionId: 2, get: jest.fn(() => 3) },
      ];

      Division.findAll.mockResolvedValue(mockDivisions);
      SocialAction.findAll.mockResolvedValue(mockSocialActions);

      const result = await getSocialActionCountByDateRange('2026-01-01', '2026-01-31', 1);

      expect(Division.findAll).toHaveBeenCalledWith({
        where: { regionalId: 1 },
        attributes: ['id', 'name'],
        include: {
          model: Regional,
          attributes: ['id'],
        },
      });
      expect(SocialAction.findAll).toHaveBeenCalledWith({
        attributes: [
          'divisionId',
          expect.any(Array), // [Sequelize.fn('COUNT', Sequelize.col('SocialAction.id')), 'actionCount']
        ],
        where: {
          date: expect.any(Object), // { [Op.between]: [startDate, endDate] }
        },
        group: ['divisionId'],
      });
      expect(result).toEqual([
        { id: 2, name: 'Division B', value: 3 },
        { id: 1, name: 'Division A', value: 5 },
      ]);
    });

    it('should return divisions with zero counts if no actions', async () => {
      const mockDivisions = [
        { id: 1, name: 'Division A', Regional: { id: 1 } },
      ];
      const mockSocialActions = [];

      Division.findAll.mockResolvedValue(mockDivisions);
      SocialAction.findAll.mockResolvedValue(mockSocialActions);

      const result = await getSocialActionCountByDateRange('2026-01-01', '2026-01-31', 1);

      expect(result).toEqual([
        { id: 1, name: 'Division A', value: 0 },
      ]);
    });
  });

  describe('getSocialActionInternalExternalCountByDateRange', () => {
    it('should return divisions with series counts sorted by total and name', async () => {
      const mockDivisions = [
        { id: 1, name: 'Division A', Regional: { id: 1 } },
        { id: 2, name: 'Division B', Regional: { id: 1 } },
      ];
      const mockSocialActions = [
        { divisionId: 1, actionType: 'internal', get: jest.fn(() => 2) },
        { divisionId: 1, actionType: 'external', get: jest.fn(() => 3) },
        { divisionId: 2, actionType: 'fundraising', get: jest.fn(() => 1) },
      ];

      Division.findAll.mockResolvedValue(mockDivisions);
      SocialAction.findAll.mockResolvedValue(mockSocialActions);

      const result = await getSocialActionInternalExternalCountByDateRange('2026-01-01', '2026-01-31', 1);

      expect(result).toEqual([
        {
          id: 2,
          name: 'Division B',
          series: [
            { name: 'Interna', value: 0 },
            { name: 'Externa', value: 0 },
            { name: 'Arrecadação', value: 1 },
          ],
        },
        {
          id: 1,
          name: 'Division A',
          series: [
            { name: 'Interna', value: 2 },
            { name: 'Externa', value: 3 },
            { name: 'Arrecadação', value: 0 },
          ],
        },
      ]);
    });

    it('should return divisions with zero series if no actions', async () => {
      const mockDivisions = [
        { id: 1, name: 'Division A', Regional: { id: 1 } },
      ];
      const mockSocialActions = [];

      Division.findAll.mockResolvedValue(mockDivisions);
      SocialAction.findAll.mockResolvedValue(mockSocialActions);

      const result = await getSocialActionInternalExternalCountByDateRange('2026-01-01', '2026-01-31', 1);

      expect(result).toEqual([
        {
          id: 1,
          name: 'Division A',
          series: [
            { name: 'Interna', value: 0 },
            { name: 'Externa', value: 0 },
            { name: 'Arrecadação', value: 0 },
          ],
        },
      ]);
    });
  });

  describe('getSocialActionsByPersonAndDivisionRaw', () => {
    it('should return social actions by person and division', async () => {
      const mockResults = [
        { personId: 1, name: 'Person A', divisionName: 'Division A', value: 5 },
      ];

      sequelize.query.mockResolvedValue(mockResults);

      const result = await getSocialActionsByPersonAndDivisionRaw(1, '2026-01-01', '2026-01-31');

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT p.id as personId'),
        {
          replacements: { divisionId: 1, startDate: new Date(2026, 0, 1), endDate: new Date(2026, 0, 31) },
          type: expect.anything(), // Sequelize.QueryTypes.SELECT
        }
      );
      expect(result).toEqual(mockResults);
    });

    it('should return empty array if no results', async () => {
      sequelize.query.mockResolvedValue([]);

      const result = await getSocialActionsByPersonAndDivisionRaw(1, '2026-01-01', '2026-01-31');

      expect(result).toEqual([]);
    });
  });
});
