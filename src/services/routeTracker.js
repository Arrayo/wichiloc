import { distanceToRoute } from '../utils/distance';
import { createRoute } from '../domain/route';

const ALERT_THRESHOLD = 500;
const WARNING_THRESHOLD = 250;

export const createRouteTracker = (coordinates, onStatusChange) => {
  const route = createRoute(coordinates);
  let lastStatus = 'on-route';

  return (currentPosition) => {
    const [lat, lng] = currentPosition;
    const point = [lng, lat];
    
    const distance = distanceToRoute(point, route.geometry);
    
    let status = 'on-route';
    if (distance > ALERT_THRESHOLD) {
      status = 'off-route';
    } else if (distance > WARNING_THRESHOLD) {
      status = 'warning';
    }

    if (status !== lastStatus) {
      lastStatus = status;
      onStatusChange(status, distance);
    }

    return { status, distance };
  };
};
