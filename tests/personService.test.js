require('dotenv').config();

const {
  createPerson,
  getPersonById,
  getAllPersons,
  updatePerson,
  getPersonsByDivision,
  recordLatePayment,
  getLatePayments,
} = require('../services/personService');
const Person = require('../models/Person');
const Division = require('../models/Division');
const Regional = require('../models/Regional');
const LatePayment = require('../models/LatePayment');
const LatePaymentAlreadyExistsError = require('../exceptions/LatePaymentAlreadyExistsError');

jest.mock('../models/Person');
jest.mock('../models/Division');
jest.mock('../models/Regional');
jest.mock('../models/LatePayment');

describe('Person Service', () => {
  beforeAll(() => {
    process.env.JAWSDB_URL = 'mysql://user:password@localhost:3306/mydb';
  });

  describe('createPerson', () => {
    it('should create a person successfully', async () => {
      const mockRegional = { id: 1, name: 'North' };
      const mockDivision = { id: 1, name: 'East', regionalId: 1, Regional: mockRegional };
      const mockPerson = { id: 1, fullName: 'John Doe', shortName: 'JD', divisionId: 1, hierarchyLevel: 'VIII: Full' };
      Division.findByPk.mockResolvedValue(mockDivision);
      Person.create.mockResolvedValue(mockPerson);

      const result = await createPerson('John Doe', 'JD', 1, 'VIII: Full');
      expect(Division.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(Person.create).toHaveBeenCalledWith({ fullName: 'John Doe', shortName: 'JD', divisionId: 1, hierarchyLevel: 'VIII: Full' });
      expect(result).toEqual(mockPerson);
    });

    it('should throw an error if division is not found', async () => {
      Division.findByPk.mockResolvedValue(null);

      await expect(createPerson('John Doe', 'JD', 1, 'VIII: Full')).rejects.toThrow('Divisão inválida');
    });

    it('should throw an error if creation fails', async () => {
      const mockRegional = { id: 1, name: 'North' };
      const mockDivision = { id: 1, name: 'East', regionalId: 1, Regional: mockRegional };
      Regional.findByPk.mockResolvedValue(mockRegional);
      Division.findByPk.mockResolvedValue(mockDivision);
      Person.create.mockRejectedValue(new Error('Error creating person'));

      await expect(createPerson('John Doe', 'JD', 1, 'VIII: Full')).rejects.toThrow('Error creating person');
    });
  });

  describe('Late Payments', () => {
    it('should create a late payment when none exists', async () => {
      const personId = 1;
      const year = 2026;
      const month = 1;
      const mockPerson = { id: personId };
      const mockCreated = { id: 100, personId, year, month, paidAt: null, notes: null };

      Person.findByPk.mockResolvedValue(mockPerson);
      LatePayment.findOne.mockResolvedValue(null);
      LatePayment.create.mockResolvedValue(mockCreated);

      const result = await recordLatePayment(personId, year, month);
      expect(Person.findByPk).toHaveBeenCalledWith(personId);
      expect(LatePayment.findOne).toHaveBeenCalledWith({ where: { personId, year, month } });
      expect(LatePayment.create).toHaveBeenCalledWith({ personId, year, month, paidAt: null, notes: null });
      expect(result).toEqual(mockCreated);
    });

    it('should create a late payment with paidAt and notes', async () => {
      const personId = 1;
      const year = 2026;
      const month = 1;
      const paidAt = new Date('2026-01-15');
      const notes = 'Pagou com atraso';
      const mockPerson = { id: personId };
      const mockCreated = { id: 100, personId, year, month, paidAt, notes };

      Person.findByPk.mockResolvedValue(mockPerson);
      LatePayment.findOne.mockResolvedValue(null);
      LatePayment.create.mockResolvedValue(mockCreated);

      const result = await recordLatePayment(personId, year, month, paidAt, notes);
      expect(LatePayment.create).toHaveBeenCalledWith({ personId, year, month, paidAt, notes });
      expect(result).toEqual(mockCreated);
    });

    it('should throw LatePaymentAlreadyExistsError when late payment already exists', async () => {
      const personId = 1;
      const year = 2026;
      const month = 2;
      const mockPerson = { id: personId };
      const mockExisting = { id: 101, personId, year, month, paidAt: null };

      Person.findByPk.mockResolvedValue(mockPerson);
      LatePayment.findOne.mockResolvedValue(mockExisting);

      await expect(recordLatePayment(personId, year, month)).rejects.toThrow(LatePaymentAlreadyExistsError);
      expect(LatePayment.findOne).toHaveBeenCalledWith({ where: { personId, year, month } });
    });

    it('should return null when getting late payments for non-existent person', async () => {
      Person.findByPk.mockResolvedValue(null);
      const result = await getLatePayments(999, 2026);
      expect(result).toBeNull();
    });

    it('should return late payments for a person and year', async () => {
      const personId = 1;
      const year = 2026;
      const mockPerson = { id: personId };
      const mockPayments = [
        { id: 1, personId, year, month: 1, paidAt: null, notes: null },
        { id: 2, personId, year, month: 2, paidAt: '2026-02-15', notes: 'Pagou após cobrança' },
      ];

      Person.findByPk.mockResolvedValue(mockPerson);
      LatePayment.findAll.mockResolvedValue(mockPayments);

      const result = await getLatePayments(personId, year);
      expect(LatePayment.findAll).toHaveBeenCalledWith({ where: { personId, year }, order: [['year', 'ASC'], ['month', 'ASC']] });
      expect(result).toEqual(mockPayments);
    });
  });

});
