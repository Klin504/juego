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
  const fakeInput = { snapshotForStep: () => actions(), clear() {} };
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
