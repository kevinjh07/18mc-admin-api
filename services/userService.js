const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const crypto = require('crypto');
const UserAlreadyExistsError = require('../exceptions/UserAlreadyExistsError');
const EmailAlreadyInUseError = require('../exceptions/EmailAlreadyInUseError');
const InvalidOrExpiredTokenError = require('../exceptions/InvalidOrExpiredTokenError');
const UserNotFountError = require('../exceptions/UserNotFountError');

const createUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new UserAlreadyExistsError('Usuário já cadastrado com este e-mail');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashedPassword, role });
};

const getUsers = async ({ page, limit, excludeUserId }) => {
  const offset = (page - 1) * limit;
  const users = await User.findAndCountAll({
    attributes: ['id', 'email', 'name', 'isActive'],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    where: {
      id: {
        [Op.ne]: excludeUserId,
      },
    },
  });

  return {
    totalItems: users.count,
    totalPages: Math.ceil(users.count / limit),
    currentPage: page,
    data: users.rows,
  };
};

const getUserById = async (id) => {
  return User.findOne({
    where: { id },
    attributes: ['id', 'name', 'email', 'isActive'],
  });
};

const updateUser = async ({ id, name, email, isActive }) => {
  const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
  if (existingUser) {
    throw new EmailAlreadyInUseError('E-mail já está em uso por outro usuário');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  user.name = name;
  user.email = email;
  user.isActive = isActive;
  await user.save();

  return user;
};

const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UserNotFountError('Usuário não encontrado');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000 * 3; // 3 hours
  await user.save();

  return {
    userName: user.name,
    resetToken,
  };
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw new InvalidOrExpiredTokenError('Token inválido ou expirado');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  createPasswordResetToken,
  resetPassword,
};
