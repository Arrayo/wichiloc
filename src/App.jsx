import { useEffect, useRef, useState } from 'preact/hooks';
import { createMap } from './app/map';
import { loadGPX } from './services/gpxService';
import { watchPosition } from './services/geoService';
import { createRouteTracker } from './services/routeTracker';
import { saveRoute } from './services/storageService';
import { parseElevationFromGPX, getElevationStats } from './services/elevationService';
import { FloatingControls } from './components/FloatingControls';
import { RouteList } from './components/RouteList';
import { ElevationProfile } from './components/ElevationProfile';
import L from 'leaflet';

function App() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeTrackerRef = useRef(null);
  const gpxLayerRef = useRef(null);
  const [routeStatus, setRouteStatus] = useState(null);
  const [showRouteList, setShowRouteList] = useState(false);
  const [showElevation, setShowElevation] = useState(false);
  const [elevationData, setElevationData] = useState(null);
  const [elevationStats, setElevationStats] = useState(null);

  useEffect(() => {
    mapRef.current = createMap('map');

    watchPosition(([lat, lng]) => {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      if (routeTrackerRef.current) {
        const status = routeTrackerRef.current([lat, lng]);
        setRouteStatus(status);
      }
    });
  }, []);

  const loadRouteOnMap = (coordinates, gpxContent) => {
    if (gpxLayerRef.current) {
      mapRef.current.removeLayer(gpxLayerRef.current);
    }

    gpxLayerRef.current = new L.GPX(gpxContent, { async: true });
    gpxLayerRef.current.on('loaded', (event) => {
      mapRef.current.fitBounds(event.target.getBounds());
    });
    gpxLayerRef.current.addTo(mapRef.current);

    routeTrackerRef.current = createRouteTracker(
      coordinates,
      (status, distance) => {
        if (status === 'off-route') {
          navigator.vibrate?.(200);
        }
      }
    );

    const elevation = parseElevationFromGPX(gpxContent);
    setElevationData(elevation);
    setElevationStats(getElevationStats(elevation));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const gpxContent = event.target.result;
      
      loadGPX(mapRef.current, file, async (coordinates) => {
        loadRouteOnMap(coordinates, gpxContent);
        
        const routeName = file.name.replace('.gpx', '');
        await saveRoute(routeName, coordinates, gpxContent);
      });
    };
    reader.readAsText(file);
  };

  const handleSelectRoute = (route) => {
    loadRouteOnMap(route.coordinates, route.gpxContent);
  };

  const handleCenterMap = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.setView(markerRef.current.getLatLng(), 16);
    }
  };

  return (
    <>
      <div id="map" style={{ height: '100vh', width: '100vw' }} />
      <FloatingControls 
        onFileSelect={handleFile}
        onCenterMap={handleCenterMap}
        onShowRoutes={() => setShowRouteList(true)}
        onShowElevation={() => setShowElevation(true)}
        hasRoute={!!elevationData}
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
    </>
  );
}

export default App;
