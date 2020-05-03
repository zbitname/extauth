import * as url from 'url';
import * as https from 'https';
import * as querystring from 'querystring';
import {OAuth2BaseProvider, IOAuth2BaseProviderOptions, IUserName} from '../oauth2.base.provider';
import {ProviderError} from '../errors/ProviderError';

const defaultScope = ['https://www.googleapis.com/auth/userinfo.profile'].join(' ');
const providerName = 'google';

interface GoogleAuthResponseBody {
  error?: any;
  error_description?: string;
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface GoogleAuthUserResponseBody {
  names: any[];
}

interface GoogleProfileName {
  givenName?: string;
  familyName?: string;
}

export class GoogleAuthProvider extends OAuth2BaseProvider {
  static providerName = providerName;
  public providerName = providerName;

  private profileInfo: GoogleProfileName = {};

  public accessToken?: string;
  public expiresIn?: number;
  public tokenType?: string;
  public userId?: string;

  async exchangeCodeToAccessToken(code: string): Promise<GoogleAuthResponseBody> {
    const requestBody = querystring.stringify({
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      redirect_uri: this.options.redirectUri,
      grant_type: 'authorization_code',
      code
    });

    const data: GoogleAuthResponseBody = await new Promise((resolve, reject) => {
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

    const data: GoogleAuthUserResponseBody = await new Promise((resolve, reject) => {
      let _data = '';

      const req = https.request({
        hostname: 'people.googleapis.com',
        path: '/v1/people/me?personFields=names',
        port: 443,
        method: 'GET',
        headers: {
          'Authorization': `${this.tokenType} ${this.accessToken}`
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

    const name = data?.names[0];

    this.userId = name?.metadata?.source?.id;

    this.profileInfo = name;

    return this.userId;
  }

  async getUserName(): Promise<IUserName> {
    return {
      firstName: this.profileInfo.givenName,
      lastName: this.profileInfo.familyName
    };
  }

  static getAuthUrl(options: IOAuth2BaseProviderOptions): string {
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
