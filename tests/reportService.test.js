require('dotenv').config();

jest.mock('../models/Division');
jest.mock('../models/Event', () => ({
  findAll: jest.fn(),
}));
jest.mock('../models/Person', () => ({
  findAll: jest.fn(),
}));
jest.mock('../models/LatePayment', () => ({
  findAll: jest.fn(),
}));

const { generateDivisionReport, getGraduationScores } = require('../services/reportService');
const Division = require('../models/Division');
const Event = require('../models/Event');
const Person = require('../models/Person');
const LatePayment = require('../models/LatePayment');

describe('Report Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDivisionReport', () => {
    it('should generate division report with events', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Action 1',
          date: '2026-01-01',
          actionType: 'internal',
          eventType: 'social_action',
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
          eventType: 'social_action',
          divisionId: 1,
          Division: { id: 1, name: 'Division A' },
          People: [
            { id: 2, shortName: 'Person B', hierarchyLevel: 'leader' },
          ],
        },
      ];

      Event.findAll.mockResolvedValue(mockEvents);

      const result = await generateDivisionReport(1, '2026-01-01', '2026-01-31');

      expect(Event.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          eventType: 'social_action',
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
      const mockEvents = [
        {
          id: 1,
          title: 'Action 1',
          date: '2026-01-01',
          actionType: 'internal',
          eventType: 'social_action',
          divisionId: 1,
          Division: { id: 1, name: 'Division A' },
          People: [],
        },
      ];

      Event.findAll.mockResolvedValue(mockEvents);

      const result = await generateDivisionReport(1);

      expect(Event.findAll).toHaveBeenCalledWith({
        where: { eventType: 'social_action' },
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

    it('should return empty array if no events', async () => {
      Event.findAll.mockResolvedValue([]);

      const result = await generateDivisionReport(1, '2026-01-01', '2026-01-31');

      expect(result).toEqual([]);
    });
  });

  describe('getGraduationScores', () => {
    it('should return null if division not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      const result = await getGraduationScores(999, new Date('2025-01-01'), new Date('2025-12-31'));

      expect(result).toBeNull();
    });

    it('should return empty data if no active persons in division', async () => {
      Division.findByPk.mockResolvedValue({ id: 1 });
      Person.findAll.mockResolvedValue([]);

      const result = await getGraduationScores(1, new Date('2025-01-01'), new Date('2025-12-31'));

      expect(result.data).toEqual([]);
    });

    it('should calculate scores correctly for person with all points', async () => {
      Division.findByPk.mockResolvedValue({ id: 1 });
      Person.findAll.mockResolvedValue([
        { id: 1, fullName: 'João Silva', shortName: 'Silva' },
      ]);

      Event.findAll.mockResolvedValue([
        { id: 1, eventType: 'social_action', People: [{ id: 1 }] },
        { id: 2, eventType: 'poll', People: [{ id: 1 }] },
        { id: 3, eventType: 'other', People: [{ id: 1 }] },
      ]);

      LatePayment.findAll.mockResolvedValue([]);

      const result = await getGraduationScores(1, new Date('2025-01-01'), new Date('2025-12-31'));

      expect(result.data[0].scores).toEqual({
        socialAction: 1,
        poll: 1,
        otherEvents: 1,
        payments: 1,
      });
      expect(result.data[0].totalScore).toBe(4);
    });

    it('should calculate scores correctly for person with late payment', async () => {
      Division.findByPk.mockResolvedValue({ id: 1 });
      Person.findAll.mockResolvedValue([
        { id: 1, fullName: 'João Silva', shortName: 'Silva' },
      ]);

      Event.findAll.mockResolvedValue([
        { id: 1, eventType: 'social_action', People: [{ id: 1 }] },
      ]);

      LatePayment.findAll.mockResolvedValue([
        { personId: 1, year: 2025, month: 3 },
      ]);

      const result = await getGraduationScores(1, new Date('2025-01-01'), new Date('2025-12-31'));

      expect(result.data[0].scores).toEqual({
        socialAction: 1,
        poll: 0,
        otherEvents: 0,
        payments: 0,
      });
      expect(result.data[0].totalScore).toBe(1);
    });

    it('should calculate scores correctly for person with no participation', async () => {
      Division.findByPk.mockResolvedValue({ id: 1 });
      Person.findAll.mockResolvedValue([
        { id: 1, fullName: 'João Silva', shortName: 'Silva' },
      ]);

      Event.findAll.mockResolvedValue([
        { id: 1, eventType: 'social_action', People: [] },
      ]);

      LatePayment.findAll.mockResolvedValue([]);

      const result = await getGraduationScores(1, new Date('2025-01-01'), new Date('2025-12-31'));

      expect(result.data[0].scores).toEqual({
        socialAction: 0,
        poll: 0,
        otherEvents: 0,
        payments: 1,
      });
      expect(result.data[0].totalScore).toBe(1);
    });
  });
});
