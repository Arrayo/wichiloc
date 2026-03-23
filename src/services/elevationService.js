export const parseElevationFromGPX = (gpxContent) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
  
  const trkpts = xmlDoc.querySelectorAll('trkpt');
  const elevationData = [];
  let cumulativeDistance = 0;

  trkpts.forEach((point, index) => {
    const lat = parseFloat(point.getAttribute('lat'));
    const lon = parseFloat(point.getAttribute('lon'));
    const eleNode = point.querySelector('ele');
    const elevation = eleNode ? parseFloat(eleNode.textContent) : 0;

    if (index > 0) {
      const prevPoint = elevationData[index - 1];
      const distance = calculateDistance(
        prevPoint.lat, prevPoint.lon,
        lat, lon
      );
      cumulativeDistance += distance;
    }

    elevationData.push({
      lat,
      lon,
      elevation,
      distance: cumulativeDistance,
    });
  });

  return elevationData;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getElevationStats = (elevationData) => {
  if (elevationData.length === 0) return null;

  let totalAscent = 0;
  let totalDescent = 0;
  let maxElevation = elevationData[0].elevation;
  let minElevation = elevationData[0].elevation;

  for (let i = 1; i < elevationData.length; i++) {
    const diff = elevationData[i].elevation - elevationData[i - 1].elevation;
    
    if (diff > 0) totalAscent += diff;
    if (diff < 0) totalDescent += Math.abs(diff);
    
    maxElevation = Math.max(maxElevation, elevationData[i].elevation);
    minElevation = Math.min(minElevation, elevationData[i].elevation);
  }

  const totalDistance = elevationData[elevationData.length - 1].distance;

  return {
    totalDistance: (totalDistance / 1000).toFixed(2),
    totalAscent: Math.round(totalAscent),
    totalDescent: Math.round(totalDescent),
    maxElevation: Math.round(maxElevation),
    minElevation: Math.round(minElevation),
  };
};
