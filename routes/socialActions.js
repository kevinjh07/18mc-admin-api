const express = require('express');
const { check, validationResult } = require('express-validator');
const socialActionController = require('../controllers/socialActionController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /socialActions:
 *   post:
 *     summary: Cria uma nova ação social
 *     tags: [SocialActions]
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
 *     responses:
 *       201:
 *         description: Ação social criada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 */
router.post(
  '/',
  authenticateToken,
  [
    check('title')
      .notEmpty()
      .withMessage('O título da ação social é obrigatório.')
      .isLength({ max: 150 })
      .withMessage('O título não pode ter mais de 150 caracteres.'),
    check('actionType')
      .notEmpty()
      .withMessage('O tipo da ação social é obrigatório.')
      .isIn(['internal', 'external', 'fundraising'])
      .withMessage('O tipo deve ser interna, externa ou arrecadação.'),
    check('date')
      .notEmpty()
      .withMessage('A data da ação social é obrigatória.')
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
  socialActionController.createSocialAction,
);

/**
 * @swagger
 * /socialActions/{id}:
 *   get:
 *     summary: Obtém uma ação social pelo ID
 *     tags: [SocialActions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ação social encontrada
 *       404:
 *         description: Ação social não encontrada
 */
router.get('/:id', socialActionController.getSocialActionById);

/**
 * @swagger
 * /socialActions:
 *   get:
 *     summary: Lista todas as ações sociais com paginação
 *     tags: [SocialActions]
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
 *         description: Lista de ações sociais
 */
router.get('/', socialActionController.getAllSocialActions);

/**
 * @swagger
 * /socialActions/{id}:
 *   put:
 *     summary: Atualiza uma ação social pelo ID
 *     tags: [SocialActions]
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
 *               personIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Ação social atualizada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 *       404:
 *         description: Ação social ou pessoas não encontradas
 */
router.put(
  '/:id',
  authenticateToken,
  [
    check('title')
      .optional()
      .isLength({ max: 150 })
      .withMessage('O título não pode ter mais de 150 caracteres.'),
    check('actionType')
      .optional()
      .isIn(['internal', 'external', 'fundraising'])
      .withMessage('O tipo deve ser "interna","externa" ou "arrecadação".'),
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
  socialActionController.updateSocialAction,
);

/**
 * @swagger
 * /socialActions/{id}/persons:
 *   get:
 *     summary: Obtém a lista de pessoas associadas a uma ação social pelo ID
 *     tags: [SocialActions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ação social
 *     responses:
 *       200:
 *         description: Lista de pessoas associadas à ação social
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: Nome curto da pessoa
 *       404:
 *         description: Nenhuma pessoa encontrada para esta ação social
 */
router.get('/:id/persons', socialActionController.getPersonsBySocialActionId);

module.exports = router;
