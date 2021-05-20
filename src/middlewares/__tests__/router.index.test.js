const router = require('../router');

jest.mock('../router/utils/composeEndpoint');

describe('Router', () => {
  test('Should init router', () => {
    const sgApp = { config: { routes: ['auth', 'home', 'user'] }, router: {} };
    const { initialize } = router(sgApp);
    expect(initialize).toBeDefined();
    expect(typeof initialize).toBe('function');
  });

  test('Should call initialize', () => {
    const createEndpointComposer = require('../router/utils/composeEndpoint');
    createEndpointComposer.mockReturnValueOnce(jest.fn(() => 'router'));
    const sgApp = { config: { routes: ['auth', 'home', 'user'] }, router: {} };
    const { initialize } = router(sgApp);
    initialize();
    expect(createEndpointComposer).toHaveBeenCalled();
  });
});
