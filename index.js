const ProviderError = require('./errors/ProviderError');

/**
 * @typedef {import('./oauth2.base.provider').OAuth2BaseProviderOptions} OAuth2BaseProviderOptions
 */

/**
 * @typedef {import('./oauth2.base.provider')} OAuth2BaseProvider
 */

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
   * @param {OAuth2BaseProviderOptions} options
   * @returns {void}
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
   * @returns {void}
   *
   * @memberOf Auth
   */
  setSignInFunc(fnc) {
    this._signInFnc = fnc;
  }

  /**
   * Sign in function getter
   *
   * @returns {function}
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
   * @returns {OAuth2BaseProvider} Instance of provider class extends OAuth2BaseProvider
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
   * @returns {string} URL for redirect for auth
   *
   * @memberOf Auth
   */
  getAuthUrl(providerName) {
    const {Provider, options} = this._providers[providerName];

    return Provider.getAuthUrl(options);
  }
}

module.exports = {Auth, ProviderError};
