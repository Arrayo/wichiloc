const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const parseGPX = (gpxContent) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
  const trkpts = xmlDoc.querySelectorAll('trkpt');

  const coordinates = [];
  const elevationData = [];
  let cumulativeDistance = 0;

  trkpts.forEach((point, index) => {
    const lat = parseFloat(point.getAttribute('lat'));
    const lon = parseFloat(point.getAttribute('lon'));
    const eleNode = point.querySelector('ele');
    const elevation = eleNode ? parseFloat(eleNode.textContent) : 0;

    coordinates.push([lon, lat]);

    if (index > 0) {
      const prev = elevationData[index - 1];
      cumulativeDistance += haversineDistance(prev.lat, prev.lon, lat, lon);
    }

    elevationData.push({ lat, lon, elevation, distance: cumulativeDistance });
  });

  return { coordinates, elevationData };
};
