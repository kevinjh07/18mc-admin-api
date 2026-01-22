require('dotenv').config();

jest.mock('../models/Division');
jest.mock('../models/SocialAction', () => ({
  findAll: jest.fn(),
}));
jest.mock('../models/Person');

const { generateDivisionReport } = require('../services/reportService');
const Division = require('../models/Division');
const SocialAction = require('../models/SocialAction');
const Person = require('../models/Person');

describe('Report Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDivisionReport', () => {
    it('should generate division report with social actions', async () => {
      const mockSocialActions = [
        {
          id: 1,
          title: 'Action 1',
          date: '2026-01-01',
          actionType: 'internal',
          divisionId: 1,
          Division: { id: 1, name: 'Division A' },
          People: [
            { id: 1, shortName: 'Person A', hierarchyLevel: 'member' },
          ],
        },
        {
          id: 2,
          title: 'Action 2',
          date: '2026-01-02',
          actionType: 'external',
          divisionId: 1,
          Division: { id: 1, name: 'Division A' },
          People: [
            { id: 2, shortName: 'Person B', hierarchyLevel: 'leader' },
          ],
        },
      ];

      SocialAction.findAll.mockResolvedValue(mockSocialActions);

      const result = await generateDivisionReport(1, '2026-01-01', '2026-01-31');

      expect(SocialAction.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          date: expect.any(Object),
        }),
        include: [
          {
            model: Division,
            where: { regionalId: 1 },
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
      expect(result).toEqual([
        {
          divisionId: 1,
          divisionName: 'Division A',
          socialActions: {
            internal: [
              {
                id: 1,
                name: 'Action 1',
                date: '2026-01-01',
                participants: [
                  { id: 1, shortName: 'Person A', hierarchyLevel: 'member' },
                ],
              },
            ],
            external: [
              {
                id: 2,
                name: 'Action 2',
                date: '2026-01-02',
                participants: [
                  { id: 2, shortName: 'Person B', hierarchyLevel: 'leader' },
                ],
              },
            ],
            fundraising: [],
          },
        },
      ]);
    });

    it('should generate report without date filters', async () => {
      const mockSocialActions = [
        {
          id: 1,
          title: 'Action 1',
          date: '2026-01-01',
          actionType: 'internal',
          divisionId: 1,
          Division: { id: 1, name: 'Division A' },
          People: [],
        },
      ];

      SocialAction.findAll.mockResolvedValue(mockSocialActions);

      const result = await generateDivisionReport(1);

      expect(SocialAction.findAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['date', 'DESC']],
      });
      expect(result).toEqual([
        {
          divisionId: 1,
          divisionName: 'Division A',
          socialActions: {
            internal: [
              {
                id: 1,
                name: 'Action 1',
                date: '2026-01-01',
                participants: [],
              },
            ],
            external: [],
            fundraising: [],
          },
        },
      ]);
    });

    it('should return empty array if no social actions', async () => {
      SocialAction.findAll.mockResolvedValue([]);

      const result = await generateDivisionReport(1, '2026-01-01', '2026-01-31');

      expect(result).toEqual([]);
    });
  });
});