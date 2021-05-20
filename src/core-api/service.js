const createSingleTypeService = (options) => options;
const createCollectionTypeService = (options) => options;
/**
 * default service
 *
 */
const createCoreService = ({ model, sgApp }) => {
  const serviceFactory = model.kind === 'singleType' ? createSingleTypeService : createCollectionTypeService;

  return serviceFactory({ model, sgApp });
};

module.exports = createCoreService;
