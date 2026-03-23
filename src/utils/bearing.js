export const calculateBearing = (from, to) => {
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  
  return bearing;
};

const WINDOW_SIZE = 25;

export const findNearestPointOnRoute = (currentPos, coordinates, startIndex = 0) => {
  let minDistance = Infinity;
  let nearestPoint = coordinates[0];
  let nearestIndex = 0;

  // Primera llamada (startIndex === 0): búsqueda global para ubicar al usuario
  // dondequiera que esté en la ruta. Después: ventana local para eficiencia.
  const isFirstSearch = startIndex === 0;
  const searchStart = isFirstSearch ? 0 : Math.max(0, startIndex - 5);
  const searchEnd = isFirstSearch
    ? coordinates.length - 1
    : Math.min(coordinates.length - 1, startIndex + WINDOW_SIZE);

  for (let i = searchStart; i <= searchEnd; i++) {
    const [lon, lat] = coordinates[i];
    const distance = Math.sqrt(
      Math.pow(currentPos[0] - lat, 2) +
      Math.pow(currentPos[1] - lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = [lat, lon];
      nearestIndex = i;
    }
  }

  return { point: nearestPoint, index: nearestIndex };
};
