import { BOSS_MAX_HP, CHILO_WING_ATTACK } from "./combat-config.js";

export const CHILO_JUMP_ATTACK = Object.freeze({
  patternId: "CHILO_JUMP",
  name: "Salto anunciado",
  kind: "jump",
  shape: "circle",
  damage: 16,
  diameterPx: 100,
  startupSec: 1,
  activeSec: 0.25,
  recoverySec: 0.85,
  category: "landing",
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
  interAttackDelaySec: 2.4,
  attackStartDistancePx: 250,
  jumpRangePx: 280,
  jumpArcHeightPx: 110, // PROVISIONAL: altura visual del arco no está fijada en el diseño.
  arenaCenterMinX: 108,
  arenaCenterMaxX: 852,
  hurtFlashSec: 0.12, // PROVISIONAL: duración visual de la reacción.
  attacks: Object.freeze([CHILO_WING_ATTACK, CHILO_JUMP_ATTACK]),
});

