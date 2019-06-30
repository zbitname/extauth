const url = require('url');
const https = require('https');
const querystring = require('querystring');
const OAuth2BaseProvider = require('../oauth2.base.provider');
const ProviderError = require('./../errors/ProviderError');
const defaultScope = ['profile'].join(' ');
const providerName = 'google';

/**
 * Provider for google.com
 *
 * @class GoogleAuthProvider
 * @extends {OAuth2BaseProvider}
 */
class GoogleAuthProvider extends OAuth2BaseProvider {
  /**
   * Creates an instance of GoogleAuthProvider.
   *
   * @constructor
   * @memberOf GoogleAuthProvider
   */
  constructor(...args) {
    super(...args);

    this._providerName = providerName;
    this._profileInfo = null;
  }

  /**
   * Exchange code to access token
   *
   * @param {string} code Code received after authorize user
   * @return {Promise<Object>}
   * @memberOf GoogleAuthProvider
   */
  exchangeCodeToAccessToken(code) {
    const requestBody = querystring.stringify({
      client_id: this._options.clientId,
      client_secret: this._options.clientSecret,
      redirect_uri: this._options.redirectUri,
      grant_type: 'authorization_code',
      code
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.googleapis.com',
        port: 443,
        path: '/oauth2/v4/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const req = https.request(options, res => {
        let data = '';

        res.on('data', chunk => {
          data += chunk.toString();
        });

        res.once('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', err => {
        reject(err);
      });

      req.write(requestBody);
      req.end();
    }).then(data => {
      if (data.error) {
        throw new ProviderError(data.error_description, data.error);
      }

      this._accessToken = data.access_token;
      this._expiresIn = data.expires_in;
      this._tokenType = data.token_type;

      return data;
    });
  }

  /**
   * Returns user id from provider
   *
   * @return {Promise<string>} User id
   * @memberOf GoogleAuthProvider
   */
  async getUserId() {
    if (this._userId) {
      return Promise.resolve(this._userId);
    }

    return new Promise((resolve, reject) => {
      let data = '';

      const req = https.request({
        hostname: 'www.googleapis.com',
        path: '/plus/v1/people/me',
        port: 443,
        method: 'GET',
        headers: {
          'Authorization': `${this._tokenType} ${this._accessToken}`
        }
      }, res => {
        res.on('data', chunk => {
          data += chunk.toString();
        });

        res.once('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', err => {
        reject(err);
      });

      req.end();
    }).then(data => {
      this._userId = data.id;

      this._profileInfo = data;

      return this._userId;
    });
  }

  /**
   * User first name and last name
   *
   * @typedef {Object} UserName
   * @property {string|null} firstName First name of user
   * @property {string|null} lastName Last name of user
   *
   * @return {Promise<UserName>}
   * @memberof VkAuthProvider
   */
  async getUserName() {
    return {firstName: this._profileInfo.name.givenName, lastName: this._profileInfo.name.familyName};
  }

  /**
   * Make url for autorization
   *
   * @static
   * @param {Object} [options={}]
   * @return {string} URL
   * @memberof GoogleAuthProvider
   */
  static getAuthUrl(options = {}) {
    const authBaseUrl = {
      protocol: 'https',
      host: 'accounts.google.com',
      pathname: 'o/oauth2/v2/auth',
      query: {
        client_id: options.clientId,
        redirect_uri: options.redirectUri,
        response_type: 'code',
        scope: options.scope || defaultScope
      }
    };

    return url.format(authBaseUrl);
  }
}

GoogleAuthProvider.providerName = providerName;

module.exports = GoogleAuthProvider;
