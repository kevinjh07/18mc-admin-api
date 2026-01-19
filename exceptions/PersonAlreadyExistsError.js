class PersonAlreadyExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PersonAlreadyExistsError';
  }
}

module.exports = PersonAlreadyExistsError;
