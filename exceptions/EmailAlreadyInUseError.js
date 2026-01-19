class EmailAlreadyInUseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EmailAlreadyInUseError';
  }
}

module.exports = EmailAlreadyInUseError;
