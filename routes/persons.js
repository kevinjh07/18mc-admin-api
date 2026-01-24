const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const personController = require('../controllers/personController');

/**
 * @swagger
 * /persons:
 *   post:
 *     summary: Cria uma nova pessoa
 *     tags: [Persons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               shortName:
 *                 type: string
 *               divisionId:
 *                 type: integer
 *               hierarchyLevel:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Pessoa criada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 */
router.post(
  '/',
  [
    check('fullName').notEmpty().withMessage('Nome Completo é obrigatório'),
    check('shortName').notEmpty().withMessage('Nome Colete é obrigatório'),
    check('divisionId').isInt().withMessage('Divisão é obrigatório'),
    check('hierarchyLevel').notEmpty().withMessage('Grau Hierárquico é obrigatório'),
    check('isActive').isBoolean().withMessage('isActive deve ser um booleano'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  personController.createPerson
);

/**
 * @swagger
 * /persons/{id}:
 *   get:
 *     summary: Obtém uma pessoa pelo ID
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pessoa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 fullName:
 *                   type: string
 *                 shortName:
 *                   type: string
 *                 divisionId:
 *                   type: integer
 *                 hierarchyLevel:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 Division:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     Regional:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       404:
 *         description: Pessoa não encontrada
 */
router.get('/:id', personController.getPersonById);

/**
 * @swagger
 * /persons:
 *   get:
 *     summary: Lista todas as pessoas com paginação
 *     tags: [Persons]
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
 *         name: divisionId
 *         schema:
 *           type: integer
 *         description: ID da divisão para filtrar
 *     responses:
 *       200:
 *         description: Lista de pessoas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                       shortName:
 *                         type: string
 *                       divisionId:
 *                         type: integer
 *                       hierarchyLevel:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       Division:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 */
router.get('/', personController.getAllPersons);

/**
 * @swagger
 * /persons/{id}:
 *   put:
 *     summary: Atualiza uma pessoa pelo ID
 *     tags: [Persons]
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
 *               fullName:
 *                 type: string
 *               shortName:
 *                 type: string
 *               divisionId:
 *                 type: integer
 *               hierarchyLevel:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pessoa atualizada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 *       404:
 *         description: Pessoa não encontrada
 */
router.put(
  '/:id',
  [
    check('fullName').notEmpty().withMessage('Nome Completo é obrigatório'),
    check('shortName').notEmpty().withMessage('Nome Colete é obrigatório'),
    check('divisionId').isInt().withMessage('Divisão é obrigatório'),
    check('hierarchyLevel').notEmpty().withMessage('Grau Hierárquico é obrigatório'),
    check('isActive').isBoolean().withMessage('isActive deve ser um booleano'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  personController.updatePerson
);

/**
 * @swagger
 * /persons/division/{divisionId}:
 *   get:
 *     summary: Retorna uma lista de integrantes filtrados pelo ID da divisão
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: divisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da divisão
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *         description: Situação do integrante (true/false)
 *     responses:
 *       200:
 *         description: Lista de integrantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   shortName:
 *                     type: string
 *       404:
 *         description: Nenhum integrante encontrado para a divisão
 */
router.get('/division/:divisionId', personController.getPersonsByDivision);

/**
 * @swagger
 * /persons/{id}/payments:
 *   post:
 *     summary: Registra ou atualiza o pagamento mensal de uma pessoa
 *     tags: [Persons]
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
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               paidOnTime:
 *                 type: boolean
 *               paidAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Pagamento registrado
 *       404:
 *         description: Pessoa não encontrada
 */
router.post(
  '/:id/payments',
  [
    check('year').isInt().withMessage('year deve ser um inteiro'),
    check('month').isInt({ min: 1, max: 12 }).withMessage('month deve ser 1-12'),
    check('paidOnTime').optional().isBoolean().withMessage('paidOnTime deve ser booleano'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  personController.addMonthlyPayment
);

/**
 * @swagger
 * /persons/{id}/payments:
 *   get:
 *     summary: Lista pagamentos mensais de uma pessoa
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filtrar por ano
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   personId:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   month:
 *                     type: integer
 *                   paidOnTime:
 *                     type: boolean
 *                   paidAt:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       404:
 *         description: Pessoa não encontrada
 */
router.get('/:id/payments', personController.getMonthlyPayments);

module.exports = router;
