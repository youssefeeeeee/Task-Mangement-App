import api from './api';

describe('API Configuration', () => {
  beforeEach(() => {
    let store = {};

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: jest.fn((k) => (k in store ? store[k] : null)),
      setItem: jest.fn((k, v) => { store[k] = String(v); }),
      removeItem: jest.fn((k) => { delete store[k]; }),
      clear: jest.fn(() => { store = {}; }),
    },
  });
    jest.clearAllMocks();
  });

  test('should have correct base URL', () => {
    expect(api.defaults.baseURL).toBe(process.env.NEXT_PUBLIC_API_URL);
  });

  test('should add Authorization header when token exists', async () => {
    const token = 'test-token';
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn(() => token) },
      writable: true,
    });

    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBe(`Bearer ${token}`);
  });

  test('should not add Authorization header when token is missing', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: jest.fn(() => null) },
      writable: true,
    });

    const config = await api.interceptors.request.handlers[0].fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
