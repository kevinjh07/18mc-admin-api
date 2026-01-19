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

module.exports = {
  getDivisionReport,
};
