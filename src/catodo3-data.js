import { BOSS_MAX_HP, PROJECTILE_CLEANUP_MARGIN_PX } from "./combat-config.js";
import { LABORATORY_MECHANICS } from "./laboratory-mechanics.js";

const PULSE_SPEED_PX_PER_SEC = 200;
const PULSE_ORIGIN_X = 710;

export const CATODO_PULSE_ATTACK = Object.freeze({
  patternId: "CATODO_PULSE",
  name: "Pulso de luz",
  kind: "projectile",
  shape: "circle",
  category: "lowProjectile",
  damage: 16,
  startupSec: 0.85,
  // PROVISIONAL: ventana activa deriva del margen de salida de pantalla.
  activeSec: (PULSE_ORIGIN_X + PROJECTILE_CLEANUP_MARGIN_PX) / PULSE_SPEED_PX_PER_SEC,
  recoverySec: 0.7,
});

export const CATODO_SENSOR_LEFT_ATTACK = Object.freeze({
  patternId: "CATODO_SENSOR_L",
  name: "Sensor izquierdo",
  kind: "sweep",
  shape: "rectangle",
  category: "floorSensor",
  sensorId: "left",
  damage: 19,
  startupSec: 1.15,
  activeSec: 0.5,
  recoverySec: 0.8,
});

export const CATODO_SENSOR_RIGHT_ATTACK = Object.freeze({
  ...CATODO_SENSOR_LEFT_ATTACK,
  patternId: "CATODO_SENSOR_R",
  name: "Sensor derecho",
  sensorId: "right",
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
  initialDelaySec: 0, // PROVISIONAL: la ficha no fija espera inicial.
  interAttackDelaySec: 1.9,
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
    CATODO_SENSOR_LEFT_ATTACK,
    CATODO_PULSE_ATTACK,
    CATODO_SENSOR_RIGHT_ATTACK,
  ]),
});
