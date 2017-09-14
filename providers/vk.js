const url = require('url');
const https = require('https');
const OAuth2BaseProvider = require('../oauth2.base.provider');
const ProviderError = require('./../errors/ProviderError');
const defaultScope = '';
const providerName = 'vk';

/**
 * Provider for vk.com
 *
 * @class VkAuthProvider
 * @extends {OAuth2BaseProvider}
 */
class VkAuthProvider extends OAuth2BaseProvider {
  /**
   * Creates an instance of VkAuthProvider.
   * @param {any} options
   * @param {any} auth Instance of Auth class
   *
   * @memberOf VkAuthProvider
   */
  constructor(options, auth) {
    super(options, auth);

    this._providerName = providerName;
  }

  /**
   * Exchange code to access token
   *
   * @param {string} code Code received after authorize user
   * @return {Promise}
   *
   * @memberOf GoogleAuthProvider
   */
  exchangeCodeToAccessToken(code) {
    const tokenUrl = {
      protocol: 'https',
      host: 'oauth.vk.com',
      pathname: 'access_token',
      query: {
        client_id: this._options.clientId,
        client_secret: this._options.clientSecret,
        redirect_uri: this._options.redirectUri,
        code
      }
    };

    const tokenUrlStr = url.format(tokenUrl);

    return new Promise((resolve, reject) => {
      let data = '';

      https.get(tokenUrlStr, res => {
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
    }).then(data => {
      if (data.error) {
        throw new ProviderError(data.error_description, data.error);
      }

      this._accessToken = data.access_token;
      this._expiresIn = data.expires_in;
      this._userId = data.user_id;

      return data;
    });
  }
}

VkAuthProvider.providerName = providerName;

VkAuthProvider.getAuthUrl = options => {
  const authBaseUrl = {
    protocol: 'https',
    host: 'oauth.vk.com',
    pathname: 'authorize',
    query: {
      client_id: options.clientId,
      redirect_uri: options.redirectUri,
      display: 'page',
      scope: options.scope || defaultScope,
      response_type: 'code',
      v: '5.62'
    }
  };

  return url.format(authBaseUrl);
};

module.exports = VkAuthProvider;
