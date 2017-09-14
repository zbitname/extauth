const test = require('ava');
const assert = require('assert');
const {Auth} = require('../index');
const BaseProvider = require('../oauth2.base.provider');

const providerOptions = {
  clientId: 'test client id',
  clientSecret: 'test client secret',
  redirectUri: 'http://localhost/auth/provider/callback'
};

test('OAuth2BaseProvider.exchangeCodeToAccessToken', t => {
  const auth = new Auth();
  auth.registerProvider(BaseProvider, providerOptions);
  const provider = auth.getProvider(BaseProvider.providerName);

  assert.throws(() => provider.exchangeCodeToAccessToken('test'), Error);

  t.pass();
});

test('OAuth2BaseProvider.getUserId', t => {
  const auth = new Auth();
  auth.registerProvider(BaseProvider, providerOptions);
  const provider = auth.getProvider(BaseProvider.providerName);

  provider.getUserId().then(userId => {
    assert.equal(userId, null);
    t.pass();
  });
});

test('OAuth2BaseProvider.isNew', t => {
  const auth = new Auth();
  auth.registerProvider(BaseProvider, providerOptions);
  const provider = auth.getProvider(BaseProvider.providerName);

  auth.setSignInFunc(function() {
    this.isNew(true); // eslint-disable-line no-invalid-this
    assert.equal(provider.isNew(), true);

    this.isNew(false); // eslint-disable-line no-invalid-this
    assert.equal(provider.isNew(), false);

    t.pass();
  });

  provider.signIn();
});

test('OAuth2BaseProvider.getProviderName', t => {
  const auth = new Auth();
  auth.registerProvider(BaseProvider, providerOptions);
  const provider = auth.getProvider(BaseProvider.providerName);

  assert.equal(provider.getProviderName(), 'undefined');
});
