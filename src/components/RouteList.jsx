import { useEffect, useState } from 'preact/hooks';
import { getAllRoutes, deleteRoute, updateRouteName } from '../services/storageService';
import { downloadGPX } from '../utils/download';
import { X, Pencil, Trash2, Share2, Check, AlertTriangle, Route } from 'lucide-preact';
import './RouteList.css';

export const RouteList = ({ onSelectRoute, onClose }) => {
  const [routes, setRoutes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const savedRoutes = await getAllRoutes();
    setRoutes(savedRoutes.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteRoute(deletingId);
      setDeletingId(null);
      loadRoutes();
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleStartEdit = (route, e) => {
    e.stopPropagation();
    setEditingId(route.id);
    setEditingName(route.name);
  };

  const handleSaveEdit = async (id, e) => {
    e.stopPropagation();
    if (editingName.trim()) {
      await updateRouteName(id, editingName.trim());
      setEditingId(null);
      loadRoutes();
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleShare = async (route, e) => {
    e.stopPropagation();
    
    try {
      const blob = new Blob([route.gpxContent], { type: 'application/gpx+xml' });
      const file = new File([blob], `${route.name}.gpx`, { type: 'application/gpx+xml' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: route.name,
          text: `Ruta GPX: ${route.name}`,
          files: [file]
        });
      } else {
        downloadGPX(route.gpxContent, route.name);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error al compartir:', error);
      }
    }
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
    <>
      <div className="route-list-overlay" onClick={onClose}>
        <div className="route-list-panel" onClick={(e) => e.stopPropagation()}>
          <div className="route-list-header">
            <span className="route-list-title"><Route size={18} /> Rutas guardadas</span>
            <button className="close-btn" onClick={onClose}><X size={16} /></button>
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
                    if (editingId !== route.id) {
                      onSelectRoute(route);
                      onClose();
                    }
                  }}
                >
                  <div className="route-info">
                    {editingId === route.id ? (
                      <input
                        type="text"
                        className="route-name-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <div className="route-name">{route.name}</div>
                    )}
                    <div className="route-date">{formatDate(route.timestamp)}</div>
                  </div>
                  <div className="route-actions">
                    {editingId === route.id ? (
                      <>
                        <button className="action-btn save-btn" onClick={(e) => handleSaveEdit(route.id, e)}>
                          <Check size={14} />
                        </button>
                        <button className="action-btn cancel-btn" onClick={handleCancelEdit}>
                          <X size={14} />
                        </button>
                    </>
                  ) : (
                    <>
                      <button className="action-btn share-btn" onClick={(e) => handleShare(route, e)} title="Compartir">
                        <Share2 size={14} />
                      </button>
                      <button className="action-btn edit-btn" onClick={(e) => handleStartEdit(route, e)} title="Editar nombre">
                        <Pencil size={14} />
                      </button>
                      <button className="action-btn delete-btn" onClick={(e) => handleDeleteClick(route.id, e)} title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deletingId && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-icon"><AlertTriangle size={32} /></div>
            <h3>¿Eliminar ruta?</h3>
            <p>Esta acción no se puede deshacer</p>
            <div className="delete-confirm-actions">
              <button className="btn-cancel" onClick={handleCancelDelete}>
                Cancelar
              </button>
              <button className="btn-delete" onClick={handleConfirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
