const url = require('url');
const OAuth2BaseProvider = require('../../oauth2.base.provider');
const defaultScope = 'profile';
const providerName = 'test';

/**
 * Provider for vk.com
 *
 * @class TestAuthProvider
 * @extends {OAuth2BaseProvider}
 */
class TestAuthProvider extends OAuth2BaseProvider {
  /**
   * Creates an instance of TestAuthProvider.
   * @param {any} options
   * @param {any} auth Instance of Auth class
   *
   * @memberOf TestAuthProvider
   */
  constructor(options, auth) {
    super(options, auth);

    this._providerName = providerName;
  }

  /**
   * Exchange code to access token
   *
   * @param {string} code Code received after authorize user
   * @returns {Promise}
   *
   * @memberOf GoogleAuthProvider
   */
  exchangeCodeToAccessToken(code) {
    return new Promise((resolve, reject) => {
      let data = {
        access_token: 'test_access_token',
        expires_in: 3600,
        user_id: 3
      };

      this._accessToken = data.access_token;
      this._expiresIn = data.expires_in;
      this._userId = data.user_id;
    });
  }
}

TestAuthProvider.providerName = providerName;

TestAuthProvider.getAuthUrl = options => {
  const authBaseUrl = {
    protocol: 'http',
    host: 'localhost',
    pathname: 'authorize',
    query: {
      client_id: options.clientId,
      redirect_uri: options.redirectUri,
      scope: options.scope || defaultScope,
      response_type: 'code'
    }
  };

  return url.format(authBaseUrl);
};

module.exports = TestAuthProvider;
