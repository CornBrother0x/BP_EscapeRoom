/**
 * All sound is synthesized in WebAudio — square-wave UI bleeps in the spirit
 * of the era, an ambient machine hum, and a composed 56k modem handshake for
 * the finale. No audio files shipped. M toggles mute (master gain).
 */

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type SoundKind = 'click' | 'error' | 'chime' | 'derez';

const DTMF: Record<string, [number, number]> = {
  '0': [941, 1336],
  '1': [697, 1209],
  '5': [770, 1336],
  '9': [852, 1477],
};

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private humStarted = false;
  private readonly fileBuffers = new Map<string, AudioBuffer>();
  private readonly filePromises = new Map<string, Promise<ArrayBuffer>>();
  private music: AudioBufferSourceNode | null = null;

  /** Lazily create the context — must first be called from a user gesture. */
  private ensure(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        this.master.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  toggleMuted(): boolean {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }

  private tone(
    freq: number,
    startIn: number,
    duration: number,
    type: OscillatorType = 'square',
    gain = 0.08,
  ): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + startIn;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private noise(startIn: number, duration: number, gain = 0.06, filterFreq = 2000): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + startIn;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.linearRampToValueAtTime(0.001, t + duration);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
  }

  play(kind: SoundKind): void {
    switch (kind) {
      case 'click':
        this.tone(880, 0, 0.035, 'square', 0.04);
        break;
      case 'error':
        this.tone(220, 0, 0.12);
        this.tone(160, 0.13, 0.18);
        break;
      case 'chime':
        this.tone(523, 0, 0.12, 'sine', 0.1);
        this.tone(659, 0.09, 0.12, 'sine', 0.1);
        this.tone(784, 0.18, 0.2, 'sine', 0.1);
        break;
      case 'derez':
        this.noise(0, 0.6, 0.09, 900);
        this.tone(400, 0, 0.5, 'sawtooth', 0.05);
        break;
    }
  }

  /**
   * Defrag progress: each completed row adds the next note of a C-major
   * chord (root → third → fifth → octave), so the puzzle "builds" a chord.
   */
  defragStep(step: number): void {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    const f = chord[Math.min(step, chord.length - 1)];
    this.tone(f, 0, 0.55, 'sine', 0.14);
    this.tone(f * 2, 0.02, 0.4, 'triangle', 0.04); // shimmer
  }

  /** The full resolve when the whole disk is defragged. */
  defragComplete(): void {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((f, i) => this.tone(f, i * 0.1, 0.7, 'sine', 0.12));
    // ring out the triad
    for (const f of [523.25, 659.25, 783.99]) this.tone(f, 0.55, 1.4, 'sine', 0.06);
  }

  /** Very soft looping background music (through master, so M mutes it too). */
  async startMusicLoop(url: string, gain = 0.09): Promise<void> {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.music) return;
    try {
      let buf = this.fileBuffers.get(url);
      if (!buf) {
        this.preloadFile(url);
        const raw = await this.filePromises.get(url);
        if (!raw) return;
        buf = await ctx.decodeAudioData(raw.slice(0));
        this.fileBuffers.set(url, buf);
      }
      if (this.music) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(g).connect(this.master);
      src.start();
      this.music = src;
    } catch {
      /* music is non-essential */
    }
  }

  /** Stop the background music (e.g. when the finale dial-up begins). */
  stopMusic(): void {
    if (this.music) {
      try {
        this.music.stop();
      } catch {
        /* already stopped */
      }
      this.music = null;
    }
  }

  /** Quiet machine-room hum, forever. */
  startHum(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.humStarted) return;
    this.humStarted = true;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 58;
    const g = ctx.createGain();
    g.gain.value = 0.014;
    osc.connect(g).connect(this.master);
    osc.start();
  }

  /** Start fetching a file early so playback is instant when asked for. */
  preloadFile(url: string): void {
    if (!this.filePromises.has(url)) {
      this.filePromises.set(
        url,
        fetch(url).then((r) => {
          if (!r.ok) throw new Error(`audio fetch failed: ${url}`);
          return r.arrayBuffer();
        }),
      );
    }
  }

  /** Play an audio file through the master gain (mute applies). */
  async playFile(url: string): Promise<boolean> {
    const ctx = this.ensure();
    if (!ctx || !this.master) return false;
    try {
      let buffer = this.fileBuffers.get(url);
      if (!buffer) {
        this.preloadFile(url);
        const raw = await this.filePromises.get(url);
        if (!raw) return false;
        buffer = await ctx.decodeAudioData(raw.slice(0));
        this.fileBuffers.set(url, buffer);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.master);
      src.start();
      return true;
    } catch {
      return false;
    }
  }

  /** The real 75-second 56k screech; synthesized fallback if it fails. */
  async playDialup(): Promise<void> {
    const ok = await this.playFile('/audio/dialup.mp3');
    if (!ok) await this.handshake();
  }

  /** The victory fanfare of a generation: dial tone, DTMF, carrier, static. */
  async handshake(): Promise<void> {
    const ctx = this.ensure();
    if (!ctx || !this.master) {
      await sleep(4200);
      return;
    }
    // Dial tone
    this.tone(350, 0, 0.7, 'sine', 0.07);
    this.tone(440, 0, 0.7, 'sine', 0.07);
    // DTMF: 555-0195
    const digits = '5550195';
    [...digits].forEach((d, i) => {
      const pair = DTMF[d];
      if (!pair) return;
      const at = 0.85 + i * 0.14;
      this.tone(pair[0], at, 0.09, 'sine', 0.07);
      this.tone(pair[1], at, 0.09, 'sine', 0.07);
    });
    // Carrier negotiation chirps
    for (let i = 0; i < 8; i++) {
      this.tone(i % 2 === 0 ? 1300 : 2100, 2.0 + i * 0.09, 0.08, 'square', 0.045);
    }
    // Warble + static burst
    this.tone(980, 2.8, 0.5, 'sawtooth', 0.04);
    this.tone(1750, 3.0, 0.5, 'sawtooth', 0.04);
    this.noise(3.3, 1.3, 0.075, 2400);
    await sleep(4600);
  }
}
