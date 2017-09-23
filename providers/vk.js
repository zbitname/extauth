const url = require('url');
const https = require('https');
const OAuth2BaseProvider = require('../oauth2.base.provider');
const ProviderError = require('./../errors/ProviderError');

const DEFAULT_SCOPE = '';
const PROVIDER_NAME = 'vk';

const getRequest = url => {
  return new Promise((resolve, reject) => {
    let data = '';

    https.get(url, res => {
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
  });
}

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

    this._providerName = PROVIDER_NAME;
    this._profileInfo = null;
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

    return getRequest(tokenUrlStr).then(data => {
      if (data.error) {
        throw new ProviderError(data.error_description, data.error);
      }

      this._accessToken = data.access_token;
      this._expiresIn = data.expires_in;
      this._userId = data.user_id;

      return data;
    });
  }

  async getUserName() {
    const urlStr = this.getMethodUrl(true, 'users.get', {
      user_ids: this._userId,
      fields: 'photo_id, verified, sex, bdate, city, country, home_town, has_photo, photo_50, photo_100, photo_200_orig, photo_200, photo_400_orig, photo_max, photo_max_orig, online, domain, has_mobile, contacts, site, education, universities, schools, status, last_seen, followers_count, common_count, occupation, nickname, relatives, relation, personal, connections, exports, wall_comments, activities, interests, music, movies, tv, books, games, about, quotes, can_post, can_see_all_posts, can_see_audio, can_write_private_message, can_send_friend_request, is_favorite, is_hidden_from_feed, timezone, screen_name, maiden_name, crop_photo, is_friend, friend_status, career, military, blacklisted, blacklisted_by_me'
    });

    if (!this._profileInfo) {
      const res = await getRequest(urlStr);

      const profile = res.response[0];
      
      this._profileInfo = profile;
    }

    return {firstName: this._profileInfo.first_name, lastName: this._profileInfo.last_name};
  }

  getMethodUrl(accessTokenIsNeeded, method, options = {}) {
    const urlObj = {
      protocol: 'https',
      host: 'api.vk.com',
      pathname: `method/${method}`,
      query: Object.assign({
        v: '5.68'
      }, options)
    };

    if (accessTokenIsNeeded) {
      if (!this._accessToken) {
        throw new ProviderError('First get access token');
      }

      urlObj.query.access_token = this._accessToken;
    }
  
    return url.format(urlObj);
  }
}

VkAuthProvider.providerName = PROVIDER_NAME;

VkAuthProvider.getAuthUrl = options => {
  const authBaseUrl = {
    protocol: 'https',
    host: 'oauth.vk.com',
    pathname: 'authorize',
    query: {
      client_id: options.clientId,
      redirect_uri: options.redirectUri,
      display: 'page',
      scope: options.scope || DEFAULT_SCOPE,
      response_type: 'code',
      v: '5.68'
    }
  };

  return url.format(authBaseUrl);
};

module.exports = VkAuthProvider;
