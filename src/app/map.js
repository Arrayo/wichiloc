import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const createMap = (containerId) => {
  const map = L.map(containerId).setView([37.9922, -1.1307], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  return map;
};
