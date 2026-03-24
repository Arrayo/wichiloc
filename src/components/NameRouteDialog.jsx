import { useState, useEffect } from 'preact/hooks';
import './NameRouteDialog.css';

export const NameRouteDialog = ({ defaultName, onSave, onCancel }) => {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="name-dialog-overlay" onClick={onCancel}>
      <div className="name-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Nombrar ruta</h3>
        <input
          type="text"
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de la ruta"
          autoFocus
        />
        <div className="name-dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
