import * as url from 'url';
import * as https from 'https';
import {OAuth2BaseProvider, IOAuth2BaseProviderOptions, IUserName} from '../oauth2.base.provider';
import {ProviderError} from '../errors/ProviderError';

const DEFAULT_SCOPE = '';
const PROVIDER_NAME = 'vk';
const API_VERSION = '5.103';

interface IVkUserProfile {
  id: number;
  first_name: string;
  last_name: string;
}

interface IVkUserPorfileResponse {
  response: IVkUserProfile[];
}

function getRequest<T>(urlStr: string): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = '';

    https.get(urlStr, res => {
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

interface IVkAuthResponseBody {
  error?: any;
  error_description?: string;
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  user_id?: string;
}

export class VkAuthProvider extends OAuth2BaseProvider {
  static providerName = PROVIDER_NAME;
  public providerName = PROVIDER_NAME;

  private profileInfo?: IVkUserProfile;

  public accessToken?: string;
  public expiresIn?: number;
  public tokenType?: string;
  public userId?: string;

  async exchangeCodeToAccessToken(code: string) {
    const tokenUrl = {
      protocol: 'https',
      host: 'oauth.vk.com',
      pathname: 'access_token',
      query: {
        client_id: this.options.clientId,
        client_secret: this.options.clientSecret,
        redirect_uri: this.options.redirectUri,
        code
      }
    };

    const tokenUrlStr = url.format(tokenUrl);

    const data: IVkAuthResponseBody = await getRequest<IVkAuthResponseBody>(tokenUrlStr);

    if (data.error) {
      throw new ProviderError(data.error_description, data.error);
    }

    this.accessToken = data?.access_token;
    this.expiresIn = data?.expires_in;
    this.userId = data?.user_id;

    return data;
  }

  /**
   * Maker requset to {@link https://vk.com/dev/users.get|VK dev docs} and return {@link https://vk.com/dev/objects/user|User object}
   */
  private async fetchProfileInfo() {
    const urlStr = this.getMethodUrl(true, 'users.get', {
      user_ids: this.userId,
      // eslint-disable-next-line max-len
      fields: ''
    });

    const res = await getRequest<IVkUserPorfileResponse>(urlStr);

    const profile = res.response[0];

    this.profileInfo = profile;

    return this.profileInfo;
  }

  async getUserName(): Promise<IUserName> {
    if (!this.profileInfo) {
      await this.fetchProfileInfo();
    }

    return {firstName: this.profileInfo?.first_name, lastName: this.profileInfo?.last_name};
  }

  /**
   * @param {string} method One of https://vk.com/dev/methods
   * @param {Object} [options={}]
   */
  private getMethodUrl(accessTokenIsNeeded: boolean, method: string, options = {}) {
    const urlQuery: {[key: string]: any} = {
      ...options,
      v: API_VERSION
    };

    const urlObj = {
      protocol: 'https',
      host: 'api.vk.com',
      pathname: `method/${method}`,
      query: urlQuery
    };

    if (accessTokenIsNeeded) {
      if (!this.accessToken) {
        throw new ProviderError('First get access token');
      }

      urlObj.query.access_token = this.accessToken;
    }

    return url.format(urlObj);
  }

  /**
   * Make url for autorization
   *
   * @static
   * @param {Object} [options={}]
   * @return {string} URL
   * @memberof VkAuthProvider
   */
  static getAuthUrl(options: IOAuth2BaseProviderOptions) {
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
        v: API_VERSION
      }
    };

    return url.format(authBaseUrl);
  }
}
