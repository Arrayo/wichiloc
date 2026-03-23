import { useState } from 'preact/hooks';
import './EmergencyButton.css';

export const EmergencyButton = ({ currentPosition }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getLocationUrl = () => {
    if (!currentPosition) return null;
    const [lat, lng] = currentPosition;
    return `https://maps.google.com/maps?q=${lat},${lng}`;
  };

  const getLocationText = () => {
    if (!currentPosition) return '';
    const [lat, lng] = currentPosition;
    const url = getLocationUrl();
    return `🆘 NECESITO AYUDA\n\nMi ubicación actual:\n${url}\n\nCoordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(getLocationText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowMenu(false);
  };

  const handleSMS = () => {
    const text = encodeURIComponent(getLocationText());
    window.location.href = `sms:?body=${text}`;
    setShowMenu(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '🆘 Necesito ayuda',
          text: getLocationText(),
        });
        setShowMenu(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error al compartir:', error);
      }
    }
  };

  const handleCopyLocation = async () => {
    try {
      await navigator.clipboard.writeText(getLocationText());
      alert('Ubicación copiada al portapapeles');
      setShowMenu(false);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  if (!currentPosition) return null;

  return (
    <>
      <button 
        className="emergency-btn"
        onClick={() => setShowMenu(true)}
        aria-label="Botón de emergencia"
      >
        🆘
      </button>

      {showMenu && (
        <div className="emergency-menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="emergency-menu" onClick={(e) => e.stopPropagation()}>
            <div className="emergency-header">
              <h3>🆘 Compartir ubicación</h3>
              <button className="close-btn" onClick={() => setShowMenu(false)}>✕</button>
            </div>
            
            <div className="emergency-warning">
              Tu ubicación actual será compartida con el mensaje de emergencia
            </div>

            <div className="emergency-actions">
              <button className="emergency-action-btn whatsapp" onClick={handleWhatsApp}>
                <span className="btn-icon">💬</span>
                <span className="btn-text">WhatsApp</span>
              </button>

              <button className="emergency-action-btn sms" onClick={handleSMS}>
                <span className="btn-icon">📱</span>
                <span className="btn-text">SMS</span>
              </button>

              {navigator.share && (
                <button className="emergency-action-btn share" onClick={handleShare}>
                  <span className="btn-icon">📤</span>
                  <span className="btn-text">Compartir</span>
                </button>
              )}

              <button className="emergency-action-btn copy" onClick={handleCopyLocation}>
                <span className="btn-icon">📋</span>
                <span className="btn-text">Copiar</span>
              </button>
            </div>

            <div className="emergency-preview">
              <div className="preview-label">Vista previa del mensaje:</div>
              <div className="preview-text">{getLocationText()}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
