import { render } from 'preact';
import './styles/tokens.css';
import App from './App';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

render(<App />, document.getElementById('app'));
