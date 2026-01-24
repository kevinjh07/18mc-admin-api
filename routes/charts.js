const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');

/**
 * @swagger
 * /socialActions:
 *   get:
 *     summary: Lista divisões e quantidade de ações sociais por período e regional
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: regionalId
 *         schema:
 *           type: integer
 *         description: Id da regional
 *     responses:
 *       200:
 *         description: Quantidade de ações social por divisão
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   value:
 *                     type: integer
 */
router.get('/', chartController.getSocialActionCountByDateRange);

/**
 * @swagger
 * /socialActions/action-type:
 *   get:
 *     summary: Lista divisões e quantidade de ações sociais por período e regional dividido por interno e externo
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: regionalId
 *         schema:
 *           type: integer
 *         description: Id da regional
 *     responses:
 *       200:
 *         description: Quantidade de ações social por divisão
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   series:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         value:
 *                           type: integer
 */
router.get(
  '/action-type',
  chartController.getSocialActionInternalExternalCountByDateRange,
);

/**
 * @swagger
 * /socialActions/person-division:
 *   get:
 *     summary: Lista participantes em ações sociais por divisão e período
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: integer
 *         description: Id da divisão
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *     responses:
 *       200:
 *         description: Lista de participantes em ações sociais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   personId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   divisionName:
 *                     type: string
 *                   value:
 *                     type: integer
 */
router.get(
  '/person-division',
  chartController.getSocialActionsByPersonAndDivision,
);

module.exports = router;
