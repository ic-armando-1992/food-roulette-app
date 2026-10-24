import { getCircularGestureDeltaDegrees } from '@/features/discovery/utils/getCircularGestureDeltaDegrees';

describe('getCircularGestureDeltaDegrees', () => {
  it('keeps clockwise movement continuous across the 180-degree boundary', () => {
    expect(getCircularGestureDeltaDegrees(175, -175)).toBe(10);
  });

  it('keeps counterclockwise movement continuous across the boundary', () => {
    expect(getCircularGestureDeltaDegrees(-175, 175)).toBe(-10);
  });

  it('returns ordinary angular movement unchanged', () => {
    expect(getCircularGestureDeltaDegrees(20, 65)).toBe(45);
  });
});
