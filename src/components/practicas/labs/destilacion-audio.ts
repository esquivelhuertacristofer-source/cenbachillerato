"use client";

/**
 * Audio sintetizado (Web Audio API) para el laboratorio 3D de destilación.
 *
 * NO usa archivos de audio ni dependencias externas: todo el sonido se genera
 * por código (osciladores + ruido filtrado), así que no infla el bundle del
 * Worker. Es client-only y el AudioContext se crea/reanuda tras un gesto del
 * usuario (al activar el sonido), respetando la política de autoplay.
 *
 * Sonidos: ebullición (ruido en banda modulado), llama del mechero (ruido
 * grave continuo), goteo del condensado (ping con caída) y la explosión.
 */

type FlameLevel = "off" | "baja" | "media" | "alta";

export class LabAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private boil: { gain: GainNode; lfo: OscillatorNode; src: AudioBufferSourceNode } | null = null;
  private flame: { gain: GainNode; src: AudioBufferSourceNode } | null = null;
  private dripTimer: ReturnType<typeof setInterval> | null = null;

  /** Crea el contexto y un buffer de ruido marrón reutilizable (perezoso). */
  private setup(): AudioContext {
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02; // integra → ruido marrón aprox.
      d[i] = last * 3.2;
    }

    this.ctx = ctx;
    this.master = master;
    this.noiseBuf = buf;
    return ctx;
  }

  /** Activa (reanuda) el audio y sube el volumen maestro. */
  async enable() {
    const ctx = this.setup();
    if (ctx.state === "suspended") await ctx.resume();
    this.master?.gain.setTargetAtTime(0.5, ctx.currentTime, 0.05);
  }

  /** Silencia sin destruir los nodos (toggle rápido). */
  mute() {
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
  }

  private noiseSource(): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    src.start();
    return src;
  }

  /** Burbujeo continuo de ebullición (ruido en banda con tremolo lento). */
  setBoiling(on: boolean) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    if (on && !this.boil) {
      const src = this.noiseSource();
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 520;
      bp.Q.value = 0.9;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 7;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.16;
      lfo.connect(lfoGain).connect(gain.gain);
      gain.gain.setTargetAtTime(0.18, ctx.currentTime, 0.3);
      src.connect(bp).connect(gain).connect(this.master);
      lfo.start();
      this.boil = { gain, lfo, src };
    } else if (!on && this.boil) {
      const b = this.boil;
      b.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      const stopAt = ctx.currentTime + 0.6;
      try {
        b.src.stop(stopAt);
        b.lfo.stop(stopAt);
      } catch {
        /* nodo ya detenido */
      }
      this.boil = null;
    }
  }

  /** Soplido grave de la llama, más fuerte cuanto mayor la intensidad. */
  setFlame(level: FlameLevel) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const target = level === "alta" ? 0.12 : level === "media" ? 0.08 : level === "baja" ? 0.045 : 0;
    if (target > 0 && !this.flame) {
      const src = this.noiseSource();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      src.connect(lp).connect(gain).connect(this.master);
      this.flame = { gain, src };
    }
    if (this.flame) {
      this.flame.gain.gain.setTargetAtTime(Math.max(0.0001, target), ctx.currentTime, 0.2);
      if (target === 0) {
        const f = this.flame;
        try {
          f.src.stop(ctx.currentTime + 0.5);
        } catch {
          /* nodo ya detenido */
        }
        this.flame = null;
      }
    }
  }

  /** Una gota de condensado cayendo (ping con caída de tono). */
  drip() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    const g = ctx.createGain();
    const f0 = 900 + Math.random() * 500;
    o.frequency.setValueAtTime(f0, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.4, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  }

  startDrips() {
    if (this.dripTimer) return;
    this.dripTimer = setInterval(() => {
      if (Math.random() < 0.6) this.drip();
    }, 480);
  }

  stopDrips() {
    if (this.dripTimer) {
      clearInterval(this.dripTimer);
      this.dripTimer = null;
    }
  }

  /** Estallido del matraz: ráfaga de ruido con barrido grave + golpe sub. */
  explosion() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const src = this.noiseSource();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1800, ctx.currentTime);
    lp.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    src.connect(lp).connect(g).connect(this.master);
    try {
      src.stop(ctx.currentTime + 1.0);
    } catch {
      /* nodo ya detenido */
    }
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(90, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.5);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.5, ctx.currentTime);
    og.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.connect(og).connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.7);
  }

  dispose() {
    this.stopDrips();
    try {
      this.setBoiling(false);
      this.setFlame("off");
    } catch {
      /* noop */
    }
    if (this.ctx) {
      try {
        void this.ctx.close();
      } catch {
        /* noop */
      }
    }
    this.ctx = null;
    this.master = null;
    this.noiseBuf = null;
    this.boil = null;
    this.flame = null;
  }
}
