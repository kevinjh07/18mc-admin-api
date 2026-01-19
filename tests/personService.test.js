require('dotenv').config();

const {
  createPerson,
  getPersonById,
  getAllPersons,
  updatePerson,
  deletePerson,
  getPersonsByDivision,
  recordMonthlyPayment,
  getMonthlyPayments,
} = require('../services/personService');
const Person = require('../models/Person');
const Division = require('../models/Division');
const Regional = require('../models/Regional');
const MonthlyPayment = require('../models/MonthlyPayment');

jest.mock('../models/Person');
jest.mock('../models/Division');
jest.mock('../models/Regional');
jest.mock('../models/MonthlyPayment');

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

  describe('Monthly Payments', () => {
    it('should create a monthly payment when none exists', async () => {
      const personId = 1;
      const year = 2026;
      const month = 1;
      const paidOnTime = true;
      const mockPerson = { id: personId };
      const mockCreated = { id: 100, personId, year, month, paidOnTime, paidAt: null };

      Person.findByPk.mockResolvedValue(mockPerson);
      MonthlyPayment.findOne.mockResolvedValue(null);
      MonthlyPayment.create.mockResolvedValue(mockCreated);

      const result = await recordMonthlyPayment(personId, year, month, paidOnTime);
      expect(Person.findByPk).toHaveBeenCalledWith(personId);
      expect(MonthlyPayment.findOne).toHaveBeenCalledWith({ where: { personId, year, month } });
      expect(MonthlyPayment.create).toHaveBeenCalledWith({ personId, year, month, paidOnTime, paidAt: null });
      expect(result).toEqual(mockCreated);
    });

    it('should update an existing monthly payment', async () => {
      const personId = 1;
      const year = 2026;
      const month = 2;
      const paidOnTime = false;
      const mockPerson = { id: personId };
      const mockExisting = { id: 101, personId, year, month, paidOnTime: true, update: jest.fn().mockResolvedValue(true) };

      Person.findByPk.mockResolvedValue(mockPerson);
      MonthlyPayment.findOne.mockResolvedValue(mockExisting);

      const result = await recordMonthlyPayment(personId, year, month, paidOnTime);
      expect(MonthlyPayment.findOne).toHaveBeenCalledWith({ where: { personId, year, month } });
      expect(mockExisting.update).toHaveBeenCalledWith({ paidOnTime, paidAt: null });
      expect(result).toEqual(mockExisting);
    });

    it('should return null when getting payments for non-existent person', async () => {
      Person.findByPk.mockResolvedValue(null);
      const result = await getMonthlyPayments(999, 2026);
      expect(result).toBeNull();
    });

    it('should return payments for a person and year', async () => {
      const personId = 1;
      const year = 2026;
      const mockPerson = { id: personId };
      const mockPayments = [
        { id: 1, personId, year, month: 1, paidOnTime: true },
        { id: 2, personId, year, month: 2, paidOnTime: false },
      ];

      Person.findByPk.mockResolvedValue(mockPerson);
      MonthlyPayment.findAll.mockResolvedValue(mockPayments);

      const result = await getMonthlyPayments(personId, year);
      expect(MonthlyPayment.findAll).toHaveBeenCalledWith({ where: { personId, year }, order: [['year', 'ASC'], ['month', 'ASC']] });
      expect(result).toEqual(mockPayments);
    });
  });

});
