const createSingleTypeController = (options) => options;
const createCollectionTypeController = (options) => options;
module.exports = ({ service, model }) => {
  if (model.kind === 'singleType') {
    return createSingleTypeController({ model, service });
  }

  return createCollectionTypeController({ model, service });
};
