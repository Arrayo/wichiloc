import { AlertTriangle, XCircle, CheckCircle } from 'lucide-preact';
import './RouteStatusBanner.css';

const CONFIG = {
  'on-route': {
    Icon: CheckCircle,
    className: 'status-on-route',
    label: 'En ruta',
  },
  'warning': {
    Icon: AlertTriangle,
    className: 'status-warning',
    label: 'Alejándote',
  },
  'off-route': {
    Icon: XCircle,
    className: 'status-off-route',
    label: 'Fuera de ruta',
  },
};

export const RouteStatusBanner = ({ routeStatus }) => {
  if (!routeStatus) return null;

  const config = CONFIG[routeStatus.status];
  if (!config) return null;

  const { Icon, className, label } = config;
  const dist = routeStatus.distance != null ? Math.round(routeStatus.distance) : null;
  const isAlert = routeStatus.status === 'warning' || routeStatus.status === 'off-route';

  return (
    <div className={`route-status-banner ${className} ${isAlert ? 'alert' : ''}`}>
      <Icon size={isAlert ? 20 : 14} />
      <span className="status-label">{label}</span>
      {isAlert && dist !== null && (
        <span className="status-dist">{dist} m</span>
      )}
    </div>
  );
};
