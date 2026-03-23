import { useState, useEffect } from 'preact/hooks';
import './Compass.css';

export const Compass = () => {
  const [heading, setHeading] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) return;

    const handleOrientation = (event) => {
      if (event.alpha === null) return;
      const compassHeading = event.webkitCompassHeading ?? (360 - event.alpha);
      setHeading(compassHeading);
      setIsActive(true);
    };

    const register = () => {
      window.addEventListener('deviceorientation', handleOrientation);
    };

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+: el permiso debe pedirse desde una interacción de usuario.
      // Lo pedimos en el primer tap sobre el documento para no bloquear el render.
      const requestOnInteraction = () => {
        DeviceOrientationEvent.requestPermission()
          .then(state => { if (state === 'granted') register(); })
          .catch(() => {});
        document.removeEventListener('click', requestOnInteraction);
      };
      document.addEventListener('click', requestOnInteraction);
      return () => {
        document.removeEventListener('click', requestOnInteraction);
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }

    register();
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const getCardinalDirection = () => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  const getCardinalName = () => {
    const names = {
      'N': 'Norte',
      'NE': 'Noreste',
      'E': 'Este',
      'SE': 'Sureste',
      'S': 'Sur',
      'SO': 'Suroeste',
      'O': 'Oeste',
      'NO': 'Noroeste'
    };
    return names[getCardinalDirection()];
  };

  if (!isActive) return null;

  return (
    <div className="compass-container">
      <div className="compass" style={{ transform: `rotate(${-heading}deg)` }}>
        <div className="compass-rose">
          <div className="compass-point north">N</div>
          <div className="compass-point east">E</div>
          <div className="compass-point south">S</div>
          <div className="compass-point west">O</div>
        </div>
        
        <div className="compass-marks">
          {[...Array(36)].map((_, i) => {
            const angle = i * 10;
            const isCardinal = angle % 90 === 0;
            const isMajor = angle % 30 === 0;
            return (
              <div
                key={i}
                className={`compass-mark ${isCardinal ? 'cardinal' : isMajor ? 'major' : 'minor'}`}
                style={{ transform: `rotate(${angle}deg)` }}
              />
            );
          })}
        </div>
      </div>
      
      <div className="compass-indicator">
        <div className="compass-arrow"></div>
      </div>
      
      <div className="compass-info">
        <div className="compass-direction">{getCardinalDirection()}</div>
        <div className="compass-degrees">{Math.round(heading)}°</div>
        <div className="compass-name">{getCardinalName()}</div>
      </div>
    </div>
  );
};
