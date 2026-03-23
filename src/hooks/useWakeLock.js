import { useEffect, useRef } from 'preact/hooks';

export const useWakeLock = (active) => {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const request = async () => {
      if (!('wakeLock' in navigator) || !active || wakeLockRef.current) return;
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (err) {
        console.error('Error al activar Wake Lock:', err);
      }
    };

    const release = async () => {
      if (!wakeLockRef.current) return;
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.error('Error al liberar Wake Lock:', err);
      }
    };

    if (active) {
      request();
    } else {
      release();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active) {
        request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      release();
    };
  }, [active]);
};
