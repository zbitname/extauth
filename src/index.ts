import {OAuth2BaseProvider, IOAuth2BaseProviderOptions} from './oauth2.base.provider';

export {ProviderError} from './errors/ProviderError';

export class Auth {
  private providers: any = {};
  private signInFnc: ((state?: any) => void)|null = null;

  /**
   * Register the some provider
   */
  registerProvider(Provider: typeof OAuth2BaseProvider, options: IOAuth2BaseProviderOptions) {
    this.providers[Provider.providerName] = {Provider, options};
  }

  setSignInFunc(fnc: (state?: any) => any) {
    this.signInFnc = fnc;
  }

  getSignInFunc() {
    return this.signInFnc;
  }

  getProvider(providerName: string): OAuth2BaseProvider {
    const {Provider, options} = this.providers[providerName];

    return new Provider(options, this);
  }

  /**
   * Returns link to authorize user
   */
  getAuthUrl(providerName: string): string {
    const {Provider, options} = this.providers[providerName];

    return Provider.getAuthUrl(options);
  }
}
