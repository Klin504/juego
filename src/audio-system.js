/**
 * audio-system.js
 * Sistema de sonido Web Audio API con síntesis procedural 16-bit,
 * control de silencio/volumen y equivalentes visuales completos.
 * Fase 3.5 según contratos 1.6, 1.7 y PLAN_DESARROLLO.md.
 */

export class AudioSystem {
  #ctx = null;
  #enabled = true;
  #volume = 0.6;
  #masterGain = null;

  constructor({ enabled = true, volume = 0.6 } = {}) {
    this.#enabled = enabled;
    this.#volume = volume;
  }

  get enabled() {
    return this.#enabled;
  }

  get volume() {
    return this.#volume;
  }

  toggleEnabled() {
    this.#enabled = !this.#enabled;
    if (this.#masterGain && this.#ctx) {
      this.#masterGain.gain.setValueAtTime(this.#enabled ? this.#volume : 0, this.#ctx.currentTime);
    }
    return this.#enabled;
  }

  setEnabled(enabled) {
    this.#enabled = Boolean(enabled);
    if (this.#masterGain && this.#ctx) {
      this.#masterGain.gain.setValueAtTime(this.#enabled ? this.#volume : 0, this.#ctx.currentTime);
    }
  }

  setVolume(volume) {
    this.#volume = Math.max(0, Math.min(1, Number(volume) || 0));
    if (this.#masterGain && this.#ctx && this.#enabled) {
      this.#masterGain.gain.setValueAtTime(this.#volume, this.#ctx.currentTime);
    }
  }

  #ensureContext() {
    if (!this.#enabled) return null;
    try {
      if (!this.#ctx) {
        const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioCtx) return null;
        this.#ctx = new AudioCtx();
        this.#masterGain = this.#ctx.createGain();
        this.#masterGain.gain.setValueAtTime(this.#enabled ? this.#volume : 0, this.#ctx.currentTime);
        this.#masterGain.connect(this.#ctx.destination);
      }
      if (this.#ctx.state === "suspended") {
        this.#ctx.resume().catch(() => {});
      }
      return this.#ctx;
    } catch {
      return null;
    }
  }

  playScreenChanged() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playTone(ctx, 440, 0.05, "sine", 0.15);
  }

  playMenuConfirm() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playArpeggio(ctx, [523.25, 659.25], 0.08, "triangle", 0.2);
  }

  playWarning(category = "frontal") {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    const baseFreq = category === "sweep" ? 220 : category === "sensor" ? 330 : category === "projectile" ? 550 : 440;
    this.#playTone(ctx, baseFreq, 0.14, "sawtooth", 0.25);
  }

  playAttackHit() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playNoiseBurst(ctx, 0.08, 0.3);
  }

  playPlayerJump() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playSweep(ctx, 220, 440, 0.12, "square", 0.18);
  }

  playPlayerLand() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playTone(ctx, 110, 0.06, "triangle", 0.2);
  }

  playSpecial() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playArpeggio(ctx, [440, 554.37, 659.25, 880], 0.06, "square", 0.25);
  }

  playAttackCancelled() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playSweep(ctx, 660, 220, 0.1, "sawtooth", 0.22);
  }

  playVisorRevealed() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    // Tono ascendente brillante de la brújula
    this.#playArpeggio(ctx, [587.33, 739.99, 880, 1174.66], 0.07, "sine", 0.28);
  }

  playPhaseChanged() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    // Motivo dramático para NULL fase 2
    this.#playArpeggio(ctx, [293.66, 311.13, 293.66, 440], 0.12, "sawtooth", 0.3);
  }

  playFightWon() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playArpeggio(ctx, [523.25, 659.25, 783.99, 1046.5], 0.14, "triangle", 0.35);
  }

  playFightLost() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playArpeggio(ctx, [440, 415.3, 392.0, 369.99], 0.18, "sawtooth", 0.28);
  }

  playPause() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playTone(ctx, 330, 0.06, "sine", 0.15);
  }

  playResume() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playTone(ctx, 550, 0.06, "sine", 0.15);
  }

  #playTone(ctx, freq, duration, type, gainLevel) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.#masterGain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  #playSweep(ctx, startFreq, endFreq, duration, type, gainLevel) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), ctx.currentTime + duration);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.#masterGain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  #playArpeggio(ctx, freqs, noteDuration, type, gainLevel) {
    try {
      freqs.forEach((freq, index) => {
        const startTime = ctx.currentTime + index * noteDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(gainLevel, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
        osc.connect(gain);
        gain.connect(this.#masterGain);
        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {}
  }

  #playNoiseBurst(ctx, duration, gainLevel) {
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      noise.connect(gain);
      gain.connect(this.#masterGain);
      noise.start();
    } catch {}
  }
}
