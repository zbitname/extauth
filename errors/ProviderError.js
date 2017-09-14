module.exports = class extends Error {
  constructor(message, code) {
    super();

    this.message = message;
    this.code = code;
  }
};
