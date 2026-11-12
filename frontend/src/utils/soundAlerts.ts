// Web Audio API Synthesizer for Emergency Sirens and Chimes (Zero external assets required)
let audioCtx: AudioContext | null = null;
let sirenInterval: any = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playBeep = (freq = 880, duration = 0.15) => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context not allowed before user gesture
  }
};

export const playSafeChime = () => {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playBeep(freq, 0.25);
      }, idx * 120);
    });
  } catch (e) {
    // Ignore
  }
};

export const playEmergencySiren = () => {
  stopEmergencySiren();
  try {
    const ctx = getAudioContext();
    let isHigh = false;

    const beep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const freq = isHigh ? 960 : 700;
      isHigh = !isHigh;

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    };

    beep();
    sirenInterval = setInterval(beep, 380);
  } catch (e) {
    // Ignore
  }
};

export const stopEmergencySiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
};
