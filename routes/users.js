const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, checkRole } = require('../middleware/auth');
const userController = require('../controllers/userController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Endpoints para gerenciamento de usuários
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do usuário.
 *                   name:
 *                     type: string
 *                     description: Nome do usuário.
 *                   email:
 *                     type: string
 *                     description: Email do usuário.
 *       500:
 *         description: Erro interno do servidor.
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtém detalhes de um usuário específico
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Detalhes do usuário retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID do usuário.
 *                 name:
 *                   type: string
 *                   description: Nome do usuário.
 *                 email:
 *                   type: string
 *                   description: Email do usuário.
 *                 isActive:
 *                   type: boolean
 *                   description: Status do usuário.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realiza login de um usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário.
 *               password:
 *                 type: string
 *                 description: Senha do usuário.
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *       401:
 *         description: Usuário ou senha inválidos.
 *       403:
 *         description: Usuário inativo.
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Usuário ou senha inválidos');
  }
  if (!user.isActive) {
    return res.status(403).send('Usuário inativo');
  }
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: '60m',
    },
  );
  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
  res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário.
 *               email:
 *                 type: string
 *                 description: Email do usuário.
 *               password:
 *                 type: string
 *                 description: Senha do usuário.
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso.
 *       400:
 *         description: Dados inválidos fornecidos.
 */

router.post(
  '/register',
  authenticateToken,
  checkRole(['admin']),
  [
    check('name')
      .isLength({ max: 150 })
      .withMessage('O nome não pode ter mais de 150 caracteres'),
    check('email')
      .isEmail()
      .withMessage('E-mail inválido')
      .isLength({ max: 150 })
      .withMessage('O email não pode ter mais de 150 caracteres'),
    check('password')
      .isLength({ max: 100 })
      .withMessage('A senha não pode ter mais de 100 caracteres'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.registerUser,
);

/**
 * @swagger
 * /users/password-reset-request:
 *   post:
 *     summary: Solicita redefinição de senha
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email do usuário.
 *     responses:
 *       200:
 *         description: Solicitação de redefinição de senha enviada com sucesso.
 *       400:
 *         description: Dados inválidos fornecidos.
 */

router.post(
  '/password-reset-request',
  [
    check('email')
      .isEmail()
      .withMessage('Um endereço de email válido é necessário'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.requestPasswordReset,
);

/**
 * @swagger
 * /users/password-reset:
 *   post:
 *     summary: Redefine a senha do usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de redefinição de senha.
 *               newPassword:
 *                 type: string
 *                 description: Nova senha do usuário.
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso.
 *       400:
 *         description: Dados inválidos fornecidos.
 */

router.post(
  '/password-reset',
  [
    check('token').notEmpty().withMessage('Token is required'),
    check('newPassword')
      .isLength({ min: 6 })
      .withMessage('A senha deve ter no mínimo 6 caracteres')
      .isLength({ max: 100 })
      .withMessage('A senha não pode ter mais de 100 caracteres')
      .matches(/^(?=.*[A-Z])(?=.*\d).+$/)
      .withMessage(
        'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número',
      ),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.resetPassword,
);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Gera um novo token de acesso
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de atualização.
 *     responses:
 *       200:
 *         description: Novo token de acesso gerado com sucesso.
 *       400:
 *         description: Dados inválidos fornecidos.
 */

router.post(
  '/refresh-token',
  [
    check('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.refreshToken,
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso.
 *       500:
 *         description: Erro interno do servidor.
 */

router.get(
  '/',
  authenticateToken,
  checkRole(['admin']),
  userController.getUsers,
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtém detalhes de um usuário específico
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário.
 *     responses:
 *       200:
 *         description: Detalhes do usuário retornados com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno do servidor.
 */

router.get(
  '/:id',
  authenticateToken,
  checkRole(['admin']),
  userController.getUserById,
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Atualiza os dados de um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do usuário.
 *               email:
 *                 type: string
 *                 description: Email do usuário.
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       400:
 *         description: Dados inválidos fornecidos.
 *       404:
 *         description: Usuário não encontrado.
 */

router.patch(
  '/:id',
  authenticateToken,
  checkRole(['admin']),
  [
    check('name')
      .isLength({ max: 150 })
      .withMessage('O nome não pode ter mais de 150 caracteres'),
    check('email')
      .isEmail()
      .withMessage('E-mail inválido')
      .isLength({ max: 150 })
      .withMessage('O email não pode ter mais de 150 caracteres'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.updateUser,
);

module.exports = router;
