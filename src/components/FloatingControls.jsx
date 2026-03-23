import { useRef } from 'preact/hooks';
import './FloatingControls.css';

export const FloatingControls = ({ onFileSelect, onCenterMap, onShowRoutes, onShowElevation, hasRoute, routeStatus }) => {
  const fileInputRef = useRef(null);

  const getStatusColor = () => {
    if (!routeStatus) return '#6b7280';
    switch (routeStatus.status) {
      case 'off-route': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'on-route': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <div className="floating-controls">
        <button 
          className="control-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Cargar GPX"
        >
          📂
        </button>

        <button 
          className="control-btn"
          onClick={onShowRoutes}
          aria-label="Rutas guardadas"
        >
          📋
        </button>

        {hasRoute && (
          <button 
            className="control-btn"
            onClick={onShowElevation}
            aria-label="Perfil de elevación"
          >
            📈
          </button>
        )}
        
        <button 
          className="control-btn"
          onClick={onCenterMap}
          aria-label="Centrar en mi posición"
        >
          🎯
        </button>
      </div>

      {routeStatus && (
        <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}>
          <div className="status-text">
            {routeStatus.status === 'on-route' && '✓ En ruta'}
            {routeStatus.status === 'warning' && '⚠ Alejándote'}
            {routeStatus.status === 'off-route' && '✗ Fuera de ruta'}
          </div>
          <div className="status-distance">{Math.round(routeStatus.distance)}m</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx"
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
    </>
  );
};
