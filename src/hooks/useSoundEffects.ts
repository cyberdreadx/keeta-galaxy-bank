import { useCallback, useRef } from 'react';

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

  // R2-D2 style chirp - rapid frequency sweep
  const playChirp = useCallback((startFreq: number, endFreq: number, duration: number, volume: number = 0.15) => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  // Classic Star Wars terminal beep
  const playBeep = useCallback((freq: number, duration: number, volume: number = 0.12) => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Quick attack, sustain, quick release
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.setValueAtTime(volume, ctx.currentTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  // Warble effect like R2-D2
  const playWarble = useCallback((baseFreq: number, duration: number, wobbleSpeed: number = 30, volume: number = 0.12) => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(wobbleSpeed, ctx.currentTime);
    lfoGain.gain.setValueAtTime(baseFreq * 0.3, ctx.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    lfo.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    lfo.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  // Descending bloop (like Star Wars computers)
  const playBloop = useCallback((startFreq: number, endFreq: number, duration: number, volume: number = 0.1) => {
    if (!isEnabledRef.current) return;
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration * 0.3);
    osc.frequency.setValueAtTime(endFreq, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const play = useCallback((sound: SoundType) => {
    if (!isEnabledRef.current) return;

    switch (sound) {
      case 'click':
        // Quick terminal click - like pressing a Star Wars console button
        playBeep(1800, 0.04, 0.08);
        setTimeout(() => playBeep(1200, 0.03, 0.05), 25);
        break;
        
      case 'hover':
        // Subtle high pitched blip
        playChirp(2000, 2200, 0.03, 0.04);
        break;
        
      case 'navigate':
        // R2-D2 style navigation chirp sequence
        playChirp(800, 1600, 0.08, 0.1);
        setTimeout(() => playChirp(1200, 1800, 0.06, 0.08), 60);
        setTimeout(() => playBloop(1600, 1000, 0.1, 0.06), 100);
        break;
        
      case 'keypad':
        // Imperial terminal keypad beep
        const keyFreqs = [1047, 1175, 1319, 1397, 1568, 1760];
        const freq = keyFreqs[Math.floor(Math.random() * keyFreqs.length)];
        playBeep(freq, 0.06, 0.1);
        break;
        
      case 'success':
        // Triumphant R2-D2 happy sequence
        playChirp(600, 1200, 0.1, 0.12);
        setTimeout(() => playChirp(800, 1400, 0.1, 0.12), 100);
        setTimeout(() => playWarble(1600, 0.2, 25, 0.1), 180);
        setTimeout(() => playChirp(1200, 1800, 0.15, 0.1), 350);
        break;
        
      case 'error':
        // Negative buzzer - like when R2 gets shocked
        playBeep(200, 0.15, 0.15);
        setTimeout(() => playBeep(150, 0.2, 0.12), 100);
        setTimeout(() => playBloop(300, 100, 0.15, 0.08), 200);
        break;
        
      case 'lock':
        // Door lock sound - descending sequence
        playBloop(1200, 400, 0.12, 0.12);
        setTimeout(() => playBeep(300, 0.1, 0.1), 100);
        setTimeout(() => playBeep(200, 0.15, 0.08), 180);
        break;
        
      case 'unlock':
        // Door unlock - ascending R2 chirps
        playChirp(400, 800, 0.08, 0.1);
        setTimeout(() => playChirp(600, 1200, 0.08, 0.1), 70);
        setTimeout(() => playChirp(900, 1600, 0.1, 0.12), 140);
        setTimeout(() => playWarble(1400, 0.15, 35, 0.08), 220);
        break;
        
      case 'send':
        // Transmission sending - like a Star Wars data transfer
        playWarble(800, 0.1, 40, 0.1);
        setTimeout(() => playChirp(1000, 2000, 0.08, 0.08), 80);
        setTimeout(() => playChirp(1500, 2500, 0.06, 0.06), 140);
        setTimeout(() => playChirp(2000, 3000, 0.05, 0.05), 190);
        setTimeout(() => playBeep(2200, 0.08, 0.08), 250);
        break;
        
      case 'receive':
        // Incoming transmission - descending R2 sequence
        playBeep(2200, 0.06, 0.08);
        setTimeout(() => playChirp(2500, 1500, 0.08, 0.1), 60);
        setTimeout(() => playChirp(2000, 1000, 0.1, 0.1), 130);
        setTimeout(() => playWarble(1200, 0.15, 30, 0.1), 200);
        setTimeout(() => playBloop(1000, 600, 0.12, 0.08), 320);
        break;
        
      case 'connect':
        // Droid boot-up sequence
        playBloop(200, 800, 0.15, 0.08);
        setTimeout(() => playChirp(600, 1200, 0.1, 0.1), 120);
        setTimeout(() => playWarble(1000, 0.2, 25, 0.1), 200);
        setTimeout(() => playChirp(1200, 1800, 0.12, 0.12), 380);
        setTimeout(() => playBeep(1600, 0.1, 0.1), 480);
        break;
        
      case 'disconnect':
        // Power down sequence
        playWarble(1400, 0.15, 20, 0.1);
        setTimeout(() => playBloop(1200, 600, 0.12, 0.1), 120);
        setTimeout(() => playBloop(800, 300, 0.15, 0.08), 220);
        setTimeout(() => playBloop(400, 100, 0.2, 0.06), 340);
        break;
    }
  }, [playChirp, playBeep, playWarble, playBloop]);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  }, []);

  const isEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  return { play, setEnabled, isEnabled };
};

// Singleton for use outside React
let globalAudioContext: AudioContext | null = null;
let globalEnabled = typeof window !== 'undefined' ? localStorage.getItem(SOUND_ENABLED_KEY) !== 'false' : true;

export const setSoundEnabled = (enabled: boolean) => {
  globalEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  }
};
