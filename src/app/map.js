import L from 'leaflet';

export const createMap = (containerId) => {
  const map = L.map(containerId).setView([37.9922, -1.1307], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  return map;
};
