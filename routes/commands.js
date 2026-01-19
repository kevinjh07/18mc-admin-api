const express = require('express');
const commandController = require('../controllers/commandController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /commands:
 *   get:
 *     summary: Lista todos os comandos
 *     tags: [Commands]
 *     responses:
 *       200:
 *         description: Lista de comandos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do comando.
 *                   name:
 *                     type: string
 *                     description: Nome do comando.
 */
router.get('/', authenticateToken, commandController.getAllCommands);

module.exports = router;
