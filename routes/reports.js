const express = require('express');
const { check, validationResult } = require('express-validator');
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

/**
 * @swagger
 * /reports/graduation-scores:
 *   get:
 *     summary: Calcula pontuação de graduação dos integrantes de uma divisão
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: divisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da divisão
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Data início (dd/MM/yyyy)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *         description: Data fim (dd/MM/yyyy)
 *     responses:
 *       200:
 *         description: Pontuação calculada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                     end:
 *                       type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       personId:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                       shortName:
 *                         type: string
 *                       scores:
 *                         type: object
 *                         properties:
 *                           socialAction:
 *                             type: integer
 *                           poll:
 *                             type: integer
 *                           otherEvents:
 *                             type: integer
 *                           payments:
 *                             type: integer
 *                       totalScore:
 *                         type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Divisão não encontrada
 */
router.get(
  '/graduation-scores',
  [
    check('divisionId').notEmpty().withMessage('divisionId é obrigatório').isInt().withMessage('divisionId deve ser um inteiro'),
    check('startDate')
      .notEmpty()
      .withMessage('startDate é obrigatório')
      .matches(/^\d{2}\/\d{2}\/\d{4}$/)
      .withMessage('startDate deve estar no formato dd/MM/yyyy'),
    check('endDate')
      .notEmpty()
      .withMessage('endDate é obrigatório')
      .matches(/^\d{2}\/\d{2}\/\d{4}$/)
      .withMessage('endDate deve estar no formato dd/MM/yyyy'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  reportController.getGraduationScores,
);

module.exports = router;
