require('dotenv').config();

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
}));
jest.mock('bcryptjs');
jest.mock('crypto');

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  createPasswordResetToken,
  resetPassword,
} = require('../services/userService');
const { Op } = require('sequelize');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserAlreadyExistsError = require('../exceptions/UserAlreadyExistsError');
const EmailAlreadyInUseError = require('../exceptions/EmailAlreadyInUseError');
const InvalidOrExpiredTokenError = require('../exceptions/InvalidOrExpiredTokenError');
const UserNotFountError = require('../exceptions/UserNotFountError');

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = { id: 1, name: 'User', email: 'user@example.com' };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(mockUser);

      const result = await createUser({
        name: 'User',
        email: 'user@example.com',
        password: 'password',
        role: 'admin',
      });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'User',
        email: 'user@example.com',
        password: 'hashedPassword',
        role: 'admin',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UserAlreadyExistsError if email exists', async () => {
      User.findOne.mockResolvedValue({ id: 1 });

      await expect(createUser({
        name: 'User',
        email: 'user@example.com',
        password: 'password',
      })).rejects.toThrow(UserAlreadyExistsError);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users excluding userId', async () => {
      const mockUsers = {
        count: 1,
        rows: [{ id: 2, email: 'user2@example.com', isActive: true }],
      };

      User.findAndCountAll.mockResolvedValue(mockUsers);

      const result = await getUsers({ page: 1, limit: 10, excludeUserId: 1 });

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        attributes: ['id', 'email', 'isActive'],
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        where: expect.objectContaining({
          id: expect.any(Object),
        }),
      });
      expect(result).toEqual({
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        data: mockUsers.rows,
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, name: 'User', email: 'user@example.com', isActive: true };

      User.findOne.mockResolvedValue(mockUser);

      const result = await getUserById(1);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: ['id', 'name', 'email', 'isActive'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await getUserById(1);

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Old Name',
        email: 'old@example.com',
        isActive: false,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(null); // No existing user with new email
      User.findByPk.mockResolvedValue(mockUser);

      const result = await updateUser({
        id: 1,
        name: 'New Name',
        email: 'new@example.com',
        isActive: true,
      });

      expect(User.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          email: 'new@example.com',
          id: expect.any(Object),
        }),
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.name).toBe('New Name');
      expect(mockUser.email).toBe('new@example.com');
      expect(mockUser.isActive).toBe(true);
      expect(result).toEqual(mockUser);
    });

    it('should throw EmailAlreadyInUseError if email in use', async () => {
      User.findOne.mockResolvedValue({ id: 2 });

      await expect(updateUser({
        id: 1,
        email: 'existing@example.com',
      })).rejects.toThrow(EmailAlreadyInUseError);
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      User.findByPk.mockResolvedValue(null);

      await expect(updateUser({
        id: 1,
        name: 'New Name',
      })).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('createPasswordResetToken', () => {
    it('should create password reset token successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'User',
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue(Buffer.from('randomtoken'));
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedtoken'),
      });

      const result = await createPasswordResetToken('user@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        userName: 'User',
        resetToken: expect.any(String),
      });
    });

    it('should throw UserNotFountError if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(createPasswordResetToken('user@example.com')).rejects.toThrow(UserNotFountError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUser = {
        id: 1,
        password: 'oldpassword',
        passwordResetToken: 'hashedtoken',
        passwordResetExpires: Date.now() + 10000,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedtoken'),
      });
      bcrypt.hash.mockResolvedValue('newhashedpassword');

      await resetPassword('token', 'newpassword');

      expect(User.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          passwordResetToken: 'hashedtoken',
          passwordResetExpires: expect.any(Object),
        }),
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUser.password).toBe('newhashedpassword');
      expect(mockUser.passwordResetToken).toBeNull();
      expect(mockUser.passwordResetExpires).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw InvalidOrExpiredTokenError if token invalid', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(resetPassword('invalidtoken', 'newpassword')).rejects.toThrow(InvalidOrExpiredTokenError);
    });
  });
});