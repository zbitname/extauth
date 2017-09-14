const Koa = require('koa');
const app = new Koa();
const route = require('koa-route');
const {Auth} = require('../../');
const VkAuthProvider = require('../../providers/vk');
const GoogleAuthProvider = require('../../providers/google');
const db = require('../../tests/helpers/db');
const config = require('../config.json');

const auth = new Auth();
// describe common sign in method
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

// register providers
auth.registerProvider(VkAuthProvider, config.vk);
auth.registerProvider(GoogleAuthProvider, config.google);

// responses
// methods for redirect to auth page
const handleAuthorize = providerName => {
  return async ctx => {
    const url = auth.getAuthUrl(providerName);

    ctx.res.writeHead(302, {
      Location: url
    });
  };
};

app.use(route.get('/auth/vk', handleAuthorize('vk')));
app.use(route.get('/auth/google', handleAuthorize('google')));

// methods for callback with code
const handleCallback = providerName => {
  return async ctx => {
    const provider = auth.getProvider(providerName);

    try {
      await provider.exchangeCodeToAccessToken(ctx.request.query.code);
    } catch (e) {
      ctx.body = {error: e};
      return;
    }

    const user = await provider.signIn();

    ctx.body = {
      provider: provider.getProviderName(),
      userId: await provider.getUserId(),
      isNew: provider.isNew(),
      signedUser: user
    };
  };
};

app.use(route.get('/auth/vk/callback', handleCallback('vk')));
app.use(route.get('/auth/google/callback', handleCallback('google')));

app.listen(3000);
