export function getCircularGestureDeltaDegrees(
  previousAngleDegrees: number,
  currentAngleDegrees: number,
) {
  'worklet';

  const rawDelta = currentAngleDegrees - previousAngleDegrees;

  if (rawDelta > 180) {
    return rawDelta - 360;
  }

  if (rawDelta < -180) {
    return rawDelta + 360;
  }

  return rawDelta;
}
