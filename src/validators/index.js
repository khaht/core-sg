const Validator = require('fastest-validator');

const v = new Validator({
  useNewCustomCheckerFunction: true,
  messages: {
    atLeastLowercase: '{field} must contain at least one lowercase character',
    atLeastUppercase: '{field} must contain at least one uppercase character',
    atLeastOneNumber: '{field} must contain at least one number',
    atLeastOneSpecialCharacter:
      "{field} must contain at least one special character such as ! @ # $ % ^ & * ( ) _ + - = [ ] { } | '",
    mustNotAccept:
      '{field} must not accept emojis, JA/CH characters, space, the tab',
  },
});

module.exports = v;
