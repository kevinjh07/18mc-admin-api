const reportService = require('../services/reportService');

const getDivisionReport = async (req, res) => {
  const { regionalId, startDate, endDate } = req.query;
  try {
    const report = await reportService.generateDivisionReport(regionalId, startDate, endDate);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGraduationScores = async (req, res) => {
  try {
    const { divisionId, startDate, endDate } = req.query;

    // Converte dd/MM/yyyy para Date
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
      return res.status(404).json({ error: 'Divisão não encontrada' });
    }

    // Formata as datas de volta para dd/MM/yyyy na resposta
    res.json({
      period: { start: startDate, end: endDate },
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao calcular pontuação.', details: error.message });
  }
};

module.exports = {
  getDivisionReport,
  getGraduationScores,
};
