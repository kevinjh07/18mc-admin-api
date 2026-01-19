const userService = require('../services/userService');
const UserAlreadyExistsError = require('../exceptions/UserAlreadyExistsError');
const EmailAlreadyInUseError = require('../exceptions/EmailAlreadyInUseError');
const mailerService = require('../services/mailerService');
const InvalidOrExpiredTokenError = require('../exceptions/InvalidOrExpiredTokenError');
const UserNotFountError = require('../exceptions/UserNotFountError');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const user = await userService.createUser({ name, email, password, role });
    res.status(201).json(user);
  } catch (error) {
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
  
  try {
    const users = await userService.getUsers({ page, limit, excludeUserId });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, isActive } = req.body;
  try {
    await userService.updateUser({ id, name, email, isActive });
    res.status(204).end();
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const { userName, resetToken } = await userService.createPasswordResetToken(email);
    await mailerService.sendPasswordResetEmail(userName, email, resetToken);
    res.status(200).end();
  } catch (error) {
    if (error instanceof UserNotFountError) {
      res.status(422).json({ error: error.message });
    } else {
      res.status(500).json(error);
    }
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await userService.resetPassword(token, newPassword);
    res.status(200).end();
  } catch (error) {
    if (error instanceof InvalidOrExpiredTokenError) {
      res.status(422).json(error.message);
    } else {
      res.status(500).json(error.message);
    }
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '60m' }
    );
    res.json({ accessToken });
  } catch (error) {
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
