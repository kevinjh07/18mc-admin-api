const reportService = require('../services/reportService');
const logger = require('../services/loggerService'); 

const getDivisionReport = async (req, res) => {
  const { regionalId, startDate, endDate } = req.query;
  logger.info('Iniciando geração de relatório de divisões', { regionalId, startDate, endDate });
  try {
    const report = await reportService.generateDivisionReport(regionalId, startDate, endDate);
    logger.info('Relatório de divisões gerado com sucesso');
    res.status(200).json(report);
  } catch (error) {
    logger.error('Erro ao gerar relatório de divisões', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getGraduationScores = async (req, res) => {
  try {
    const { divisionId, startDate, endDate } = req.query;
    logger.info('Iniciando cálculo de pontuação de graduação', { divisionId, startDate, endDate });

    const [startDay, startMonth, startYear] = startDate.split('/');
    const [endDay, endMonth, endYear] = endDate.split('/');
    const start = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
    const end = new Date(`${endYear}-${endMonth}-${endDay}T23:59:59`);

    const result = await reportService.getGraduationScores(
      parseInt(divisionId),
      start,
      end,
    );

    if (result === null) {
      logger.warn('Divisão não encontrada para cálculo de pontuação', { divisionId });
      return res.status(404).json({ error: 'Divisão não encontrada' });
    }

    logger.info('Pontuação de graduação calculada com sucesso', { divisionId });
    res.json({
      period: { start: startDate, end: endDate },
      data: result.data,
    });
  } catch (error) {
    logger.error('Erro ao calcular pontuação de graduação', { error: error.message });
    res.status(500).json({ message: 'Erro ao calcular pontuação.', details: error.message });
  }
};

module.exports = {
  getDivisionReport,
  getGraduationScores,
};
