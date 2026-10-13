/** Declara niveles y construye las fichas de selección desde el balance real. */

import { LEVEL_1_DATA } from "../levels/level-1-data.js";
import { LEVEL_2_DATA } from "../levels/level-2-data.js";
import { LEVEL_3_DATA } from "../levels/level-3-data.js";
import { LEVEL_4_DATA } from "../levels/level-4-data.js";
import { FIGHTER_MAX_SPEED_PX_PER_SEC } from "../physics/physics-config.js";
import { FIGHTER_COMBAT_STATS, PLAYER_SPECIALS } from "../combat/combat-config.js";

// Orden de la campaña; el controlador usa el índice para avanzar y marcar victorias.
export const CAMPAIGN_LEVELS = Object.freeze([
  Object.freeze({ id: LEVEL_1_DATA.id, data: LEVEL_1_DATA }),
  Object.freeze({ id: LEVEL_2_DATA.id, data: LEVEL_2_DATA }),
  Object.freeze({ id: LEVEL_3_DATA.id, data: LEVEL_3_DATA }),
  Object.freeze({ id: LEVEL_4_DATA.id, data: LEVEL_4_DATA }),
]);

/** Construye la ficha visible desde los mismos números que utiliza el combate. */
function selectableFighter({ id, name, role, special }) {
  const stats = FIGHTER_COMBAT_STATS[id];
  const specialAttack = PLAYER_SPECIALS[id];
  return Object.freeze({
    id,
    name,
    role,
    special,
    maxHp: stats.maxHp,
    speed: FIGHTER_MAX_SPEED_PX_PER_SEC[id],
    normalDamage: stats.normalDamage,
    specialDamage: specialAttack.damage,
    specialHitCount: specialAttack.projectileCount ?? 1,
    specialProjectileDamages: specialAttack.projectileDamages ?? null,
    specialCooldownSec: specialAttack.cooldownSec,
  });
}

export const SELECTABLE_FIGHTERS = Object.freeze([
  selectableFighter({ id: "alma", name: "Alma Reyes", role: "Ingeniería · equilibrada", special: "Pulso de circuito · interrumpe" }),
  selectableFighter({ id: "diego", name: "Diego Cruz", role: "Deportes · más vida y daño", special: "Carga Chila · golpe y resistencia" }),
  selectableFighter({ id: "nadia", name: "Nadia Solís", role: "Comunicación · más movilidad", special: "Ráfaga de notas · tres proyectiles" }),
]);

export const INITIAL_CAMPAIGN_ATTEMPTS = 3;
export const CAMPAIGN_MARK_COUNT = 4;
export const LEVEL_SCORE_BASE_BONUS = 500;
export const LEVEL_SCORE_HP_BONUS = 5;
