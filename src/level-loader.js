import { FighterEntity } from "./fighter-entity.js";
import { PhysicsWorld } from "./physics.js";
import { CombatSystem } from "./combat-system.js";
import { Chilo } from "./chilo.js";
import { EnemyCombatant } from "./enemy-combatant.js";
import { TutorialController } from "./tutorial-controller.js";
import { COMBAT_OUTCOME } from "./combat-config.js";

const ENEMY_FACTORIES = Object.freeze({
  chilo: (data) => new Chilo(data),
});

export function loadLevel(levelData, fighterId) {
  const enemyFactory = ENEMY_FACTORIES[levelData.enemyType] ?? ((data) => new EnemyCombatant(data));
  const player = new FighterEntity({ fighterId, ...levelData.playerStart });
  const combat = new CombatSystem({
    player,
    enemyData: levelData.enemy,
    enemyFactory,
    solids: levelData.arena.solids,
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
    tutorial: new TutorialController(levelData.tutorialSteps ?? []),
  };
}

export function updateLevel(level, actions, dt) {
  if (level.status !== "en curso") return level.combat.outcome;
  level.physicsSolids[level.physicsSolids.length - 1] = level.enemy.bodyBox;
  level.physics.update(level.player, actions, dt, level.physicsSolids);
  level.tutorial.update(actions, level.player, level.enemy);
  if (level.tutorial.completed) level.enemy.setCombatReady?.(true);
  level.combat.update(dt, actions);
  if (level.tutorial.completed) level.elapsedSeconds += dt;
  if (level.elapsedSeconds >= level.data.timeLimitSec && level.combat.outcome === COMBAT_OUTCOME.IN_PROGRESS) {
    level.combat.finishForTimeout();
  }
  if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY) level.status = "completado";
  else if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT) level.status = "derrotado";
  return level.combat.outcome;
}

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
