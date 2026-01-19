const SocialActionService = require('../services/socialActionService');


const createSocialAction = async (req, res) => {
  try {
    const socialAction = await SocialActionService.createSocialAction(req.body);
    res.status(201).json(socialAction);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar ação social.', details: error.message });
  }
};

const getSocialActionById = async (req, res) => {
  try {
    const socialAction = await SocialActionService.getSocialActionById(
      req.params.id,
    );
    if (!socialAction) {
      return res.status(404).send('Social action not found');
    }
    res.json(socialAction);
  } catch (error) {
    res.status(500).send('Error fetching social action');
  }
};

const getAllSocialActions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  try {
    const socialActions = await SocialActionService.getAllSocialActions(
      page,
      limit,
      req.query.regionalId,
      req.query.divisionId,
    );
    res.json(socialActions);
  } catch (error) {
    res.status(500).send('Error fetching social actions');
  }
};

const updateSocialAction = async (req, res) => {
  try {
    await SocialActionService.updateSocialAction(req.body);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao  atualizar ação social.', details: error.message });
  }
};

const getPersonsBySocialActionId = async (req, res) => {
  try {
    const persons = await SocialActionService.getPersonsBySocialActionId(
      req.params.id,
    );
    if (!persons || persons.length === 0) {
      return res.status(404).send('No persons found for this social action');
    }
    res.json(persons);
  } catch (error) {
    res.status(500).send('Error fetching persons for social action');
  }
};

module.exports = {
  createSocialAction,
  getSocialActionById,
  getAllSocialActions,
  updateSocialAction,
  getPersonsBySocialActionId,
};
