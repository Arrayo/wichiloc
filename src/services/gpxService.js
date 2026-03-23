import 'leaflet-gpx';
import L from 'leaflet';

export const loadGPX = (map, file, onLoaded) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const gpx = new L.GPX(e.target.result, { async: true });

    gpx.on('loaded', (event) => {
      map.fitBounds(event.target.getBounds());
      
      const coordinates = [];
      event.target.getLayers().forEach(layer => {
        if (layer.getLatLngs) {
          const latlngs = layer.getLatLngs();
          latlngs.forEach(point => {
            coordinates.push([point.lng, point.lat]);
          });
        }
      });

      if (onLoaded) onLoaded(coordinates);
    });

    gpx.addTo(map);
  };

  reader.readAsText(file);
};
