const checkDuplicatedTableNames = require('./check-duplicated-table-names');
const checkReservedNames = require('./check-reserved-names');

const validateModelSchemas = ({ sgApp, manager }) => {
  checkDuplicatedTableNames({ sgApp, manager });
  checkReservedNames({ sgApp, manager });
};

module.exports = {
  validateModelSchemas,
};
