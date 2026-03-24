import logo from '../assets/logo.png';
import './InitialLoading.css';

export const InitialLoading = () => {
  return (
    <div className="initial-loading">
      <img className="loading-logo" src={logo} alt="GPX Tracker" />
    </div>
  );
};
