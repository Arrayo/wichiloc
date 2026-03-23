let audioContext = null;
let lastPlayTime = { onRoute: 0, warning: 0, offRoute: 0 };

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const playSequence = (notes) => {
  const ctx = getAudioContext();
  let time = ctx.currentTime;

  notes.forEach(({ frequency, duration, delay = 0, volume = 0.3 }) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, time + delay);
    gainNode.gain.linearRampToValueAtTime(volume, time + delay + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, time + delay + duration);

    oscillator.start(time + delay);
    oscillator.stop(time + delay + duration);
  });
};

export const playOnRouteSound = () => {
  const now = Date.now();
  if (now - lastPlayTime.onRoute < 30000) return;
  lastPlayTime.onRoute = now;

  playSequence([
    { frequency: 523.25, duration: 0.15, delay: 0, volume: 0.2 },     
    { frequency: 659.25, duration: 0.15, delay: 0.15, volume: 0.2 },  
  ]);
};

export const playWarningSound = () => {
  const now = Date.now();
  if (now - lastPlayTime.warning < 10000) return;
  lastPlayTime.warning = now;

  playSequence([
    { frequency: 440, duration: 0.15, delay: 0, volume: 0.3 },      
    { frequency: 440, duration: 0.15, delay: 0.2, volume: 0.3 },    
  ]);
};

export const playOffRouteSound = () => {
  const now = Date.now();
  if (now - lastPlayTime.offRoute < 5000) return;
  lastPlayTime.offRoute = now;

  playSequence([
    { frequency: 800, duration: 0.2, delay: 0, volume: 0.4 },
    { frequency: 600, duration: 0.2, delay: 0.25, volume: 0.4 },
    { frequency: 400, duration: 0.3, delay: 0.5, volume: 0.4 },
  ]);
};

export const playRouteCompleteSound = () => {
  playSequence([
    { frequency: 523.25, duration: 0.15, delay: 0, volume: 0.3 },     
    { frequency: 587.33, duration: 0.15, delay: 0.15, volume: 0.3 },  
    { frequency: 659.25, duration: 0.15, delay: 0.3, volume: 0.3 },   
    { frequency: 783.99, duration: 0.3, delay: 0.45, volume: 0.35 },  
    { frequency: 1046.50, duration: 0.4, delay: 0.8, volume: 0.4 },   
  ]);
};

export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
};
