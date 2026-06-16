"use client";

/**
 * Toolkit de audio sintetizado (Web Audio API) REUTILIZABLE por los labs 3D.
 *
 * NO usa archivos de audio ni dependencias externas: todo el sonido se genera
 * por código (osciladores + ruido filtrado), así que no infla el bundle del
 * Worker. Es client-only y el AudioContext se crea/reanuda tras un gesto del
 * usuario (al activar el sonido), respetando la política de autoplay.
 *
 * A diferencia de destilacion-audio.ts (específico de la destilación), esta
 * clase ofrece un repertorio de efectos genéricos que cualquier laboratorio de
 * química/física puede combinar: fuego, burbujeo, vapor, goteo, rotura de
 * vidrio y los avisos de respuesta correcta / incorrecta.
 */

export class LabSfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  /** Bucles continuos basados en ruido (fuego, vapor, burbujeo). */
  private loops = new Map<string, { gain: GainNode; nodes: AudioScheduledSourceNode[] }>();
  /** Temporizadores que disparan one-shots repetidos (crepitar, blips, gotas). */
  private timers = new Map<string, ReturnType<typeof setInterval>>();

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

  /* ── helpers de bucles ──────────────────────────────────────────────── */
  private startLoop(key: string, level: number, build: (ctx: AudioContext, out: GainNode) => AudioScheduledSourceNode[]) {
    if (this.loops.has(key) || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(this.master);
    const nodes = build(ctx, gain);
    gain.gain.setTargetAtTime(level, ctx.currentTime, 0.25);
    this.loops.set(key, { gain, nodes });
  }

  private endLoop(key: string) {
    this.clearTimer(key);
    const l = this.loops.get(key);
    if (!l || !this.ctx) return;
    const ctx = this.ctx;
    l.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
    const stopAt = ctx.currentTime + 0.5;
    for (const n of l.nodes) {
      try {
        n.stop(stopAt);
      } catch {
        /* nodo ya detenido */
      }
    }
    this.loops.delete(key);
  }

  private setTimer(key: string, fn: () => void, ms: number) {
    this.clearTimer(key);
    this.timers.set(key, setInterval(fn, ms));
  }

  private clearTimer(key: string) {
    const t = this.timers.get(key);
    if (t) {
      clearInterval(t);
      this.timers.delete(key);
    }
  }

  /* ── bucles continuos ───────────────────────────────────────────────── */

  /** Crepitar del fuego: rumor grave continuo + chasquidos aleatorios. */
  fuego(on: boolean) {
    if (on) {
      this.startLoop("fuego", 0.13, (ctx, out) => {
        const src = this.noiseSource();
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 720;
        src.connect(lp).connect(out);
        return [src];
      });
      this.setTimer("fuego", () => {
        if (Math.random() < 0.7) this.chispa();
      }, 130);
    } else {
      this.endLoop("fuego");
    }
  }

  /** Siseo del vapor (ruido en banda aguda y suave). */
  vapor(on: boolean) {
    if (on) {
      this.startLoop("vapor", 0.085, (ctx, out) => {
        const src = this.noiseSource();
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 3200;
        bp.Q.value = 0.5;
        src.connect(bp).connect(out);
        return [src];
      });
    } else {
      this.endLoop("vapor");
    }
  }

  /** Efervescencia: ruido en banda con trémolo + pequeños "plop" de burbuja. */
  burbujas(on: boolean) {
    if (on) {
      this.startLoop("burbujas", 0.1, (ctx, out) => {
        const src = this.noiseSource();
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 700;
        bp.Q.value = 1.2;
        const trem = ctx.createGain();
        trem.gain.value = 0.5;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = 11;
        const lg = ctx.createGain();
        lg.gain.value = 0.45;
        lfo.connect(lg).connect(trem.gain);
        src.connect(bp).connect(trem).connect(out);
        lfo.start();
        return [src, lfo];
      });
      this.setTimer("burbujas", () => {
        if (Math.random() < 0.8) this.blip();
      }, 95);
    } else {
      this.endLoop("burbujas");
    }
  }

  /** Goteo continuo (p. ej. el hielo que se funde). */
  gotas(on: boolean) {
    if (on) {
      if (this.timers.has("gotas")) return;
      this.setTimer("gotas", () => {
        if (Math.random() < 0.5) this.gota();
      }, 540);
    } else {
      this.clearTimer("gotas");
    }
  }

  /* ── one-shots ──────────────────────────────────────────────────────── */

  /** Chasquido del fuego (ráfaga corta de ruido agudo). */
  chispa() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const src = this.noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2100;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.05);
    src.connect(hp).connect(g).connect(this.master);
    try {
      src.stop(t + 0.16);
    } catch {
      /* nodo ya detenido */
    }
  }

  /** Plop de una burbuja (sine con barrido ascendente rápido). */
  blip() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    const g = ctx.createGain();
    const t = ctx.currentTime;
    const f = 380 + Math.random() * 900;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.8, t + 0.04);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(t + 0.09);
  }

  /** Una gota cayendo (ping con caída de tono). */
  gota() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sine";
    const g = ctx.createGain();
    const f0 = 900 + Math.random() * 500;
    o.frequency.setValueAtTime(f0, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.4, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  }

  /** Rotura de vidrio: ráfaga de ruido agudo + tintineos dispersos. */
  romper() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const src = this.noiseSource();
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2500;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    src.connect(hp).connect(g).connect(this.master);
    try {
      src.stop(t + 0.45);
    } catch {
      /* nodo ya detenido */
    }
    for (let i = 0; i < 5; i++) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      const og = ctx.createGain();
      const tt = t + 0.02 + Math.random() * 0.25;
      const f = 2000 + Math.random() * 3000;
      o.frequency.setValueAtTime(f, tt);
      og.gain.setValueAtTime(0.0001, tt);
      og.gain.exponentialRampToValueAtTime(0.08, tt + 0.005);
      og.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12);
      o.connect(og).connect(this.master);
      o.start(tt);
      o.stop(tt + 0.14);
    }
  }

  /** Aviso de respuesta correcta (dos notas ascendentes). */
  correcto() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    [660, 990].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      const g = ctx.createGain();
      const t = ctx.currentTime + i * 0.09;
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(this.master!);
      o.start(t);
      o.stop(t + 0.26);
    });
  }

  /** Aviso de respuesta incorrecta (zumbido grave descendente). */
  incorrecto() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(lp).connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.36);
  }

  dispose() {
    for (const key of Array.from(this.timers.keys())) this.clearTimer(key);
    for (const key of Array.from(this.loops.keys())) this.endLoop(key);
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
  }
}
