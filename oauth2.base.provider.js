/**
 * Base provider
 *
 * @class OAuth2BaseProvider
 */
class OAuth2BaseProvider {
  /**
   * Creates an instance of OAuth2BaseProvider.
   *
   * @param {object} [options={clientId, clientSecret}]
   * @param {Auth} auth Instance of Auth class
   *
   * @memberOf OAuth2BaseProvider
   */
  constructor(options, auth) {
    this._options = options;
    this._auth = auth;
    this._accessToken = null;
    this._expiresIn = null;
    this._tokenType = null;
    this._userId = null;
    this._isNew = null;
    this._providerName = 'undefined';
  }

  /**
   * Exchange code to access token
   *
   * @param {string} code Code received after authorize user
   *
   * @memberOf OAuth2BaseProvider
   */
  exchangeCodeToAccessToken(code) {
    throw new Error('exchangeCodeToAccessToken not implemented');
  }

  /**
   * Sign in user by external provider in your app.
   *
   * @return {Promise|any}
   *
   * @memberOf OAuth2BaseProvider
   */
  signIn() {
    const signIn = this._auth.getSignInFunc();

    return signIn.call(this);
  }

  /**
   * This method help determine user is new or already existed user in your app.
   *
   * @param {boolean} v If argument is exists then this method set value, else get value.
   * @return {boolean}
   *
   * @memberOf OAuth2BaseProvider
   */
  isNew(v) {
    if (typeof v === 'boolean') {
      this._isNew = v;
    }

    return this._isNew;
  }

  /**
   * Get user id. Before call this method must be set this._userId by your provider.
   *
   * @return {Promise}
   *
   * @memberOf OAuth2BaseProvider
   */
  getUserId() {
    return Promise.resolve(this._userId);
  }

  /**
   * Get provider name.
   *
   * @return {string}
   *
   * @memberOf OAuth2BaseProvider
   */
  getProviderName() {
    return this._providerName;
  }

  getUserName() {
    throw new Error('getUserName not implemented');
  }
}

module.exports = OAuth2BaseProvider;
