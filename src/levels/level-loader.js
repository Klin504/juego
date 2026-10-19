/** Crea entidades, física y combate a partir de datos de nivel. */

import { FighterEntity } from "../physics/fighter-entity.js";
import { PhysicsWorld } from "../physics/physics.js";
import { CombatSystem } from "../combat/combat-system.js";
import { Chilo } from "../combat/chilo.js";
import { Vera } from "../combat/vera.js";
import { Catodo3 } from "../combat/catodo3.js";
import { NullBoss } from "../combat/null-boss.js";
import { EnemyCombatant } from "../combat/enemy-combatant.js";
import { TutorialController } from "../campaign/tutorial-controller.js";
import { COMBAT_OUTCOME } from "../combat/combat-config.js";

// Cada nivel declara un tipo; esta tabla elige su clase de comportamiento.
const ENEMY_FACTORIES = Object.freeze({
  chilo: (data) => new Chilo(data),
  vera: (data) => new Vera(data),
  catodo3: (data) => new Catodo3(data),
  null: (data) => new NullBoss(data),
});

/** Mantiene al estudiante y al jefe orientados uno hacia el otro durante el duelo. */
function faceCombatants(player, enemy) {
  const horizontalDirection = Math.sign(enemy.position.x - player.position.x);
  if (horizontalDirection === 0) return;
  player.facing = horizontalDirection;
  enemy.facing = -horizontalDirection;
}

/** Construye las entidades y los sistemas de un intento a partir de datos. */
export function loadLevel(levelData, fighterId, options = {}) {
  const enemyFactory = ENEMY_FACTORIES[levelData.enemyType] ?? ((data) => new EnemyCombatant(data));
  const player = new FighterEntity({ fighterId, ...levelData.playerStart });
  const combat = new CombatSystem({
    player,
    enemyData: levelData.enemy,
    enemyFactory,
    solids: levelData.arena.solids,
    visorUnlocked: Boolean(options.visorUnlocked),
  });
  const physics = new PhysicsWorld();
  return {
    data: levelData,
    player,
    enemy: combat.enemy,
    combat,
    physics,
    physicsSolids: [...levelData.arena.solids, combat.enemy.bodyBox],
    elapsedSeconds: 0,
    status: "en curso",
    lastCombatEvents: Object.freeze([]),
    tutorial: new TutorialController(levelData.tutorialSteps ?? []),
  };
}

/** Avanza física, tutorial y combate; devuelve el resultado actual del duelo. */
export function updateLevel(level, actions, dt) {
  if (level.status !== "en curso") return level.combat.outcome;
  // La caja del jefe cambia al moverse: actualizamos su obstáculo antes de resolver física.
  level.physicsSolids[level.physicsSolids.length - 1] = level.enemy.bodyBox;
  level.physics.update(level.player, actions, dt, level.physicsSolids);
  faceCombatants(level.player, level.enemy);
  level.tutorial.update(actions, level.player, level.enemy);
  if (level.tutorial.completed) level.enemy.setCombatReady?.(true);
  const events = level.combat.update(dt, actions);
  faceCombatants(level.player, level.enemy);
  level.lastCombatEvents = events;
  if (level.tutorial.completed) level.elapsedSeconds += dt;
  if (level.elapsedSeconds >= level.data.timeLimitSec && level.combat.outcome === COMBAT_OUTCOME.IN_PROGRESS) {
    level.combat.finishForTimeout();
  }
  if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY) level.status = "completado";
  else if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT) level.status = "derrotado";
  return level.combat.outcome;
}

/** Dibuja el fondo básico definido por el nivel cuando se necesita ese modo. */
export function renderLevelBackground(ctx, levelData) {
  const { arena } = levelData;
  ctx.fillStyle = arena.backgroundColor;
  ctx.fillRect(0, 0, arena.width, arena.height);
  for (const rectangle of arena.background) {
    ctx.fillStyle = rectangle.color;
    ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }
  for (const solid of arena.solids) {
    // PROVISIONAL: tratamiento de los bloques de colisión como marcador visual hasta recibir arte final.
    ctx.fillStyle = solid.kind === "floor" ? "#697c8d" : "#34485b";
    ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
    ctx.strokeStyle = "#d7e1ec";
    ctx.lineWidth = 1;
    ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
  }
}
