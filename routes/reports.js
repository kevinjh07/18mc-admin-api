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
 *       500:
 *         description: Erro ao gerar relatório
 */
router.get('/', reportController.getDivisionReport);

module.exports = router;
