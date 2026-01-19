const express = require('express');
const { check, validationResult } = require('express-validator');
const regionalController = require('../controllers/regionalController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /regionals:
 *   post:
 *     summary: Cria uma nova regional
 *     tags: [Regionals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da regional.
 *               commandId:
 *                 type: integer
 *                 description: ID do comando associado.
 *     responses:
 *       201:
 *         description: Regional criada com sucesso.
 *       400:
 *         description: Campos obrigatórios não preenchidos.
 *       422:
 *         description: Número do comando já está em uso.
 */
router.post(
  '/',
  authenticateToken,
  checkRole(['admin']),
  [
    check('name')
      .notEmpty()
      .withMessage('O nome da regional é obrigatório.')
      .isLength({ max: 100 })
      .withMessage('O nome não pode ter mais de 100 caracteres.'),
    check('commandId')
      .optional()
      .isInt()
      .withMessage('O ID do comando deve ser um número inteiro.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  regionalController.createRegional,
);

/**
 * @swagger
 * /regionals/{id}:
 *   get:
 *     summary: Obtém uma regional pelo ID
 *     tags: [Regionals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da regional.
 *     responses:
 *       200:
 *         description: Regional encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID da regional.
 *                 name:
 *                   type: string
 *                   description: Nome da regional.
 *                 commandId:
 *                   type: integer
 *                   description: ID do comando associado.
 *       404:
 *         description: Regional não encontrada.
 */
router.get('/:id', regionalController.getRegionalById);

/**
 * @swagger
 * /regionals:
 *   get:
 *     summary: Lista todas as regionais
 *     tags: [Regionals]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página (padrão 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de itens por página (padrão 30)
 *       - in: query
 *         name: commandId
 *         schema:
 *           type: integer
 *         description: ID do comando para filtrar as regionais
 *     responses:
 *       200:
 *         description: Lista de regionais retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID da regional.
 *                   name:
 *                     type: string
 *                     description: Nome da regional.
 *                   commandId:
 *                     type: integer
 *                     description: ID do comando associado.
 */
router.get('/', regionalController.getAllRegionals);

/**
 * @swagger
 * /regionals/{id}:
 *   put:
 *     summary: Atualiza uma regional pelo ID
 *     tags: [Regionals]
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
 *     responses:
 *       200:
 *         description: Regional atualizada
 *       400:
 *         description: Campos obrigatórios não preenchidos
 *       404:
 *         description: Regional não encontrada
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
    check('commandId')
      .optional()
      .isInt()
      .withMessage('O ID do comando deve ser um número inteiro.'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  regionalController.updateRegional,
);

/**
 * @swagger
 * /regionals/{id}:
 *   patch:
 *     summary: Atualiza uma regional pelo ID
 *     tags: [Regionals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da regional.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da regional.
 *               commandId:
 *                 type: integer
 *                 description: ID do comando associado.
 *     responses:
 *       200:
 *         description: Regional atualizada com sucesso.
 *       400:
 *         description: Campos obrigatórios não preenchidos.
 *       404:
 *         description: Regional não encontrada.
 *       422:
 *         description: Número do comando já está em uso.
 */

module.exports = router;
