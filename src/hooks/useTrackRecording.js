import { useState, useRef } from 'preact/hooks';
import { saveRoute } from '../services/storageService';

const generateGPX = (trackPoints, trackName) => {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Tracker" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${trackName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${trackName}</name>
    <trkseg>`;

  const gpxPoints = trackPoints.map(point =>
    `      <trkpt lat="${point.lat}" lon="${point.lng}">
        ${point.altitude !== null ? `<ele>${point.altitude}</ele>` : ''}
        <time>${point.timestamp}</time>
      </trkpt>`
  ).join('\n');

  const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`;

  return gpxHeader + '\n' + gpxPoints + gpxFooter;
};

const downloadGPX = (gpxContent, fileName) => {
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const useTrackRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pointCount, setPointCount] = useState(0);
  const [showSaveTrackDialog, setShowSaveTrackDialog] = useState(false);
  const isRecordingRef = useRef(false);
  const trackPointsRef = useRef([]);
  const pointCountRef = useRef(0);

  const startRecording = () => {
    trackPointsRef.current = [];
    pointCountRef.current = 0;
    isRecordingRef.current = true;
    setIsRecording(true);
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setPointCount(pointCountRef.current);
    setShowSaveTrackDialog(true);
  };

  const addTrackPoint = (lat, lng, altitude) => {
    if (!isRecordingRef.current) return;
    trackPointsRef.current.push({
      lat,
      lng,
      altitude: altitude ?? null,
      timestamp: new Date().toISOString(),
    });
    pointCountRef.current = trackPointsRef.current.length;
  };

  const saveTrack = async (trackName) => {
    const points = trackPointsRef.current;
    const gpxContent = generateGPX(points, trackName);
    const coordinates = points.map(p => [p.lng, p.lat]);

    await saveRoute(trackName, coordinates, gpxContent);
    downloadGPX(gpxContent, trackName);

    trackPointsRef.current = [];
    pointCountRef.current = 0;
    isRecordingRef.current = false;
    setIsRecording(false);
    setPointCount(0);
    setShowSaveTrackDialog(false);
  };

  const discardTrack = () => {
    trackPointsRef.current = [];
    pointCountRef.current = 0;
    isRecordingRef.current = false;
    setIsRecording(false);
    setPointCount(0);
    setShowSaveTrackDialog(false);
  };

  return {
    isRecording,
    isRecordingRef,
    pointCount,
    pointCountRef,
    showSaveTrackDialog,
    startRecording,
    stopRecording,
    addTrackPoint,
    saveTrack,
    discardTrack,
  };
};
