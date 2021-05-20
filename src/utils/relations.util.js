const { prop } = require('lodash/fp');

const MANY_RELATIONS = ['oneToMany', 'manyToMany', 'manyWay'];
const RF_RELATIONS = ['oneToMany', 'manyToMany', 'manyWay', 'manyToOne', 'oneWay', 'oneToOne'];

const getRelationalFields = (modelDef) => modelDef.associations.filter((a) => RF_RELATIONS.includes(a.nature)).map(prop('alias'));

module.exports = {
  getRelationalFields,
  constants: {
    MANY_RELATIONS,
  },
};
