import { useEffect, useRef, useState } from 'preact/hooks';
import { createMap } from './app/map';
import { parseGPX } from './services/gpxService';
import { watchPosition } from './services/geoService';
import { createRouteTracker } from './services/routeTracker';
import { saveRoute } from './services/storageService';
import { getElevationStats } from './services/elevationService';
import { playOnRouteSound, playWarningSound, playOffRouteSound, playRouteCompleteSound, initAudio } from './services/audioService';
import { calculateBearing, findNearestPointOnRoute } from './utils/bearing';
import { FloatingControls } from './components/FloatingControls';
import { RouteList } from './components/RouteList';
import { ElevationProfile } from './components/ElevationProfile';
import { RouteCompleteDialog } from './components/RouteCompleteDialog';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NameRouteDialog } from './components/NameRouteDialog';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StatsButton } from './components/StatsButton';
import { EmergencyButton } from './components/EmergencyButton';
import { ImportUrlDialog } from './components/ImportUrlDialog';
import { Compass } from './components/Compass';
import { InitialLoading } from './components/InitialLoading';
import { SaveTrackDialog } from './components/SaveTrackDialog';
import { useWakeLock } from './hooks/useWakeLock';
import { useTrackRecording } from './hooks/useTrackRecording';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function App() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeTrackerRef = useRef(null);
  const gpxLayerRef = useRef(null);
  const traveledLineRef = useRef(null);
  const routeCoordinatesRef = useRef(null);
  const positionHistoryRef = useRef([]);
  const reverseDetectionRef = useRef({ detected: false });
  const routeCompleteRef = useRef(false);
  const [routeStatus, setRouteStatus] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('on-route');
  const [showRouteList, setShowRouteList] = useState(false);
  const [showElevation, setShowElevation] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showImportUrlDialog, setShowImportUrlDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Cargando...');
  const [viewingStart, setViewingStart] = useState(false);
  const [elevationData, setElevationData] = useState(null);
  const [elevationStats, setElevationStats] = useState(null);
  const [currentGpxContent, setCurrentGpxContent] = useState(null);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);
  const [currentAltitude, setCurrentAltitude] = useState(null);
  const [elevationGain, setElevationGain] = useState(0);
  const {
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
  } = useTrackRecording();

  useWakeLock(!!trackingStartTime);

  useEffect(() => { currentStatusRef.current = currentStatus; }, [currentStatus]);
  const lastPositionRef = useRef(null);
  const lastAltitudeRef = useRef(null);
  const currentStatusRef = useRef('on-route');
  const nearestIndexRef = useRef(0);
  const cachedIconColorRef = useRef(null);
  const cachedIconRef = useRef(null);
  const lastSetViewRef = useRef(0);
  const autoReverseAppliedRef = useRef(false);
  const currentGpxContentRef = useRef(null);
  const elevationDataRef = useRef(null);

  useEffect(() => {
    currentGpxContentRef.current = currentGpxContent;
  }, [currentGpxContent]);

  useEffect(() => {
    elevationDataRef.current = elevationData;
  }, [elevationData]);

  useEffect(() => {
    mapRef.current = createMap('map');
    
    const initAudioOnClick = () => {
      initAudio();
      document.removeEventListener('click', initAudioOnClick);
    };
    document.addEventListener('click', initAudioOnClick);
    let devClickCleanup = () => {};

    const updatePosition = (lat, lng, altitude = null) => {
      setCurrentPosition([lat, lng]);
      
      addTrackPoint(lat, lng, altitude);
      
      let status = 'on-route';
      let nearestIndex = nearestIndexRef.current;

      if (routeCoordinatesRef.current) {
        const result = findNearestPointOnRoute([lat, lng], routeCoordinatesRef.current, nearestIndexRef.current);
        nearestIndex = result.index;
        nearestIndexRef.current = nearestIndex;

        if (traveledLineRef.current && nearestIndex > 0) {
          const traveled = routeCoordinatesRef.current
            .slice(0, nearestIndex + 1)
            .map(([lon, latc]) => [latc, lon]);
          traveledLineRef.current.setLatLngs(traveled);
        }
      }

      if (routeTrackerRef.current) {
        const statusResult = routeTrackerRef.current([lat, lng]);
        const previousStatus = currentStatusRef.current;
        setRouteStatus(statusResult);
        status = statusResult.status;
        setCurrentStatus(status);
        
        if (status !== previousStatus) {
          if (status === 'on-route') {
            playOnRouteSound();
            navigator.vibrate?.([50]);
          } else if (status === 'warning') {
            playWarningSound();
            navigator.vibrate?.([100, 50, 100]);
          } else if (status === 'off-route') {
            playOffRouteSound();
            navigator.vibrate?.([200, 100, 200]);
          }
        }
        
        if ((status === 'on-route' || status === 'warning') && routeCoordinatesRef.current) {
          
          positionHistoryRef.current.push({ lat, lng, index: nearestIndex });
          if (positionHistoryRef.current.length > 4) {
            positionHistoryRef.current.shift();
          }
          
          if (positionHistoryRef.current.length >= 4 && !autoReverseAppliedRef.current) {
            const history = positionHistoryRef.current;
            let reverseCount = 0;
            
            for (let i = 1; i < history.length; i++) {
              if (history[i].index < history[i - 1].index) {
                reverseCount++;
              }
            }
            
            const firstIndex = history[0].index;
            const lastObservedIndex = history[history.length - 1].index;
            const routeLastIndex = routeCoordinatesRef.current.length - 1;
            const startedNearEnd = firstIndex >= routeLastIndex * 0.7;
            const meaningfulBackwardProgress = firstIndex - lastObservedIndex >= 3;

            if (reverseCount >= 3 && startedNearEnd && meaningfulBackwardProgress) {
              autoReverseAppliedRef.current = true;
              reverseDetectionRef.current.detected = true;
              const reversedCoords = [...routeCoordinatesRef.current].reverse();
              const reversedElevationData = reverseElevationData(elevationDataRef.current);
              loadRouteOnMap(reversedCoords, currentGpxContentRef.current, true, reversedElevationData);
              return;
            }
          }
          
          if (!routeCompleteRef.current && positionHistoryRef.current.length >= 3) {
            const lastIndex = routeCoordinatesRef.current.length - 1;
            const [lonEnd, latEnd] = routeCoordinatesRef.current[lastIndex];
            const distanceToEnd = Math.sqrt(
              Math.pow(lat - latEnd, 2) + 
              Math.pow(lng - lonEnd, 2)
            );
            
            const maxIndexVisited = Math.max(...positionHistoryRef.current.map(p => p.index));
            const routeCoverage = maxIndexVisited;
            
            const isNearFinish = nearestIndex >= lastIndex - 2 || nearestIndex <= 1;
            const hasCompletedRoute = routeCoverage > lastIndex * 0.6;
            
            if (distanceToEnd < 0.0003 && isNearFinish && hasCompletedRoute) {
              routeCompleteRef.current = true;
              navigator.vibrate?.([200, 100, 200, 100, 400]);
              playRouteCompleteSound();
              setShowCompleteDialog(true);
            }
          }
        }
      }

      const getStatusColor = () => {
        switch (status) {
          case 'on-route': return '#10b981';
          case 'warning': return '#f59e0b';
          case 'off-route': return '#ef4444';
          default: return '#6b7280';
        }
      };

      const color = getStatusColor();

      if (cachedIconColorRef.current !== color) {
        cachedIconColorRef.current = color;
        cachedIconRef.current = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div style="position:relative;width:52px;height:52px;">
              <div style="
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:52px;height:52px;
                border-radius:50%;
                background:${color}30;
                animation:pulse-user 2s infinite;
              "></div>
              <img src="${import.meta.env.BASE_URL}user-marker.png"
                style="
                  position:absolute;top:50%;left:50%;
                  transform:translate(-50%,-50%);
                  width:40px;height:40px;
                  object-fit:contain;
                  filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));
                "
              />
            </div>
            <style>
              @keyframes pulse-user {
                0%   { transform:translate(-50%,-50%) scale(0.85); opacity:.9; }
                100% { transform:translate(-50%,-50%) scale(2);    opacity:0; }
              }
            </style>
          `,
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        });
      }
      const directionIcon = cachedIconRef.current;

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: directionIcon }).addTo(mapRef.current);
        mapRef.current.setView([lat, lng], 17);
        
        setHasInitialPosition(true);
        
        if (routeCoordinatesRef.current) {
          setTrackingStartTime(Date.now());
          lastPositionRef.current = [lat, lng];
        }
      } else {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setIcon(directionIcon);
        
        const now = Date.now();
        if (now - lastSetViewRef.current > 3000) {
          mapRef.current.setView([lat, lng]);
          lastSetViewRef.current = now;
        }
        
        if (lastPositionRef.current && (routeCoordinatesRef.current || isRecordingRef.current)) {
          const [lastLat, lastLng] = lastPositionRef.current;
          const distance = calculateDistance(lastLat, lastLng, lat, lng);
          setTotalDistance(prev => prev + distance);
          lastPositionRef.current = [lat, lng];
        }
      }

      function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; 
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      }
    };

    if (import.meta.env.DEV) {
      const devClickHandler = (e) => updatePosition(e.latlng.lat, e.latlng.lng);
      mapRef.current.on('click', devClickHandler);
      devClickCleanup = () => mapRef.current?.off('click', devClickHandler);
    }

    const watchId = watchPosition(([lat, lng], altitude) => {
      updatePosition(lat, lng, altitude);
      
      if (altitude !== null && altitude !== undefined) {
        setCurrentAltitude(altitude);
        
        if (isRecordingRef.current && lastAltitudeRef.current !== null && altitude > lastAltitudeRef.current) {
          const gain = altitude - lastAltitudeRef.current;
          setElevationGain(prev => prev + gain);
        }
        lastAltitudeRef.current = altitude;
      }
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      document.removeEventListener('click', initAudioOnClick);
      devClickCleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reverseElevationData = (data) => {
    if (!data || data.length === 0) return null;

    const totalDistance = data[data.length - 1].distance;

    return [...data]
      .reverse()
      .map((point) => ({
        ...point,
        distance: totalDistance - point.distance,
      }));
  };

  const loadRouteOnMap = (coordinates, gpxContent, reversed = false, elevationData = null) => {
    if (!coordinates || coordinates.length === 0) {
      alert('Error: La ruta no tiene coordenadas válidas. Carga el archivo GPX de nuevo.');
      return;
    }

    if (gpxLayerRef.current) {
      mapRef.current.removeLayer(gpxLayerRef.current);
    }
    if (traveledLineRef.current) {
      mapRef.current.removeLayer(traveledLineRef.current);
      traveledLineRef.current = null;
    }

    routeCoordinatesRef.current = coordinates;
    
    if (!reversed) {
      setCurrentGpxContent(gpxContent);
      autoReverseAppliedRef.current = false;
    }
    
    reverseDetectionRef.current = { detected: false };
    positionHistoryRef.current = [];
    routeCompleteRef.current = false;
    nearestIndexRef.current = 0;
    cachedIconColorRef.current = null;
    cachedIconRef.current = null;

    if (!reversed) {
      setTotalDistance(0);
      setElevationGain(0);
      lastAltitudeRef.current = null;

      if (markerRef.current) {
        // GPS ya activo: arrancar tracking desde la posición actual
        setTrackingStartTime(Date.now());
        lastPositionRef.current = markerRef.current.getLatLng
          ? [markerRef.current.getLatLng().lat, markerRef.current.getLatLng().lng]
          : null;
      } else {
        // GPS todavía sin fijar: updatePosition lo iniciará cuando llegue
        setTrackingStartTime(null);
        lastPositionRef.current = null;
      }
    }

    const latlngs = coordinates.map(([lon, lat]) => [lat, lon]);
    
    const lineColor = '#10b981';
    
    const whiteLine = L.polyline(latlngs, { 
      color: 'rgba(0,0,0,0.4)', 
      weight: 7, 
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current);
    
    const coloredLine = L.polyline(latlngs, { 
      color: lineColor, 
      weight: 5, 
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current);

    if (traveledLineRef.current) {
      mapRef.current.removeLayer(traveledLineRef.current);
    }
    traveledLineRef.current = L.polyline([], {
      color: 'rgba(120,120,120,0.85)',
      weight: 5,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current);
    
    const start = latlngs[0];
    const end = latlngs[latlngs.length - 1];
    const distanceStartEnd = Math.sqrt(
      Math.pow(start[0] - end[0], 2) + 
      Math.pow(start[1] - end[1], 2)
    );
    const isCircular = distanceStartEnd < 0.0001; 
    
    const markers = [];
    
    const startIcon = L.divIcon({
      className: 'route-marker',
      html: `<img src="${import.meta.env.BASE_URL}start-marker.png"
        style="width:36px;height:36px;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));"
      />`,
      iconSize: [36, 36],
      iconAnchor: [8, 36],
    });

    const endIcon = L.divIcon({
      className: 'route-marker',
      html: `<img src="${import.meta.env.BASE_URL}end-marker.png"
        style="width:36px;height:36px;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));"
      />`,
      iconSize: [36, 36],
      iconAnchor: [8, 36],
    });

    markers.push(L.marker(start, { icon: startIcon }).addTo(mapRef.current));
    const endPos = isCircular ? [end[0], end[1] + 0.00018] : end;
    markers.push(L.marker(endPos, { icon: endIcon }).addTo(mapRef.current));
    
    const arrows = [];
    const arrowInterval = Math.max(1, Math.floor(latlngs.length / 15)); 
    const skipStart = 1; 
    const skipEnd = 1; 
    
    const arrowBorderColor = '#f59e0b';
    const arrowFillColor = '#34d399';
    
    for (let i = arrowInterval + skipStart; i < latlngs.length - skipEnd; i += arrowInterval) {
      const from = latlngs[i - 1];
      const to = latlngs[i];
      const bearing = calculateBearing(from, to);
      
      const arrowIcon = L.divIcon({
        className: 'route-arrow',
        html: `
          <div style="
            transform: rotate(${bearing}deg);
            position: relative;
          ">
            <div style="
              width: 0;
              height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-bottom: 20px solid ${arrowBorderColor};
              filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
            "></div>
            <div style="
              position: absolute;
              top: 2px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 7px solid transparent;
              border-right: 7px solid transparent;
              border-bottom: 14px solid ${arrowFillColor};
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      const arrow = L.marker(to, { icon: arrowIcon }).addTo(mapRef.current);
      arrows.push(arrow);
    }
    
    gpxLayerRef.current = L.layerGroup([whiteLine, coloredLine, ...markers, ...arrows]).addTo(mapRef.current);
    mapRef.current.fitBounds(whiteLine.getBounds());

    routeTrackerRef.current = createRouteTracker(
      coordinates,
      (status) => {
        if (status === 'off-route') {
          navigator.vibrate?.(200);
        }
      }
    );

    if (elevationData) {
      setElevationData(elevationData);
      setElevationStats(getElevationStats(elevationData));
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('Importando ruta...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const gpxContent = event.target.result;
      const { coordinates, elevationData } = parseGPX(gpxContent);

      loadRouteOnMap(coordinates, gpxContent, false, elevationData);

      const defaultName = file.name
        .replace(/\.gpx$/i, '')
        .replace(/[-_]/g, ' ')
        .trim();

      setPendingRoute({ coordinates, gpxContent, defaultName });
      setIsLoading(false);
      setShowNameDialog(true);
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  const handleSaveRouteName = async (name) => {
    if (pendingRoute) {
      await saveRoute(name, pendingRoute.coordinates, pendingRoute.gpxContent);
      setPendingRoute(null);
      setShowNameDialog(false);
    }
  };

  const handleCancelRouteName = () => {
    setShowNameDialog(false);
    setPendingRoute(null);
  };

  const handleImportFromUrl = (gpxContent, defaultName) => {
    setIsLoading(true);
    setLoadingMessage('Procesando ruta...');

    const { coordinates, elevationData } = parseGPX(gpxContent);
    loadRouteOnMap(coordinates, gpxContent, false, elevationData);

    setPendingRoute({ coordinates, gpxContent, defaultName });
    setIsLoading(false);
    setShowNameDialog(true);
  };

  const handleSelectRoute = (route) => {
    setIsLoading(true);
    setLoadingMessage('Cargando ruta...');
    
    setTimeout(() => {
      const { elevationData } = route.gpxContent
        ? parseGPX(route.gpxContent)
        : { elevationData: null };

      if (!elevationData) {
        setElevationData(null);
        setElevationStats(null);
      }

      loadRouteOnMap(route.coordinates, route.gpxContent, false, elevationData);
      setIsLoading(false);
    }, 300);
  };

  const handleCenterMap = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.setView(markerRef.current.getLatLng(), 19);
    }
  };

  const handleNavigateToStart = () => {
    if (!routeCoordinatesRef.current || routeCoordinatesRef.current.length === 0) return;
    
    const [lon, lat] = routeCoordinatesRef.current[0];
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(7)},${lon.toFixed(7)}&travelmode=driving`;
    
    window.open(googleMapsUrl, '_blank');
  };

  const handleToggleStartView = () => {
    if (!routeCoordinatesRef.current || routeCoordinatesRef.current.length === 0) return;
    
    if (viewingStart) {
      if (markerRef.current) {
        mapRef.current.setView(markerRef.current.getLatLng(), 19);
      }
      setViewingStart(false);
    } else {
      const [lon, lat] = routeCoordinatesRef.current[0];
      mapRef.current.setView([lat, lon], 19);
      setViewingStart(true);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      if (pointCountRef.current > 0) {
        stopRecording();
      } else {
        discardTrack();
      }
    } else {
      startRecording();
      setTrackingStartTime(Date.now());
      setTotalDistance(0);
      setElevationGain(0);
      lastPositionRef.current = markerRef.current
        ? [markerRef.current.getLatLng().lat, markerRef.current.getLatLng().lng]
        : null;
      lastAltitudeRef.current = null;
    }
  };

  return (
    <>
      {!hasInitialPosition && <InitialLoading />}
      <div id="map" style={{ height: '100vh', width: '100vw' }} />
      <OfflineIndicator />
      {(isRecording || routeCoordinatesRef.current) && trackingStartTime && (
        <StatsButton 
          distance={totalDistance}
          startTime={trackingStartTime}
          altitude={currentAltitude}
          elevationGain={elevationGain}
          routeStatus={routeStatus}
        />
      )}
      <FloatingControls 
        onFileSelect={handleFile}
        onCenterMap={handleCenterMap}
        onShowRoutes={() => setShowRouteList(true)}
        onShowElevation={() => setShowElevation(true)}
        onNavigateToStart={handleNavigateToStart}
        onToggleStartView={handleToggleStartView}
        onImportUrl={() => setShowImportUrlDialog(true)}
        onToggleRecording={handleToggleRecording}
        hasRoute={!!elevationData}
        viewingStart={viewingStart}
        isRecording={isRecording}
        routeStatus={routeStatus}
      />
      {showRouteList && (
        <RouteList 
          onSelectRoute={handleSelectRoute}
          onClose={() => setShowRouteList(false)}
        />
      )}
      {showElevation && elevationData && (
        <ElevationProfile 
          elevationData={elevationData}
          stats={elevationStats}
          onClose={() => setShowElevation(false)}
        />
      )}
      {showCompleteDialog && (
        <RouteCompleteDialog 
          stats={elevationStats}
          onNavigate={handleNavigateToStart}
          onClose={() => setShowCompleteDialog(false)}
        />
      )}
      {showNameDialog && pendingRoute && (
        <NameRouteDialog 
          defaultName={pendingRoute.defaultName}
          onSave={handleSaveRouteName}
          onCancel={handleCancelRouteName}
        />
      )}
      {showImportUrlDialog && (
        <ImportUrlDialog 
          onImport={handleImportFromUrl}
          onClose={() => setShowImportUrlDialog(false)}
        />
      )}
      {showSaveTrackDialog && (
        <SaveTrackDialog 
          trackData={{
            distance: totalDistance,
            duration: Date.now() - trackingStartTime,
            points: pointCount
          }}
          onSave={async (name) => { await saveTrack(name); setTrackingStartTime(null); }}
          onDiscard={() => { discardTrack(); setTrackingStartTime(null); }}
        />
      )}
      {isLoading && <LoadingSpinner message={loadingMessage} />}
      <EmergencyButton currentPosition={currentPosition} />
      <Compass />
    </>
  );
}

export default App;
