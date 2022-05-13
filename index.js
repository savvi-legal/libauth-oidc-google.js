"use strict";

//@ts-ignore
let E = require("libauth/lib/errors.js");

/**
 * @typedef GoogleOIDCOpts
 * @property {String} clientId
 * @property {String} [clientSecret]
 * @property {String} [redirectUri]
 * @property {Boolean} verify
 * @property {String|Boolean} iss
 * @property {String|Boolean} exp
 * @property {String|Boolean} azp
 * @property {String|Boolean} access_type
 * @property {Function} pluginVerify
 */

/**
 * @param {GoogleOIDCOpts} userOpts
 */
function create(userOpts) {
  let issuer =
    userOpts.issuer || userOpts.claims?.iss || "https://accounts.google.com";
  let clientId = userOpts.clientId || userOpts.claims?.client_id;

  let myOpts = {
    clientId: userOpts.clientId ?? clientId,
    clientSecret: userOpts.clientSecret,
    redirectUri: userOpts.redirectUri,
    issuer: userOpts.issuer ?? issuer,
    //
    claims: Object.assign(
      {
        iss: issuer,
        // email_verified: userOpts.email_verified ?? true,
        exp: true,
      },
      userOpts.claims || {},
    ),
    // these are easily overwritten by req.query at time of request
    authQuery: Object.assign(
      {
        client_id: userOpts.authQuery?.client_id ?? userOpts.clientId,
        scope: "email profile",
        //login_hint: req.query.login_hint,
        access_type: userOpts.access_type ?? "online",
      },
      userOpts.authQuery || {},
    ),
    /** @param {Jws} jws */
    pluginVerify: function (jws) {
      if (false === userOpts.verifyClaims) {
        return;
      }

      if (false !== userOpts.azp) {
        if (jws.claims.azp != userOpts.clientId) {
          throw E.SUSPICIOUS_TOKEN();
        }
      }
    },
    verifyClaims: userOpts.verifyClaims ?? true,
  };

  return myOpts;
}

create.create = create;
module.exports = create;
