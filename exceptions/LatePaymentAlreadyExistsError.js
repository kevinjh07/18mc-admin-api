class LatePaymentAlreadyExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LatePaymentAlreadyExistsError';
  }
}

module.exports = LatePaymentAlreadyExistsError;
