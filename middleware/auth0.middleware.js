const { auth } = require("express-oauth2-jwt-bearer");
const dotenv = require("dotenv");

dotenv.config();

const validateAuth0AccessToken = auth({
  issuerBaseURL: `${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: process.env.AUTH0_TOKENSIGNINGALG
});

module.exports = {
  validateAuth0AccessToken
};


