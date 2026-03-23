export const createRoute = (coordinates) => ({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates,
  },
});
