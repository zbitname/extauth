const url = require('url');
const https = require('https');
const querystring = require('querystring');
const OAuth2BaseProvider = require('../oauth2.base.provider');
const ProviderError = require('../errors/ProviderError');
const defaultScope = ['user_read'].join('+');
const providerName = 'twich';

/**
 * Provider for twitch.tv
 *
 * @class TwichAuthProvider
 * @extends {OAuth2BaseProvider}
 */
class TwichAuthProvider extends OAuth2BaseProvider {
  /**
   * Creates an instance of TwichAuthProvider.
   *
   * @constructor
   * @memberOf TwichAuthProvider
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
   * @memberOf TwichAuthProvider
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
        hostname: 'id.twitch.tv',
        port: 443,
        // eslint-disable-next-line max-len
        path: `/oauth2/token?client_id=${this._options.clientId}&client_secret=${this._options.clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${this._options.redirectUri}`,
        method: 'POST'
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
   * @memberOf TwichAuthProvider
   */
  async getUserId() {
    if (this._userId) {
      return Promise.resolve(this._userId);
    }

    return new Promise((resolve, reject) => {
      let data = '';

      const req = https.request({
        hostname: 'api.twitch.tv',
        path: '/kraken/user',
        port: 443,
        method: 'GET',
        headers: {
          'Authorization': `OAuth ${this._accessToken}`,
          'Client-ID': this._options.clientId,
          'Accept': 'application/vnd.twitchtv.v5+json'
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
      this._userId = data._id;

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
    return {firstName: this._profileInfo.name};
  }

  /**
   * Make url for autorization
   *
   * @static
   * @param {Object} [options={}]
   * @return {string} URL
   * @memberof TwichAuthProvider
   */
  static getAuthUrl(options = {}) {
    const authBaseUrl = {
      protocol: 'https',
      host: 'id.twitch.tv',
      pathname: 'oauth2/authorize',
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

TwichAuthProvider.providerName = providerName;

module.exports = TwichAuthProvider;
