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
  let myOpts = {
    clientId: userOpts.clientId,
    clientSecret: userOpts.clientSecret,
    redirectUri: userOpts.redirectUri,
    //
    iss: userOpts.iss ?? "https://accounts.google.com",
    exp: userOpts.exp ?? true,
    claims: {
      // email_verified: userOpts.email_verified ?? true,
    },
    // these are easily overwritten by req.query at time of request
    authorizationQuery: {
      client_id: userOpts.clientId,
      scope: "email profile",
      //login_hint: req.query.login_hint,
      access_type: userOpts.access_type ?? "online",
    },
    /** @param {Jws} jws */
    pluginVerify: function (jws) {
      if (false === userOpts.verify) {
        return;
      }

      if (false !== userOpts.azp) {
        if (jws.claims.azp != userOpts.clientId) {
          throw E.SUSPICIOUS_TOKEN();
        }
      }
    },
  };

  return myOpts;
}

create.create = create;
module.exports = create;
