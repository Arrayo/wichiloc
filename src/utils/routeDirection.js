import { calculateBearing } from './bearing';

export const detectReverseDirection = (currentPos, nearestPoint, coordinates) => {
  let nearestIndex = 0;
  let minDistance = Infinity;
  
  coordinates.forEach((coord, index) => {
    const [lon, lat] = coord;
    const distance = Math.sqrt(
      Math.pow(currentPos[0] - lat, 2) + 
      Math.pow(currentPos[1] - lon, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  
  if (nearestIndex < 2 || nearestIndex > coordinates.length - 3) {
    return null;
  }
  
  const nextPoint = coordinates[nearestIndex + 1];
  const prevPoint = coordinates[nearestIndex - 1];
  
  const bearingToNext = calculateBearing(
    [nearestPoint[0], nearestPoint[1]], 
    [nextPoint[1], nextPoint[0]]
  );
  
  const bearingToPrev = calculateBearing(
    [nearestPoint[0], nearestPoint[1]], 
    [prevPoint[1], prevPoint[0]]
  );
  
  const currentBearing = calculateBearing(currentPos, nearestPoint);
  
  const diffToNext = Math.abs(((bearingToNext - currentBearing + 180) % 360) - 180);
  const diffToPrev = Math.abs(((bearingToPrev - currentBearing + 180) % 360) - 180);
  
  return diffToPrev < diffToNext;
};
