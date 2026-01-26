const userService = require('../services/userService');
const UserAlreadyExistsError = require('../exceptions/UserAlreadyExistsError');
const EmailAlreadyInUseError = require('../exceptions/EmailAlreadyInUseError');
const mailerService = require('../services/mailerService');
const InvalidOrExpiredTokenError = require('../exceptions/InvalidOrExpiredTokenError');
const UserNotFountError = require('../exceptions/UserNotFountError');
const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  logger.info('Iniciando registro de usuário', { name, email, role });
  try {
    const user = await userService.createUser({ name, email, password, role });
    logger.info('Usuário registrado com sucesso', { userId: user.id });
    res.status(201).json(user);
  } catch (error) {
    logger.error('Erro ao registrar usuário', { error: error.message });
    if (error instanceof UserAlreadyExistsError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const excludeUserId = req.user.userId;
  logger.info('Buscando usuários', { page, limit, excludeUserId });
  try {
    const users = await userService.getUsers({ page, limit, excludeUserId });
    logger.info('Usuários encontrados', { count: users.length });
    res.status(200).json(users);
  } catch (error) {
    logger.error('Erro ao buscar usuários', { error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  logger.info('Buscando usuário por ID', { userId: id });
  try {
    const user = await userService.getUserById(id);
    if (!user) {
      logger.warn('Usuário não encontrado', { userId: id });
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    logger.info('Usuário encontrado', { userId: id });
    res.status(200).json(user);
  } catch (error) {
    logger.error('Erro ao buscar usuário por ID', { userId: id, error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, isActive } = req.body;
  logger.info('Atualizando usuário', { userId: id, name, email, isActive });
  try {
    await userService.updateUser({ id, name, email, isActive });
    logger.info('Usuário atualizado com sucesso', { userId: id });
    res.status(204).end();
  } catch (error) {
    logger.error('Erro ao atualizar usuário', { userId: id, error: error.message });
    if (error instanceof EmailAlreadyInUseError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  logger.info('Solicitando redefinição de senha', { email });
  try {
    const { userName, resetToken } = await userService.createPasswordResetToken(email);
    await mailerService.sendPasswordResetEmail(userName, email, resetToken);
    logger.info('Email de redefinição de senha enviado', { email });
    res.status(200).end();
  } catch (error) {
    logger.error('Erro ao solicitar redefinição de senha', { error: error.message });
    if (error instanceof UserNotFountError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).json(error);
    }
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  logger.info('Redefinindo senha');
  try {
    await userService.resetPassword(token, newPassword);
    logger.info('Senha redefinida com sucesso');
    res.status(200).end();
  } catch (error) {
    logger.error('Erro ao redefinir senha', { error: error.message });
    res.status(400).json({ error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  logger.info('Atualizando token', { refreshToken });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '60m' }
    );
    logger.info('Token atualizado com sucesso', { userId: decoded.userId });
    res.json({ accessToken });
  } catch (error) {
    logger.error('Erro ao atualizar token', { error: error.message });
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  requestPasswordReset,
  resetPassword,
  refreshToken,
};
