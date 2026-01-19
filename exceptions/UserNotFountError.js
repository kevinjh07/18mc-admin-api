class UserNotFountError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UserNotFountError';
    }
  }
  
  module.exports = UserNotFountError;
  