import { useState } from 'preact/hooks';
import './ImportUrlDialog.css';

export const ImportUrlDialog = ({ onImport, onClose }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Por favor, introduce una URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let response;
      try {
        response = await fetch(url);
      } catch {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const gpxContent = await response.text();

      if (!gpxContent.includes('<gpx') && !gpxContent.includes('<?xml')) {
        throw new Error('El contenido no parece ser un archivo GPX válido');
      }

      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1] || 'ruta-importada';
      const routeName = fileName.replace(/\.gpx$/i, '').replace(/[-_]/g, ' ').trim();

      onImport(gpxContent, routeName);
      onClose();
    } catch (err) {
      console.error('Error al importar desde URL:', err);
      setError(err.message || 'Error al descargar el archivo. Verifica la URL.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleImport();
    }
  };

  return (
    <div className="import-url-overlay" onClick={onClose}>
      <div className="import-url-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="import-url-header">
          <h3>Importar desde URL</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="import-url-content">
          <p className="import-url-description">
            Introduce la URL directa de un archivo GPX
          </p>

          <input
            type="url"
            className="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="https://ejemplo.com/ruta.gpx"
            disabled={isLoading}
            autoFocus
          />

          {error && (
            <div className="import-url-error">
              ⚠️ {error}
            </div>
          )}

          <div className="import-url-examples">
            <div className="examples-title">Ejemplos compatibles:</div>
            <ul>
              <li>Enlaces directos a archivos .gpx</li>
              <li>Wikiloc (URL de descarga directa)</li>
              <li>AllTrails (URL de descarga directa)</li>
              <li>Cualquier servidor que sirva archivos GPX</li>
            </ul>
          </div>
        </div>

        <div className="import-url-actions">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn-import" 
            onClick={handleImport}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  );
};
