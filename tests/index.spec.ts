/* tslint:disable:no-invalid-this */

import * as assert from 'assert';
import {describe, it, before} from 'mocha';

import {Auth} from '../src/index';
import {TestAuthProvider} from './helpers/provider';
import {collection} from './helpers/db';

const providerOptions = {
  clientId: 'test client id',
  clientSecret: 'test client secret',
  redirectUri: 'http://localhost/auth/provider/callback'
};

describe('Auth', () => {
  describe('Common', () => {
    let auth: Auth;

    before(() => {
      auth = new Auth();

      auth.setSignInFunc(async function() {
        const User = collection('users');
        const providerName = this.getProviderName();

        const condition = {
          provider: providerName,
          userId: await this.getUserId()
        };

        let user = User.findOne(condition);

        if (!user) {
          this.isNew(true);
          user = User.create(condition);
        } else {
          this.isNew(false);
        }

        return user;
      });

      auth.registerProvider(TestAuthProvider, providerOptions);
    });

    it('#getAuthUrl', () => {
      const authUrl = auth.getAuthUrl(TestAuthProvider.providerName);

      assert.equal(typeof authUrl, 'string');
    });

    it('#getSignInFunc', () => {
      const signInFnc = auth.getSignInFunc();

      assert.equal(typeof signInFnc, 'function');
    });

    it('#getProvider', () => {
      const provider = auth.getProvider(TestAuthProvider.providerName);

      assert.equal(typeof provider, 'object');
      assert.equal(provider instanceof TestAuthProvider, true);
    });
  });

  it('#getUserId', async () => {
    const auth = new Auth();
    auth.registerProvider(TestAuthProvider, providerOptions);
    const provider = auth.getProvider(TestAuthProvider.providerName);

    assert.equal(provider instanceof TestAuthProvider, true);

    const userId = await provider.getUserId();
    assert.equal(userId, null);
  });

  it('#isNew', next => {
    const auth = new Auth();
    auth.registerProvider(TestAuthProvider, providerOptions);
    const provider = auth.getProvider(TestAuthProvider.providerName);

    auth.setSignInFunc(function() {
      this.isNew(true); // eslint-disable-line no-invalid-this
      assert.equal(provider.isNew(), true);

      this.isNew(false); // eslint-disable-line no-invalid-this
      assert.equal(provider.isNew(), false);

      next();
    });

    provider.signIn();
  });

  it('#getProviderName', () => {
    const auth = new Auth();
    auth.registerProvider(TestAuthProvider, providerOptions);
    const provider = auth.getProvider(TestAuthProvider.providerName);

    assert.equal(provider.getProviderName(), 'test');
  });
});
