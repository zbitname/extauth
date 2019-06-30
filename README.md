# NOT FOR PRODUCTION (not yet now)
[![Build Status](https://travis-ci.com/zbitname/extauth.svg?branch=master)](https://travis-ci.com/zbitname/extauth)

# About
This module is simpliest alternative for authorize by external providers.

# Support auth providers
- vk.com
- google.com
- twitch.tv

# TODO
- Supports redirects on success login and on fail login
- Implement providers for facebook or any other provider supports OAuth2
- Maybe implement local provider (auth by login and password)

# USE
See examples from `test` apps for chosen by you or similar framework.

# TEST
## How to test
### Test app examples
```bash
# FRAMEWORK_NAME = any (koa2)
cd test-apps/${FRAMEWORK_NAME}
npm start
```
and go to page `http://localhost:3000/auth/${providerName}`
where providerName = any (vk, google, twitch)

### Automated tests
```bash
npm run ava
```

### Code coverage
```bash
npm run coverage
```

## Implemented tests with frameworks
- Koa2
