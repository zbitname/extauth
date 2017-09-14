const test = require('ava');
const assert = require('assert');
const {Auth} = require('../index');
const Provider = require('./helpers/provider');
const db = require('./helpers/db');

const auth = new Auth();

auth.setSignInFunc(async function() {
  const User = db.collection('users');
  const providerName = this.getProviderName(); // eslint-disable-line no-invalid-this

  const condition = {
    provider: providerName,
    userId: await this.getUserId() // eslint-disable-line no-invalid-this
  };

  let user = User.findOne(condition);

  if (!user) {
    this.isNew(true); // eslint-disable-line no-invalid-this
    user = User.create(condition);
  } else {
    this.isNew(false); // eslint-disable-line no-invalid-this
  }

  return user;
});

const providerOptions = {
  clientId: 'test client id',
  clientSecret: 'test client secret',
  redirectUri: 'http://localhost/auth/provider/callback'
};

auth.registerProvider(Provider, providerOptions);

test('Auth.getAuthUrl', t => {
  const authUrl = auth.getAuthUrl(Provider.providerName);

  assert.equal(typeof authUrl, 'string');

  t.pass();
});

test('Auth.getSignInFunc', t => {
  const signInFnc = auth.getSignInFunc();

  assert.equal(typeof signInFnc, 'function');

  t.pass();
});

test('Auth.getProvider', t => {
  const provider = auth.getProvider(Provider.providerName);

  assert.equal(typeof provider, 'object');
  assert.equal(provider instanceof Provider, true);

  t.pass();
});
