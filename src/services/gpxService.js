import L from 'leaflet';

export const loadGPX = (map, file, onLoaded) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const gpxContent = e.target.result;
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
    
    const trkpts = xmlDoc.querySelectorAll('trkpt');
    
    const coordinates = [];
    trkpts.forEach(point => {
      const lat = parseFloat(point.getAttribute('lat'));
      const lon = parseFloat(point.getAttribute('lon'));
      coordinates.push([lon, lat]);
    });
    
    const latlngs = coordinates.map(([lon, lat]) => [lat, lon]);
    const polyline = L.polyline(latlngs, { color: 'blue', weight: 3 }).addTo(map);
    map.fitBounds(polyline.getBounds());
    
    if (onLoaded) onLoaded(coordinates);
  };

  reader.readAsText(file);
};
