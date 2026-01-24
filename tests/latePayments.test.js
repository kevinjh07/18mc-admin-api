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

describe('Late Payments Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /persons/:id/late-payments', () => {
    it('should record a late payment and return 201', async () => {
      const mockRecord = { id: 10, personId: 1, year: 2026, month: 1, paidAt: null, notes: null };
      PersonService.recordLatePayment.mockResolvedValue(mockRecord);

      const res = await request(app)
        .post('/persons/1/late-payments')
        .send({ year: 2026, month: 1 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockRecord);
      expect(PersonService.recordLatePayment).toHaveBeenCalledWith(1, 2026, 1, null, null);
    });

    it('should record a late payment with paidAt and notes', async () => {
      const paidAt = '2026-01-15T10:00:00.000Z';
      const mockRecord = { id: 10, personId: 1, year: 2026, month: 1, paidAt, notes: 'Pagou com 15 dias de atraso' };
      PersonService.recordLatePayment.mockResolvedValue(mockRecord);

      const res = await request(app)
        .post('/persons/1/late-payments')
        .send({ year: 2026, month: 1, paidAt, notes: 'Pagou com 15 dias de atraso' });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(mockRecord);
      expect(PersonService.recordLatePayment).toHaveBeenCalledWith(1, 2026, 1, new Date(paidAt), 'Pagou com 15 dias de atraso');
    });

    it('should return 404 when person not found', async () => {
      PersonService.recordLatePayment.mockRejectedValue(new Error('Pessoa não encontrada.'));

      const res = await request(app)
        .post('/persons/999/late-payments')
        .send({ year: 2026, month: 1 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Pessoa não encontrada.' });
    });

    it('should return 400 on invalid input', async () => {
      const res = await request(app).post('/persons/1/late-payments').send({ year: 'invalid', month: 13 });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 409 when late payment already exists', async () => {
      const LatePaymentAlreadyExistsError = require('../exceptions/LatePaymentAlreadyExistsError');
      PersonService.recordLatePayment.mockRejectedValue(new LatePaymentAlreadyExistsError('Já existe um registro de atraso para este integrante no ano e mês especificados.'));

      const res = await request(app)
        .post('/persons/1/late-payments')
        .send({ year: 2026, month: 1 });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toEqual({ error: 'Já existe um registro de atraso para este integrante no ano e mês especificados.' });
    });
  });

  describe('GET /persons/:id/late-payments', () => {
    it('should return late payments 200', async () => {
      const mockPayments = [
        { id: 1, personId: 1, year: 2026, month: 1, paidAt: null, notes: null },
        { id: 2, personId: 1, year: 2026, month: 2, paidAt: '2026-02-20T10:00:00.000Z', notes: 'Pagou após cobrança' },
      ];
      PersonService.getLatePayments.mockResolvedValue(mockPayments);

      const res = await request(app).get('/persons/1/late-payments?year=2026');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockPayments);
      expect(PersonService.getLatePayments).toHaveBeenCalledWith(1, 2026);
    });

    it('should return 404 when person not found', async () => {
      PersonService.getLatePayments.mockResolvedValue(null);

      const res = await request(app).get('/persons/999/late-payments');

      expect(res.statusCode).toEqual(404);
    });
  });
});
