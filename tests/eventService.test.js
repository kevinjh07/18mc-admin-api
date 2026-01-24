require('dotenv').config();

jest.mock('../models/Event', () => ({
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
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  getPersonsByEventId,
} = require('../services/eventService');
const Event = require('../models/Event');
const Division = require('../models/Division');
const Person = require('../models/Person');
const Regional = require('../models/Regional');

describe('Event Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create event with social_action type and actionType', async () => {
      const mockDivision = { id: 1 };
      const mockEvent = { id: 1, title: 'Event 1', divisionId: 1, eventType: 'social_action', actionType: 'internal' };

      Division.findByPk.mockResolvedValue(mockDivision);
      Event.create.mockResolvedValue(mockEvent);

      const result = await createEvent({
        title: 'Event 1',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        eventType: 'social_action',
        actionType: 'internal',
      });

      expect(Division.findByPk).toHaveBeenCalledWith(1);
      expect(Event.create).toHaveBeenCalledWith({
        title: 'Event 1',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        eventType: 'social_action',
        actionType: 'internal',
      });
      expect(result).toEqual(mockEvent);
    });

    it('should create event with other type without actionType', async () => {
      const mockDivision = { id: 1 };
      const mockEvent = { id: 2, title: 'Event 2', divisionId: 1, eventType: 'other', actionType: null };

      Division.findByPk.mockResolvedValue(mockDivision);
      Event.create.mockResolvedValue(mockEvent);

      const result = await createEvent({
        title: 'Event 2',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        eventType: 'other',
      });

      expect(Event.create).toHaveBeenCalledWith({
        title: 'Event 2',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        eventType: 'other',
        actionType: null,
      });
      expect(result).toEqual(mockEvent);
    });

    it('should throw error if social_action without actionType', async () => {
      const mockDivision = { id: 1 };
      Division.findByPk.mockResolvedValue(mockDivision);

      await expect(createEvent({
        title: 'Event 1',
        date: '2026-01-01',
        description: 'Description',
        divisionId: 1,
        eventType: 'social_action',
      })).rejects.toThrow('O tipo de ação (actionType) é obrigatório para eventos do tipo "ação social"');
    });

    it('should throw error if division not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      await expect(createEvent({
        title: 'Event 1',
        divisionId: 1,
        eventType: 'other',
      })).rejects.toThrow('Divisão inválida');
    });
  });

  describe('getEventById', () => {
    it('should return event by id', async () => {
      const mockEvent = {
        id: 1,
        Division: { id: 1, name: 'Division A', Regional: { id: 1 } },
        People: [{ id: 1, shortName: 'Person A' }],
      };

      Event.findByPk.mockResolvedValue(mockEvent);

      const result = await getEventById(1);

      expect(Event.findByPk).toHaveBeenCalledWith(1, {
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
      expect(result).toEqual(mockEvent);
    });

    it('should return null if event not found', async () => {
      Event.findByPk.mockResolvedValue(null);

      const result = await getEventById(1);

      expect(result).toBeNull();
    });
  });

  describe('getAllEvents', () => {
    it('should return paginated events by divisionId', async () => {
      const mockEvents = {
        count: 1,
        rows: [{ id: 1, title: 'Event 1' }],
      };

      Event.findAndCountAll.mockResolvedValue(mockEvents);

      const result = await getAllEvents(1, 10, null, 1, null);

      expect(Event.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['date', 'DESC']],
        where: {},
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
        data: mockEvents.rows,
      });
    });

    it('should return paginated events filtered by eventType', async () => {
      const mockEvents = {
        count: 1,
        rows: [{ id: 1, title: 'Event 1', eventType: 'social_action' }],
      };

      Event.findAndCountAll.mockResolvedValue(mockEvents);

      const result = await getAllEvents(1, 10, null, null, 'social_action');

      expect(Event.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['date', 'DESC']],
        where: { eventType: 'social_action' },
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
        data: mockEvents.rows,
      });
    });
  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const mockDivision = { id: 1 };
      const mockEvent = {
        id: 1,
        eventType: 'social_action',
        update: jest.fn(),
        setPeople: jest.fn(),
      };
      const mockPersons = [{ id: 1 }, { id: 2 }];

      Division.findByPk.mockResolvedValue(mockDivision);
      Event.findByPk.mockResolvedValue(mockEvent);
      Person.findAll.mockResolvedValue(mockPersons);

      const result = await updateEvent({
        id: 1,
        title: 'Updated Event',
        date: '2026-01-01',
        description: 'Updated Description',
        divisionId: 1,
        personIds: [1, 2],
        eventType: 'social_action',
        actionType: 'internal',
      });

      expect(Division.findByPk).toHaveBeenCalledWith(1);
      expect(Event.findByPk).toHaveBeenCalledWith(1);
      expect(mockEvent.update).toHaveBeenCalledWith({
        title: 'Updated Event',
        date: '2026-01-01',
        description: 'Updated Description',
        divisionId: 1,
        eventType: 'social_action',
        actionType: 'internal',
      });
      expect(Person.findAll).toHaveBeenCalledWith({ where: { id: [1, 2] } });
      expect(mockEvent.setPeople).toHaveBeenCalledWith(mockPersons);
      expect(result).toEqual(mockEvent);
    });

    it('should update event without persons', async () => {
      const mockDivision = { id: 1 };
      const mockEvent = {
        id: 1,
        eventType: 'other',
        update: jest.fn(),
        setPeople: jest.fn(),
      };

      Division.findByPk.mockResolvedValue(mockDivision);
      Event.findByPk.mockResolvedValue(mockEvent);

      const result = await updateEvent({
        id: 1,
        title: 'Updated Event',
        date: '2026-01-01',
        description: 'Updated Description',
        divisionId: 1,
        eventType: 'other',
      });

      expect(mockEvent.setPeople).toHaveBeenCalledWith([]);
      expect(result).toEqual(mockEvent);
    });

    it('should throw error if event not found', async () => {
      const mockDivision = { id: 1 };
      Division.findByPk.mockResolvedValue(mockDivision);
      Event.findByPk.mockResolvedValue(null);

      await expect(updateEvent({
        id: 999,
        divisionId: 1,
        eventType: 'other',
      })).rejects.toThrow('Evento não encontrado');
    });
  });

  describe('getPersonsByEventId', () => {
    it('should return persons by event id', async () => {
      const mockEvent = {
        id: 1,
        People: [
          { shortName: 'Person A' },
          { shortName: 'Person B' },
        ],
      };

      Event.findByPk.mockResolvedValue(mockEvent);

      const result = await getPersonsByEventId(1);

      expect(Event.findByPk).toHaveBeenCalledWith(1, {
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

    it('should throw error if event not found', async () => {
      Event.findByPk.mockResolvedValue(null);

      await expect(getPersonsByEventId(999)).rejects.toThrow('Evento não encontrado');
    });
  });
});
