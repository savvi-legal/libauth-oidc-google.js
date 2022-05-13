# @libauth/oidc-google

OIDC for Google Sign In for LibAuth.js

Specifically, this is for <https://accounts.google.com>

| Issuer        | <https://accounts.google.com/>                                 |
| :------------ | :------------------------------------------------------------- |
| Discovery URI | <https://accounts.google.com/.well-known/openid-configuration> |
| JWKs URI      | <https://www.googleapis.com/oauth2/v3/certs>                   |

See also: <https://therootcompany.com/blog/google-sign-in-javascript-api/>

## Install

```bash
npm install --save libauth @libauth/oidc-google
```

## Usage

You must first create a set of credentials with an approved `redirect_uri` in
the Google Cloud Dashboard:

- <https://console.developers.google.com/apis/dashboard>

### Protecting your Google Credentials

Don't commit your Google Sign In credentials to code.

Rather use a `.env` for local development and servers, or the _Environment
Configuration_ (or _Secrets Vault_) of your CI/CD service.

`.env`:

```bash
# Found at https://console.developers.google.com/apis/dashboard
GOOGLE_CLIENT_ID='00...00-XX...XX.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET='XXXXXXXXXXXXXXXXXXXXXXXX'
```

```js
require("dotenv").config({ path: ".env" });
```

### HTTP / Express Boilerplate

The goal of LibAuth is to minimize _magic_ (anything difficult to understand or
configure), and _maximize control_, without sacrificing _ease-of-use_ or
convenience.

To do this we require more copy-and-paste boilerplate than other auth
libraries - with the upside is that it's all just normal, easy-to-replace
_middleware_ - hopefully nothing unexpected or constraining.

```js
// GOOGLE SIGN IN

let googleOidc = libauth.oidc(
  require("@libauth/oidc-google")({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: "/api/session/oidc/accounts.google.com/code",
  }),
);

//
// For 'Authorization Code' (Server-Side Redirects) Flow
// (requires `clientId` and `clientSecret`)
//
app.get(
  "/api/session/oidc/accounts.google.com/auth",
  googleOidc.setAuthUrl,
  googleOidc.redirectToAuthUrl,
);
app.get(
  "/api/session/oidc/accounts.google.com/code",
  googleOidc.exchangeCode,
  googleOidc.verifyToken,
  MyDB.getUserClaimsByOidc,
  libauth.setCookie,
  libauth.setCookieHeader,
  libauth.setTokens,
  libauth.redirect("/my-account"),
);

//
// For 'Implicit Grant' (Client-Side) Flow
// (requires `clientId` only)
//
app.post(
  "/api/session/oidc/accounts.google.com/token",
  googleOidc.verifyToken,
  MyDB.getUserClaimsByOidc,
  libauth.setCookie,
  libauth.setCookieHeader,
  libauth.setTokens,
  libauth.sendTokens,
);
```

### User Middleware

The things that LibAuth **can't** do for you:

1. Get your user from your database
2. Decide what details about the user (_claims_) to include in the token

_Claims_ is a standard term meaning the standard (or private or custom)
properties of a token, which describe the user.

The list of Standard OIDC Claims for ID Tokens:
<https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims>

```js
MyDB.getUserByGoogleOidc = async function getUserByGoogleOidc(req, res, next) {
  // get a new session
  let user = await DB.get({ ppid: req.authn.ppid });

  // "claims" is the standard term for "user info",
  // and includes pre-defined values such as:
  let claims = {
    sub: user.id,
    given_name: user.first_name,
    family_name: user.first_name,
    picture: user.photo_url,
    email: user.email,
    email_verified: user.email_verified_at || false,
    zoneinfo: user.timezoneName,
    locale: user.localeName,
  };

  libauth.set(req, { idClaims: claims });
};
```

## Developing

Rather than a _monorepo_, we've chosen the _git submodule_ approach (to keep
`git tag`s distinct, etc).

```bash
git clone https://github.com/therootcompany/libauth.js
```

```bash
pushd ./libauth.js/
git submodule init
git submodule update
```

```bash
pushd ./plugins/oidc-google/
git checkout main
```
