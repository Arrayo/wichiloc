import { useRef, useState } from 'preact/hooks';
import { haversineDistance } from '../utils/distance';

const ANNOUNCE_FAR  = 80;  // meters — first announcement
const ANNOUNCE_NEAR = 25;  // meters — second (action) announcement
const PASSED_DIST   = 15;  // meters — consider waypoint passed

const speak = (text) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
};

export const useTurnByTurn = () => {
  const waypointsRef    = useRef([]);
  const nextIdxRef      = useRef(0);
  const [nextTurn, setNextTurn] = useState(null);

  const setWaypoints = (waypoints) => {
    waypointsRef.current = waypoints.map((w) => ({
      ...w,
      announcedFar:  false,
      announcedNear: false,
    }));
    nextIdxRef.current = 0;
    setNextTurn(waypoints[0] ? { ...waypoints[0], distance: null } : null);
  };

  const updatePosition = (lat, lng) => {
    const waypoints = waypointsRef.current;
    let idx = nextIdxRef.current;
    if (idx >= waypoints.length) { setNextTurn(null); return; }

    const wp = waypoints[idx];
    const dist = haversineDistance(lat, lng, wp.lat, wp.lon);

    setNextTurn({ ...wp, distance: Math.round(dist) });

    if (dist < ANNOUNCE_FAR && !wp.announcedFar) {
      wp.announcedFar = true;
      speak(`En ${ANNOUNCE_FAR} metros, ${wp.text}`);
    }

    if (dist < ANNOUNCE_NEAR && !wp.announcedNear) {
      wp.announcedNear = true;
      speak(wp.text);
    }

    if (dist < PASSED_DIST) {
      nextIdxRef.current = idx + 1;
      const next = waypoints[idx + 1];
      setNextTurn(next ? { ...next, distance: null } : null);
    }
  };

  const reset = () => {
    waypointsRef.current = [];
    nextIdxRef.current = 0;
    setNextTurn(null);
  };

  return { setWaypoints, updatePosition, nextTurn, reset };
};
