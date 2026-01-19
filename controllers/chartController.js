const ChartService = require('../services/chartService');

const getSocialActionCountByDateRange = async (req, res) => {
  const { startDate, endDate, regionalId } = req.query;

  if (!startDate || !endDate || !regionalId) {
    return res
      .status(400)
      .json({ message: 'Parâmetros inválidos fornecidos.' });
  }

  try {
    const socialActions = await ChartService.getSocialActionCountByDateRange(
      startDate,
      endDate,
      regionalId,
    );

    res.json(socialActions);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro interno do servidor.', details: error.message });
  }
};

const getSocialActionInternalExternalCountByDateRange = async (req, res) => {
  const { startDate, endDate, regionalId } = req.query;

  if (!startDate || !endDate || !regionalId) {
    return res
      .status(400)
      .json({ message: 'Parâmetros inválidos fornecidos.' });
  }

  try {
    const socialActions =
      await ChartService.getSocialActionInternalExternalCountByDateRange(
        startDate,
        endDate,
        regionalId,
      );

    res.json(socialActions);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro interno do servidor.', details: error.message });
  }
};

const getSocialActionsByPersonAndDivision = async (req, res) => {
  const { divisionId, startDate, endDate } = req.query;

  if (!divisionId || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: 'Parâmetros inválidos fornecidos.' });
  }

  try {
    const socialActions =
      await ChartService.getSocialActionsByPersonAndDivisionRaw(
        divisionId,
        startDate,
        endDate,
      );

    res.json(socialActions);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Erro interno do servidor.', details: error.message });
  }
};

module.exports = {
  getSocialActionCountByDateRange,
  getSocialActionInternalExternalCountByDateRange,
  getSocialActionsByPersonAndDivision,
};
