class InvalidOrExpiredTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidOrExpiredTokenError';
  }
}

module.exports = InvalidOrExpiredTokenError;
