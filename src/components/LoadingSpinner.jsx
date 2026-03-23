import './LoadingSpinner.css';

export const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};
