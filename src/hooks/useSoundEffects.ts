import { useCallback, useRef, useEffect } from 'react';

type SoundType = 
  | 'click' 
  | 'navigate' 
  | 'success' 
  | 'error' 
  | 'lock' 
  | 'unlock' 
  | 'send' 
  | 'receive' 
  | 'keypad'
  | 'connect'
  | 'disconnect'
  | 'hover';

const SOUND_ENABLED_KEY = 'keeta_sound_enabled';

const getInitialSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored !== 'false';
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef<boolean>(getInitialSoundEnabled());

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.1,
    detune: number = 0
  ) => {
    if (!isEnabledRef.current) return;
    
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.detune.setValueAtTime(detune, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const playNoise = useCallback((duration: number, volume: number = 0.05) => {
    if (!isEnabledRef.current) return;
    
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start(ctx.currentTime);
  }, [getAudioContext]);

  const play = useCallback((sound: SoundType) => {
    if (!isEnabledRef.current) return;

    switch (sound) {
      case 'click':
        // Short blip
        playTone(800, 0.05, 'square', 0.08);
        break;
        
      case 'hover':
        // Subtle high tone
        playTone(1200, 0.03, 'sine', 0.03);
        break;
        
      case 'navigate':
        // Swoosh-like effect
        playTone(400, 0.1, 'sawtooth', 0.06);
        setTimeout(() => playTone(600, 0.08, 'sine', 0.05), 30);
        break;
        
      case 'keypad':
        // Beep for PIN entry
        playTone(600 + Math.random() * 100, 0.08, 'square', 0.06);
        break;
        
      case 'success':
        // Ascending tones
        playTone(523, 0.1, 'sine', 0.1); // C5
        setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100); // E5
        setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200); // G5
        break;
        
      case 'error':
        // Descending harsh tones
        playTone(400, 0.15, 'square', 0.1);
        setTimeout(() => playTone(300, 0.2, 'square', 0.1), 100);
        break;
        
      case 'lock':
        // Mechanical lock sound
        playNoise(0.05, 0.1);
        playTone(200, 0.1, 'square', 0.08);
        setTimeout(() => playTone(150, 0.15, 'square', 0.06), 80);
        break;
        
      case 'unlock':
        // Unlock chime
        playTone(300, 0.08, 'sine', 0.08);
        setTimeout(() => playTone(450, 0.08, 'sine', 0.08), 60);
        setTimeout(() => playTone(600, 0.12, 'sine', 0.1), 120);
        break;
        
      case 'send':
        // Outgoing transmission
        playTone(800, 0.05, 'sine', 0.08);
        setTimeout(() => playTone(1000, 0.05, 'sine', 0.08), 50);
        setTimeout(() => playTone(1200, 0.05, 'sine', 0.06), 100);
        setTimeout(() => playNoise(0.1, 0.03), 150);
        break;
        
      case 'receive':
        // Incoming transmission
        playNoise(0.05, 0.03);
        setTimeout(() => playTone(1200, 0.05, 'sine', 0.08), 50);
        setTimeout(() => playTone(1000, 0.05, 'sine', 0.08), 100);
        setTimeout(() => playTone(800, 0.08, 'sine', 0.1), 150);
        break;
        
      case 'connect':
        // Connection established
        playTone(400, 0.1, 'sine', 0.06);
        setTimeout(() => playTone(500, 0.1, 'sine', 0.08), 100);
        setTimeout(() => playTone(800, 0.2, 'sine', 0.1), 200);
        playNoise(0.3, 0.02);
        break;
        
      case 'disconnect':
        // Disconnection
        playTone(600, 0.1, 'sine', 0.08);
        setTimeout(() => playTone(400, 0.15, 'sine', 0.06), 100);
        setTimeout(() => playTone(200, 0.2, 'sine', 0.04), 200);
        break;
    }
  }, [playTone, playNoise]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  }, []);

  const isEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  return { play, setEnabled, isEnabled };
};

// Create a singleton instance for use outside of React components
let globalAudioContext: AudioContext | null = null;
let globalEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';

export const playSound = (sound: SoundType) => {
  if (!globalEnabled) return;
  
  if (!globalAudioContext) {
    globalAudioContext = new AudioContext();
  }
  
  const ctx = globalAudioContext;
  
  const playTone = (freq: number, dur: number, type: OscillatorType = 'sine', vol: number = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  };

  switch (sound) {
    case 'click':
      playTone(800, 0.05, 'square', 0.08);
      break;
    case 'success':
      playTone(523, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
      setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200);
      break;
    case 'error':
      playTone(400, 0.15, 'square', 0.1);
      setTimeout(() => playTone(300, 0.2, 'square', 0.1), 100);
      break;
  }
};

export const setSoundEnabled = (enabled: boolean) => {
  globalEnabled = enabled;
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
};
