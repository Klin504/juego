/** Configura las fases y ataques de Vera. */

import { BOSS_MAX_HP } from "./combat-config.js";

// El patrón describe aviso, daño y recuperación; Vera añade el trayecto al ejecutarlo.
export const VERA_BALL_ATTACK = Object.freeze({
  patternId: "VERA_BALL",
  name: "Bote de retorno",
  kind: "projectile",
  shape: "circle",
  damage: 18,
  startupSec: 0.66,
  activeSec: 0.01, // PROVISIONAL: ventana mínima para emitir el proyectil; su viaje sigue independiente hasta salir.
  recoverySec: 0.5,
  category: "lowProjectile",
  ai: Object.freeze({ range: "far", weight: 1.05, countersSpecial: true }),
  comboFollowUpIds: Object.freeze(["VERA_RUN"]),
  comboChance: 0.4,
});

export const VERA_RUN_ATTACK = Object.freeze({
  patternId: "VERA_RUN",
  name: "Carrera de línea",
  kind: "sweep",
  shape: "rectangle",
  damage: 23,
  startupSec: 0.76,
  activeSec: 0.36,
  recoverySec: 0.56,
  category: "groundSweep",
  ai: Object.freeze({ range: "close", weight: 1, countersGuard: true, countersApproach: true, countersAttack: true }),
  comboFollowUpIds: Object.freeze(["VERA_BALL", "VERA_AIR_PASS"]),
  comboChance: 0.44,
});

export const VERA_AIR_PASS_ATTACK = Object.freeze({
  patternId: "VERA_AIR_PASS",
  name: "Pase a media altura",
  kind: "projectile",
  shape: "rectangle",
  damage: 21,
  startupSec: 0.76,
  activeSec: 0.01,
  recoverySec: 0.55,
  category: "highProjectile",
  ai: Object.freeze({ range: "far", weight: 0.82, countersJump: true, countersSpecial: true }),
});

export const VERA_POWER_SPIKE_ATTACK = Object.freeze({
  patternId: "VERA_POWER_SPIKE",
  name: "Remate de línea",
  kind: "melee",
  shape: "rectangle",
  damage: 25,
  width: 164,
  height: 94,
  offsetX: 0,
  offsetY: -96,
  startupSec: 0.72,
  activeSec: 0.2,
  recoverySec: 0.62,
  category: "frontal",
  breaksGuard: true,
  ai: Object.freeze({ range: "close", weight: 0.92, countersGuard: true, countersApproach: true, countersSpecial: true }),
});

// Controla cómo Vera mantiene distancia, esquiva y enlaza jugadas.
const VERA_AI = Object.freeze({
  leftBoundX: 118,
  rightBoundX: 842,
  minRangePx: 132,
  maxRangePx: 246,
  moveSpeedPxPerSec: 110,
  dodgeDistancePx: 132,
  dodgeSpeedPxPerSec: 820,
  dodgeDurationSec: 0.15,
  dodgeCooldownSec: 0.8,
  dodgeChance: 0.7,
  dodgeRecoveryDelaySec: 0.32,
  comboChance: 0.4,
  comboDelaySec: 0.28,
  comboDamageMultiplier: 1.25,
  intervalJitterSec: 0.16,
});

// La fase posterior agrega un remate y reduce la pausa entre patrones.
const VERA_PHASE_ONE = Object.freeze({
  name: "Fase 1 · Control de cancha",
  transitionAtHp: 82,
  interAttackDelaySec: 1.25,
  attacks: Object.freeze([VERA_BALL_ATTACK, VERA_RUN_ATTACK, VERA_AIR_PASS_ATTACK]),
});

const VERA_PHASE_TWO = Object.freeze({
  name: "Fase 2 · Remate de línea",
  interAttackDelaySec: 0.74,
  attacks: Object.freeze([VERA_BALL_ATTACK, VERA_RUN_ATTACK, VERA_AIR_PASS_ATTACK, VERA_POWER_SPIKE_ATTACK]),
});

export const VERA_DATA = Object.freeze({
  id: "vera",
  bossId: "vera",
  name: "Vera",
  maxHp: BOSS_MAX_HP.vera,
  bodyBox: Object.freeze({ width: 44, height: 88 }),
  hurtBox: Object.freeze({ width: 40, height: 82 }),
  x: 750,
  y: 430,
  facing: -1,
  initialDelaySec: 0.95,
  interAttackDelaySec: 1.25,
  hurtFlashSec: 0.12, // PROVISIONAL: duración visual del estado herido.
  court: Object.freeze({ left: 98, right: 862, groundY: 430, lineTop: 400, runStartX: 98, runEndX: 862 }),
  projectile: Object.freeze({
    width: 24,
    height: 24,
    radius: 12,
    speedPxPerSec: 260,
    routeLeftX: 110,
    routeRightX: 850,
    centerY: 412,
    behavior: "court-return",
  }),
  airProjectile: Object.freeze({
    width: 22,
    height: 18,
    speedPxPerSec: 310,
    lifetimeSec: 3.2,
  }),
  attacks: Object.freeze([VERA_BALL_ATTACK, VERA_RUN_ATTACK, VERA_AIR_PASS_ATTACK]),
  phases: Object.freeze([VERA_PHASE_ONE, VERA_PHASE_TWO]),
  ai: VERA_AI,
});
