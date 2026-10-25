import { getGeographicDistanceMeters } from '@/features/discovery/utils/getGeographicDistanceMeters';

describe('getGeographicDistanceMeters', () => {
  it('returns zero for the same point and a useful distance for moved points', () => {
    const origin = { latitude: 32.5149, longitude: -117.0382 };

    expect(getGeographicDistanceMeters(origin, origin)).toBe(0);
    expect(
      getGeographicDistanceMeters(origin, {
        latitude: 19.4326,
        longitude: -99.1332,
      }),
    ).toBeGreaterThan(1_000_000);
  });
});
