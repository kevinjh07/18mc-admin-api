require('dotenv').config();

// Mock auth middleware to bypass authentication in tests
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => next(),
  checkRole: () => (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../app');

// Mock the service used by the controller
const PersonService = require('../services/personService');
jest.mock('../services/personService');

describe('Person Payments Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /persons/:id/payments', () => {
    it('should record a payment and return 201', async () => {
      const mockRecord = { id: 10, personId: 1, year: 2026, month: 1, paidOnTime: true, paidAt: null };
      PersonService.recordMonthlyPayment.mockResolvedValue(mockRecord);

      const res = await request(app)
        .post('/persons/1/payments')
        .send({ year: 2026, month: 1, paidOnTime: true });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockRecord);
      expect(PersonService.recordMonthlyPayment).toHaveBeenCalledWith(1, 2026, 1, true, null);
    });

    it('should return 404 when person not found', async () => {
      PersonService.recordMonthlyPayment.mockRejectedValue(new Error('Pessoa não encontrada.'));

      const res = await request(app)
        .post('/persons/999/payments')
        .send({ year: 2026, month: 1, paidOnTime: true });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Pessoa não encontrada.' });
    });

    it('should return 400 on invalid input', async () => {
      const res = await request(app).post('/persons/1/payments').send({ year: 'invalid', month: 13 });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /persons/:id/payments', () => {
    it('should return payments 200', async () => {
      const mockPayments = [
        { id: 1, personId: 1, year: 2026, month: 1, paidOnTime: true },
        { id: 2, personId: 1, year: 2026, month: 2, paidOnTime: false },
      ];
      PersonService.getMonthlyPayments.mockResolvedValue(mockPayments);

      const res = await request(app).get('/persons/1/payments?year=2026');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPayments);
      expect(PersonService.getMonthlyPayments).toHaveBeenCalledWith(1, 2026);
    });

    it('should return 404 when person not found', async () => {
      PersonService.getMonthlyPayments.mockResolvedValue(null);

      const res = await request(app).get('/persons/999/payments');

      expect(res.statusCode).toEqual(404);
    });
  });
});
