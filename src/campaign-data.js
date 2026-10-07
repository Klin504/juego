import { LEVEL_1_DATA } from "./level-1-data.js";
import { LEVEL_2_DATA } from "./level-2-data.js";
import { LEVEL_3_DATA } from "./level-3-data.js";
import { FIGHTER_MAX_SPEED_PX_PER_SEC } from "./physics-config.js";
import { FIGHTER_COMBAT_STATS } from "./combat-config.js";

export const CAMPAIGN_LEVELS = Object.freeze([
  Object.freeze({ id: LEVEL_1_DATA.id, data: LEVEL_1_DATA }),
  Object.freeze({ id: LEVEL_2_DATA.id, data: LEVEL_2_DATA }),
  Object.freeze({ id: LEVEL_3_DATA.id, data: LEVEL_3_DATA }),
]);

export const SELECTABLE_FIGHTERS = Object.freeze([
  Object.freeze({ id: "alma", name: "Alma Reyes", role: "Ingeniería · equilibrada", maxHp: FIGHTER_COMBAT_STATS.alma.maxHp, speed: FIGHTER_MAX_SPEED_PX_PER_SEC.alma, special: "Pulso de circuito · interrumpe" }),
  Object.freeze({ id: "diego", name: "Diego Cruz", role: "Deportes · resistente", maxHp: FIGHTER_COMBAT_STATS.diego.maxHp, speed: FIGHTER_MAX_SPEED_PX_PER_SEC.diego, special: "Carga Chila · golpe y resistencia" }),
  Object.freeze({ id: "nadia", name: "Nadia Solís", role: "Comunicación · ágil", maxHp: FIGHTER_COMBAT_STATS.nadia.maxHp, speed: FIGHTER_MAX_SPEED_PX_PER_SEC.nadia, special: "Ráfaga de notas · tres proyectiles" }),
]);

export const INITIAL_CAMPAIGN_ATTEMPTS = 3;
export const CAMPAIGN_MARK_COUNT = 4;
export const LEVEL_SCORE_BASE_BONUS = 500;
export const LEVEL_SCORE_HP_BONUS = 5;
