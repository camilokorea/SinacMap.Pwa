import { GeolocationService } from './geolocation';

describe('GeolocationService.getPermissionState (issue #41)', () => {
  let service: GeolocationService;
  const original = navigator.permissions;

  beforeEach(() => {
    service = new GeolocationService();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'permissions', { value: original, configurable: true });
  });

  const stubPermissions = (query: unknown) => {
    Object.defineProperty(navigator, 'permissions', { value: query ? { query } : undefined, configurable: true });
  };

  it('returns the browser-reported state when the Permissions API is available', async () => {
    stubPermissions(() => Promise.resolve({ state: 'denied' } as PermissionStatus));
    expect(await service.getPermissionState()).toBe('denied');
  });

  it('returns "unsupported" when the Permissions API is missing', async () => {
    stubPermissions(undefined);
    expect(await service.getPermissionState()).toBe('unsupported');
  });

  it('returns "unsupported" when the query throws (e.g. geolocation name unknown)', async () => {
    stubPermissions(() => Promise.reject(new Error('TypeError')));
    expect(await service.getPermissionState()).toBe('unsupported');
  });
});
