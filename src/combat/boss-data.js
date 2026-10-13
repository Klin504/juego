/** Configura a Chilo y sus patrones de combate. */

import { BOSS_MAX_HP, CHILO_WING_ATTACK } from "./combat-config.js";

// Cada patrón fija daño, tiempos y preferencias que consulta la IA del jefe.
export const CHILO_JUMP_ATTACK = Object.freeze({
  patternId: "CHILO_JUMP",
  name: "Salto anunciado",
  kind: "jump",
  shape: "circle",
  damage: 20,
  diameterPx: 112,
  startupSec: 0.8,
  activeSec: 0.24,
  recoverySec: 0.62,
  category: "landing",
  ai: Object.freeze({ range: "mid", weight: 1.1, countersApproach: true, countersAttack: true, countersSpecial: true }),
});

export const CHILO_LUNGE_ATTACK = Object.freeze({
  patternId: "CHILO_LUNGE",
  name: "Envión rompeguardia",
  kind: "melee",
  shape: "rectangle",
  damage: 22,
  width: 142,
  height: 92,
  offsetX: 0,
  offsetY: -94,
  startupSec: 0.78,
  activeSec: 0.22,
  recoverySec: 0.62,
  category: "frontal",
  breaksGuard: true,
  ai: Object.freeze({ range: "close", weight: 0.78, countersGuard: true, countersApproach: true, countersSpecial: true }),
});

export const CHILO_DIVE_ATTACK = Object.freeze({
  patternId: "CHILO_DIVE",
  name: "Picado de cresta",
  kind: "jump",
  shape: "circle",
  damage: 24,
  diameterPx: 132,
  startupSec: 0.72,
  activeSec: 0.24,
  recoverySec: 0.62,
  category: "landing",
  ai: Object.freeze({ range: "mid", weight: 0.92, countersAttack: true, countersJump: true, countersSpecial: true }),
});

// Parámetros de distancia, evasión y combos exclusivos de Chilo.
const CHILO_AI = Object.freeze({
  leftBoundX: 108,
  rightBoundX: 852,
  minRangePx: 82,
  maxRangePx: 168,
  moveSpeedPxPerSec: 124,
  dodgeDistancePx: 146,
  dodgeSpeedPxPerSec: 860,
  dodgeDurationSec: 0.16,
  dodgeCooldownSec: 0.98,
  dodgeChance: 0.7,
  dodgeRecoveryDelaySec: 0.32,
  comboChance: 0.42,
  comboDelaySec: 0.3,
  comboDamageMultiplier: 1.24,
  intervalJitterSec: 0.18,
});

// La segunda fase acelera ataques y añade el picado cuando baja la vida.
const CHILO_PHASE_ONE = Object.freeze({
  name: "Fase 1 · Presión aérea",
  transitionAtHp: 62,
  interAttackDelaySec: 1.32,
  attacks: Object.freeze([CHILO_WING_ATTACK, CHILO_JUMP_ATTACK, CHILO_LUNGE_ATTACK]),
});

const CHILO_PHASE_TWO = Object.freeze({
  name: "Fase 2 · Picado de cresta",
  interAttackDelaySec: 0.82,
  attacks: Object.freeze([CHILO_WING_ATTACK, CHILO_JUMP_ATTACK, CHILO_LUNGE_ATTACK, CHILO_DIVE_ATTACK]),
});

export const CHILO_DATA = Object.freeze({
  id: "chilo",
  name: "Chilo",
  bossId: "chilo",
  maxHp: BOSS_MAX_HP.chilo,
  bodyBox: Object.freeze({ width: 56, height: 96 }),
  hurtBox: Object.freeze({ width: 50, height: 88 }),
  x: 750,
  y: 430,
  facing: -1,
  initialDelaySec: 0,
  interAttackDelaySec: 1.32,
  attackStartDistancePx: 320,
  jumpRangePx: 280,
  jumpArcHeightPx: 110, // PROVISIONAL: altura visual del arco no está fijada en el diseño.
  arenaCenterMinX: 108,
  arenaCenterMaxX: 852,
  hurtFlashSec: 0.12, // PROVISIONAL: duración visual de la reacción.
  attacks: Object.freeze([CHILO_WING_ATTACK, CHILO_JUMP_ATTACK, CHILO_LUNGE_ATTACK]),
  phases: Object.freeze([CHILO_PHASE_ONE, CHILO_PHASE_TWO]),
  ai: CHILO_AI,
});

