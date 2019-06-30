/**
 * Custom error class
 *
 * @class ProviderError
 * @extends {Error}
 */
class ProviderError extends Error {
  /**
   *Creates an instance of ProviderError.
   * @param {any} message
   * @param {any} code
   * @memberof ProviderError
   */
  constructor(message, code) {
    super();

    this.message = message;
    this.code = code;
  }
}

module.exports = ProviderError;
