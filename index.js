const ProviderError = require('./errors/ProviderError');

/**
 * Main class of this module
 *
 * @class Auth
 */
class Auth {
  /**
   * Creates an instance of Auth.
   *
   * @memberOf Auth
   */
  constructor() {
    this._providers = {};
    this._signInFnc = null;
  }

  /**
   * Register the some provider
   *
   * @param {OAuth2BaseProvider} Provider
   * @param {Object} options
   *
   * @memberOf Auth
   */
  registerProvider(Provider, options) {
    this._providers[Provider.providerName] = {Provider, options};
  }

  /**
   * Sign in function setter
   *
   * @param {function} fnc
   *
   * @memberOf Auth
   */
  setSignInFunc(fnc) {
    this._signInFnc = fnc;
  }

  /**
   * Sign in function getter
   *
   * @return {function}
   *
   * @memberOf Auth
   */
  getSignInFunc() {
    return this._signInFnc;
  }

  /**
   * Create provider instance
   *
   * @param {string} providerName Name of provider
   * @return {OAuth2BaseProvider} Instance of provider class extends OAuth2BaseProvider
   *
   * @memberOf Auth
   */
  getProvider(providerName) {
    const {Provider, options} = this._providers[providerName];

    return new Provider(options, this);
  }

  /**
   * Returns link to authorize user
   *
   * @param {string} providerName Name of provider
   * @return {OAuth2BaseProvider} Instance of provider class extends OAuth2BaseProvider
   *
   * @memberOf Auth
   */
  getAuthUrl(providerName) {
    const {Provider, options} = this._providers[providerName];

    return Provider.getAuthUrl(options);
  }
}

module.exports = {Auth, ProviderError};
