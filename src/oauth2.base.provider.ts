import {Auth} from './index';

const PROVIDER_NAME = 'undefined';

export interface IOAuth2BaseProviderOptions {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: any;
}

export interface IUserName {
  firstName?: string;
  lastName?: string;
}

export abstract class OAuth2BaseProvider {
  private optionsValue: IOAuth2BaseProviderOptions = {};
  private auth: Auth;
  private isNewValue = true;

  static providerName = PROVIDER_NAME;

  public providerName = PROVIDER_NAME;
  public accessToken?: string;
  public expiresIn?: number;
  public tokenType?: string;
  public userId?: string;

  constructor(options: IOAuth2BaseProviderOptions, auth: Auth) {
    this.options = options;
    this.auth = auth;
  }

  abstract getUserName(): Promise<IUserName>;
  abstract exchangeCodeToAccessToken(code: string): any;

  static getAuthUrl(options: IOAuth2BaseProviderOptions): string {
    throw new TypeError('Not implemented');
  }

  get options() {
    return this.optionsValue;
  }

  set options(value: IOAuth2BaseProviderOptions) {
    this.optionsValue = value;
  }

  signIn(state?: any): any {
    const signIn = this.auth.getSignInFunc();

    if (signIn) {
      return signIn.call(this, state);
    }
  }

  isNew(v?: boolean): boolean {
    if (typeof v === 'boolean') {
      this.isNewValue = v;
    }

    return this.isNewValue;
  }

  async getUserId() {
    return this.userId;
  }

  getProviderName() {
    return this.providerName;
  }
}
