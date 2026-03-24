import { haversineDistance } from '../utils/distance';

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
