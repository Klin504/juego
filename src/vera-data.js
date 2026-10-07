import { BOSS_MAX_HP } from "./combat-config.js";

export const VERA_BALL_ATTACK = Object.freeze({
  patternId: "VERA_BALL",
  name: "Bote de retorno",
  kind: "projectile",
  shape: "circle",
  damage: 15,
  startupSec: 0.8,
  activeSec: 0.01, // PROVISIONAL: ventana mínima para emitir el proyectil; su viaje sigue independiente hasta salir.
  recoverySec: 0.65,
  category: "lowProjectile",
});

export const VERA_RUN_ATTACK = Object.freeze({
  patternId: "VERA_RUN",
  name: "Carrera de línea",
  kind: "sweep",
  shape: "rectangle",
  damage: 20,
  startupSec: 0.95,
  activeSec: 0.4,
  recoverySec: 0.75,
  category: "groundSweep",
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
  initialDelaySec: 1.2, // PROVISIONAL: la ficha no especifica espera inicial antes del primer aviso.
  interAttackDelaySec: 2.1,
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
  attacks: Object.freeze([VERA_BALL_ATTACK, VERA_RUN_ATTACK]),
});
