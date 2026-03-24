import { calculateBearing } from './bearing';
import { haversineDistance } from './distance';

const TURN_THRESHOLD = 22;   // degrees — minimum angle to consider a turn
const MERGE_DISTANCE = 40;   // meters — merge turns closer than this
const SMOOTH_WINDOW = 4;     // points to look ahead/behind for smoothing

const normalizeDelta = (delta) => ((delta + 540) % 360) - 180;

export const classifyTurn = (deltaDeg) => {
  const d = normalizeDelta(deltaDeg);
  if (Math.abs(d) < TURN_THRESHOLD) return null;
  if (d <= -120) return { type: 'u-turn-left',   text: 'Media vuelta' };
  if (d >= 120)  return { type: 'u-turn-right',  text: 'Media vuelta' };
  if (d <= -60)  return { type: 'sharp-left',    text: 'Giro brusco a la izquierda' };
  if (d >= 60)   return { type: 'sharp-right',   text: 'Giro brusco a la derecha' };
  if (d <= -30)  return { type: 'left',          text: 'Gira a la izquierda' };
  if (d >= 30)   return { type: 'right',         text: 'Gira a la derecha' };
  if (d < 0)     return { type: 'slight-left',   text: 'Mantén la izquierda' };
  return             { type: 'slight-right',  text: 'Mantén la derecha' };
};

const smoothBearing = (coords, center, window) => {
  const fromIdx = Math.max(0, center - window);
  const toIdx   = Math.min(coords.length - 1, center + window);
  const [lonF, latF] = coords[fromIdx];
  const [lonT, latT] = coords[toIdx];
  return calculateBearing([latF, lonF], [latT, lonT]);
};

export const extractTurnWaypoints = (coordinates) => {
  if (coordinates.length < SMOOTH_WINDOW * 2 + 2) return [];

  const raw = [];

  for (let i = SMOOTH_WINDOW; i < coordinates.length - SMOOTH_WINDOW; i++) {
    const bearingBefore = smoothBearing(coordinates, i - 1, SMOOTH_WINDOW);
    const bearingAfter  = smoothBearing(coordinates, i + 1, SMOOTH_WINDOW);
    const delta = bearingAfter - bearingBefore;
    const classification = classifyTurn(delta);
    if (!classification) continue;

    const [lon, lat] = coordinates[i];
    raw.push({ index: i, lat, lon, delta: normalizeDelta(delta), ...classification });
  }

  // Merge turns closer than MERGE_DISTANCE — keep the strongest
  const merged = [];
  for (const turn of raw) {
    const last = merged[merged.length - 1];
    if (last && haversineDistance(last.lat, last.lon, turn.lat, turn.lon) < MERGE_DISTANCE) {
      if (Math.abs(turn.delta) > Math.abs(last.delta)) {
        merged[merged.length - 1] = turn;
      }
    } else {
      merged.push(turn);
    }
  }

  return merged;
};
