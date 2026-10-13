import assert from "node:assert/strict";
import { CombatSystem } from "../src/combat/combat-system.js";
import {
  FIGHTER_COMBAT_STATS,
  CHILO_WING_ATTACK,
  MAX_ACTIVE_PROJECTILES,
  PLAYER_SPECIALS,
} from "../src/combat/combat-config.js";
import { TRAINING_DUMMY_DATA } from "../src/combat/combat-data.js";
import { FighterEntity } from "../src/physics/fighter-entity.js";
import { InputController } from "../src/input/input-controller.js";
import { FIXED_STEP_SECONDS, STATE } from "../src/core/constants.js";
import { SELECTABLE_FIGHTERS } from "../src/campaign/campaign-data.js";
import { CampaignController } from "../src/campaign/campaign-controller.js";

const PASSIVE_ENEMY = Object.freeze({
  ...TRAINING_DUMMY_DATA,
  maxHp: 400,
  initialDelaySec: 999,
});

function actions(overrides = {}) {
  const neutral = () => ({ pressed: false, held: false, released: false });
  return {
    moveX: 0,
    jump: neutral(),
    guard: neutral(),
    normalAttack: neutral(),
    specialTap: neutral(),
    visor: neutral(),
    ...overrides,
  };
}

function makeFight(fighterId, x = 625) {
  const player = new FighterEntity({ fighterId, x, y: 430 });
  player.grounded = true;
  return { player, combat: new CombatSystem({ player, enemyData: PASSIVE_ENEMY, solids: [] }) };
}

function step(combat, overrides = {}) {
  return combat.update(FIXED_STEP_SECONDS, actions(overrides));
}

for (const [fighterId, normalDamage, specialDamage] of [
  ["alma", 14, 22],
  ["diego", 16, 28],
  ["nadia", 12, 22],
]) {
  assert.equal(FIGHTER_COMBAT_STATS[fighterId].normalDamage, normalDamage);
  assert.equal(PLAYER_SPECIALS[fighterId].damage, specialDamage);
  const selectionCard = SELECTABLE_FIGHTERS.find((fighter) => fighter.id === fighterId);
  assert.equal(selectionCard.normalDamage, normalDamage, `${fighterId}: daño mostrado en selección`);
  assert.equal(selectionCard.specialDamage, specialDamage, `${fighterId}: especial mostrado en selección`);

  const normalFight = makeFight(fighterId);
  step(normalFight.combat, { normalAttack: { pressed: true, held: true, released: false } });
  for (let index = 0; index < 12 && normalFight.combat.enemy.hp === 400; index += 1) step(normalFight.combat);
  assert.equal(400 - normalFight.combat.enemy.hp, normalDamage, `${fighterId}: daño normal`);

  const { player, combat } = makeFight(fighterId);
  const firstEvents = step(combat, { specialTap: { pressed: true, held: false, released: true } });
  assert.equal(firstEvents.filter((event) => event.kind === "specialActivated").length, 1,
    `${fighterId}: el especial no se activó exactamente una vez`);
  assert.equal(combat.specialCooldownRemainingSec, PLAYER_SPECIALS[fighterId].cooldownSec);
  assert.equal(combat.specialVisualActive, true, `${fighterId}: falta la pose especial`);

  if (fighterId === "nadia") {
    assert.deepEqual(combat.projectiles.map((projectile) => projectile.damage), [8, 7, 7]);
    assert.deepEqual(selectionCard.specialProjectileDamages, [8, 7, 7]);
  } else {
    assert.equal(400 - combat.enemy.hp, specialDamage, `${fighterId}: daño especial`);
  }
  if (fighterId === "diego") assert.ok(player.position.x > 625, "Diego no avanzó en su carga");

  const repeatedEvents = step(combat, { specialTap: { pressed: true, held: false, released: true } });
  assert.equal(repeatedEvents.filter((event) => event.kind === "specialActivated").length, 0,
    `${fighterId}: la recarga permitió activar dos veces`);

  const damageEvents = firstEvents.filter((event) => event.kind === "damageApplied" && event.targetId === combat.enemy.id);
  for (let index = 0; index < 65; index += 1) {
    const events = step(combat);
    damageEvents.push(...events.filter((event) => event.kind === "damageApplied" && event.targetId === combat.enemy.id));
  }
  assert.equal(400 - combat.enemy.hp, specialDamage, `${fighterId}: daño final del especial`);
  assert.equal(damageEvents.reduce((sum, event) => sum + event.amount, 0), specialDamage,
    `${fighterId}: el especial duplicó o perdió impactos`);
  const campaign = new CampaignController();
  campaign.selectFighter(fighterId);
  campaign.addCombatEvents(damageEvents);
  assert.equal(campaign.attemptScore, 25, `${fighterId}: la puntuación del especial se duplicó`);
  assert.equal(combat.specialVisualActive, false, `${fighterId}: la pose especial quedó fija`);
}

const fullVolley = makeFight("nadia").combat;
for (let index = 0; index < MAX_ACTIVE_PROJECTILES - 2; index += 1) {
  assert.equal(fullVolley.spawnProjectile({
    id: `occupied-${index}`, attackInstanceId: `occupied-${index}`, patternId: "fixture",
    owner: "enemy", x: 400, y: 100, velocityX: 0, velocityY: 0,
    width: 4, height: 4, damage: 1, lifetimeSec: 3,
  }), true);
}
const rejectedEvents = step(fullVolley, { specialTap: { pressed: true, held: false, released: true } });
assert.equal(rejectedEvents.some((event) => event.kind === "specialActivated"), false);
assert.equal(fullVolley.specialCooldownRemainingSec, 0, "Nadia gastó recarga sin espacio para tres notas");

const almaInterrupt = makeFight("alma").combat;
almaInterrupt.enemy.attack = {
  id: "warning-to-cancel",
  data: CHILO_WING_ATTACK,
  elapsedSec: 0,
  phase: "warning",
  facing: -1,
  targetPosition: { x: 625, y: 390 },
  contactedTargets: new Set(),
};
const interruptEvents = step(almaInterrupt, { specialTap: { pressed: true, held: false, released: true } });
assert.equal(interruptEvents.filter((event) => event.kind === "attackCancelled").length, 1,
  "El pulso de Alma no interrumpió el aviso del jefe");
assert.equal(almaInterrupt.enemy.attack?.phase, "recovery");

const diegoGuard = makeFight("diego").combat;
diegoGuard.enemy.attack = {
  id: "charge-resistance",
  data: CHILO_WING_ATTACK,
  elapsedSec: CHILO_WING_ATTACK.startupSec,
  phase: "active",
  facing: -1,
  targetPosition: { x: 625, y: 390 },
  contactedTargets: new Set(),
};
step(diegoGuard, { specialTap: { pressed: true, held: false, released: true } });
assert.equal(diegoGuard.playerCombatant.maxHp - diegoGuard.playerCombatant.hp, 7,
  "La carga de Diego no redujo el aletazo de 16 a 7 puntos");

const rechargedAlma = makeFight("alma").combat;
step(rechargedAlma, { specialTap: { pressed: true, held: false, released: true } });
for (let index = 0; index < 482; index += 1) step(rechargedAlma);
assert.equal(rechargedAlma.specialCooldownRemainingSec, 0, "La recarga de Alma no terminó");
const secondActivation = step(rechargedAlma, { specialTap: { pressed: true, held: false, released: true } });
assert.equal(secondActivation.filter((event) => event.kind === "specialActivated").length, 1,
  "Alma no pudo reutilizar el especial después de la recarga");

const input = new InputController();
input.connect({ stateMachine: { currentName: STATE.PLAYING }, clock: {}, loop: {} });
const key = (code) => ({ code, repeat: false, isComposing: false, preventDefault() {} });
input.handleKeyDown(key("ShiftLeft"));
assert.equal(input.snapshotForStep().specialTap.pressed, false, "Shift activó el especial antes de soltar");
input.handleKeyUp(key("ShiftLeft"));
assert.equal(input.snapshotForStep().specialTap.pressed, true, "soltar Shift no activó el especial");

console.log("Especiales, recargas, daño de jugadores y entrada Shift: correctos.");
