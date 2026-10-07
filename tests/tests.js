import { CombatSystem } from "../src/combat-system.js";
import { CHILO_WING_ATTACK, COMBAT_OUTCOME, MAX_ACTIVE_PROJECTILES, TRAINING_DUMMY } from "../src/combat-config.js";
import { TRAINING_DUMMY_DATA } from "../src/combat-data.js";
import { FighterEntity } from "../src/fighter-entity.js";
import { PhysicsWorld } from "../src/physics.js";
import { TEST_ROOM_SOLIDS, TEST_ROOM_START } from "../src/test-room.js";
import { FIXED_STEP_SECONDS, LOGICAL_HEIGHT, LOGICAL_WIDTH, STATE } from "../src/constants.js";
import { InputController } from "../src/input-controller.js";
import { GameClock } from "../src/game-clock.js";
import { StateMachine } from "../src/state-machine.js";
import { createStates } from "../src/states.js";
import { LEVEL_1_DATA } from "../src/level-1-data.js";
import { loadLevel, updateLevel } from "../src/level-loader.js";
import { CHILO_DATA, CHILO_JUMP_ATTACK } from "../src/boss-data.js";
import { Chilo } from "../src/chilo.js";
import { EnemyCombatant } from "../src/enemy-combatant.js";

const output = document.querySelector("#results");
const summary = document.querySelector("#summary");
const results = [];
const dt = FIXED_STEP_SECONDS;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(name, test) {
  try {
    test();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error?.message ?? String(error) });
  }
}

function actions(overrides = {}) {
  const neutral = { pressed: false, held: false, released: false };
  return {
    moveX: 0,
    jump: { ...neutral, bufferRemainingSeconds: 0 },
    guard: { ...neutral },
    normalAttack: { ...neutral },
    specialTap: { ...neutral },
    debugToggle: { ...neutral },
    restartLevel: { ...neutral },
    ...overrides,
  };
}

function makeFight({ playerX = 625, enemyData = TRAINING_DUMMY_DATA } = {}) {
  const player = new FighterEntity({ fighterId: "alma", x: playerX, y: 430 });
  player.grounded = true;
  return { player, fight: new CombatSystem({ player, enemyData, solids: [] }) };
}

function phaseFixture() {
  const phaseAttack = (patternId) => Object.freeze({
    patternId, name: patternId, kind: "melee", damage: 1, width: 12, height: 12,
    offsetX: 0, offsetY: -6, startupSec: 0.1, activeSec: 0.1, recoverySec: 0.1,
  });
  return Object.freeze({
    ...TRAINING_DUMMY,
    id: "phase-fixture",
    maxHp: 100,
    phases: Object.freeze([
      Object.freeze({ transitionAtHp: 50, interAttackDelaySec: 99, attacks: Object.freeze([phaseAttack("fixture-phase-one")]) }),
      Object.freeze({ interAttackDelaySec: 99, attacks: Object.freeze([phaseAttack("fixture-phase-two")]) }),
    ]),
  });
}

run("El cargador construye Nivel 1 desde datos con estado limpio", () => {
  const level = loadLevel(LEVEL_1_DATA, "alma");
  assert(level.data === LEVEL_1_DATA && level.data.id === "nivel-1", "no conservó datos del Nivel 1");
  assert(level.player.position.x === 210 && level.player.position.y === 430, "aparición del estudiante incorrecta");
  assert(level.enemy instanceof Chilo && level.enemy.hp === 80, "no creó a Chilo con 80 HP");
  assert(level.enemy.position.x === 750 && level.enemy.position.y === 430, "aparición de Chilo incorrecta");
  assert(level.elapsedSeconds === 0 && level.status === "en curso", "el nivel no empieza limpio");
  assert(level.combat.projectiles.length === 0 && level.combat.playerCombatant.hp === 100, "quedaron daños/proyectiles iniciales");
  assert(level.tutorial.stepIndex === 0 && level.tutorial.currentStep.id === "move", "el tutorial no inicia en el primer paso");
  assert(level.data.timeLimitSec === 150 && level.data.arena.solids.length === 3, "arena o límite de tiempo incorrecto");
  const genericEnemy = loadLevel({ ...LEVEL_1_DATA, enemyType: "enemigo-configurable" }, "diego").enemy;
  assert(genericEnemy instanceof EnemyCombatant, "el cargador no acepta enemigos base configurados por datos");
});

run("El tutorial avanza solo con cada acción y el reinicio vuelve al primer paso", () => {
  const level = loadLevel(LEVEL_1_DATA, "alma");
  const tutorial = level.tutorial;
  assert(!tutorial.update(actions({ jump: { pressed: true, held: true, released: false } }), level.player, level.enemy), "saltó el paso de movimiento");
  assert(tutorial.update(actions({ moveX: 1, jump: { pressed: true, held: true, released: false } }), level.player, level.enemy), "no aceptó movimiento");
  assert(tutorial.currentStep.id === "jump", "omitió el paso de salto");
  assert(!tutorial.update(actions({ moveX: 1 }), level.player, level.enemy), "movimiento omitió el paso de salto");
  assert(tutorial.update(actions({ jump: { pressed: true, held: true, released: false } }), level.player, level.enemy), "no aceptó salto");
  assert(tutorial.currentStep.id === "attack", "orden de tutorial incorrecto tras salto");
  assert(tutorial.update(actions({ normalAttack: { pressed: true, held: true, released: false } }), level.player, level.enemy), "no aceptó ataque");
  assert(tutorial.currentStep.id === "guard", "paso de guardia fuera de orden");
  assert(tutorial.update(actions({ guard: { pressed: false, held: true, released: false } }), level.player, level.enemy), "no aceptó guardia sostenida");
  assert(tutorial.currentStep.id === "special", "paso de especial fuera de orden");
  assert(tutorial.update(actions({ specialTap: { pressed: true, held: false, released: true } }), level.player, level.enemy), "no aceptó especial");
  assert(tutorial.currentStep.id === "approach", "no llegó al paso de aproximación");
  assert(!tutorial.update(actions(), level.player, level.enemy), "avanzó aproximación sin acercarse");
  level.player.position.x = 500;
  assert(tutorial.update(actions(), level.player, level.enemy) && tutorial.completed, "no avanzó al entrar en distancia de combate");
  tutorial.reset();
  assert(!tutorial.completed && tutorial.stepIndex === 0 && tutorial.currentStep.id === "move", "el tutorial no se reinició");
});

run("La victoria completa el nivel; la derrota usa GAME OVER; KO simultáneo gana", () => {
  const victory = loadLevel(LEVEL_1_DATA, "alma");
  victory.combat.enemy.applyDamage(80, { sourceId: "test", attackInstanceId: "victory", step: 1 });
  updateLevel(victory, actions(), dt);
  assert(victory.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY && victory.status === "completado", "muerte de Chilo no completó el nivel");

  const defeat = loadLevel(LEVEL_1_DATA, "alma");
  defeat.combat.playerCombatant.applyDamage(100, { sourceId: "test", attackInstanceId: "defeat", step: 1 });
  updateLevel(defeat, actions(), dt);
  assert(defeat.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT && defeat.status === "derrotado", "muerte del jugador no produjo derrota");

  const tie = loadLevel(LEVEL_1_DATA, "alma");
  tie.player.position.x = 630;
  tie.combat.enemy.applyDamage(70, { sourceId: "test", attackInstanceId: "weaken", step: 1 });
  tie.combat.playerCombatant.applyDamage(99, { sourceId: "test", attackInstanceId: "weaken-player", step: 1 });
  tie.combat.playerCombatant.invulnerabilityRemainingSec = 0;
  tie.combat.spawnProjectile({ id: "tie-projectile", patternId: "test", attackInstanceId: "tie-projectile", owner: "enemy", x: 630, y: 390, velocityX: 0, velocityY: 0, width: 8, height: 8, damage: 1, lifetimeSec: 2 });
  updateLevel(tie, actions({ normalAttack: { pressed: true, held: true, released: false } }), dt);
  assert(tie.combat.enemy.hp === 0 && tie.combat.playerCombatant.hp === 0, "el escenario no produjo KO simultáneo");
  assert(tie.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY && tie.status === "completado", "el KO simultáneo no completó con victoria");

  const timed = loadLevel({ ...LEVEL_1_DATA, timeLimitSec: 0 }, "alma");
  const tutorialActions = [
    actions({ moveX: 1 }),
    actions({ jump: { pressed: true, held: true, released: false, bufferRemainingSeconds: 0.1 } }),
    actions({ normalAttack: { pressed: true, held: true, released: false } }),
    actions({ guard: { pressed: false, held: true, released: false } }),
    actions({ specialTap: { pressed: true, held: false, released: true } }),
  ];
  for (const tutorialAction of tutorialActions) timed.tutorial.update(tutorialAction, timed.player, timed.enemy);
  timed.player.position.x = 500;
  timed.tutorial.update(actions(), timed.player, timed.enemy);
  updateLevel(timed, actions(), dt);
  assert(timed.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT && timed.status === "derrotado", "el límite de tiempo no termina el encuentro");
});

run("Recrear el Nivel 1 limpia daño, proyectiles, tutorial y resultado", () => {
  const dirty = loadLevel(LEVEL_1_DATA, "nadia");
  dirty.player.position.x = 550;
  dirty.combat.playerCombatant.applyDamage(20, { sourceId: "test", attackInstanceId: "dirty", step: 1 });
  dirty.combat.enemy.applyDamage(10, { sourceId: "test", attackInstanceId: "dirty", step: 1 });
  dirty.combat.spawnProjectile({ id: "dirty-shot", patternId: "test", attackInstanceId: "dirty-shot", owner: "enemy", x: 500, y: 300, velocityX: 30, velocityY: 0, width: 8, height: 8, damage: 1, lifetimeSec: 2 });
  dirty.tutorial.update(actions({ moveX: 1 }), dirty.player, dirty.enemy);
  dirty.status = "derrotado";

  const clean = loadLevel(LEVEL_1_DATA, "nadia");
  assert(clean.player.position.x === 210 && clean.player.position.y === 430, "posición no se restauró");
  assert(clean.combat.playerCombatant.hp === 85 && clean.combat.enemy.hp === 80, "vida no se restauró");
  assert(clean.combat.projectiles.length === 0 && clean.combat.outcome === COMBAT_OUTCOME.IN_PROGRESS, "proyectiles o resultado residual");
  assert(clean.tutorial.stepIndex === 0 && clean.elapsedSeconds === 0 && clean.status === "en curso", "tutorial/temporizador/estado no se restauró");
});

run("Pausa omite pasos y congela tutorial, telegráfico y ataque de Chilo", () => {
  const level = loadLevel(LEVEL_1_DATA, "diego");
  const tutorialBefore = JSON.stringify({ step: level.tutorial.stepIndex, hp: level.combat.playerCombatant.hp, elapsed: level.elapsedSeconds });
  for (let frame = 0; frame < 120; frame += 1) { /* La máquina en PAUSA no llama updateLevel. */ }
  assert(JSON.stringify({ step: level.tutorial.stepIndex, hp: level.combat.playerCombatant.hp, elapsed: level.elapsedSeconds }) === tutorialBefore, "tutorial avanzó durante pausa");
  updateLevel(level, actions({ jump: { pressed: true, held: true, released: false } }), dt);
  assert(level.tutorial.currentStep.id === "move", "la pausa permitió saltar pasos al reanudar");

  const fighting = loadLevel(LEVEL_1_DATA, "alma");
  fighting.enemy.setCombatReady(true);
  fighting.player.position.x = 630;
  fighting.combat.update(dt, actions());
  for (let step = 0; step < 20; step += 1) fighting.combat.update(dt, actions());
  const before = JSON.stringify(fighting.combat.snapshot);
  for (let frame = 0; frame < 120; frame += 1) { /* La pausa no llama al paso fijo. */ }
  assert(JSON.stringify(fighting.combat.snapshot) === before, "aviso/ataque de Chilo avanzó en pausa");
  fighting.combat.update(dt, actions());
  assert(fighting.combat.snapshot.enemy.currentAttack.elapsedSec > JSON.parse(before).enemy.currentAttack.elapsedSec, "no reanudó desde el mismo tick");
  assert(fighting.combat.playerCombatant.hp === 100, "apareció daño fantasma al reanudar");
});

run("Chilo usa los tiempos/daños documentados de aletazo y salto anunciado", () => {
  const level = loadLevel(LEVEL_1_DATA, "alma");
  level.enemy.setCombatReady(true);
  level.player.position.x = 630;
  const opening = level.combat.update(dt, actions());
  assert(level.enemy.attack?.data.patternId === "CHILO_WING" && level.enemy.attack.phase === "warning", "Chilo no inició con CHILO_WING en aviso");
  assert(opening.some((event) => event.kind === "warningStarted"), "no emitió aviso inicial");
  assert(CHILO_DATA.maxHp === 80 && CHILO_DATA.interAttackDelaySec === 2.4, "vida/ritmo no coincide con el diseño");
  assert(level.enemy.attack.data.startupSec === 1.15 && level.enemy.attack.data.activeSec === 0.18 && level.enemy.attack.data.recoverySec === 0.65 && level.enemy.attack.data.damage === 12, "tiempos/daño de aletazo incorrectos");
  for (let step = 0; step < 68; step += 1) level.combat.update(dt, actions());
  assert(level.enemy.attack.phase === "warning", "el aviso del aletazo terminó antes de 1.15 s");
  const wingEvents = level.combat.update(dt, actions());
  assert(level.enemy.attack.phase === "active", "el aletazo no entró en activo a 1.15 s");
  assert(level.combat.playerCombatant.hp === 88, `aletazo debía causar 12, HP=${level.combat.playerCombatant.hp}`);
  assert(wingEvents.filter((event) => event.kind === "damageApplied" && event.targetId === "alma").length === 1, "el aletazo duplicó daño");
  assert(level.enemy.attack.data.width === 125 && level.enemy.attack.data.offsetY === -95 && level.enemy.attack.data.height === 90, "zona del aletazo no representa x125/y335…425");

  const guardedWing = loadLevel(LEVEL_1_DATA, "alma");
  guardedWing.enemy.setCombatReady(true);
  guardedWing.player.position.x = 630;
  guardedWing.player.grounded = true;
  guardedWing.combat.update(dt, actions({ guard: { pressed: false, held: true, released: false } }));
  for (let step = 0; step < 69; step += 1) guardedWing.combat.update(dt, actions({ guard: { pressed: false, held: true, released: false } }));
  assert(guardedWing.combat.playerCombatant.hp === 96, `S debía reducir el aletazo de 12 a 4, HP=${guardedWing.combat.playerCombatant.hp}`);

  let iterations = 0;
  while (level.enemy.attack?.data.patternId !== "CHILO_JUMP" && iterations < 500) {
    level.combat.update(dt, actions());
    iterations += 1;
  }
  assert(level.enemy.attack?.data.patternId === "CHILO_JUMP", "Chilo no alternó a salto");
  const jumpTarget = { ...level.enemy.attack.targetPosition };
  assert(level.enemy.attack.data.startupSec === 1 && level.enemy.attack.data.activeSec === 0.25 && level.enemy.attack.data.recoverySec === 0.85 && level.enemy.attack.data.damage === 16 && level.enemy.attack.data.diameterPx === 100, "datos del salto no coinciden con el diseño");
  assert(Math.abs(jumpTarget.x - level.enemy.position.x) <= 280, "destino del salto excedió 280 px");
  level.player.position.x = 500;
  for (let step = 0; step < 60; step += 1) level.combat.update(dt, actions());
  assert(level.enemy.attack?.phase === "active", "el salto no aterrizó tras 1 s de aviso");
  assert(level.enemy.attack.targetPosition.x === jumpTarget.x && level.enemy.attack.targetPosition.y === jumpTarget.y, "el destino cambió con el movimiento del jugador");
  assert(level.combat.playerCombatant.hp === 88, "el salto dañó durante arco o fuera de la sombra fijada");

  const jumpHit = loadLevel(LEVEL_1_DATA, "alma");
  jumpHit.enemy.setCombatReady(true);
  jumpHit.player.position.x = 630;
  jumpHit.player.grounded = true;
  jumpHit.combat.update(dt, actions());
  while (jumpHit.enemy.attack && jumpHit.enemy.attack.data.patternId === "CHILO_WING") jumpHit.combat.update(dt, actions());
  let jumpWait = 0;
  while (jumpHit.enemy.attack?.data.patternId !== CHILO_JUMP_ATTACK.patternId && jumpWait < 600) {
    jumpHit.combat.update(dt, actions());
    jumpWait += 1;
  }
  assert(jumpHit.enemy.attack?.data.patternId === "CHILO_JUMP", "no encontró salto para impacto");
  jumpHit.player.position.x = jumpHit.enemy.attack.targetPosition.x;
  while (jumpHit.enemy.attack?.phase === "warning") jumpHit.combat.update(dt, actions({ guard: { pressed: false, held: true, released: false } }));
  assert(jumpHit.combat.playerCombatant.hp === 72, `salto debía causar 16 al aterrizar, HP=${jumpHit.combat.playerCombatant.hp}`);
});

run("Alma, Diego y Nadia pueden golpear a Chilo y recorren ambos patrones", () => {
  const expected = { alma: { hp: 100, damage: 10 }, diego: { hp: 120, damage: 12 }, nadia: { hp: 85, damage: 8 } };
  for (const [fighterId, stats] of Object.entries(expected)) {
    const level = loadLevel(LEVEL_1_DATA, fighterId);
    level.player.position.x = 630;
    level.enemy.setCombatReady(true);
    assert(level.combat.playerCombatant.maxHp === stats.hp, `${fighterId}: vida inicial incorrecta`);
    level.combat.update(dt, actions({ normalAttack: { pressed: true, held: true, released: false } }));
    assert(level.enemy.hp === 80 - stats.damage, `${fighterId}: ataque normal no aplicó su daño`);
    assert(level.enemy.attack?.data.patternId === "CHILO_WING", `${fighterId}: Chilo no inició con aletazo`);
    let steps = 0;
    while (level.enemy.attack?.data.patternId !== "CHILO_JUMP" && steps < 500) {
      level.combat.update(dt, actions());
      steps += 1;
    }
    assert(level.enemy.attack?.data.patternId === "CHILO_JUMP", `${fighterId}: Chilo no llegó al salto`);
  }
});

run("Un ataque daña una vez; mantener atacar no lo repite", () => {
  const { fight } = makeFight();
  fight.update(dt, actions({ normalAttack: { pressed: true, held: true, released: false } }));
  for (let step = 0; step < 45; step += 1) {
    fight.update(dt, actions({ normalAttack: { pressed: false, held: true, released: false } }));
  }
  assert(fight.enemy.hp === 70, `HP enemigo esperado 70, recibido ${fight.enemy.hp}`);
});

run("Invulnerabilidad limita a un daño por golpe y proyectil en el mismo paso", () => {
  const { player, fight } = makeFight({ playerX: 680 });
  fight.enemy.position.x = 680;
  fight.enemy.attack = {
    id: "test-melee", data: CHILO_WING_ATTACK, elapsedSec: CHILO_WING_ATTACK.startupSec,
    phase: "active", facing: -1, targetPosition: { x: 680, y: 390 }, contactedTargets: new Set(),
  };
  fight.spawnProjectile({ id: "test-shot", patternId: "test", attackInstanceId: "test-shot", owner: "enemy", x: 680, y: 390, velocityX: 0, velocityY: 0, width: 18, height: 18, damage: 8, lifetimeSec: 2 });
  const events = fight.update(dt, actions());
  const damages = events.filter((event) => event.kind === "damageApplied" && event.targetId === player.fighterId);
  assert(damages.length === 1, `eventos de daño esperados 1, recibidos ${damages.length}`);
  assert(events.some((event) => event.kind === "projectileContact"), "el proyectil no alcanzó el objetivo en ese paso");
  assert(fight.playerCombatant.hp === 92, `HP jugador esperado 92 tras un único daño de 8, recibido ${fight.playerCombatant.hp}`);
});

run("Proyectil: movimiento, pared, objetivo, máximo activo y salida de pantalla", () => {
  const { player, fight } = makeFight();
  const wallFight = new CombatSystem({ player, enemyData: TRAINING_DUMMY_DATA, solids: [{ x: 80, y: 0, width: 18, height: LOGICAL_HEIGHT }] });
  assert(wallFight.spawnProjectile({ id: "wall", patternId: "test", attackInstanceId: "wall", owner: "player", x: 90, y: 390, velocityX: -600, velocityY: 0, width: 10, height: 10, damage: 1, lifetimeSec: 2 }), "no creó proyectil de pared");
  wallFight.update(dt, actions());
  assert(wallFight.projectiles.length === 0, "proyectil no se eliminó al chocar con pared");

  const targetFight = makeFight();
  const startX = targetFight.fight.enemy.position.x - 80;
  targetFight.fight.spawnProjectile({ id: "hit", patternId: "test", attackInstanceId: "hit", owner: "player", x: startX, y: 390, velocityX: 600, velocityY: 0, width: 10, height: 10, damage: 5, lifetimeSec: 2 });
  const initialX = targetFight.fight.projectiles[0].position.x;
  targetFight.fight.update(0.2, actions());
  assert(targetFight.fight.projectiles.length === 0, "proyectil no se eliminó tras tocar hurtbox");
  assert(targetFight.fight.projectiles[0] === undefined && targetFight.fight.enemy.hp === 75, "hurtbox no recibió el daño esperado");

  const travelFight = makeFight();
  travelFight.fight.spawnProjectile({ id: "travel", patternId: "test", attackInstanceId: "travel", owner: "player", x: 400, y: 100, velocityX: 120, velocityY: 0, width: 4, height: 4, damage: 1, lifetimeSec: 3 });
  travelFight.fight.update(dt, actions());
  assert(travelFight.fight.projectiles[0]?.position.x > 400, "el proyectil no avanzó según su velocidad");

  const capFight = makeFight();
  for (let index = 0; index < MAX_ACTIVE_PROJECTILES; index += 1) {
    assert(capFight.fight.spawnProjectile({ id: `cap-${index}`, patternId: "test", attackInstanceId: `cap-${index}`, owner: "player", x: 400, y: 100, velocityX: 0, velocityY: 0, width: 2, height: 2, damage: 1, lifetimeSec: 3 }), "rechazó antes de alcanzar el máximo");
  }
  assert(!capFight.fight.spawnProjectile({ id: "over-cap", patternId: "test", attackInstanceId: "over-cap", owner: "player", x: 400, y: 100, velocityX: 0, velocityY: 0, width: 2, height: 2, damage: 1, lifetimeSec: 3 }), "aceptó más del máximo activo");
  capFight.fight.update(dt, actions());
  assert(capFight.fight.projectiles.every((projectile) => projectile.position.x === 400), "proyectiles estáticos dejaron de viajar correctamente");

  const edgeFight = makeFight();
  edgeFight.fight.spawnProjectile({ id: "edge", patternId: "test", attackInstanceId: "edge", owner: "player", x: LOGICAL_WIDTH + 50, y: 100, velocityX: 600, velocityY: 0, width: 2, height: 2, damage: 1, lifetimeSec: 3 });
  edgeFight.fight.update(dt, actions());
  assert(edgeFight.fight.projectiles.length === 0, "no limpió el proyectil fuera de pantalla");
});

run("Pausa congela startup, activa, recuperación y proyectil; reanuda sin daño fantasma", () => {
  for (const phase of ["warning", "active", "recovery"]) {
    const { fight } = makeFight();
    const elapsedSec = phase === "warning" ? 0.1 : phase === "active" ? 1.16 : 1.34;
    fight.enemy.attack = { id: `pause-${phase}`, data: CHILO_WING_ATTACK, elapsedSec, phase, facing: -1, targetPosition: { x: 625, y: 390 }, contactedTargets: new Set(phase === "active" ? ["alma"] : []) };
    const before = JSON.stringify(fight.snapshot);
    for (let frame = 0; frame < 144; frame += 1) { /* PAUSA no invoca update. */ }
    assert(JSON.stringify(fight.snapshot) === before, `cambió estado durante pausa en ${phase}`);
    fight.update(dt, actions());
    assert(fight.enemy.attack !== null, `ataque desapareció al reanudar desde ${phase}`);
    assert(fight.playerCombatant.hp === 100, `daño fantasma al reanudar desde ${phase}`);
  }
  const { fight } = makeFight();
  fight.spawnProjectile({ id: "paused-shot", patternId: "test", attackInstanceId: "paused-shot", owner: "enemy", x: 400, y: 300, velocityX: 60, velocityY: 0, width: 8, height: 8, damage: 1, lifetimeSec: 3 });
  const beforeX = fight.projectiles[0].position.x;
  const clock = new GameClock();
  clock.update(8.25);
  const beforeClock = clock.elapsedSeconds;
  const before = JSON.stringify(fight.snapshot);
  for (let frame = 0; frame < 144; frame += 1) { /* Simula espera de reloj de pared pausado. */ }
  assert(JSON.stringify(fight.snapshot) === before && clock.elapsedSeconds === beforeClock, "combate o reloj avanzó en pausa");
  fight.update(dt, actions()); clock.update(dt);
  assert(fight.projectiles[0].position.x > beforeX && Math.abs(clock.elapsedSeconds - beforeClock - dt) < 1e-10, "no reanudó en un paso fijo limpio");
});

run("KO simultáneo da victoria; derrota transita a GAME OVER; derrota del enemigo queda marcada", () => {
  const simultaneous = makeFight({ playerX: 625 });
  simultaneous.fight.playerCombatant.applyDamage(99);
  simultaneous.fight.playerCombatant.invulnerabilityRemainingSec = 0;
  simultaneous.fight.enemy.applyDamage(70);
  simultaneous.fight.enemy.attack = { id: "ko-melee", data: CHILO_WING_ATTACK, elapsedSec: 1.15, phase: "active", facing: -1, targetPosition: { x: 625, y: 390 }, contactedTargets: new Set() };
  simultaneous.fight.spawnProjectile({ id: "ko-shot", patternId: "test", attackInstanceId: "ko-shot", owner: "enemy", x: 625, y: 390, velocityX: 0, velocityY: 0, width: 8, height: 8, damage: 1, lifetimeSec: 2 });
  simultaneous.fight.update(dt, actions({ normalAttack: { pressed: true, held: true, released: false } }));
  assert(simultaneous.fight.enemy.hp === 0 && simultaneous.fight.playerCombatant.hp === 0, "el fixture no produjo KO simultáneo");
  assert(simultaneous.fight.outcome === COMBAT_OUTCOME.PLAYER_VICTORY, `prioridad incorrecta: ${simultaneous.fight.outcome}`);

  const loss = makeFight({ playerX: 680 });
  loss.fight.playerCombatant.applyDamage(99); loss.fight.playerCombatant.invulnerabilityRemainingSec = 0;
  loss.fight.enemy.position.x = 750;
  loss.fight.enemy.attack = { id: "loss-melee", data: CHILO_WING_ATTACK, elapsedSec: 1.15, phase: "active", facing: -1, targetPosition: { x: 680, y: 390 }, contactedTargets: new Set() };
  loss.fight.update(dt, actions());
  assert(loss.fight.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT, "no expuso derrota del jugador");

  const clock = new GameClock();
  let autoStep = 0;
  const fakeInput = {
    snapshotForStep: () => {
      const step = autoStep++;
      if (step === 0) return actions({ moveX: 1 });
      if (step === 1) return actions({ jump: { pressed: true, held: true, released: false, bufferRemainingSeconds: 0.1 } });
      if (step === 2) return actions({ normalAttack: { pressed: true, held: true, released: false } });
      if (step === 3) return actions({ guard: { pressed: false, held: true, released: false } });
      if (step === 4) return actions({ specialTap: { pressed: true, held: false, released: true } });
      return actions({ moveX: 1 });
    },
    clear() {},
  };
  let machine;
  const states = createStates(clock, fakeInput, () => machine.transition(STATE.GAME_OVER));
  const allowed = new Map([[STATE.MENU, new Set([STATE.PLAYING])], [STATE.PLAYING, new Set([STATE.PAUSED, STATE.GAME_OVER])], [STATE.PAUSED, new Set([STATE.PLAYING, STATE.MENU])], [STATE.GAME_OVER, new Set([STATE.MENU])]]);
  machine = new StateMachine(states, allowed, STATE.MENU);
  machine.transition(STATE.PLAYING);
  for (let step = 0; step < 12000 && machine.currentName === STATE.PLAYING; step += 1) machine.update(dt);
  assert(machine.currentName === STATE.GAME_OVER, `la máquina quedó en ${machine.currentName} tras 200 s simulados`);

  const enemyOnly = makeFight();
  enemyOnly.fight.enemy.applyDamage(79);
  enemyOnly.fight.update(dt, actions({ normalAttack: { pressed: true, held: true, released: false } }));
  assert(enemyOnly.fight.enemy.hp === 0, "enemigo no llegó a cero");
  assert(enemyOnly.fight.outcome === COMBAT_OUTCOME.PLAYER_VICTORY, "muerte aislada del enemigo no marcó victoria");
});

run("Umbral de fase y siguiente ataque son genéricos por datos", () => {
  const player = new FighterEntity({ fighterId: "alma", x: 625, y: 430 });
  const enemy = new CombatSystem({ player, enemyData: phaseFixture(), solids: [] }).enemy;
  assert(enemy.peekNextAttack().patternId === "fixture-phase-one", "fase inicial incorrecta");
  const firstAttack = enemy.peekNextAttack();
  enemy.attack = { id: "phase-in-progress", data: firstAttack, elapsedSec: 0.2, phase: "recovery", facing: -1, targetPosition: { x: 625, y: 390 }, contactedTargets: new Set() };
  enemy.applyDamage(50, { sourceId: "test", attackInstanceId: "threshold", step: 1 });
  assert(enemy.phaseIndex === 0, "cambió de fase antes de terminar el ataque en curso");
  enemy.update(0.1, player);
  assert(enemy.phaseIndex === 1, "no cambió de fase al terminar el ataque tras cruzar el umbral de HP");
  assert(enemy.peekNextAttack().patternId === "fixture-phase-two", "no expuso patrón de la fase nueva");
});

run("60 Hz y 144 Hz de reloj de pared producen la misma simulación fija", () => {
  function simulate(renderHz) {
    const { fight, player } = makeFight({ playerX: 300 });
    const physics = new PhysicsWorld();
    player.grounded = true;
    let accumulator = 0;
    const renderDt = 1 / renderHz;
    const duration = 6;
    const frames = Math.round(renderHz * duration);
    for (let frame = 0; frame < frames; frame += 1) {
      accumulator += renderDt;
      while (accumulator + 1e-12 >= dt) {
        physics.update(player, actions({ moveX: 1 }), dt, []);
        fight.update(dt, actions());
        accumulator -= dt;
      }
    }
    return { x: player.position.x, hp: fight.enemy.hp, steps: fight.snapshot.step };
  }
  const at60 = simulate(60);
  const at144 = simulate(144);
  assert(JSON.stringify(at60) === JSON.stringify(at144), `60 Hz ${JSON.stringify(at60)} ≠ 144 Hz ${JSON.stringify(at144)}`);
});

run("Pérdida de foco limpia acciones held y pressed", () => {
  const mockMachine = { currentName: STATE.PLAYING, transition(next) { this.currentName = next; return true; } };
  const input = new InputController();
  input.connect({ stateMachine: mockMachine, clock: { reset() {} }, loop: { resetTiming() {} } });
  input.mount();
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD", bubbles: true }));
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyR", bubbles: true }));
  const before = input.snapshotForStep();
  assert(before.moveX === 1 && before.normalAttack.held, "no registró las acciones sintéticas");
  window.dispatchEvent(new Event("blur"));
  const after = input.snapshotForStep();
  assert(mockMachine.currentName === STATE.PAUSED, "no pausó al perder foco");
  assert(after.moveX === 0 && !after.moveRight.held && !after.normalAttack.held && !after.normalAttack.pressed, "quedaron acciones retenidas o pulsadas");
  input.unmount();
});

run("T reinicia desde pausa y GAME OVER con transiciones permitidas", () => {
  const allowed = new Map([
    [STATE.MENU, new Set([STATE.PLAYING])],
    [STATE.PLAYING, new Set([STATE.PAUSED, STATE.GAME_OVER])],
    [STATE.PAUSED, new Set([STATE.PLAYING, STATE.MENU])],
    [STATE.GAME_OVER, new Set([STATE.MENU])],
  ]);
  const machine = {
    currentName: STATE.PAUSED,
    transitions: [],
    transition(next) {
      if (!allowed.get(this.currentName)?.has(next)) return false;
      this.transitions.push([this.currentName, next]);
      this.currentName = next;
      return true;
    },
  };
  const input = new InputController();
  input.connect({ stateMachine: machine, clock: { reset() {} }, loop: { resetTiming() {} } });
  input.mount();
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT", bubbles: true }));
  assert(machine.currentName === STATE.PLAYING && machine.transitions[0][0] === STATE.PAUSED && machine.transitions[1][0] === STATE.MENU, "T no reinició desde pausa por las transiciones existentes");
  window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyT", bubbles: true }));
  machine.currentName = STATE.GAME_OVER;
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT", bubbles: true }));
  assert(machine.currentName === STATE.PLAYING && machine.transitions.slice(-2)[0][0] === STATE.GAME_OVER, "T no reinició desde GAME OVER");
  input.unmount();
});

run("Física 2.2: salto cercano a 150 px y no atraviesa suelo, pared, plataforma ni muñeco", () => {
  const physics = new PhysicsWorld();
  const player = new FighterEntity({ fighterId: "alma", x: 210, y: 430 });
  player.grounded = true;
  let peak = player.position.y;
  physics.update(player, actions({ jump: { pressed: true, held: true, released: false, bufferRemainingSeconds: 0.1 } }), dt, TEST_ROOM_SOLIDS);
  for (let step = 0; step < 90; step += 1) {
    physics.update(player, actions({ jump: { pressed: false, held: true, released: false, bufferRemainingSeconds: 0 } }), dt, TEST_ROOM_SOLIDS);
    peak = Math.min(peak, player.position.y);
  }
  const jumpHeight = 430 - peak;
  assert(jumpHeight >= 140 && jumpHeight <= 160, `altura de salto ${jumpHeight.toFixed(1)} px`);

  const collisionPlayer = new FighterEntity({ fighterId: "alma", x: 840, y: 430 });
  collisionPlayer.grounded = true;
  for (let step = 0; step < 120; step += 1) physics.update(collisionPlayer, actions({ moveX: 1 }), dt, TEST_ROOM_SOLIDS);
  assert(collisionPlayer.bodyBox.x + collisionPlayer.bodyBox.width <= 862 + 1e-6, "atravesó la pared derecha");
  assert(collisionPlayer.position.y === 430 && collisionPlayer.grounded, "atravesó el suelo");

  const platformPlayer = new FighterEntity({ fighterId: "alma", x: 250, y: 430 });
  platformPlayer.grounded = true;
  physics.update(platformPlayer, actions({ jump: { pressed: true, held: true, released: false, bufferRemainingSeconds: 0.1 } }), dt, TEST_ROOM_SOLIDS);
  for (let step = 0; step < 180 && !platformPlayer.grounded; step += 1) {
    const jumpHeld = step < 25;
    physics.update(platformPlayer, actions({ moveX: step < 20 ? 1 : 0, jump: { held: jumpHeld, pressed: false, released: !jumpHeld } }), dt, TEST_ROOM_SOLIDS);
  }
  assert(platformPlayer.grounded && platformPlayer.position.y === 320, `no aterrizó sobre plataforma: y=${platformPlayer.position.y}`);

  const dummy = { x: 722, y: 334, width: 56, height: 96 };
  const dummyPlayer = new FighterEntity({ fighterId: "alma", x: 680, y: 430 });
  dummyPlayer.grounded = true;
  for (let step = 0; step < 120; step += 1) physics.update(dummyPlayer, actions({ moveX: 1 }), dt, [...TEST_ROOM_SOLIDS, dummy]);
  assert(dummyPlayer.bodyBox.x + dummyPlayer.bodyBox.width <= dummy.x + 1e-6, "atravesó la caja sólida del muñeco");
  assert(LOGICAL_HEIGHT === 540, "resolución lógica esperada cambió");
});

for (const result of results) {
  const item = document.createElement("li");
  item.className = result.passed ? "pass" : "fail";
  item.textContent = `${result.passed ? "PASA" : "FALLA"} — ${result.name}${result.error ? `: ${result.error}` : ""}`;
  output.append(item);
}
const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;
summary.textContent = failed === 0
  ? `Resultado: ${passed}/${results.length} pruebas PASA. Sin errores.`
  : `Resultado: ${passed}/${results.length} PASA; ${failed} FALLA. Revisa las líneas en rojo.`;
summary.style.borderLeftColor = failed === 0 ? "#75e397" : "#ff7682";
