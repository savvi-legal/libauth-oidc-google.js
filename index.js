"use strict";

//@ts-ignore
//let E = require("libauth/lib/errors.js");
let E = require("../../lib/errors.js");

/**
 * @typedef GoogleOIDCOpts
 * @property {String|Boolean} issuer
 * @property {String} clientId
 * @property {String} [clientSecret]
 * @property {String} [redirectUri]
 * @property {Object} [claims]
 * @property {String|Boolean} claims.iss
 * @property {String|Boolean} claims.exp
 * @property {String|Boolean} claims.azp
 * @property {Object} [authQuery]
 * @property {String|Boolean} [authQuery.client_id]
 * @property {String|Boolean} [authQuery.scope]
 * @property {String|Boolean} [authQuery.access_type]
 * @property {Function} pluginVerify
 * @property {Boolean} verifyClaims
 */

/**
 * @param {GoogleOIDCOpts} userOpts
 */
function create(userOpts) {
  let issuer =
    userOpts.issuer || userOpts.claims?.iss || "https://accounts.google.com";
  let clientId = userOpts.clientId || userOpts.authQuery?.client_id;

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
        client_id: clientId,
        scope: "email profile",
        access_type: "online",
        //login_hint: req.query.login_hint,
      },
      userOpts.authQuery || {},
    ),
    /** @param {Jws} jws */
    pluginVerify: function (jws) {
      if (false === userOpts.verifyClaims) {
        return;
      }

      if (false !== userOpts.claims?.azp) {
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
