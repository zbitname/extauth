import * as url from 'url';
import * as https from 'https';
import * as querystring from 'querystring';
import {OAuth2BaseProvider, IOAuth2BaseProviderOptions, IUserName} from '../oauth2.base.provider';
import {ProviderError} from '../errors/ProviderError';

const defaultScope = 'user:read:email';
const providerName = 'twitch';

interface TwitchAuthResponseBody {
  error?: any;
  error_description?: string;
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface ITwitchProfile {
  id: string;
  display_name: string;
}

export class TwitchAuthProvider extends OAuth2BaseProvider {
  static providerName = providerName;
  public providerName = providerName;

  private profileInfo?: ITwitchProfile;

  public accessToken?: string;
  public expiresIn?: number;
  public tokenType?: string;
  public userId?: string;

  async exchangeCodeToAccessToken(code: string) {
    const requestBody = querystring.stringify({
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      redirect_uri: this.options.redirectUri,
      grant_type: 'authorization_code',
      code
    });

    const data: TwitchAuthResponseBody = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'id.twitch.tv',
        port: 443,
        // eslint-disable-next-line max-len
        path: `/oauth2/token?client_id=${this.options.clientId}&client_secret=${this.options.clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${this.options.redirectUri}`,
        method: 'POST'
      };

      const req = https.request(options, res => {
        let _data = '';

        res.on('data', chunk => {
          _data += chunk.toString();
        });

        res.once('end', () => {
          try {
            resolve(JSON.parse(_data));
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', err => {
        reject(err);
      });

      req.write(requestBody);
      req.end();
    });

    if (data.error) {
      throw new ProviderError(data.error_description, data.error);
    }

    this.accessToken = data.access_token;
    this.expiresIn = data.expires_in;
    this.tokenType = data.token_type;

    return data;
  }

  async getUserId() {
    if (this.userId) {
      return this.userId;
    }

    const data = await new Promise<{data: ITwitchProfile[]}>((resolve, reject) => {
      let _data = '';

      const req = https.request({
        hostname: 'api.twitch.tv',
        path: '/helix/users',
        port: 443,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          // 'Client-ID': this._options.clientId,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      }, res => {
        res.on('data', chunk => {
          _data += chunk.toString();
        });

        res.once('end', () => {
          try {
            resolve(JSON.parse(_data));
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', err => {
        reject(err);
      });

      req.end();
    });

    this.profileInfo = data.data[0];
    this.userId = this.profileInfo?.id;

    return this.userId;
  }

  async getUserName(): Promise<IUserName> {
    return {firstName: this.profileInfo?.display_name};
  }

  static getAuthUrl(options: IOAuth2BaseProviderOptions) {
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
