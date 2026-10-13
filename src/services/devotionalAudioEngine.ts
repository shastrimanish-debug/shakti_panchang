// Web Audio API Meditative Tanpura, Temple Bell & Harmonium Engine

class DevotionalAudioEngine {
  private ctx: AudioContext | null = null;
  private tanpuraInterval: number | null = null;
  private harmoniumOsc: OscillatorNode | null = null;
  private harmoniumGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a resonant Temple Bell sound
   */
  playTempleBell(freq = 880) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, now + 3.0);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.0);
    } catch (e) {
      console.warn('Temple bell audio exception:', e);
    }
  }

  /**
   * Starts meditative 4-string Tanpura strumming (Sa-Pa-Sa-Sa)
   */
  startTanpuraDrone() {
    this.stopTanpuraDrone();
    this.initCtx();
    if (!this.ctx) return;

    this.isRunning = true;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Harmonium Root Reed
    try {
      this.harmoniumOsc = this.ctx.createOscillator();
      this.harmoniumGain = this.ctx.createGain();

      this.harmoniumOsc.type = 'triangle';
      this.harmoniumOsc.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3 / Sa

      // Low pass filter for warm reed tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      this.harmoniumGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.harmoniumOsc.connect(filter);
      filter.connect(this.harmoniumGain);
      this.harmoniumGain.connect(this.masterGain);

      this.harmoniumOsc.start();
    } catch {
      // Ignore
    }

    // Tanpura String Plucking Cycle (Pa - Sa - Sa - Low Sa)
    // Frequencies for C# tuning: Pa (196Hz), Sa (261.63Hz), Low Sa (130.81Hz)
    const stringFreqs = [196.0, 261.63, 261.63, 130.81];
    let stringIdx = 0;

    const pluckString = () => {
      if (!this.isRunning || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const freq = stringFreqs[stringIdx % 4];

        const stringOsc = this.ctx.createOscillator();
        const stringGain = this.ctx.createGain();

        stringOsc.type = 'sawtooth';
        stringOsc.frequency.setValueAtTime(freq, now);

        // Tanpura jawari harmonic filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 2, now);
        filter.Q.setValueAtTime(2, now);

        stringGain.gain.setValueAtTime(0.12, now);
        stringGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        stringOsc.connect(filter);
        filter.connect(stringGain);
        if (this.masterGain) stringGain.connect(this.masterGain);

        stringOsc.start(now);
        stringOsc.stop(now + 2.5);

        stringIdx++;
      } catch {
        // Ignore
      }
    };

    // Initial Pluck
    pluckString();
    this.tanpuraInterval = window.setInterval(pluckString, 800);
  }

  /**
   * Stops Tanpura & Harmonium drone
   */
  stopTanpuraDrone() {
    this.isRunning = false;
    if (this.tanpuraInterval !== null) {
      clearInterval(this.tanpuraInterval);
      this.tanpuraInterval = null;
    }
    if (this.harmoniumOsc) {
      try {
        this.harmoniumOsc.stop();
      } catch {
        // Ignore
      }
      this.harmoniumOsc = null;
    }
  }
}

export const devotionalAudioEngine = new DevotionalAudioEngine();
