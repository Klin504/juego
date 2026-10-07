import { BOSS_MAX_HP } from "./combat-config.js";
import { LIBRARY_MECHANICS } from "./library-mechanics.js";

const NULL_ECHO_CHILO = Object.freeze({
  patternId: "NULL_ECHO_CHILO", name: "Eco de Chilo", kind: "melee", shape: "rectangle", category: "frontal",
  width: 135, height: 90, offsetX: 0, offsetY: -95, damage: 18, startupSec: 1.2, activeSec: 0.2, recoverySec: 0.55,
});
const NULL_ECHO_VERA = Object.freeze({
  patternId: "NULL_ECHO_VERA", name: "Eco de Vera", kind: "sweep", shape: "rectangle", category: "groundSweep",
  damage: 19, startupSec: 0.9, activeSec: 0.4, recoverySec: 0.6,
});
const NULL_ECHO_CATODO = Object.freeze({
  patternId: "NULL_ECHO_CATODO", name: "Eco de CÁTODO-3", kind: "sweep", shape: "rectangle", category: "floorSensor",
  damage: 20, startupSec: 1.15, activeSec: 0.5, recoverySec: 0.65,
});
const NULL_FINAL_SWEEP = Object.freeze({
  patternId: "NULL_FINAL_SWEEP", name: "Barrido final", kind: "sweep", shape: "rectangle", category: "fullFloorSweep",
  damage: 24, startupSec: 1.5, activeSec: 0.6, recoverySec: 0.9,
});

const PHASE_ONE = Object.freeze({
  name: "Fase 1 · Ecos",
  transitionAtHp: 80,
  interAttackDelaySec: 1.8,
  attacks: Object.freeze([NULL_ECHO_CHILO, NULL_ECHO_VERA, NULL_ECHO_CATODO]),
});
const PHASE_TWO = Object.freeze({
  name: "Fase 2 · Validación final",
  interAttackDelaySec: 1.5,
  attacks: Object.freeze([NULL_ECHO_CHILO, NULL_ECHO_VERA, NULL_ECHO_CATODO, NULL_FINAL_SWEEP]),
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
  initialDelaySec: 0, // PROVISIONAL: el diseño no fija una espera antes del primer eco.
  hurtFlashSec: 0.12, // PROVISIONAL: valor compartido para reacción visual de jefe.
  phases: Object.freeze([PHASE_ONE, PHASE_TWO]),
  arenaGroundY: LIBRARY_MECHANICS.floorY,
  library: LIBRARY_MECHANICS,
});

export const NULL_ATTACKS = Object.freeze({
  echoChilo: NULL_ECHO_CHILO,
  echoVera: NULL_ECHO_VERA,
  echoCatodo: NULL_ECHO_CATODO,
  finalSweep: NULL_FINAL_SWEEP,
});
