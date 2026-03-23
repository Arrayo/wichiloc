import './InitialLoading.css';

export const InitialLoading = () => {
  return (
    <div className="initial-loading">
      <div className="loading-content">
        <img className="loading-icon" src={`${import.meta.env.BASE_URL}location-icon.png`} alt="" />
        <div className="loading-spinner"></div>
        <h2>Obteniendo ubicación</h2>
        <p>Buscando señal GPS...</p>
      </div>
    </div>
  );
};
