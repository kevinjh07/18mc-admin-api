const express = require('express');
const { check, validationResult } = require('express-validator');
const eventController = require('../controllers/eventController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Cria um novo evento
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *               description:
 *                 type: string
 *               divisionId:
 *                 type: integer
 *               eventType:
 *                 type: string
 *                 enum: [social_action, other, poll]
 *               actionType:
 *                 type: string
 *                 enum: [internal, external, fundraising]
 *                 description: Obrigatório apenas para eventType 'social_action'
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *       400:
 *         description: Campos obrigatórios não preenchidos ou dados inválidos
 */
router.post(
  '/',
  authenticateToken,
  [
    check('title')
      .notEmpty()
      .withMessage('O título do evento é obrigatório.')
      .isLength({ max: 150 })
      .withMessage('O título não pode ter mais de 150 caracteres.'),
    check('eventType')
      .notEmpty()
      .withMessage('O tipo do evento é obrigatório.')
      .isIn(['social_action', 'other', 'poll'])
      .withMessage('O tipo deve ser "ação social", "outro" ou "enquete".'),
    check('actionType')
      .custom((value, { req }) => {
        if (req.body.eventType === 'social_action') {
          if (!value) {
            throw new Error('O tipo de ação é obrigatório para eventos do tipo "ação social".');
          }
          if (!['internal', 'external', 'fundraising'].includes(value)) {
            throw new Error('O tipo de ação deve ser "interna", "externa" ou "arrecadação".');
          }
        } else if (value) {
          throw new Error('O tipo de ação é válido apenas para eventos do tipo "ação social".');
        }
        return true;
      }),
    check('date')
      .notEmpty()
      .withMessage('A data do evento é obrigatória.')
      .isISO8601()
      .withMessage('A data deve estar no formato ISO 8601.'),
    check('divisionId')
      .notEmpty()
      .withMessage('O ID da divisão é obrigatório.')
      .isInt()
      .withMessage('O ID da divisão deve ser um número inteiro.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  eventController.createEvent,
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtém um evento pelo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento não encontrado
 */
router.get('/:id', eventController.getEventById);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Lista todos os eventos com paginação e filtros
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de itens por página
 *       - in: query
 *         name: regionalId
 *         schema:
 *           type: integer
 *         description: ID da regional para filtrar
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: integer
 *         description: ID da divisão para filtrar
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [social_action, other, poll]
 *         description: Tipo de evento para filtrar
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get(
  '/',
  [
    check('page').optional().isInt({ min: 1 }).withMessage('Página deve ser inteiro >= 1.'),
    check('limit').optional().isInt({ min: 1 }).withMessage('Limite deve ser inteiro >= 1.'),
    check('regionalId').optional().isInt().withMessage('regionalId deve ser inteiro.'),
    check('divisionId').optional().isInt().withMessage('divisionId deve ser inteiro.'),
    check('eventType')
      .optional()
      .isIn(['social_action', 'other', 'poll'])
      .withMessage('O tipo deve ser "ação social", "outro" ou "enquete".'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  eventController.getAllEvents,
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Atualiza um evento pelo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *               description:
 *                 type: string
 *               divisionId:
 *                 type: integer
 *               eventType:
 *                 type: string
 *                 enum: [social_action, other, poll]
 *               actionType:
 *                 type: string
 *                 enum: [internal, external, fundraising]
 *               personIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       204:
 *         description: Evento atualizado com sucesso
 *       400:
 *         description: Campos obrigatórios não preenchidos ou dados inválidos
 *       404:
 *         description: Evento ou pessoas não encontrados
 */
router.put(
  '/:id',
  authenticateToken,
  [
    check('title')
      .optional()
      .isLength({ max: 150 })
      .withMessage('O título não pode ter mais de 150 caracteres.'),
    check('eventType')
      .optional()
      .isIn(['social_action', 'other', 'poll'])
      .withMessage('O tipo deve ser "ação social", "outro" ou "enquete".'),
    check('actionType')
      .custom((value, { req }) => {
        if (req.body.eventType === 'social_action') {
          if (!value) {
            throw new Error('O tipo de ação é obrigatório para eventos do tipo "ação social".');
          }
          if (!['internal', 'external', 'fundraising'].includes(value)) {
            throw new Error('O tipo de ação deve ser "interna", "externa" ou "arrecadação".');
          }
        } else if (value) {
          throw new Error('O tipo de ação é válido apenas para eventos do tipo "ação social".');
        }
        return true;
      }),
    check('date')
      .optional()
      .isISO8601()
      .withMessage('A data deve estar no formato ISO 8601.'),
    check('divisionId')
      .optional()
      .isInt()
      .withMessage('O ID da divisão deve ser um número inteiro.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  eventController.updateEvent,
);

/**
 * @swagger
 * /events/{id}/persons:
 *   get:
 *     summary: Obtém a lista de pessoas associadas a um evento pelo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Lista de pessoas associadas ao evento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: Nome curto da pessoa
 *       404:
 *         description: Nenhuma pessoa encontrada para este evento
 */
router.get('/:id/persons', eventController.getPersonsByEventId);

module.exports = router;
