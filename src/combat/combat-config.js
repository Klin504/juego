/** Centraliza vida, daños, especiales y constantes compartidas de combate. */

import { FIXED_STEP_SECONDS } from "../core/constants.js";

// Fuente única del balance: la ficha de selección lee estos mismos valores.
// Diego gana en vida y golpe, Nadia en velocidad y alcance, y Alma equilibra ambas.
export const FIGHTER_COMBAT_STATS = Object.freeze({
  alma: Object.freeze({ maxHp: 100, normalDamage: 14 }),
  diego: Object.freeze({ maxHp: 120, normalDamage: 16 }),
  nadia: Object.freeze({ maxHp: 85, normalDamage: 12 }),
});

// El ataque R consulta este mapa; no se recalcula daño dentro de la interfaz.
export const PLAYER_NORMAL_DAMAGE_BY_FIGHTER = Object.freeze({
  alma: FIGHTER_COMBAT_STATS.alma.normalDamage,
  diego: FIGHTER_COMBAT_STATS.diego.normalDamage,
  nadia: FIGHTER_COMBAT_STATS.nadia.normalDamage,
});

export const BOSS_MAX_HP = Object.freeze({ chilo: 100, vera: 136, catodo3: 164, null: 204 });
export const PLAYER_HURTBOX = Object.freeze({ width: 32, height: 78 });
export const PLAYER_INVULNERABILITY_SEC = 0.45;
export const GUARD_DAMAGE_FACTOR = 0.3;
export const TRAINING_ENEMY_ID = "dummy-chilo";
export const COMBAT_OUTCOME = Object.freeze({
  IN_PROGRESS: "en curso",
  PLAYER_VICTORY: "jugador vencedor",
  PLAYER_DEFEAT: "jugador derrotado",
});

// Fases del golpe R: preparación, ventana de impacto y recuperación.
export const PLAYER_NORMAL_ATTACK = Object.freeze({
  patternId: "player-normal-r",
  damageByFighter: PLAYER_NORMAL_DAMAGE_BY_FIGHTER,
  width: 100,
  height: 44, // PROVISIONAL: altura de hitbox de R no especificada en el diseño.
  offsetX: 0,
  offsetY: -66, // PROVISIONAL: offset vertical de hitbox de R.
  startupSec: 0.06,
  activeSec: 0.14,
  recoverySec: 0.42,
  scoreOnHit: 10,
});

const NADIA_PROJECTILE_SPEED_PX_PER_SEC = 260; // PROVISIONAL: la velocidad del especial no está fijada.
const NADIA_PROJECTILE_RANGE_PX = 220;
const ALMA_SPECIAL_COOLDOWN_SEC = 8;
const DIEGO_SPECIAL_COOLDOWN_SEC = 10;
const NADIA_SPECIAL_COOLDOWN_SEC = 7;
export const PLAYER_SPECIAL_VISUAL_SEC = 0.24;
// damage es el máximo por activación. Nadia reparte 22 puntos entre tres notas.
export const PLAYER_SPECIALS = Object.freeze({
  alma: Object.freeze({
    patternId: "ALMA_PULSE",
    kind: "pulse",
    damage: 22,
    reachPx: 165,
    width: 165,
    height: 90, // PROVISIONAL: alto y offset vertical del pulso.
    offsetX: 0,
    offsetY: -95,
    startupSec: 0, // PROVISIONAL: el especial no tiene startup definido.
    activeSec: FIXED_STEP_SECONDS, // PROVISIONAL: pulso ejecutado en el paso de entrada.
    recoverySec: ALMA_SPECIAL_COOLDOWN_SEC - FIXED_STEP_SECONDS,
    cooldownSec: ALMA_SPECIAL_COOLDOWN_SEC,
  }),
  diego: Object.freeze({
    patternId: "DIEGO_CHARGE",
    kind: "charge",
    damage: 28,
    dashDistancePx: 110,
    reachPx: 120,
    width: 120,
    height: 84, // PROVISIONAL: alto y offset vertical de la zona de carga.
    offsetX: 0,
    offsetY: -84,
    damageReceivedFactor: 0.4,
    startupSec: 0, // PROVISIONAL: el especial no tiene startup definido.
    activeSec: FIXED_STEP_SECONDS, // PROVISIONAL: avance ejecutado en un paso con barrido continuo.
    recoverySec: DIEGO_SPECIAL_COOLDOWN_SEC - FIXED_STEP_SECONDS,
    cooldownSec: DIEGO_SPECIAL_COOLDOWN_SEC,
  }),
  nadia: Object.freeze({
    patternId: "NADIA_NOTES",
    kind: "volley",
    damage: 22,
    projectileCount: 3,
    projectileDamages: Object.freeze([8, 7, 7]),
    reachPx: NADIA_PROJECTILE_RANGE_PX,
    startupSec: 0, // PROVISIONAL: el especial no tiene startup definido.
    activeSec: NADIA_PROJECTILE_RANGE_PX / NADIA_PROJECTILE_SPEED_PX_PER_SEC,
    recoverySec: NADIA_SPECIAL_COOLDOWN_SEC - (NADIA_PROJECTILE_RANGE_PX / NADIA_PROJECTILE_SPEED_PX_PER_SEC),
    projectile: Object.freeze({
      width: 12, // PROVISIONAL: tamaño y dispersión vertical de cada nota.
      height: 12,
      spreadPx: 12,
      speedPxPerSec: NADIA_PROJECTILE_SPEED_PX_PER_SEC,
      lifetimeSec: NADIA_PROJECTILE_RANGE_PX / NADIA_PROJECTILE_SPEED_PX_PER_SEC,
    }),
    cooldownSec: NADIA_SPECIAL_COOLDOWN_SEC,
  }),
});

export const CHILO_WING_ATTACK = Object.freeze({
  patternId: "CHILO_WING",
  name: "Aletazo frontal",
  kind: "melee",
  damage: 16,
  width: 125,
  height: 90,
  offsetX: 0,
  offsetY: -95,
  startupSec: 0.88,
  activeSec: 0.2,
  recoverySec: 0.56,
  category: "frontal",
  ai: Object.freeze({ range: "close", weight: 1.18, countersSpecial: true }),
  comboFollowUpIds: Object.freeze(["CHILO_LUNGE"]),
  comboChance: 0.42,
});

export const TRAINING_ORB_ATTACK = Object.freeze({
  patternId: "DUMMY_ORB",
  name: "Orbe de práctica",
  kind: "projectile",
  damage: 8, // PROVISIONAL: el muñeco no tiene daño de proyectil definido.
  startupSec: 0.6, // PROVISIONAL: aviso del proyectil de práctica.
  activeSec: FIXED_STEP_SECONDS, // PROVISIONAL: ventana mínima de un paso para crear el proyectil.
  recoverySec: 0.5, // PROVISIONAL: recuperación del proyectil de práctica.
  category: "projectile",
});

export const TRAINING_DUMMY = Object.freeze({
  id: TRAINING_ENEMY_ID,
  bossId: "chilo",
  maxHp: BOSS_MAX_HP.chilo,
  bodyBox: Object.freeze({ width: 56, height: 96 }),
  hurtBox: Object.freeze({ width: 50, height: 88 }),
  x: 750,
  y: 430,
  facing: -1,
  interAttackDelaySec: 2.4,
  hurtFlashSec: 0.12, // PROVISIONAL: duración visual de la reacción.
  // PROVISIONALES: tamaño, velocidad y tiempo de vida del orbe del muñeco.
  projectile: Object.freeze({
    width: 18,
    height: 18,
    speedPxPerSec: 260, // PROVISIONAL: velocidad de proyectil para el muñeco.
    lifetimeSec: 4,
    damage: TRAINING_ORB_ATTACK.damage,
  }),
});

// PROVISIONALES: máximo simultáneo y margen de limpieza para el sistema inicial de proyectiles.
export const MAX_ACTIVE_PROJECTILES = 6;
export const PROJECTILE_CLEANUP_MARGIN_PX = 40;
export const DEBUG_ATTACKBOX_COLOR = "#54ff81";
export const DEBUG_PLAYER_HURTBOX_COLOR = "#55dcff";
export const DEBUG_ENEMY_ATTACKBOX_COLOR = "#ff8652";
export const DEBUG_ENEMY_HURTBOX_COLOR = "#ff54b8";
export const DEBUG_PROJECTILE_COLOR = "#f6ef54";
export const PLAYER_HEALTH_COLOR = "#58e07b";
export const ENEMY_HEALTH_COLOR = "#ff596a";
export const HEALTH_BACKGROUND_COLOR = "#182131";
export const HEALTH_BORDER_COLOR = "#f1f5fa";
export const PLAYER_INVULNERABLE_ALPHA = 0.38; // PROVISIONAL: opacidad del parpadeo.
export const INVULNERABILITY_BLINK_INTERVAL_SEC = 0.08; // PROVISIONAL: cadencia visual.
