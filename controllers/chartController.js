const ChartService = require('../services/chartService');
const logger = require('../services/loggerService');

const getSocialActionCountByDateRange = async (req, res) => {
  const { startDate, endDate, regionalId } = req.query;
  logger.info('Buscando contagem de ações sociais por intervalo de datas', {
    startDate,
    endDate,
    regionalId,
  });

  if (!startDate || !endDate || !regionalId) {
    logger.warn('Parâmetros inválidos fornecidos', {
      startDate,
      endDate,
      regionalId,
    });
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
    logger.info('Contagem de ações sociais obtida com sucesso', {
      count: socialActions.length,
    });
    res.json(socialActions);
  } catch (error) {
    logger.error('Erro ao buscar contagem de ações sociais', {
      error: error.message,
    });
    res
      .status(500)
      .json({ message: 'Erro interno do servidor.', details: error.message });
  }
};

const getSocialActionInternalExternalCountByDateRange = async (req, res) => {
  const { startDate, endDate, regionalId } = req.query;
  logger.info(
    'Buscando contagem de ações sociais internas e externas por intervalo de datas',
    { startDate, endDate, regionalId },
  );

  if (!startDate || !endDate || !regionalId) {
    logger.warn('Parâmetros inválidos fornecidos', {
      startDate,
      endDate,
      regionalId,
    });
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
    logger.info('Contagem de ações sociais internas e externas obtida com sucesso', {
      count: socialActions.length,
    });
    res.json(socialActions);
  } catch (error) {
    logger.error('Erro ao buscar contagem de ações sociais internas e externas', {
      error: error.message,
    });
    res
      .status(500)
      .json({ message: 'Erro interno do servidor.', details: error.message });
  }
};

const getSocialActionsByPersonAndDivision = async (req, res) => {
  const { divisionId, startDate, endDate } = req.query;
  logger.info('Buscando ações sociais por pessoa e divisão', {
    divisionId,
    startDate,
    endDate,
  });

  if (!divisionId || !startDate || !endDate) {
    logger.warn('Parâmetros inválidos fornecidos', {
      divisionId,
      startDate,
      endDate,
    });
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
    logger.info('Ações sociais por pessoa e divisão obtidas com sucesso', {
      count: socialActions.length,
    });
    res.json(socialActions);
  } catch (error) {
    logger.error('Erro ao buscar ações sociais por pessoa e divisão', {
      error: error.message,
    });
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
