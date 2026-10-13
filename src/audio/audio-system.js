/**
 * audio-system.js
 * Sistema de sonido Web Audio API con síntesis procedural 16-bit,
 * control de silencio/volumen y equivalentes visuales completos.
 * Fase 3.5 según contratos 1.6, 1.7 y PLAN_DESARROLLO.md.
 */

// Cada escena tiene tempo y secuencias de notas para la música sintetizada.
const SCORES = Object.freeze({
  menu: { bpm: 98, root: 45, lead: [12, null, 16, null, 19, null, 16, null, 12, null, 14, null, 16, null, 7, null], bass: [0, null, null, null, -5, null, null, null, -7, null, null, null, -5, null, null, null] },
  select: { bpm: 112, root: 48, lead: [12, 16, 19, null, 16, null, 12, null, 14, 17, 21, null, 19, null, 16, null], bass: [0, null, null, null, 5, null, null, null, 7, null, null, null, 5, null, null, null] },
  intro: { bpm: 86, root: 43, lead: [12, null, null, 15, null, null, 19, null, 17, null, null, 15, null, 12, null, null], bass: [0, null, null, null, -2, null, null, null, -5, null, null, null, -2, null, null, null] },
  combat: { bpm: 154, root: 40, lead: [12, null, 15, 12, 19, null, 15, null, 12, null, 17, 15, 19, null, 22, null], bass: [0, null, 0, null, -3, null, -3, null, -5, null, -5, null, -3, null, 0, null], drums: true },
  boss: { bpm: 174, root: 38, lead: [12, null, 13, 19, 12, null, 24, null, 13, null, 12, 10, 7, null, 13, null], bass: [0, null, 0, null, -1, null, -1, null, -5, null, -5, null, -1, null, -1, null], drums: true },
  victory: { bpm: 128, root: 48, lead: [12, 16, 19, 24, 21, 19, 16, null, 17, 21, 24, 28, 24, 21, 19, null], bass: [0, null, null, null, 5, null, null, null, 7, null, null, null, 5, null, null, null] },
  defeat: { bpm: 78, root: 45, lead: [12, null, 11, null, 9, null, 7, null, 5, null, 4, null, 2, null, 0, null], bass: [0, null, null, null, -2, null, null, null, -5, null, null, null, -7, null, null, null] },
  archive: { bpm: 70, root: 43, lead: [12, null, null, null, 19, null, null, null, 17, null, null, null, 15, null, null, null], bass: [0, null, null, null, -5, null, null, null, -2, null, null, null, -5, null, null, null] },
});

// Traduce los nombres de pantallas del juego a una pista musical compartida.
const SCENE_ALIASES = Object.freeze({
  howToPlay: "menu", selectFighter: "select", levelIntro: "intro", playing: "combat", levelClear: "victory", gameOver: "defeat", paused: "pause",
  "MENÚ": "menu", "CÓMO JUGAR": "menu", "SELECCIÓN": "select", "INTRO NIVEL": "intro", "JUGANDO": "combat", "PAUSA": "pause", "GAME OVER": "defeat", "VICTORIA": "victory", "RESULTADO": "victory", "ARCHIVO": "archive",
});
const midiFrequency = (note) => 440 * 2 ** ((note - 69) / 12);

export class AudioSystem {
  #ctx = null;
  #enabled = true;
  #volume = 0.6;
  #masterGain = null;
  #musicGain = null;
  #sfxGain = null;
  #noiseBuffer = null;
  #scene = "menu";
  #scheduler = null;
  #nextStepTime = 0;
  #step = 0;
  #activeVoices = new Set();
  #hidden = false;
  #unlocked = false;
  #firstGesture;
  #visibilityListener;

  constructor({ enabled = true, volume = 0.6 } = {}) {
    this.#enabled = enabled;
    this.#volume = volume;
    this.#firstGesture = (event) => {
      if (event.isTrusted === false) return;
      this.unlock();
    };
    this.#visibilityListener = () => this.handleVisibility(!document.hidden);
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", this.#firstGesture);
      window.addEventListener("pointerdown", this.#firstGesture);
      document.addEventListener("visibilitychange", this.#visibilityListener);
    }
  }

  get enabled() {
    return this.#enabled;
  }

  get volume() {
    return this.#volume;
  }

  get scene() {
    return this.#scene;
  }

  /** Activa Web Audio tras la primera interacción real del usuario. */
  unlock() {
    if (!this.#enabled) return false;
    this.#unlocked = true;
    const ctx = this.#ensureContext();
    if (!ctx) return false;
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.#firstGesture);
      window.removeEventListener("pointerdown", this.#firstGesture);
    }
    if (ctx.state === "suspended" && !this.#hidden) {
      ctx.resume().then(() => this.#startScheduler()).catch(() => {});
    } else {
      this.#startScheduler();
    }
    return true;
  }

  /** Cambia la música asociada a la pantalla actual. */
  setScene(scene) {
    const next = SCENE_ALIASES[scene] ?? scene;
    if (next !== "pause" && !SCORES[next]) return;
    if (this.#scene === next) return;
    this.#scene = next;
    this.#step = 0;
    this.#nextStepTime = this.#ctx ? this.#ctx.currentTime + 0.05 : 0;
    if (this.#musicGain && this.#ctx) {
      const now = this.#ctx.currentTime;
      this.#musicGain.gain.cancelScheduledValues(now);
      this.#musicGain.gain.setTargetAtTime(next === "pause" ? 0 : 0.24, now, 0.045);
    }
  }

  toggleEnabled() {
    this.setEnabled(!this.#enabled);
    if (this.#enabled) this.unlock();
    return this.#enabled;
  }

  setEnabled(enabled) {
    this.#enabled = Boolean(enabled);
    if (this.#masterGain && this.#ctx) {
      this.#masterGain.gain.setTargetAtTime(this.#enabled ? this.#volume : 0, this.#ctx.currentTime, 0.015);
    }
    if (this.#enabled) this.#startScheduler();
    else this.#stopScheduler();
  }

  setVolume(volume) {
    this.#volume = Math.max(0, Math.min(1, Number(volume) || 0));
    if (this.#masterGain && this.#ctx && this.#enabled) {
      this.#masterGain.gain.setTargetAtTime(this.#volume, this.#ctx.currentTime, 0.015);
    }
  }

  handleVisibility(visible) {
    this.#hidden = !visible;
    if (!this.#ctx) return;
    if (!visible) {
      this.#stopScheduler();
      this.#ctx.suspend().catch(() => {});
    } else if (this.#enabled) {
      this.#ctx.resume().then(() => {
        this.#nextStepTime = this.#ctx.currentTime + 0.05;
        this.#startScheduler();
      }).catch(() => {});
    }
  }

  destroy() {
    this.#stopScheduler();
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", this.#firstGesture);
      window.removeEventListener("pointerdown", this.#firstGesture);
      document.removeEventListener("visibilitychange", this.#visibilityListener);
    }
    this.#ctx?.close().catch(() => {});
  }

  #ensureContext() {
    if (!this.#enabled || !this.#unlocked || this.#hidden) return null;
    try {
      if (!this.#ctx) {
        const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioCtx) return null;
        this.#ctx = new AudioCtx();
        this.#masterGain = this.#ctx.createGain();
        this.#masterGain.gain.setValueAtTime(this.#enabled ? this.#volume : 0, this.#ctx.currentTime);
        this.#musicGain = this.#ctx.createGain();
        this.#sfxGain = this.#ctx.createGain();
        this.#musicGain.gain.value = 0.24;
        this.#sfxGain.gain.value = 0.72;
        this.#musicGain.connect(this.#masterGain);
        this.#sfxGain.connect(this.#masterGain);
        this.#masterGain.connect(this.#ctx.destination);
        this.#noiseBuffer = this.#buildNoiseBuffer();
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

  playMenuMove() {
    const ctx = this.#ensureContext();
    if (ctx) this.#playTone(ctx, 660, 0.045, "square", 0.15);
  }

  playAttackStart() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playNoiseBurst(ctx, 0.06, 0.16);
    this.#playSweep(ctx, 330, 180, 0.08, "square", 0.1);
  }

  playPlayerDamage() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playNoiseBurst(ctx, 0.14, 0.28);
    this.#playSweep(ctx, 140, 60, 0.18, "sawtooth", 0.21);
  }

  playProjectile() {
    const ctx = this.#ensureContext();
    if (ctx) this.#playSweep(ctx, 540, 260, 0.12, "square", 0.13);
  }

  /** Convierte eventos de combate en efectos sonoros sin acoplar el audio a la pelea. */
  consumeCombatEvents(events, playerId) {
    for (const event of events ?? []) {
      switch (event.kind) {
        case "warningStarted": this.playWarning(event.patternId); break;
        case "attackStarted": this.playAttackStart(); break;
        case "specialActivated": this.playSpecial(); break;
        case "damageApplied":
          if (event.targetId === playerId) this.playPlayerDamage();
          else this.playAttackHit();
          break;
        case "attackCancelled": this.playAttackCancelled(); break;
        case "projectileLaunched": this.playProjectile(); break;
        case "visorRevealed": this.playVisorRevealed(); break;
        default: break;
      }
    }
  }

  playMenuConfirm() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playArpeggio(ctx, [523.25, 659.25, 783.99], 0.065, "triangle", 0.2);
  }

  playWarning(category = "frontal") {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    const warning = String(category).toLowerCase();
    const baseFreq = warning.includes("sweep") || warning.includes("jump") ? 260 : warning.includes("projectile") || warning.includes("ball") ? 550 : warning.includes("sensor") ? 330 : 440;
    this.#playTone(ctx, baseFreq, 0.14, "sawtooth", 0.25);
    this.#playTone(ctx, baseFreq * 1.5, 0.08, "square", 0.1);
  }

  playAttackHit() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playNoiseBurst(ctx, 0.12, 0.3);
    this.#playSweep(ctx, 160, 65, 0.12, "triangle", 0.23);
  }

  playPlayerJump() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playSweep(ctx, 220, 440, 0.12, "square", 0.18);
  }

  playPlayerLand() {
    const ctx = this.#ensureContext();
    if (!ctx) return;
    this.#playNoiseBurst(ctx, 0.05, 0.1);
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

  /** Inicia el temporizador musical solo cuando el audio puede reproducirse. */
  #startScheduler() {
    if (!this.#ctx || !this.#enabled || this.#hidden || this.#scheduler) return;
    this.#nextStepTime = this.#ctx.currentTime + 0.05;
    this.#scheduler = setInterval(() => this.#scheduleMusic(), 65);
    this.#scheduleMusic();
  }

  #stopScheduler() {
    if (this.#scheduler) clearInterval(this.#scheduler);
    this.#scheduler = null;
  }

  /** Programa notas un poco por adelantado para evitar cortes entre fotogramas. */
  #scheduleMusic() {
    const ctx = this.#ctx;
    const score = SCORES[this.#scene];
    if (!ctx || !this.#enabled || this.#hidden || ctx.state !== "running" || !score) return;
    if (this.#nextStepTime < ctx.currentTime) this.#nextStepTime = ctx.currentTime + 0.02;
    const beat = 60 / score.bpm / 4;
    // Programa 160 ms por adelantado para que el ritmo no dependa del dibujo.
    while (this.#nextStepTime < ctx.currentTime + 0.16) {
      const index = this.#step % 16;
      const lead = score.lead[index];
      const bass = score.bass[index];
      if (lead != null) this.#scheduleNote(this.#nextStepTime, midiFrequency(score.root + lead), beat * 0.88, "square", 0.13);
      if (bass != null) this.#scheduleNote(this.#nextStepTime, midiFrequency(score.root + bass - 12), beat * 2.5, "triangle", 0.24);
      if (score.drums) {
        if (index % 4 === 0) this.#scheduleNote(this.#nextStepTime, 82, 0.11, "sine", 0.32, 44);
        if (index % 4 === 2) this.#scheduleMusicNoise(this.#nextStepTime, 0.075, 0.14);
        if (index % 2 === 1) this.#scheduleMusicNoise(this.#nextStepTime, 0.023, 0.045);
      }
      this.#step += 1;
      this.#nextStepTime += beat;
    }
  }

  /** Crea una voz musical con entrada y salida suaves y límite de simultaneidad. */
  #scheduleNote(at, frequency, duration, type, volume, endFrequency) {
    if (this.#activeVoices.size >= 24) return;
    const oscillator = this.#ctx.createOscillator();
    const gain = this.#ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(this.#musicGain);
    this.#trackVoice(oscillator, gain);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.005);
  }

  #scheduleMusicNoise(at, duration, volume) {
    if (!this.#noiseBuffer || this.#activeVoices.size >= 24) return;
    const source = this.#ctx.createBufferSource();
    const filter = this.#ctx.createBiquadFilter();
    const gain = this.#ctx.createGain();
    source.buffer = this.#noiseBuffer;
    filter.type = "highpass";
    filter.frequency.value = 1500;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.#musicGain);
    this.#trackVoice(source, filter, gain);
    source.start(at);
    source.stop(at + duration + 0.005);
  }

  /** Desconecta osciladores y filtros al terminar para liberar recursos. */
  #trackVoice(source, ...nodes) {
    this.#activeVoices.add(source);
    source.onended = () => {
      source.disconnect();
      nodes.forEach((node) => node.disconnect());
      this.#activeVoices.delete(source);
    };
  }

  #buildNoiseBuffer() {
    const frames = Math.round(this.#ctx.sampleRate * 0.35);
    const buffer = this.#ctx.createBuffer(1, frames, this.#ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  #playTone(ctx, freq, duration, type, gainLevel) {
    try {
      if (this.#activeVoices.size >= 24) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.#sfxGain);
      this.#trackVoice(osc, gain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  #playSweep(ctx, startFreq, endFreq, duration, type, gainLevel) {
    try {
      if (this.#activeVoices.size >= 24) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), ctx.currentTime + duration);
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.#sfxGain);
      this.#trackVoice(osc, gain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  #playArpeggio(ctx, freqs, noteDuration, type, gainLevel) {
    try {
      freqs.forEach((freq, index) => {
        if (this.#activeVoices.size >= 24) return;
        const startTime = ctx.currentTime + index * noteDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(gainLevel, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
        osc.connect(gain);
        gain.connect(this.#sfxGain);
        this.#trackVoice(osc, gain);
        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {}
  }

  #playNoiseBurst(ctx, duration, gainLevel) {
    try {
      if (!this.#noiseBuffer || this.#activeVoices.size >= 24) return;
      const noise = ctx.createBufferSource();
      noise.buffer = this.#noiseBuffer;
      noise.playbackRate.value = 0.88 + Math.random() * 0.24;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2300;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.#sfxGain);
      this.#trackVoice(noise, filter, gain);
      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch {}
  }
}
