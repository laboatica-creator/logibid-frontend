// soundService.js - Web Audio API Synths for LogiBid
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

// Activar el contexto al primer clic o toque en la app (necesario por navegadores)
export const initSoundContext = () => {
    const act = () => {
       getAudioContext().resume();
       document.removeEventListener('click', act);
    };
    document.addEventListener('click', act);
}

// 1. Sonido para NUEVA SOLICITUD (Transportista) - Tonos graves de camión / bocina
export const playNewRequestSound = () => {
  if (localStorage.getItem('logibid_sounds') === 'false') return;
  const ctx = getAudioContext();
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'square'; osc1.frequency.setValueAtTime(150, ctx.currentTime);
  osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(100, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  
  osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
  osc1.start(); osc2.start();
  osc1.stop(ctx.currentTime + 0.6); osc2.stop(ctx.currentTime + 0.6);
};

// 2. Sonido para NUEVA OFERTA (Cliente) - Sonido de Moneda (Mario style)
export const playNewBidSound = () => {
  if (localStorage.getItem('logibid_sounds') === 'false') return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(988, ctx.currentTime); // B5
  osc.frequency.setValueAtTime(1319, ctx.currentTime + 0.08); // E6
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
};

// 3. Sonido para OFERTA ACEPTADA (Transportista) - Sonido de Éxito o Despegue
export const playBidAcceptedSound = () => {
  if (localStorage.getItem('logibid_sounds') === 'false') return;
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
  osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.7);
};

// 4. Sonido para PAGO LIBERADO - Cash register "Cha-Ching"
export const playPaymentReleasedSound = () => {
  if (localStorage.getItem('logibid_sounds') === 'false') return;
  const ctx = getAudioContext();
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'square'; osc1.frequency.setValueAtTime(3000, ctx.currentTime);
  osc2.type = 'sine'; osc2.frequency.setValueAtTime(5000, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
  osc1.start(); osc2.start();
  osc1.stop(ctx.currentTime + 0.3); osc2.stop(ctx.currentTime + 0.3);
};
