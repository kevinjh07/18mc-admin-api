class PaymentAlreadyExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PaymentAlreadyExistsError';
  }
}

module.exports = PaymentAlreadyExistsError;
