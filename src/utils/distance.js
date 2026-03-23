import * as turf from '@turf/turf';

export const distanceToRoute = (point, line) => {
  return turf.pointToLineDistance(point, line, { units: 'meters' });
};
