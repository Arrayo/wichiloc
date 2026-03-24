const SUBDOMAINS = ['a', 'b', 'c'];
const ZOOM_LEVELS = [13, 14, 15, 16];
const MAX_PRECACHE_TILES = 300;

const lngToTileX = (lng, zoom) =>
  Math.floor((lng + 180) / 360 * Math.pow(2, zoom));

const latToTileY = (lat, zoom) => {
  const latRad = lat * Math.PI / 180;
  return Math.floor(
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
};

export const precacheRouteTiles = (coordinates) => {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;

  // coordinates are [lon, lat] pairs
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const tileUrls = [];

  outer: for (const zoom of ZOOM_LEVELS) {
    const xMin = lngToTileX(minLng, zoom);
    const xMax = lngToTileX(maxLng, zoom);
    const yMin = latToTileY(maxLat, zoom); // Y is inverted (north = lower Y)
    const yMax = latToTileY(minLat, zoom);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const subdomain = SUBDOMAINS[(x + y) % SUBDOMAINS.length];
        tileUrls.push(`https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`);
        if (tileUrls.length >= MAX_PRECACHE_TILES) break outer;
      }
    }
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'PRECACHE_TILES',
    urls: tileUrls,
  });
};
