const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error('Authentication failed: Invalid token', { error: err.message });
      return res.sendStatus(403);
    }
    logger.info('Authentication successful', { user: user.id });
    req.user = user;
    next();
  });
};

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    logger.warn('Authorization failed: User does not have the required role', { user: req.user.id, requiredRoles: roles });
    return res.sendStatus(403);
  }
  logger.info('Authorization successful', { user: req.user.id, role: req.user.role });
  next();
};

module.exports = { authenticateToken, checkRole };
