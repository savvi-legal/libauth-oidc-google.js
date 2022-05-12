"use strict";

//@ts-ignore
let E = require("libauth/lib/errors.js");

/**
 * @typedef GoogleOIDCOpts
 * @property {String} clientId
 * @property {String} [secretId]
 * @property {Boolean} verify
 * @property {String|Boolean} iss
 * @property {String|Boolean} exp
 * @property {String|Boolean} azp
 * @property {Function} pluginVerify
 */

/**
 * @param {GoogleOIDCOpts} userOpts
 */
function create(userOpts) {
  let myOpts = {
    iss: userOpts.iss ?? "https://accounts.google.com",
    exp: userOpts.exp ?? true,
    claims: {
      // email_verified: userOpts.email_verified ?? true,
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
