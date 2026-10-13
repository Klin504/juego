/** Configura las fases y ataques de CÁTODO-3. */

import { BOSS_MAX_HP } from "./combat-config.js";
import { LABORATORY_MECHANICS } from "./laboratory-mechanics.js";

const PULSE_SPEED_PX_PER_SEC = 200;
const PULSE_ORIGIN_X = 710;

// Los ataques separan el aviso visual del movimiento posterior del proyectil.
export const CATODO_PULSE_ATTACK = Object.freeze({
  patternId: "CATODO_PULSE",
  name: "Pulso de luz",
  kind: "projectile",
  shape: "circle",
  category: "lowProjectile",
  damage: 19,
  startupSec: 0.66,
  activeSec: 0.1,
  recoverySec: 0.5,
  ai: Object.freeze({ range: "far", weight: 1.08, countersSpecial: true }),
  comboFollowUpIds: Object.freeze(["CATODO_SENSOR_L", "CATODO_SENSOR_R"]),
  comboChance: 0.4,
});

export const CATODO_OVERLOAD_ATTACK = Object.freeze({
  patternId: "CATODO_OVERLOAD",
  name: "Pulso de sobrecarga",
  kind: "projectile",
  shape: "circle",
  category: "lowProjectile",
  damage: 25,
  startupSec: 0.95,
  activeSec: 0.1,
  recoverySec: 0.68,
  speedPxPerSec: 245,
  ai: Object.freeze({ range: "far", weight: 0.58, countersSpecial: true }),
});

export const CATODO_SENSOR_LEFT_ATTACK = Object.freeze({
  patternId: "CATODO_SENSOR_L",
  name: "Sensor izquierdo",
  kind: "sweep",
  shape: "rectangle",
  category: "floorSensor",
  sensorId: "left",
  damage: 22,
  startupSec: 0.88,
  activeSec: 0.44,
  recoverySec: 0.58,
  ai: Object.freeze({ range: "mid", weight: 1.05, countersGuard: true, countersAttack: true }),
  comboFollowUpIds: Object.freeze(["CATODO_PULSE", "CATODO_OVERLOAD"]),
  comboChance: 0.4,
});

export const CATODO_SENSOR_RIGHT_ATTACK = Object.freeze({
  ...CATODO_SENSOR_LEFT_ATTACK,
  patternId: "CATODO_SENSOR_R",
  name: "Sensor derecho",
  sensorId: "right",
});

export const CATODO_CLOSE_ARC_ATTACK = Object.freeze({
  patternId: "CATODO_CLOSE_ARC",
  name: "Descarga de proximidad",
  kind: "melee",
  shape: "rectangle",
  damage: 26,
  width: 146,
  height: 94,
  offsetX: 0,
  offsetY: -95,
  startupSec: 0.68,
  activeSec: 0.2,
  recoverySec: 0.64,
  category: "frontal",
  breaksGuard: true,
  ai: Object.freeze({ range: "close", weight: 1.05, countersGuard: true, countersApproach: true, countersSpecial: true }),
});

const CATODO3_AI = Object.freeze({
  leftBoundX: 122,
  rightBoundX: 838,
  minRangePx: 112,
  maxRangePx: 214,
  moveSpeedPxPerSec: 94,
  dodgeDistancePx: 128,
  dodgeSpeedPxPerSec: 790,
  dodgeDurationSec: 0.15,
  dodgeCooldownSec: 0.74,
  dodgeChance: 0.72,
  dodgeRecoveryDelaySec: 0.3,
  comboChance: 0.4,
  comboDelaySec: 0.27,
  comboDamageMultiplier: 1.25,
  intervalJitterSec: 0.14,
});

const CATODO_PHASE_ONE = Object.freeze({
  name: "Fase 1 · Rutina defensiva",
  transitionAtHp: 98,
  interAttackDelaySec: 0.98,
  attacks: Object.freeze([CATODO_PULSE_ATTACK, CATODO_OVERLOAD_ATTACK, CATODO_SENSOR_LEFT_ATTACK, CATODO_SENSOR_RIGHT_ATTACK]),
});

const CATODO_PHASE_TWO = Object.freeze({
  name: "Fase 2 · Defensa de proximidad",
  interAttackDelaySec: 0.62,
  attacks: Object.freeze([CATODO_PULSE_ATTACK, CATODO_OVERLOAD_ATTACK, CATODO_SENSOR_LEFT_ATTACK, CATODO_SENSOR_RIGHT_ATTACK, CATODO_CLOSE_ARC_ATTACK]),
});

export const CATODO3_DATA = Object.freeze({
  id: "catodo3",
  bossId: "catodo3",
  name: "CÁTODO-3",
  maxHp: BOSS_MAX_HP.catodo3,
  bodyBox: Object.freeze({ width: 52, height: 92 }),
  hurtBox: Object.freeze({ width: 48, height: 86 }),
  x: 750,
  y: 430,
  facing: -1,
  initialDelaySec: 0,
  interAttackDelaySec: 0.98,
  hurtFlashSec: 0.12, // PROVISIONAL: duración visual del estado herido.
  arenaGroundY: LABORATORY_MECHANICS.floorY,
  projectile: Object.freeze({
    width: 32,
    height: 32,
    radius: 16,
    originX: PULSE_ORIGIN_X,
    centerY: 410,
    speedPxPerSec: PULSE_SPEED_PX_PER_SEC,
    lifetimeSec: 4, // PROVISIONAL: respaldo; normalmente se limpia al salir de pantalla.
    direction: -1,
    ignoreWalls: true,
  }),
  laboratory: LABORATORY_MECHANICS,
  attacks: Object.freeze([
    CATODO_PULSE_ATTACK,
    CATODO_OVERLOAD_ATTACK,
    CATODO_SENSOR_LEFT_ATTACK,
    CATODO_SENSOR_RIGHT_ATTACK,
  ]),
  phases: Object.freeze([CATODO_PHASE_ONE, CATODO_PHASE_TWO]),
  ai: CATODO3_AI,
});
