import * as url from 'url';
import {OAuth2BaseProvider, IUserName} from '../../src/oauth2.base.provider';
const defaultScope = 'profile';
const providerName = 'test';

/**
 * Provider for vk.com
 *
 * @class TestAuthProvider
 * @extends {OAuth2BaseProvider}
 */
export class TestAuthProvider extends OAuth2BaseProvider {
  public providerName = providerName;
  static providerName = providerName;

  private profileInfo = {givenName: '', familyName: ''};

  /**
   * Exchange code to access token
   *
   * @param {string} code Code received after authorize user
   * @return {Promise}
   *
   * @memberOf GoogleAuthProvider
   */
  async exchangeCodeToAccessToken(code: string) {
    const data = {
      access_token: 'test_access_token',
      expires_in: 3600,
      user_id: 3
    };

    this.accessToken = data.access_token;
    this.expiresIn = data.expires_in;
    this.userId = String(data.user_id);
  }

  async getUserName(): Promise<IUserName> {
    return {
      firstName: this.profileInfo.givenName,
      lastName: this.profileInfo.familyName
    };
  }

  static getAuthUrl(options: any) {
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
  }
}
