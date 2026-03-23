import { distanceToRoute } from '../utils/distance';
import { createRoute } from '../domain/route';

const ALERT_THRESHOLD = 50;
const WARNING_THRESHOLD = 25;

export const createRouteTracker = (coordinates, onStatusChange) => {
  const route = createRoute(coordinates);
  let lastStatus = 'on-route';

  console.log('Route created:', route);
  console.log('Coordinates count:', coordinates.length);

  return (currentPosition) => {
    const [lat, lng] = currentPosition;
    const point = [lng, lat];
    
    console.log('Current position:', { lat, lng, point });
    
    const distance = distanceToRoute(point, route.geometry);
    
    console.log('Distance to route:', distance);
    
    if (!isFinite(distance)) {
      console.error('Invalid distance calculated:', distance);
      return { status: 'error', distance: 0 };
    }
    
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
