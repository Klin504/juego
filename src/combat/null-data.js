/** Configura las fases, ataques y vida de NULL. */

import { BOSS_MAX_HP } from "./combat-config.js";
import { LIBRARY_MECHANICS } from "./library-mechanics.js";

// NULL reutiliza motivos de los jefes anteriores y los combina por fases.
const NULL_ECHO_CHILO = Object.freeze({
  patternId: "NULL_ECHO_CHILO", name: "Eco de Chilo", kind: "melee", shape: "rectangle", category: "frontal",
  width: 135, height: 90, offsetX: 0, offsetY: -95, damage: 21, startupSec: 0.88, activeSec: 0.18, recoverySec: 0.42,
  breaksGuard: true,
  ai: Object.freeze({ range: "close", weight: 1.1, countersGuard: true, countersSpecial: true }),
  comboFollowUpIds: Object.freeze(["NULL_ECHO_VERA"]),
  comboChance: 0.48,
});
const NULL_ECHO_VERA = Object.freeze({
  patternId: "NULL_ECHO_VERA", name: "Eco de Vera", kind: "sweep", shape: "rectangle", category: "groundSweep",
  damage: 22, startupSec: 0.72, activeSec: 0.34, recoverySec: 0.46,
  ai: Object.freeze({ range: "mid", weight: 1, countersGuard: true, countersSpecial: true }),
  comboFollowUpIds: Object.freeze(["NULL_ECHO_CATODO"]),
  comboChance: 0.43,
});
const NULL_ECHO_CATODO = Object.freeze({
  patternId: "NULL_ECHO_CATODO", name: "Eco de CÁTODO-3", kind: "sweep", shape: "rectangle", category: "floorSensor",
  damage: 23, startupSec: 0.82, activeSec: 0.42, recoverySec: 0.48,
  ai: Object.freeze({ range: "mid", weight: 0.9, countersGuard: true, countersSpecial: true }),
  comboFollowUpIds: Object.freeze(["NULL_ECHO_CHILO", "NULL_FINAL_SWEEP"]),
  comboChance: 0.4,
});
const NULL_FINAL_SWEEP = Object.freeze({
  patternId: "NULL_FINAL_SWEEP", name: "Barrido final", kind: "sweep", shape: "rectangle", category: "fullFloorSweep",
  damage: 28, startupSec: 1.22, activeSec: 0.55, recoverySec: 0.65,
  ai: Object.freeze({ range: "mid", weight: 0.8, countersJump: true, countersGuard: true, countersSpecial: true }),
});

const NULL_MEMORY_SEAL = Object.freeze({
  patternId: "NULL_MEMORY_SEAL",
  name: "Sello de memoria",
  kind: "jump",
  shape: "circle",
  damage: 25,
  diameterPx: 148,
  startupSec: 0.92,
  activeSec: 0.24,
  recoverySec: 0.58,
  category: "areaPulse",
  ai: Object.freeze({ range: "mid", weight: 0.9, countersJump: true, countersAttack: true, countersSpecial: true }),
});

const NULL_AI = Object.freeze({
  leftBoundX: 108,
  rightBoundX: 852,
  minRangePx: 112,
  maxRangePx: 228,
  moveSpeedPxPerSec: 126,
  dodgeDistancePx: 158,
  dodgeSpeedPxPerSec: 900,
  dodgeDurationSec: 0.16,
  dodgeCooldownSec: 0.58,
  dodgeChance: 0.84,
  dodgeRecoveryDelaySec: 0.26,
  comboChance: 0.48,
  comboDelaySec: 0.22,
  comboDamageMultiplier: 1.28,
  intervalJitterSec: 0.12,
});

const PHASE_ONE = Object.freeze({
  name: "Fase 1 · Ecos",
  transitionAtHp: 108,
  interAttackDelaySec: 0.82,
  attacks: Object.freeze([NULL_ECHO_CHILO, NULL_ECHO_VERA, NULL_ECHO_CATODO]),
});
const PHASE_TWO = Object.freeze({
  name: "Fase 2 · Validación final",
  interAttackDelaySec: 0.56,
  attacks: Object.freeze([NULL_ECHO_CHILO, NULL_ECHO_VERA, NULL_ECHO_CATODO, NULL_FINAL_SWEEP, NULL_MEMORY_SEAL]),
});

export const NULL_DATA = Object.freeze({
  id: "null",
  bossId: "null",
  name: "NULL",
  maxHp: BOSS_MAX_HP.null,
  bodyBox: Object.freeze({ width: 56, height: 96 }),
  hurtBox: Object.freeze({ width: 52, height: 88 }),
  x: 750,
  y: 430,
  facing: -1,
  initialDelaySec: 0,
  hurtFlashSec: 0.12, // PROVISIONAL: valor compartido para reacción visual de jefe.
  phases: Object.freeze([PHASE_ONE, PHASE_TWO]),
  ai: NULL_AI,
  arenaGroundY: LIBRARY_MECHANICS.floorY,
  library: LIBRARY_MECHANICS,
});

export const NULL_ATTACKS = Object.freeze({
  echoChilo: NULL_ECHO_CHILO,
  echoVera: NULL_ECHO_VERA,
  echoCatodo: NULL_ECHO_CATODO,
  finalSweep: NULL_FINAL_SWEEP,
  memorySeal: NULL_MEMORY_SEAL,
});
