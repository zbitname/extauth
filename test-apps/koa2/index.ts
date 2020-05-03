import * as Koa from 'koa';
import * as route from 'koa-route';
import {Auth} from '../..';
import {VkAuthProvider} from '../../src/providers/vk';
import {GoogleAuthProvider} from '../../src/providers/google';
import {TwitchAuthProvider} from '../../src/providers/twitch';
import * as db from '../../tests/helpers/db';
import * as config from '../config';

const app = new Koa();
const auth = new Auth();

// describe common sign in method
auth.setSignInFunc(async function() {
  const User = db.collection('users');
  const providerName = this.getProviderName();

  const condition = {
    provider: providerName,
    userId: await this.getUserId()
  };

  let user = User.findOne(condition);

  if (!user) {
    this.isNew(true);

    const name = await this.getUserName();

    user = User.create({name, ...condition});
  } else {
    this.isNew(false);
  }

  return user;
});

// register providers
auth.registerProvider(VkAuthProvider, config.vk);
auth.registerProvider(GoogleAuthProvider, config.google);
auth.registerProvider(TwitchAuthProvider, config.twitch);

// responses
// methods for redirect to auth page
const handleAuthorize = (providerName: string) => {
  return async (ctx: any) => {
    const url = auth.getAuthUrl(providerName);

    ctx.res.writeHead(302, {
      Location: url
    });
  };
};

app.use(route.get('/auth/vk', handleAuthorize('vk')));
app.use(route.get('/auth/google', handleAuthorize('google')));
app.use(route.get('/auth/twitch', handleAuthorize('twitch')));

// methods for callback with code
const handleCallback = (providerName: string) => {
  return async (ctx: any) => {
    const provider = auth.getProvider(providerName);

    try {
      await provider.exchangeCodeToAccessToken(ctx.request.query.code);
    } catch (e) {
      // eslint-disable-next-line require-atomic-updates
      ctx.body = {error: e};
      return;
    }

    const user = await provider.signIn();

    // eslint-disable-next-line require-atomic-updates
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
app.use(route.get('/auth/twitch/callback', handleCallback('twitch')));

app.listen(3000);
