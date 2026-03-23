import { useState } from 'preact/hooks';
import './SaveTrackDialog.css';

export const SaveTrackDialog = ({ trackData, onSave, onDiscard }) => {
  const [name, setName] = useState(`Track ${new Date().toLocaleDateString('es-ES')}`);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="save-track-overlay" onClick={onDiscard}>
      <div className="save-track-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="save-track-header">
          <h3>💾 Guardar recorrido</h3>
        </div>

        <div className="save-track-content">
          <div className="track-stats">
            <div className="track-stat">
              <span className="stat-icon">📏</span>
              <span className="stat-text">{formatDistance(trackData.distance)}</span>
            </div>
            <div className="track-stat">
              <span className="stat-icon">⏱️</span>
              <span className="stat-text">{formatDuration(trackData.duration)}</span>
            </div>
            <div className="track-stat">
              <span className="stat-icon">📍</span>
              <span className="stat-text">{trackData.points} puntos</span>
            </div>
          </div>

          <input
            type="text"
            className="track-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Nombre del recorrido"
            autoFocus
          />
        </div>

        <div className="save-track-actions">
          <button className="btn-discard" onClick={onDiscard}>
            Descartar
          </button>
          <button className="btn-save-track" onClick={handleSave}>
            Guardar GPX
          </button>
        </div>
      </div>
    </div>
  );
};
