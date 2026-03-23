import { useState } from 'preact/hooks';
import './NameRouteDialog.css';

export const NameRouteDialog = ({ defaultName, onSave, onCancel }) => {
  const [name, setName] = useState(defaultName);

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

  return (
    <div className="name-dialog-overlay" onClick={onCancel}>
      <div className="name-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Nombrar ruta</h3>
        <input
          type="text"
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyUp={handleKeyPress}
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
