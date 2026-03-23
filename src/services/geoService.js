export const watchPosition = (callback) => {
  return navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      callback([latitude, longitude]);
    },
    (err) => console.error(err),
    { enableHighAccuracy: true }
  );
};
