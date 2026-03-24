import { useState, useEffect } from 'preact/hooks';
import { BarChart2, Timer, Ruler, Zap, Mountain, TrendingUp, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-preact';
import { formatTime, formatDistance } from '../utils/format';
import './StatsButton.css';

export const StatsButton = ({ distance, startTime, altitude, elevationGain, routeStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);


  const calculateSpeed = () => {
    if (!elapsedTime || !distance) return '0.0';
    const hours = elapsedTime / 3600000;
    const kmh = (distance / 1000) / hours;
    return isFinite(kmh) ? kmh.toFixed(1) : '0.0';
  };

  const formatAltitude = (alt) => (alt === null || alt === undefined) ? '--' : `${Math.round(alt)} m`;
  const formatElevationGain = (gain) => (gain === null || gain === undefined) ? '--' : `${Math.round(gain)} m`;

  const statusConfig = {
    'on-route': { color: 'var(--color-success)', Icon: CheckCircle, text: 'En ruta' },
    'warning': { color: 'var(--color-warning)', Icon: AlertTriangle, text: 'Alejándote' },
    'off-route': { color: 'var(--color-danger)', Icon: XCircle, text: 'Fuera de ruta' },
    'error': { color: 'var(--color-text-muted)', Icon: AlertTriangle, text: 'Sin señal GPS' },
  };
  const status = routeStatus ? (statusConfig[routeStatus.status] ?? null) : null;

  return (
    <>
      <button
        className="stats-btn"
        onClick={() => setShowModal(true)}
        aria-label="Ver estadísticas"
        title="Estadísticas"
      >
        <BarChart2 size={22} />
      </button>

      {showModal && (
        <div className="stats-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
            <div className="stats-modal-header">
              <span className="stats-modal-title">
                <BarChart2 size={18} />
                Estadísticas
              </span>
              <button className="stats-close-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            {status && (
              <div className="stats-status" style={{ borderColor: status.color }}>
                <status.Icon size={16} style={{ color: status.color }} />
                <span className="status-text" style={{ color: status.color }}>{status.text}</span>
                <span className="status-distance">{Math.round(routeStatus.distance)} m</span>
              </div>
            )}

            <div className="stats-grid">
              {[
                { Icon: Timer, value: formatTime(elapsedTime), label: 'Tiempo' },
                { Icon: Ruler, value: formatDistance(distance), label: 'Distancia' },
                { Icon: Zap, value: calculateSpeed(), label: 'km/h' },
                { Icon: Mountain, value: formatAltitude(altitude), label: 'Altitud' },
                { Icon: TrendingUp, value: formatElevationGain(elevationGain), label: 'Desnivel +' },
              ].map(({ Icon, value, label }) => (
                <div key={label} className="stat-card">
                  <Icon size={20} className="stat-icon" />
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
