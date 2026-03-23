import { useEffect, useState } from 'preact/hooks';
import { getAllRoutes, deleteRoute } from '../services/storageService';
import './RouteList.css';

export const RouteList = ({ onSelectRoute, onClose }) => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const savedRoutes = await getAllRoutes();
    setRoutes(savedRoutes.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteRoute(id);
    loadRoutes();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="route-list-overlay" onClick={onClose}>
      <div className="route-list-panel" onClick={(e) => e.stopPropagation()}>
        <div className="route-list-header">
          <h2>Rutas guardadas</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {routes.length === 0 ? (
          <div className="empty-state">
            <p>No hay rutas guardadas</p>
            <p className="empty-hint">Carga un archivo GPX para empezar</p>
          </div>
        ) : (
          <div className="route-list">
            {routes.map((route) => (
              <div 
                key={route.id} 
                className="route-item"
                onClick={() => {
                  onSelectRoute(route);
                  onClose();
                }}
              >
                <div className="route-info">
                  <div className="route-name">{route.name}</div>
                  <div className="route-date">{formatDate(route.timestamp)}</div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDelete(route.id, e)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
