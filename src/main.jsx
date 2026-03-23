import { render } from 'preact';
import App from './App';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    console.log('Service Worker not available');
  });
}

render(<App />, document.getElementById('app'));
