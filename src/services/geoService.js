export const watchPosition = (callback) => {
  return navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, altitude } = pos.coords;
      callback([latitude, longitude], altitude);
    },
    (err) => console.error(err),
    { enableHighAccuracy: true }
  );
};
