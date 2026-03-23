import { MapPin, TrendingUp, TrendingDown, Ruler } from 'lucide-preact';
import './RouteCompleteDialog.css';

export const RouteCompleteDialog = ({ stats, onNavigate, onClose }) => {
  return (
    <div className="complete-dialog-overlay" onClick={onClose}>
      <div className="complete-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="complete-header">
          <span className="complete-emoji">🎉</span>
          <h2>¡Ruta completada!</h2>
          <p className="complete-subtitle">Buen trabajo, has terminado la ruta</p>
        </div>

        {stats && (
          <div className="complete-stats">
            <div className="complete-stat">
              <div className="stat-icon-row">
                <Ruler size={14} />
                Distancia
              </div>
              <div className="stat-val">{stats.totalDistance} km</div>
            </div>
            <div className="complete-stat">
              <div className="stat-icon-row">
                <TrendingUp size={14} />
                Ascenso
              </div>
              <div className="stat-val">{stats.totalAscent} m</div>
            </div>
            <div className="complete-stat">
              <div className="stat-icon-row">
                <TrendingDown size={14} />
                Descenso
              </div>
              <div className="stat-val">{stats.totalDescent} m</div>
            </div>
          </div>
        )}

        <div className="complete-actions">
          {onNavigate && (
            <button className="btn-navigate" onClick={onNavigate}>
              <MapPin size={16} style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
              Cómo llegar al inicio
            </button>
          )}
          <button className="btn-close" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
