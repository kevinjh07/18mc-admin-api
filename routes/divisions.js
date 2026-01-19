const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const { authenticateToken, checkRole } = require('../middleware/auth');

/**
 * @swagger
 * /divisions:
 *   post:
 *     summary: Cria uma nova divisão
 *     tags: [Divisions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               regionalId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Divisão criada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 */
router.post(
  '/',
  authenticateToken,
  checkRole(['admin']),
  [
    check('name')
      .notEmpty()
      .withMessage('O nome da divisão é obrigatório.')
      .isLength({ max: 100 })
      .withMessage('O nome não pode ter mais de 100 caracteres.'),
    check('regionalId')
      .notEmpty()
      .withMessage('O ID da regional é obrigatório.')
      .isInt()
      .withMessage('O ID da regional deve ser um número inteiro.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  divisionController.createDivision,
);

/**
 * @swagger
 * /divisions/{id}:
 *   get:
 *     summary: Obtém uma divisão pelo ID
 *     tags: [Divisions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Divisão encontrada
 *       404:
 *         description: Divisão não encontrada
 */
router.get('/:id', divisionController.getDivisionById);

/**
 * @swagger
 * /divisions:
 *   get:
 *     summary: Lista todas as divisões com paginação
 *     tags: [Divisions]
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
 *     responses:
 *       200:
 *         description: Lista de divisões
 */
router.get('/', divisionController.getAllDivisions);

/**
 * @swagger
 * /divisions:
 *   get:
 *     summary: Lista todas as divisões por regional
 *     tags: [Divisions]
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: integer
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de divisões
 */
router.get('/', divisionController.getAllDivisionsByRegionalId);

/**
 * @swagger
 * /divisions/{id}:
 *   put:
 *     summary: Atualiza uma divisão pelo ID
 *     tags: [Divisions]
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
 *               name:
 *                 type: string
 *               regionalId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Divisão atualizada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 *       404:
 *         description: Divisão ou Regional não encontrada
 */
router.put(
  '/:id',
  authenticateToken,
  checkRole(['admin']),
  [
    check('name')
      .optional()
      .isLength({ max: 100 })
      .withMessage('O nome não pode ter mais de 100 caracteres.'),
    check('regionalId')
      .optional()
      .isInt()
      .withMessage('O ID da regional deve ser um número inteiro.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  divisionController.updateDivision,
);

module.exports = router;
