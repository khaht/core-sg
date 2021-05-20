const TokenGenerator = require('uuid-token-generator');

const tokgen = new TokenGenerator(256, TokenGenerator.BASE62);

/**
 * Generate token/keys
 * We use it to generate APIKEY to users
 */
module.exports = () => tokgen.generate();
