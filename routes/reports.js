const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/**
 * @swagger
 * /reports/division:
 *   get:
 *     summary: Retorna um relatório de divisões com ações sociais
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: regionalId
 *         schema:
 *           type: integer
 *         description: ID da regional
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   divisionId:
 *                     type: integer
 *                   divisionName:
 *                     type: string
 *                   socialActions:
 *                     type: object
 *                     properties:
 *                       internal:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             date:
 *                               type: string
 *                               format: date
 *                             participants:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   shortName:
 *                                     type: string
 *                                   hierarchyLevel:
 *                                     type: string
 *                       external:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             date:
 *                               type: string
 *                               format: date
 *                             participants:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   shortName:
 *                                     type: string
 *                                   hierarchyLevel:
 *                                     type: string
 *                       fundraising:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             date:
 *                               type: string
 *                               format: date
 *                             participants:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   shortName:
 *                                     type: string
 *                                   hierarchyLevel:
 *                                     type: string
 *       500:
 *         description: Erro ao gerar relatório
 */
router.get('/', reportController.getDivisionReport);

module.exports = router;
