import { useRef, useState } from 'preact/hooks';
import {
  Plus, FolderOpen, Circle, Square, Crosshair,
  MoreHorizontal, TrendingUp, MapPin, User, Link, X,
} from 'lucide-preact';
import './FloatingControls.css';

export const FloatingControls = ({
  onFileSelect, onCenterMap, onShowRoutes, onShowElevation,
  onNavigateToStart, onToggleStartView, onImportUrl,
  onToggleRecording, hasRoute, viewingStart, isRecording,
}) => {
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="floating-controls">
        <button
          className="ctrl-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Importar GPX"
          title="Importar GPX"
        >
          <Plus size={20} />
          <span className="ctrl-label">Importar</span>
        </button>

        <button
          className="ctrl-btn"
          onClick={onShowRoutes}
          aria-label="Rutas guardadas"
          title="Rutas guardadas"
        >
          <FolderOpen size={20} />
          <span className="ctrl-label">Rutas</span>
        </button>

        <button
          className={`ctrl-btn rec-btn ${isRecording ? 'recording' : ''}`}
          onClick={onToggleRecording}
          aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
          title={isRecording ? 'Detener grabación' : 'Grabar recorrido'}
        >
          {isRecording ? <Square size={20} fill="currentColor" /> : <Circle size={20} />}
          <span className="ctrl-label">{isRecording ? 'Detener' : 'Grabar'}</span>
        </button>

        <button
          className="ctrl-btn"
          onClick={onCenterMap}
          aria-label="Centrar mapa"
          title="Centrar mapa"
        >
          <Crosshair size={20} />
          <span className="ctrl-label">Centrar</span>
        </button>

        {hasRoute && (
          <button
            className={`ctrl-btn ${showMenu ? 'active' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Más opciones"
            title="Más opciones"
          >
            <MoreHorizontal size={20} />
            <span className="ctrl-label">Más</span>
          </button>
        )}
      </div>

      {showMenu && hasRoute && (
        <div className="menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <h3>Opciones de ruta</h3>
              <button className="menu-close-btn" onClick={() => setShowMenu(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="menu-items">
              <button className="menu-item" onClick={() => { onShowElevation(); setShowMenu(false); }}>
                <span className="menu-icon"><TrendingUp size={20} /></span>
                <span className="menu-text">Perfil de elevación</span>
              </button>

              <button className="menu-item" onClick={() => { onToggleStartView(); setShowMenu(false); }}>
                <span className="menu-icon">
                  {viewingStart ? <User size={20} /> : <MapPin size={20} />}
                </span>
                <span className="menu-text">{viewingStart ? 'Ver mi posición' : 'Ver inicio de ruta'}</span>
              </button>

              <button className="menu-item" onClick={() => { onNavigateToStart(); setShowMenu(false); }}>
                <span className="menu-icon">
                  <img
                    src={`${import.meta.env.BASE_URL}gps-navigate.png`}
                    alt=""
                    style={{ width: 20, height: 20, objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(58%) sepia(90%) saturate(1800%) hue-rotate(2deg) brightness(105%)' }}
                  />
                </span>
                <span className="menu-text">Navegar al inicio</span>
              </button>

              <button className="menu-item" onClick={() => { onImportUrl(); setShowMenu(false); }}>
                <span className="menu-icon"><Link size={20} /></span>
                <span className="menu-text">Importar desde URL</span>
              </button>
            </div>
          </div>
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
