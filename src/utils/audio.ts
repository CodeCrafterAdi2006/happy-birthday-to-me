// Web Audio API Synthesizer and Ambient Soundscape Generator

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private chordOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }[] = [];
  private currentChordIndex = 0;
  private isMuted = false;

  // Cinematic beautiful chord progression (Cmaj9, Am9, Fmaj9, G11, etc.)
  private chords = [
    [130.82, 196.0, 261.63, 329.63, 392.0], // C Major / G base (C3, G3, C4, E4, G4)
    [110.0, 164.81, 220.0, 261.63, 329.63], // A Minor (A2, E3, A3, C4, E4)
    [87.31, 130.82, 174.61, 220.0, 261.63],  // F Major (F2, C3, F3, A3, C4)
    [98.0, 146.83, 196.0, 246.94, 293.66],  // G Major (G2, D3, G3, B3, D4)
    [116.54, 174.61, 233.08, 277.18, 349.23], // Bb Major / Ambience (Bb2, F3, Bb3, Db4, F4)
    [130.82, 164.81, 220.0, 293.66, 392.0]  // Am7/C (C3, E3, A3, D4, G4)
  ];

  constructor() {
    // Initialized on clicking "Enter" or "Begin Assembly"
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch((err) => console.log("Audio resume failed:", err));
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.ambientGain.connect(this.masterVolume);

      // Start beautiful low synth ambient pad
      this.startAmbientLoom();

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch((err) => console.log("Audio resume failed:", err));
      }
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (!this.masterVolume || !this.ctx) return;
    if (!muted && this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.log("Audio resume failed:", err));
    }
    const targetVal = muted ? 0 : 0.75;
    this.masterVolume.gain.setValueAtTime(this.masterVolume.gain.value, this.ctx.currentTime);
    this.masterVolume.gain.linearRampToValueAtTime(targetVal, this.ctx.currentTime + 0.3);
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  private startAmbientLoom() {
    if (!this.ctx || !this.ambientGain) return;

    // Create 3 soft, warm synth nodes for sustained pads
    const notes = this.chords[this.currentChordIndex];
    notes.forEach((freq) => {
      if (!this.ctx || !this.ambientGain) return;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.005, this.ctx.currentTime); // Subtle detune

      gainNode.gain.setValueAtTime(0.02, this.ctx.currentTime);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ambientGain);

      osc1.start();
      osc2.start();

      this.chordOscillators.push({ osc1, osc2, gain: gainNode });
    });
  }

  // Transitions the ambient pad chords smoothly
  public transitionAmbientNoise() {
    if (!this.ctx || this.chordOscillators.length === 0) return;

    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
    const nextNotes = this.chords[this.currentChordIndex];
    const now = this.ctx.currentTime;

    this.chordOscillators.forEach((oscGroup, index) => {
      const nextFreq = nextNotes[index % nextNotes.length];
      // Slow frequency transition for smooth glide sound
      oscGroup.osc1.frequency.setValueAtTime(oscGroup.osc1.frequency.value, now);
      oscGroup.osc1.frequency.exponentialRampToValueAtTime(nextFreq, now + 1.8);
      
      oscGroup.osc2.frequency.setValueAtTime(oscGroup.osc2.frequency.value, now);
      oscGroup.osc2.frequency.exponentialRampToValueAtTime(nextFreq * 1.005, now + 1.8);
      
      // Slight volume pulsation to make the soundscape feel alive
      const customSwell = 0.015 + Math.random() * 0.015;
      oscGroup.gain.gain.setValueAtTime(oscGroup.gain.gain.value, now);
      oscGroup.gain.gain.linearRampToValueAtTime(customSwell, now + 0.8);
    });
  }

  // Triggers a custom melody sequence for a character
  public playCharacterTheme(style: string) {
    if (this.isMuted) return;
    this.init(); // safety check
    
    if (!this.ctx) return;
    
    // Resume context if suspended (browser requirements)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.log("Audio resume failed:", err));
    }

    const now = this.ctx.currentTime;

    // A helper to play a single synthesized note with distinct synth engines
    const playNote = (
      freq: number, 
      startTime: number, 
      duration: number, 
      type: OscillatorType = 'triangle', 
      pitchSlideTo?: number,
      volMaxOffset = 1
    ) => {
      if (!this.ctx || !this.masterVolume) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      if (pitchSlideTo) {
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(pitchSlideTo, startTime + duration);
      }

      // Master delay / space effect simulation
      const delay = this.ctx.createDelay();
      const feedback = this.ctx.createGain();
      delay.delayTime.setValueAtTime(0.32, startTime);
      feedback.gain.setValueAtTime(0.35, startTime);

      filter.type = 'lowpass';
      // Mellow out or brighten based on type
      filter.frequency.setValueAtTime(type === 'sawtooth' ? 1200 : 2500, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.15 * volMaxOffset, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterVolume);

      // Connect to delay for spatial magic
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(this.masterVolume);

      osc.start(startTime);
      osc.stop(startTime + duration + 1);
    };

    switch (style) {
      case 'luffy': {
        // Cheerful major arpeggio, bouncy feel
        const notes = [261.63, 329.63, 392.00, 523.25, 493.88, 392.00]; // C E G C5 B G
        notes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.12, 0.25, 'triangle', undefined, 1.2);
        });
        break;
      }
      case 'eragon': {
        // Epic mystic rider theme
        const notes = [293.66, 349.23, 440.00, 587.33, 523.25]; // D4 F4 A4 D5 C5
        notes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.22, 0.45, 'sine', undefined, 1.4);
        });
        break;
      }
      case 'ben': {
        // Omnitrix futuristic sci-fi synth arpeggio
        const seq = [329.63, 415.30, 493.88, 659.25]; // E4 G#4 B4 E5 rapid tech chirp
        seq.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.08, 0.15, 'square', fq * 1.1, 0.8);
        });
        break;
      }
      case 'koro': {
        // Playful, wiggly smiley pitch modulation
        const notes = [392.00, 440.00, 493.88, 587.33];
        notes.forEach((fq, idx) => {
          // Slide upwards like a tentacle wiggle
          playNote(fq, now + idx * 0.15, 0.22, 'triangle', fq * 1.5, 1.2);
        });
        break;
      }
      case 'ayanokoji': {
        // Quiet analytical ticking notes, cold and clean
        const notes = [440.00, 415.30, 440.00, 392.00]; // A4 G#4 A4 G4
        notes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.3, 0.18, 'sine', undefined, 0.9);
        });
        break;
      }
      case 'spiderman': {
        // Energetic hero theme jumping up octaves
        const notes = [261.63, 523.25, 349.23, 698.46, 392.00]; 
        notes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.15, 0.28, 'sawtooth', undefined, 0.9);
        });
        break;
      }
      case 'batman': {
        // Deep gothic brass/organ chord sequence
        const lowNotes = [110.00, 103.83, 110.00, 87.31]; // A2 Ab2 A2 F2
        lowNotes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.4, 0.7, 'sawtooth', undefined, 1.4);
          playNote(fq * 2, now + idx * 0.4, 0.6, 'sine', undefined, 1.0);
        });
        break;
      }
      case 'robin': {
        // Fast dynamic alarm chime "Titans go"
        const notes = [329.63, 349.23, 392.00, 523.25];
        notes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.1, 0.2, 'square', undefined, 1.0);
        });
        break;
      }
      case 'krishna': {
        // Flutelike divine pentatonic Mohanam ascend
        // S - R - G - P - D - S
        const flutes = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 440.00]; // D4 E4 F#4 A4 B4 D5 A4 beautiful divine path
        flutes.forEach((fq, idx) => {
          // Soft slow glide like bamboo flute
          playNote(fq, now + idx * 0.24, 0.55, 'sine', fq * 1.01, 1.6);
        });
        break;
      }
      case 'tomjerry': {
        // Whimsical comedic high pitches slipping back and forth
        const slides = [587.33, 493.88, 523.25, 349.23];
        slides.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.14, 0.25, 'triangle', fq * 0.7, 1.2);
        });
        break;
      }
      case 'bean': {
        // Clunky simple funny tune with Teddy
        const beanNotes = [261.63, 293.66, 329.63, 261.63, 329.63];
        beanNotes.forEach((fq, idx) => {
          playNote(fq, now + idx * 0.2, 0.35, 'triangle', undefined, 1.1);
        });
        break;
      }
      default:
        // Soft standard sparkles
        playNote(523.25, now, 0.4, 'sine');
        break;
    }
  }

  // Sparkly celebration sound trigger for the grand finale
  public playGrandFinale() {
    if (this.isMuted) return;
    this.init();

    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.log("Audio resume failed:", err));
    }

    const now = this.ctx.currentTime;
    
    // Play a massive shimmering glissando / golden chords burst
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale shimmering upwards
    chord.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);
      
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(100, now);

      gain.gain.setValueAtTime(0.001, now + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.05 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterVolume!);

      osc.start(now + index * 0.05);
      osc.stop(now + 3.0);
    });

    // Epic background chime loop
    for (let i = 0; i < 12; i++) {
      const randomFreq = 500 + Math.random() * 800;
      const delay = 0.2 + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(randomFreq, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);

      osc.connect(gain);
      gain.connect(this.masterVolume!);

      osc.start(now + delay);
      osc.stop(now + delay + 1);
    }
  }
}

export const audio = new AudioManager();
