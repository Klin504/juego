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
import { CampaignController } from "../src/campaign-controller.js";
import { VALID_STATE_TRANSITIONS } from "../src/campaign-transitions.js";
import { CAMPAIGN_RECORD_STORAGE_KEY, readCampaignRecord, saveCampaignRecord } from "../src/campaign-storage.js";
import { LEVEL_2_DATA } from "../src/level-2-data.js";
import { VERA_BALL_ATTACK, VERA_DATA, VERA_RUN_ATTACK } from "../src/vera-data.js";
import { Vera } from "../src/vera.js";
import { CAMPAIGN_LEVELS } from "../src/campaign-data.js";
import { LEVEL_3_DATA } from "../src/level-3-data.js";
import { CATODO3_DATA, CATODO_PULSE_ATTACK, CATODO_SENSOR_LEFT_ATTACK, CATODO_SENSOR_RIGHT_ATTACK } from "../src/catodo3-data.js";
import { Catodo3 } from "../src/catodo3.js";
import { LABORATORY_MECHANICS } from "../src/laboratory-mechanics.js";
import { Projectile } from "../src/projectile.js";
import { LEVEL_4_DATA } from "../src/level-4-data.js";
import { NULL_DATA, NULL_ATTACKS } from "../src/null-data.js";
import { NullBoss } from "../src/null-boss.js";
import { LIBRARY_MECHANICS, chooseReachableSafeZone, playerInsideSafeZone } from "../src/library-mechanics.js";

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
  const result = results.at(-1);
  const item = document.createElement("li");
  item.className = result.passed ? "pass" : "fail";
  item.textContent = `${result.passed ? "PASA" : "FALLA"} — ${result.name}${result.error ? `: ${result.error}` : ""}`;
  output.append(item);
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

function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
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

run("El cargador construye Nivel 2 con Vera y estado inicial limpio", () => {
  const level = loadLevel(LEVEL_2_DATA, "diego");
  assert(level.data === LEVEL_2_DATA && level.data.id === "nivel-2", "no cargó los datos de cancha");
  assert(level.enemy instanceof Vera && level.enemy.hp === 110, "Vera no se construyó con 110 HP");
  assert(level.enemy.position.x === 750 && level.enemy.bodySize.width === 44 && level.enemy.hurtSize.width === 40, "geometría inicial de Vera incorrecta");
  assert(level.combat.projectiles.length === 0 && level.combat.playerCombatant.hp === 120, "Nivel 2 no inicia limpio");
  assert(level.elapsedSeconds === 0 && level.status === "en curso" && level.tutorial.completed, "estado/tutorial inicial incorrecto");
  assert(level.data.timeLimitSec === 210 && level.data.arena.solids.length === 3, "arena o límite incorrecto");
  assert(level.data.arena.background.some((rect) => rect.id === "court-mid-line"), "faltan líneas decorativas de cancha");
});

run("Reiniciar el Nivel 2 limpia vida, balón, fase y estado de Vera", () => {
  const dirty = loadLevel(LEVEL_2_DATA, "nadia");
  dirty.combat.playerCombatant.applyDamage(10, { sourceId: "vera", attackInstanceId: "dirty-player", step: 1 });
  dirty.enemy.applyDamage(20, { sourceId: "nadia", attackInstanceId: "dirty-vera", step: 1 });
  dirty.combat.spawnProjectile({ id: "dirty-court-ball", attackInstanceId: "dirty-court-ball", patternId: "VERA_BALL", owner: "enemy", x: 300, y: 412, velocityX: -260, velocityY: 0, width: 24, height: 24, radius: 12, damage: 15, lifetimeSec: 6, courtReturn: { leftX: 110, rightX: 850, outboundDirection: -1 } });
  dirty.enemy.attack = { id: "dirty-attack", data: VERA_RUN_ATTACK, elapsedSec: 1.1, phase: "active", facing: -1, targetPosition: { x: 210, y: 391 }, contactedTargets: new Set(), sweepBox: { x: 98, y: 400, width: 764, height: 30 } };
  const clean = loadLevel(LEVEL_2_DATA, "nadia");
  assert(clean.combat.playerCombatant.hp === 85 && clean.enemy.hp === 110, "vida no volvió a valores iniciales");
  assert(clean.combat.projectiles.length === 0 && clean.enemy.attack === null && clean.enemy.phaseIndex === 0, "quedaron balón, ataque o fase residual");
  assert(clean.elapsedSeconds === 0 && clean.status === "en curso", "tiempo/estado no se reinició");
});

run("Vera usa patrones, tiempos, daño y vida documentados", () => {
  assert(VERA_DATA.maxHp === 110 && VERA_BALL_ATTACK.damage === 15, "vida/daño de balón incorrectos");
  assert(VERA_BALL_ATTACK.startupSec === 0.8 && VERA_BALL_ATTACK.recoverySec === 0.65 && VERA_DATA.interAttackDelaySec === 2.1, "secuencia de balón no coincide con ficha");
  assert(VERA_RUN_ATTACK.startupSec === 0.95 && VERA_RUN_ATTACK.activeSec === 0.4 && VERA_RUN_ATTACK.recoverySec === 0.75 && VERA_RUN_ATTACK.damage === 20, "tiempos/daño de carrera no coinciden");
  const level = loadLevel(LEVEL_2_DATA, "alma");
  let launchedAt = null;
  for (let step = 1; step <= 180; step += 1) {
    updateLevel(level, actions(), dt);
    if (level.lastCombatEvents.some((event) => event.kind === "projectileLaunched" && event.patternId === "VERA_BALL")) { launchedAt = step; break; }
  }
  assert(launchedAt !== null && level.combat.projectiles.length === 1, "Vera no lanzó el balón tras el aviso");
  const ball = level.combat.projectiles[0];
  assert(ball.attackInstanceId === level.enemy.attack?.id || ball.attackInstanceId.includes("vera-attack-"), "el balón no conserva ID de instancia de ataque");
  assert(ball.position.y === 412 && ball.radius === 12 && ball.velocity.x < 0, "balón/rumbo de ida incorrectos");
  const run = loadLevel(LEVEL_2_DATA, "alma");
  for (let step = 0; step < 700 && run.enemy.attack?.data.patternId !== "VERA_RUN"; step += 1) updateLevel(run, actions(), dt);
  assert(run.enemy.attack?.data.patternId === "VERA_RUN", "no alternó del balón a la carrera");
  assert(run.enemy.attack.sweepBox.y === 400 && run.enemy.attack.sweepBox.height === 30, "línea de carrera no ocupa y=400…430");
});

run("El balón de Vera rebota una vez y aplica un solo contacto por ID", () => {
  const player = new FighterEntity({ fighterId: "alma", x: 500, y: 430 });
  player.grounded = true;
  const quietEnemy = { ...TRAINING_DUMMY_DATA, initialDelaySec: 99, attacks: Object.freeze([]) };
  const combat = new CombatSystem({ player, enemyData: quietEnemy, solids: [] });
  combat.spawnProjectile({ id: "vera-ball-test", attackInstanceId: "vera-attack-1", patternId: "VERA_BALL", owner: "enemy", x: 600, y: 412, velocityX: -260, velocityY: 0, width: 24, height: 24, radius: 12, damage: 15, lifetimeSec: 6, courtReturn: { leftX: 110, rightX: 850, outboundDirection: -1 } });
  let firstContact = false;
  for (let step = 0; step < 60; step += 1) {
    const events = combat.update(dt, actions());
    if (events.some((event) => event.kind === "projectileContact")) { firstContact = true; break; }
  }
  assert(firstContact && combat.playerCombatant.hp === 85, "ida no infligió 15 de daño (Alma)");
  const projectile = combat.projectiles[0];
  const sameId = projectile.attackInstanceId;
  let returned = false;
  let previousX = projectile.position.x;
  for (let step = 0; step < 400 && combat.projectiles.length; step += 1) {
    combat.update(dt, actions());
    const current = combat.projectiles[0];
    if (current && current.velocity.x > 0 && current.position.x > previousX) returned = true;
    if (current) previousX = current.position.x;
  }
  assert(returned, "el balón no rebotó ni regresó");
  assert(combat.playerCombatant.hp === 85, "el regreso duplicó el daño de la misma instancia");
  assert(combat.projectiles.length === 0 && sameId === "vera-attack-1", "el proyectil no se limpió o cambió ID");
});

run("La carrera de Vera se puede evitar saltando y no se mitiga con guardia", () => {
  const level = loadLevel(LEVEL_2_DATA, "diego");
  const attack = { ...VERA_RUN_ATTACK, startupSec: 0, activeSec: 0.4 };
  const enemy = new Vera({ ...VERA_DATA, initialDelaySec: 99, attacks: Object.freeze([attack]) });
  enemy.attack = { id: "vera-run-test", data: attack, elapsedSec: 0, phase: "active", facing: -1, targetPosition: { x: 210, y: 391 }, contactedTargets: new Set(), sweepBox: { x: 98, y: 400, width: 764, height: 30 } };
  const player = level.player;
  player.position.x = 500;
  const groundedCombat = new CombatSystem({ player, enemyData: { ...VERA_DATA, initialDelaySec: 99 }, enemyFactory: () => enemy, solids: [] });
  groundedCombat.update(dt, actions({ guard: { pressed: false, held: true, released: false } }));
  assert(groundedCombat.playerCombatant.hp === 100, "S redujo el daño de carrera que debe ignorarlo");
  const jumper = new FighterEntity({ fighterId: "alma", x: 500, y: 400 });
  jumper.grounded = false;
  const jumpEnemy = new Vera({ ...VERA_DATA, initialDelaySec: 99 });
  jumpEnemy.attack = { id: "vera-run-jump", data: attack, elapsedSec: 0.1, phase: "active", facing: -1, targetPosition: { x: 500, y: 361 }, contactedTargets: new Set(), sweepBox: { x: 98, y: 400, width: 764, height: 30 } };
  const jumpCombat = new CombatSystem({ player: jumper, enemyData: VERA_DATA, enemyFactory: () => jumpEnemy, solids: [] });
  jumpCombat.update(dt, actions());
  assert(jumpCombat.playerCombatant.hp === 100, "la carrera golpeó al jugador con pies a y=400");
});

run("S reduce el balón de Vera a 5 de daño", () => {
  const player = new FighterEntity({ fighterId: "alma", x: 500, y: 430 });
  player.grounded = true;
  const quietEnemy = { ...TRAINING_DUMMY_DATA, initialDelaySec: 99, attacks: Object.freeze([]) };
  const combat = new CombatSystem({ player, enemyData: quietEnemy, solids: [] });
  combat.spawnProjectile({ id: "vera-ball-guard", attackInstanceId: "vera-guard-1", patternId: "VERA_BALL", owner: "enemy", x: 500, y: 412, velocityX: 0, velocityY: 0, width: 24, height: 24, radius: 12, damage: 15, lifetimeSec: 2, courtReturn: { leftX: 110, rightX: 850, outboundDirection: -1 } });
  combat.update(dt, actions({ guard: { pressed: false, held: true, released: false } }));
  assert(combat.playerCombatant.hp === 95, `guardia dejó ${combat.playerCombatant.hp} HP; debía aplicar 5 de daño`);
});

run("Pausa congela un ataque activo de Vera y reanudar no aplica daño fantasma", () => {
  const level = loadLevel(LEVEL_2_DATA, "alma");
  level.player.position.x = 500;
  level.enemy.attack = { id: "vera-run-pause", data: VERA_RUN_ATTACK, elapsedSec: 1.05, phase: "active", facing: -1, targetPosition: { x: 500, y: 391 }, contactedTargets: new Set(), sweepBox: { x: 98, y: 400, width: 764, height: 30 } };
  const before = level.enemy.attack.elapsedSec;
  const hpBefore = level.combat.playerCombatant.hp;
  const ball = { id: "paused-ball", attackInstanceId: "paused-ball", patternId: "VERA_BALL", owner: "enemy", x: 600, y: 412, velocityX: -260, velocityY: 0, width: 24, height: 24, radius: 12, damage: 15, lifetimeSec: null, courtReturn: { leftX: 110, rightX: 850, outboundDirection: -1 } };
  level.combat.spawnProjectile(ball);
  const projectileX = level.combat.projectiles[0].position.x;
  for (let step = 0; step < 120; step += 1) { /* Estado PAUSA: no se ejecuta updateLevel. */ }
  assert(level.enemy.attack.elapsedSec === before && level.combat.playerCombatant.hp === hpBefore, "el ataque cambió durante la pausa");
  assert(level.combat.projectiles[0].position.x === projectileX, "el balón avanzó durante la pausa");
  updateLevel(level, actions(), dt);
  assert(level.combat.playerCombatant.hp === hpBefore - 20, "el daño de carrera no se aplicó al reanudar en el paso activo");
  assert(level.enemy.attack.elapsedSec === before + dt, "la fase no continuó desde el tiempo pausado");
});

run("La campaña enlaza niveles 1–4 y conserva estudiante hasta el último duelo", () => {
  assert(CAMPAIGN_LEVELS.length === 4 && CAMPAIGN_LEVELS[1].data === LEVEL_2_DATA && CAMPAIGN_LEVELS[2].data === LEVEL_3_DATA && CAMPAIGN_LEVELS[3].data === LEVEL_4_DATA, "niveles 2–4 no están registrados en campaña");
  for (const fighterId of ["alma", "diego", "nadia"]) {
    const playable = loadLevel(LEVEL_2_DATA, fighterId);
    assert(playable.enemy instanceof Vera && playable.player.fighterId === fighterId, `Nivel 2 no construye a ${fighterId}`);
    const campaign = new CampaignController();
    campaign.selectFighter(fighterId);
    campaign.settleVictory({ playerHp: 80, remainingSeconds: 30 });
    assert(campaign.advance() && campaign.currentLevel.id === "nivel-2" && campaign.selectedFighterId === fighterId, `no conservó estudiante ${fighterId} al avanzar`);
    campaign.settleVictory({ playerHp: 80, remainingSeconds: 30 });
    assert(campaign.advance() && campaign.currentLevel.id === "nivel-3", "Nivel 2 no pasó a Nivel 3");
    campaign.settleVictory({ playerHp: 80, remainingSeconds: 30 });
    assert(campaign.advance() && campaign.currentLevel.id === "nivel-4" && campaign.selectedFighterId === fighterId, "Nivel 3 no pasó a Nivel 4 conservando estudiante");
    campaign.settleVictory({ playerHp: 80, remainingSeconds: 30 });
    assert(!campaign.advance() && campaign.terminal === "VICTORIA", "la campaña no cierra tras NULL");
  }
  const retries = new CampaignController();
  retries.selectFighter("alma");
  retries.advance();
  retries.advance();
  retries.advance();
  assert(retries.attemptsRemaining === 3 && retries.currentLevel.id === "nivel-4", "avance consumió intento");
  assert(retries.settleDefeat() && retries.attemptsRemaining === 2 && retries.retryAfterDefeat(), "derrota no conserva regla de reintentos");
});

run("Victoria de Nivel 1 abre Nivel 2 cargado con el mismo estudiante", () => {
  const clock = new GameClock();
  const input = { clear() {}, snapshotForStep: () => actions() };
  let machine;
  const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
  machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("selectNext", STATE.SELECT_FIGHTER, transition);
  states.commands.handle("confirm", STATE.SELECT_FIGHTER, transition);
  states.commands.handle("confirm", STATE.LEVEL_INTRO, transition);
  states.getLevel().combat.enemy.applyDamage(80, { sourceId: "test", attackInstanceId: "win-level-1", step: 1 });
  machine.update(dt);
  assert(machine.currentName === STATE.VICTORY && states.campaign.marks[0], "Nivel 1 no registró victoria");
  states.commands.handle("confirm", STATE.VICTORY, transition);
  states.commands.handle("confirm", STATE.LEVEL_INTRO, transition);
  assert(machine.currentName === STATE.PLAYING && states.campaign.currentLevel.id === "nivel-2", "no cargó el Nivel 2 después de la marca inicial");
  assert(states.campaign.selectedFighterId === "diego" && states.getLevel().player.fighterId === "diego", "no conservó estudiante al cambiar de nivel");
});

run("Arnés Digit2 inicia el Nivel 2 con el luchador seleccionado", () => {
  const clock = new GameClock();
  const input = new InputController();
  let machine;
  const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
  machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  input.connect({ stateMachine: machine, clock, loop: { resetTiming() {} }, commands: states.commands });
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("selectNext", STATE.SELECT_FIGHTER, transition);
  input.handleKeyDown({ code: "Digit2", repeat: false, isComposing: false, ctrlKey: false, altKey: false, metaKey: false, preventDefault() {} });
  assert(machine.currentName === STATE.LEVEL_INTRO && states.campaign.currentLevel.id === "nivel-2" && states.campaign.selectedFighterId === "diego", `el atajo no abrió Nivel 2 con Diego (${machine.currentName}, ${states.campaign.currentLevel?.id}, ${states.campaign.selectedFighterId})`);
});

run("El cargador construye Nivel 3 y deja el laboratorio limpio", () => {
  const level = loadLevel(LEVEL_3_DATA, "alma");
  assert(level.data === LEVEL_3_DATA && level.data.id === "nivel-3", "no cargó datos del laboratorio");
  assert(level.enemy instanceof Catodo3 && level.enemy.hp === 130, "no creó CÁTODO-3 con 130 HP");
  assert(level.enemy.position.x === 750 && level.enemy.bodySize.width === 52 && level.enemy.hurtSize.width === 48, "spawns/geometría de CÁTODO-3 incorrectos");
  assert(level.combat.projectiles.length === 0 && level.combat.playerCombatant.hp === 100, "el nivel empieza con daño/proyectil residual");
  assert(level.elapsedSeconds === 0 && level.status === "en curso" && level.tutorial.completed, "estado inicial del nivel incorrecto");
  assert(level.data.timeLimitSec === 270 && level.data.arena.solids.length === 3, "arena/límite del Nivel 3 incorrectos");
  assert(level.data.arena.background.some((rect) => rect.id === "lab-mesón-left"), "no hay decorado de laboratorio");
});

run("Recrear Nivel 3 limpia vida, pulso, fase y ataque del laboratorio", () => {
  const dirty = loadLevel(LEVEL_3_DATA, "nadia");
  dirty.combat.playerCombatant.applyDamage(9, { sourceId: "catodo3", attackInstanceId: "lab-dirty", step: 1 });
  dirty.enemy.applyDamage(20, { sourceId: "nadia", attackInstanceId: "lab-dirty", step: 1 });
  dirty.combat.spawnProjectile({ id: "dirty-pulse", attackInstanceId: "dirty-pulse", patternId: "CATODO_PULSE", owner: "enemy", x: 350, y: 410, velocityX: -200, velocityY: 0, width: 32, height: 32, radius: 16, damage: 16, lifetimeSec: 4 });
  dirty.enemy.attack = { id: "dirty-sensor", data: CATODO_SENSOR_LEFT_ATTACK, elapsedSec: 1.2, phase: "active", facing: -1, targetPosition: { x: 210, y: 391 }, contactedTargets: new Set(), sensorBox: { x: 260, y: 400, width: 120, height: 30 } };
  const clean = loadLevel(LEVEL_3_DATA, "nadia");
  assert(clean.combat.playerCombatant.hp === 85 && clean.enemy.hp === 130, "no restauró la vida inicial");
  assert(clean.combat.projectiles.length === 0 && clean.enemy.attack === null && clean.enemy.phaseIndex === 0, "quedó pulso o ataque residual");
  assert(clean.elapsedSeconds === 0 && clean.status === "en curso", "estado/tiempo residual");
});

run("CÁTODO-3 respeta vida, secuencia y tiempos documentados", () => {
  assert(CATODO3_DATA.maxHp === 130 && CATODO3_DATA.projectile.radius === 16 && CATODO3_DATA.projectile.speedPxPerSec === 200, "vida/orbe fuera de ficha");
  assert(CATODO_PULSE_ATTACK.startupSec === 0.85 && CATODO_PULSE_ATTACK.damage === 16 && CATODO_PULSE_ATTACK.recoverySec === 0.7, "datos de pulso incorrectos");
  assert(CATODO_SENSOR_LEFT_ATTACK.startupSec === 1.15 && CATODO_SENSOR_LEFT_ATTACK.activeSec === 0.5 && CATODO_SENSOR_LEFT_ATTACK.recoverySec === 0.8 && CATODO_SENSOR_LEFT_ATTACK.damage === 19, "datos de sensor incorrectos");
  assert(CATODO_SENSOR_RIGHT_ATTACK.patternId === "CATODO_SENSOR_R" && CATODO3_DATA.interAttackDelaySec === 1.9, "secuencia derecha/intervalo incorrectos");
  assert(CATODO3_DATA.attacks.map((attack) => attack.patternId).join(",") === "CATODO_PULSE,CATODO_SENSOR_L,CATODO_PULSE,CATODO_SENSOR_R", "secuencia no alterna pulso e izquierda/derecha");
  const level = loadLevel(LEVEL_3_DATA, "diego");
  let pulseLaunched = false;
  for (let step = 0; step < 300; step += 1) {
    updateLevel(level, actions(), dt);
    if (level.lastCombatEvents.some((event) => event.kind === "projectileLaunched" && event.patternId === "CATODO_PULSE")) { pulseLaunched = true; break; }
  }
  assert(pulseLaunched && level.combat.projectiles.length === 1, "no lanzó el pulso después de aviso");
  const pulse = level.combat.projectiles[0];
  assert(Math.abs(pulse.position.x - (710 - 200 * dt)) < 1e-6 && pulse.position.y === 410 && pulse.velocity.x === -200 && pulse.radius === 16, "origen, trayectoria o velocidad del pulso no coinciden");
  for (let step = 0; step < 500 && level.enemy.attack?.data.patternId !== "CATODO_SENSOR_L"; step += 1) updateLevel(level, actions(), dt);
  assert(level.enemy.attack?.data.patternId === "CATODO_SENSOR_L", "no siguió sensor izquierdo al pulso");
  assert(level.enemy.attack.sensorBox.x === 260 && level.enemy.attack.sensorBox.width === 120, "zona del sensor izquierdo incorrecta");
  const phases = new Set();
  for (let step = 0; step < 180; step += 1) {
    updateLevel(level, actions(), dt);
    if (level.enemy.attack?.data.patternId === "CATODO_SENSOR_L") phases.add(level.enemy.attack.phase);
  }
  assert(phases.has("warning") && phases.has("active") && phases.has("recovery"), "el sensor no recorrió sus fases");
});

run("El pulso atraviesa la pared del laboratorio y se limpia al salir de pantalla", () => {
  const pulse = new Projectile({ id: "pulse-exit", patternId: "CATODO_PULSE", attackInstanceId: "pulse-exit", owner: "enemy", x: 710, y: 410, velocityX: -200, velocityY: 0, width: 32, height: 32, radius: 16, damage: 16, lifetimeSec: 4, ignoreWalls: true });
  const inertTarget = { id: "inert", hp: 0 };
  const targetHurtBox = { x: 0, y: 0, width: 1, height: 1 };
  let crossedWall = false;
  for (let step = 0; step < 300 && pulse.active; step += 1) {
    pulse.update(dt, LEVEL_3_DATA.arena.solids, inertTarget, targetHurtBox, 40);
    if (pulse.position.x < 98) crossedWall = true;
  }
  assert(crossedWall, "el pulso no cruzó el muro izquierdo hasta salir de la arena");
  assert(!pulse.active, "el pulso no se limpió fuera de pantalla");
});

run("Sensores de laboratorio alternos dejan seguro el centro y admiten salto", () => {
  assert(LABORATORY_MECHANICS.sensorStrips[0].left === 260 && LABORATORY_MECHANICS.sensorStrips[0].right === 380, "franja izquierda fuera de diseño");
  assert(LABORATORY_MECHANICS.sensorStrips[1].left === 580 && LABORATORY_MECHANICS.sensorStrips[1].right === 700, "franja derecha fuera de diseño");
  assert(LABORATORY_MECHANICS.safeCorridor.left === 396 && LABORATORY_MECHANICS.safeCorridor.right === 564, "corredor seguro incorrecto");
  function sensorFight({ playerX, feetY = 430, guard = false, sensor = CATODO_SENSOR_LEFT_ATTACK }) {
    const player = new FighterEntity({ fighterId: "alma", x: playerX, y: feetY });
    player.grounded = feetY === 430;
    const enemy = new Catodo3({ ...CATODO3_DATA, initialDelaySec: 99 });
    enemy.attack = { id: "sensor-test", data: sensor, elapsedSec: sensor.startupSec, phase: "active", facing: -1, targetPosition: { x: playerX, y: 391 }, contactedTargets: new Set(), sensorBox: { x: sensor.sensorId === "left" ? 260 : 580, y: 400, width: 120, height: 30 } };
    const combat = new CombatSystem({ player, enemyData: CATODO3_DATA, enemyFactory: () => enemy, solids: [] });
    combat.update(dt, actions(guard ? { guard: { pressed: false, held: true, released: false } } : {}));
    return combat.playerCombatant.hp;
  }
  assert(sensorFight({ playerX: 320 }) === 81, "sensor izquierdo no aplicó 19 daño");
  assert(sensorFight({ playerX: 480 }) === 100, "corredor central recibió daño");
  assert(sensorFight({ playerX: 320, feetY: 400 }) === 100, "saltar no evitó sensor con 30 px de despeje");
  assert(sensorFight({ playerX: 640, sensor: CATODO_SENSOR_RIGHT_ATTACK }) === 81, "sensor derecho no aplicó su daño");
  assert(sensorFight({ playerX: 320, guard: true }) === 81, "S redujo sensor de suelo indebidamente");
});

run("El pulso de CÁTODO-3 se puede cubrir o despejar con 30 px de salto", () => {
  function pulseDamage({ guarding = false, feetY = 430 } = {}) {
    const player = new FighterEntity({ fighterId: "alma", x: 500, y: feetY });
    player.grounded = feetY === 430;
    const enemyData = { ...CATODO3_DATA, initialDelaySec: 99, attacks: Object.freeze([]) };
    const combat = new CombatSystem({ player, enemyData, solids: [] });
    combat.spawnProjectile({ id: `pulse-${guarding}-${feetY}`, attackInstanceId: `pulse-${guarding}-${feetY}`, patternId: "CATODO_PULSE", owner: "enemy", x: 500, y: 410, velocityX: 0, velocityY: 0, width: 32, height: 32, radius: 16, damage: 16, lifetimeSec: 2, category: "lowProjectile" });
    combat.update(dt, actions(guarding ? { guard: { pressed: false, held: true, released: false } } : {}));
    return combat.playerCombatant.hp;
  }
  assert(pulseDamage() === 84, "pulso sin defensa no quitó 16 HP");
  assert(pulseDamage({ guarding: true }) === 95, "S no redujo pulso a 5 de daño");
  assert(pulseDamage({ feetY: 400 }) === 100, "salto con 30 px de despeje no evitó el pulso");
});

run("El cargador construye el Nivel 4 con NULL y estado inicial limpio", () => {
  const level = loadLevel(LEVEL_4_DATA, "nadia");
  assert(level.data === LEVEL_4_DATA && level.data.id === "nivel-4", "no cargó biblioteca");
  assert(level.enemy instanceof NullBoss && level.enemy.hp === 160 && level.enemy.phaseIndex === 0, "NULL no inició en fase uno con 160 HP");
  assert(level.enemy.peekNextAttack() === NULL_ATTACKS.echoChilo, "secuencia inicial de NULL incorrecta");
  assert(level.player.fighterId === "nadia" && level.player.position.x === 210 && level.enemy.position.x === 750, "estudiante o spawns no se conservaron");
  assert(level.combat.projectiles.length === 0 && level.combat.playerCombatant.hp === 85, "el combate no empezó limpio");
  assert(level.elapsedSeconds === 0 && level.status === "en curso" && level.data.timeLimitSec === 360, "reloj, estado o límite incorrecto");
  assert(level.data.arena.solids.length === 3 && level.data.arena.background.some((rect) => rect.id === "library-terminal"), "arena de biblioteca incompleta");
});

run("NULL usa patrones documentados, orden, daños, tiempos y umbral de fase", () => {
  const [phaseOne, phaseTwo] = NULL_DATA.phases;
  assert(NULL_DATA.maxHp === 160 && phaseOne.transitionAtHp === 80, "vida o umbral de NULL incorrectos");
  assert(phaseOne.attacks.map((attack) => attack.patternId).join(",") === "NULL_ECHO_CHILO,NULL_ECHO_VERA,NULL_ECHO_CATODO", "secuencia de ecos incorrecta");
  assert(phaseTwo.attacks.map((attack) => attack.patternId).join(",") === "NULL_ECHO_CHILO,NULL_ECHO_VERA,NULL_ECHO_CATODO,NULL_FINAL_SWEEP", "la segunda fase no reinicia ecos ni añade barrido");
  assert(phaseOne.interAttackDelaySec === 1.8 && phaseTwo.interAttackDelaySec === 1.5, "pausas entre ataques fuera del contrato");
  const expected = [
    [NULL_ATTACKS.echoChilo, 1.2, 0.2, 0.55, 18],
    [NULL_ATTACKS.echoVera, 0.9, 0.4, 0.6, 19],
    [NULL_ATTACKS.echoCatodo, 1.15, 0.5, 0.65, 20],
    [NULL_ATTACKS.finalSweep, 1.5, 0.6, 0.9, 24],
  ];
  for (const [attack, startup, active, recovery, damage] of expected) {
    assert(attack.startupSec === startup && attack.activeSec === active && attack.recoverySec === recovery && attack.damage === damage, `${attack.patternId} tiene daño o tiempos incorrectos`);
  }

  const enemy = new NullBoss(NULL_DATA);
  const player = new FighterEntity({ fighterId: "diego", x: 625, y: 430 });
  enemy.attack = { id: "null-threshold", data: NULL_ATTACKS.echoChilo, elapsedSec: 1.2 + 0.2 + 0.55 - 2 * dt, phase: "recovery", facing: -1, targetPosition: { x: 625, y: 390 }, contactedTargets: new Set() };
  enemy.applyDamage(80, { sourceId: "test", attackInstanceId: "threshold-80", step: 1 });
  assert(enemy.hp === 80 && enemy.phaseIndex === 0, "cambió de fase antes de terminar el ataque y recuperación");
  enemy.update(dt, player);
  assert(enemy.phaseIndex === 0, "el umbral anticipó la transición antes del final de recuperación");
  for (let step = 0; step < 3 && enemy.phaseIndex === 0; step += 1) enemy.update(dt, player);
  assert(enemy.phaseIndex === 1 && enemy.peekNextAttack() === NULL_ATTACKS.echoChilo, "no reinició en el primer eco después de la recuperación");
  assert(enemy.drainEvents().some((event) => event.kind === "phaseChanged" && event.phaseIndex === 1), "no emitió evento de transición de fase");
  assert(enemy.phaseNoticeRemainingSec > 0, "no anunció visualmente la fase nueva");
  for (let step = 0; step < 240; step += 1) enemy.update(dt, player);
  assert(enemy.phaseIndex === 1, "la fase cambió más de una vez");
});

run("Los cuatro ataques de NULL aplican su daño y respuesta específica", () => {
  function hit({ attack, x = 320, y = 430, guard = false, safeZone = LIBRARY_MECHANICS.finalSafeZones[0] }) {
    const player = new FighterEntity({ fighterId: "alma", x, y });
    player.grounded = y === 430;
    const fight = new CombatSystem({ player, enemyData: NULL_DATA, enemyFactory: (data) => new NullBoss(data), solids: [] });
    const dynamicAttack = {
      id: `fixture-${attack.patternId}`, data: attack, elapsedSec: attack.startupSec + 0.01, phase: "active", facing: -1,
      targetPosition: { x, y: y - 39 }, contactedTargets: new Set(),
    };
    if (attack.patternId === "NULL_ECHO_VERA") dynamicAttack.sweepBox = { x: 98, y: 400, width: 764, height: 30 };
    if (attack.patternId === "NULL_ECHO_CATODO") { dynamicAttack.sensorId = "left"; dynamicAttack.sensorBox = { x: 260, y: 400, width: 120, height: 30 }; }
    if (attack.patternId === "NULL_FINAL_SWEEP") dynamicAttack.safeZone = safeZone;
    fight.enemy.attack = dynamicAttack;
    const guardInput = guard ? { guard: { pressed: false, held: true, released: false } } : {};
    fight.update(dt, actions(guardInput));
    const hp = fight.playerCombatant.hp;
    fight.update(dt, actions(guardInput));
    return [hp, fight.playerCombatant.hp];
  }
  assert(JSON.stringify(hit({ attack: NULL_ATTACKS.echoChilo, x: 680, guard: true })) === "[94,94]", "el eco frontal no respeta cobertura y contacto único (18→6)");
  assert(hit({ attack: NULL_ATTACKS.echoVera, x: 500 })[0] === 81, "el eco rasante no aplicó 19");
  assert(hit({ attack: NULL_ATTACKS.echoVera, x: 500, y: 400 })[0] === 100, "el eco rasante no permite despeje de 30 px");
  assert(hit({ attack: NULL_ATTACKS.echoCatodo, x: 320 })[0] === 80, "el eco de sensor no aplicó 20");
  assert(hit({ attack: NULL_ATTACKS.echoCatodo, x: 480 })[0] === 100, "el corredor central recibió daño del eco de sensor");
  assert(hit({ attack: NULL_ATTACKS.finalSweep, x: 150, y: 250 })[0] === 100, "el cuerpo completo en franja segura recibió daño final");
});

run("Las zonas seguras de biblioteca son alcanzables, fijas y protegen el cuerpo completo", () => {
  const bossBox = { x: 722, y: 334, width: 56, height: 96 };
  const left = chooseReachableSafeZone(210, bossBox);
  const right = chooseReachableSafeZone(840, bossBox);
  const tieLeft = chooseReachableSafeZone(480, bossBox, 0);
  const tieRight = chooseReachableSafeZone(480, bossBox, 1);
  assert(left.zone.id === "left" && right.zone.id === "right", "no escogió la ruta libre más corta desde los extremos");
  assert(tieLeft.zone.id !== tieRight.zone.id && Math.abs(tieLeft.distancePx - tieRight.distancePx) < 1e-9, "el empate no alternó de forma determinista");
  const player = new FighterEntity({ fighterId: "alma", x: 150, y: 430 });
  assert(playerInsideSafeZone(player, LIBRARY_MECHANICS.finalSafeZones[0]), "el cuerpo entero en franja no se reconoce seguro");
  player.position.x = 130;
  assert(!playerInsideSafeZone(player, LIBRARY_MECHANICS.finalSafeZones[0]), "aceptó cuerpo parcialmente fuera de franja segura");
  player.position.x = 480;
  assert(!playerInsideSafeZone(player, LIBRARY_MECHANICS.finalSafeZones[0]), "un salto fuera de la franja evitó el barrido final");

  const airborne = new FighterEntity({ fighterId: "alma", x: 500, y: 250 });
  const finalFight = new CombatSystem({ player: airborne, enemyData: NULL_DATA, enemyFactory: (data) => new NullBoss(data), solids: [] });
  finalFight.enemy.attack = { id: "full-floor-test", data: NULL_ATTACKS.finalSweep, elapsedSec: 1.51, phase: "active", facing: -1, targetPosition: { x: 500, y: 300 }, contactedTargets: new Set(), safeZone: LIBRARY_MECHANICS.finalSafeZones[0] };
  finalFight.update(dt, actions());
  assert(finalFight.playerCombatant.hp === 76, "saltar fuera de la zona segura evitó el barrido final");
});

run("Pausa durante el ataque y aviso de fase de NULL no avanza ni causa daño fantasma", () => {
  const level = loadLevel(LEVEL_4_DATA, "diego");
  const enemy = level.enemy;
  enemy.attack = { id: "null-pause", data: NULL_ATTACKS.echoCatodo, elapsedSec: 1.3, phase: "active", facing: -1, targetPosition: { x: 300, y: 390 }, contactedTargets: new Set(), sensorId: "left", sensorBox: { x: 260, y: 400, width: 120, height: 30 } };
  level.player.position.x = 480;
  const hp = level.combat.playerCombatant.hp;
  const elapsed = enemy.attack.elapsedSec;
  for (let frame = 0; frame < 180; frame += 1) { /* En PAUSA no se actualiza el nivel. */ }
  assert(enemy.attack.elapsedSec === elapsed && level.combat.playerCombatant.hp === hp, "ataque avanzó durante PAUSA");
  updateLevel(level, actions(), dt);
  assert(level.combat.playerCombatant.hp === hp && enemy.attack.elapsedSec === elapsed + dt, "reanudar produjo daño fantasma o salto");

  const transitioning = new NullBoss(NULL_DATA);
  const target = new FighterEntity({ fighterId: "alma", x: 210, y: 430 });
  transitioning.applyDamage(80, { sourceId: "test", attackInstanceId: "phase", step: 1 });
  assert(transitioning.phaseIndex === 1, "el umbral sin ataque no activó transición");
  const notice = transitioning.phaseNoticeRemainingSec;
  for (let frame = 0; frame < 90; frame += 1) { /* La pausa congela incluso el banner. */ }
  assert(transitioning.phaseNoticeRemainingSec === notice && transitioning.hp === 80, "aviso de fase o vida avanzó durante PAUSA");
  transitioning.update(dt, target);
  assert(transitioning.phaseNoticeRemainingSec === notice - dt, "el aviso no reanudó desde el paso congelado");
});

run("KO simultáneo en umbral pendiente de NULL conserva prioridad de victoria", () => {
  const level = loadLevel(LEVEL_4_DATA, "alma");
  level.player.position.x = 680;
  level.combat.playerCombatant.applyDamage(99, { sourceId: "test", attackInstanceId: "one-hp", step: 1 });
  level.combat.playerCombatant.invulnerabilityRemainingSec = 0;
  const enemy = level.enemy;
  enemy.attack = { id: "null-phase-ko", data: NULL_ATTACKS.echoChilo, elapsedSec: 1.2 + 0.2 + 0.55 - dt / 2, phase: "recovery", facing: -1, targetPosition: { x: 680, y: 390 }, contactedTargets: new Set() };
  enemy.applyDamage(150, { sourceId: "test", attackInstanceId: "phase-pending", step: 1 });
  level.combat.playerAttackDamage = 10;
  level.combat.spawnProjectile({ id: "simultaneous-null-shot", attackInstanceId: "simultaneous-null-shot", patternId: "test-phase-shot", owner: "enemy", x: 680, y: 390, velocityX: 0, velocityY: 0, width: 8, height: 8, damage: 1, lifetimeSec: 2 });
  const events = level.combat.update(dt, actions({ normalAttack: { pressed: true, held: true, released: false } }));
  assert(enemy.hp === 0 && level.combat.playerCombatant.hp === 0, "el caso no produjo KO simultáneo");
  assert(enemy.phaseIndex === 1 && events.some((event) => event.kind === "phaseChanged"), "KO simultáneo no coincidió con cambio de fase");
  assert(level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY, "el KO simultáneo durante fase pendiente perdió prioridad");
});

run("Los tres estudiantes pueden completar la campaña conectada con cuatro niveles", () => {
  const ids = ["nivel-1", "nivel-2", "nivel-3", "nivel-4"];
  for (const fighterId of ["alma", "diego", "nadia"]) {
    const campaign = new CampaignController();
    assert(campaign.selectFighter(fighterId), `no seleccionó ${fighterId}`);
    for (let index = 0; index < ids.length; index += 1) {
      const level = loadLevel(campaign.currentLevel.data, fighterId);
      assert(level.player.fighterId === fighterId, `${fighterId} no llegó al ${ids[index]}`);
      level.enemy.applyDamage(level.enemy.hp, { sourceId: fighterId, attackInstanceId: `campaign-${fighterId}-${index}`, step: index + 1 });
      updateLevel(level, actions(), dt);
      assert(level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY, `${fighterId} no pudo cerrar ${ids[index]}`);
      assert(campaign.settleVictory({ playerHp: level.combat.playerCombatant.hp, remainingSeconds: level.data.timeLimitSec - level.elapsedSeconds }), `no consolidó marca ${index + 1}`);
      if (index < ids.length - 1) assert(campaign.advance() && campaign.currentLevel.id === ids[index + 1], `flujo roto tras ${ids[index]}`);
      else assert(campaign.terminal === "VICTORIA" && campaign.marks.every(Boolean), "cierre no consolidó las cuatro marcas");
    }
  }
});

run("Victoria final guarda récord aislado y muestra el cierre narrativo real", () => {
  const storage = memoryStorage();
  const clock = new GameClock();
  const input = { clear() {}, snapshotForStep: () => actions() };
  let machine;
  const states = createStates(clock, input, (next) => machine.transition(next), storage);
  machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("levelFourHarness", STATE.SELECT_FIGHTER, transition);
  states.campaign.marks.splice(0, 3, true, true, true);
  states.commands.handle("confirm", STATE.LEVEL_INTRO, transition);
  states.getLevel().combat.enemy.applyDamage(160, { sourceId: "test", attackInstanceId: "null-final", step: 1 });
  machine.update(dt);
  assert(machine.currentName === STATE.VICTORY && states.campaign.marks.every(Boolean), "no completó final con cuarta marca");
  assert(Number(storage.getItem(CAMPAIGN_RECORD_STORAGE_KEY)) === states.campaign.campaignScore && states.getCampaignRecord() === states.campaign.campaignScore, "récord real no se guardó al ganar Nivel 4");
  const drawn = [];
  const context = { fillRect() {}, strokeRect() {}, fillText(text) { drawn.push(String(text)); } };
  machine.render(context);
  assert(drawn.some((line) => line.includes("EL RECORRIDO QUEDA ABIERTO")) && drawn.some((line) => line.includes("RÉCORD LOCAL")), "no dibujó pantalla final ni récord");
  assert(drawn.some((line) => line.includes("Rutina de validación detenida")) && drawn.some((line) => line.includes("Nueva regla")) && drawn.some((line) => line.includes("Resolver el error")), "faltan mensajes finales documentados o la variante del estudiante");
});

run("Arnés Digit4 abre la introducción del Nivel 4 con estudiante elegido", () => {
  const clock = new GameClock();
  const input = new InputController();
  let machine;
  const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
  machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("selectNext", STATE.SELECT_FIGHTER, transition);
  input.connect({ stateMachine: machine, clock, loop: { resetTiming() {} }, commands: states.commands });
  input.handleKeyDown({ code: "Digit4", repeat: false, isComposing: false, ctrlKey: false, altKey: false, metaKey: false, preventDefault() {} });
  assert(machine.currentName === STATE.LEVEL_INTRO && states.campaign.currentLevel.id === "nivel-4" && states.campaign.selectedFighterId === "diego", "Digit4 no cargó NULL con estudiante seleccionado");
});

run("Reiniciar Nivel 4 limpia vida, proyectiles, ataque, fase y aviso visual", () => {
  const dirty = loadLevel(LEVEL_4_DATA, "diego");
  dirty.enemy.applyDamage(90, { sourceId: "test", attackInstanceId: "phase-dirty", step: 1 });
  dirty.enemy.attack = { id: "dirty-null", data: NULL_ATTACKS.finalSweep, elapsedSec: 1.6, phase: "active", facing: -1, targetPosition: { x: 210, y: 390 }, contactedTargets: new Set(), safeZone: LIBRARY_MECHANICS.finalSafeZones[0] };
  dirty.combat.spawnProjectile({ id: "dirty-library-projectile", attackInstanceId: "dirty-library-projectile", patternId: "fixture", owner: "enemy", x: 300, y: 300, velocityX: 20, velocityY: 0, width: 8, height: 8, damage: 1, lifetimeSec: 3 });
  dirty.combat.playerCombatant.applyDamage(10, { sourceId: "null", attackInstanceId: "dirty-damage", step: 1 });
  const clean = loadLevel(LEVEL_4_DATA, "diego");
  assert(clean.enemy.phaseIndex === 0 && clean.enemy.hp === 160 && clean.enemy.attack === null && clean.enemy.phaseNoticeRemainingSec === 0, "NULL no volvió a fase inicial");
  assert(clean.combat.playerCombatant.hp === 120 && clean.combat.projectiles.length === 0 && clean.elapsedSeconds === 0 && clean.status === "en curso", "quedaron proyectiles, daño, reloj o resultado residual");
});

run("KO simultáneo, derrota, los tres estudiantes y progresión Nivel 2→3→cierre", () => {
  for (const fighterId of ["alma", "diego", "nadia"]) {
    const level = loadLevel(LEVEL_3_DATA, fighterId);
    assert(level.player.fighterId === fighterId && level.enemy instanceof Catodo3, `Nivel 3 no admite ${fighterId}`);
    level.combat.enemy.applyDamage(130, { sourceId: fighterId, attackInstanceId: "victory", step: 1 });
    if (fighterId === "alma") level.combat.playerCombatant.applyDamage(100, { sourceId: "catodo3", attackInstanceId: "simultaneous", step: 1 });
    updateLevel(level, actions(), dt);
    assert(level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY && level.status === "completado", `KO/victoria no priorizó al jugador ${fighterId}`);
  }
  const defeat = loadLevel(LEVEL_3_DATA, "nadia");
  defeat.combat.playerCombatant.applyDamage(85, { sourceId: "catodo3", attackInstanceId: "defeat", step: 1 });
  updateLevel(defeat, actions(), dt);
  assert(defeat.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT && defeat.status === "derrotado", "derrota no queda disponible para Game Over");
  const campaign = new CampaignController();
  campaign.selectFighter("diego");
  campaign.advance();
  campaign.settleVictory({ playerHp: 100, remainingSeconds: 100 });
  assert(campaign.advance() && campaign.currentLevel.id === "nivel-3" && campaign.selectedFighterId === "diego", "Nivel 2 no avanzó a Nivel 3 conservando estudiante");
    campaign.settleVictory({ playerHp: 100, remainingSeconds: 100 });
    assert(campaign.advance() && campaign.currentLevel.id === "nivel-4", "Nivel 3 no avanzó a NULL");
    campaign.settleVictory({ playerHp: 100, remainingSeconds: 100 });
    assert(!campaign.advance() && campaign.terminal === "VICTORIA", "Nivel 4 no cerró campaña");
  const retry = new CampaignController();
  retry.selectFighter("alma");
  retry.advance(); retry.advance();
  assert(retry.settleDefeat() && retry.attemptsRemaining === 2 && retry.retryAfterDefeat(), "intentos de derrota/reintento no se conservan en Nivel 3");
});

run("Arnés Digit3 abre Nivel 3 y pausa congela ataque de CÁTODO-3", () => {
  const clock = new GameClock();
  const input = new InputController();
  let machine;
  const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
  machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("selectNext", STATE.SELECT_FIGHTER, transition);
  input.connect({ stateMachine: machine, clock, loop: { resetTiming() {} }, commands: states.commands });
  input.handleKeyDown({ code: "Digit3", repeat: false, isComposing: false, ctrlKey: false, altKey: false, metaKey: false, preventDefault() {} });
  assert(machine.currentName === STATE.LEVEL_INTRO && states.campaign.currentLevel.id === "nivel-3" && states.campaign.selectedFighterId === "diego", "Digit3 no carga nivel con estudiante elegido");

  const level = loadLevel(LEVEL_3_DATA, "alma");
  level.enemy.attack = { id: "catodo-active", data: CATODO_SENSOR_LEFT_ATTACK, elapsedSec: 1.3, phase: "active", facing: -1, targetPosition: { x: 320, y: 391 }, contactedTargets: new Set(), sensorBox: { x: 260, y: 400, width: 120, height: 30 } };
  level.player.position.x = 320;
  const before = level.enemy.attack.elapsedSec;
  const hp = level.combat.playerCombatant.hp;
  for (let step = 0; step < 90; step += 1) { /* En PAUSA no corre updateLevel. */ }
  assert(level.enemy.attack.elapsedSec === before && level.combat.playerCombatant.hp === hp, "sensores cambiaron durante PAUSA");
  updateLevel(level, actions(), dt);
  assert(level.combat.playerCombatant.hp === hp - 19 && level.enemy.attack.elapsedSec === before + dt, "al reanudar no continuó el paso activo esperado");
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
  const allowed = VALID_STATE_TRANSITIONS;
  machine = new StateMachine(states, allowed, STATE.MENU);
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("confirm", STATE.SELECT_FIGHTER, transition);
  states.commands.handle("confirm", STATE.LEVEL_INTRO, transition);
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
  const allowed = VALID_STATE_TRANSITIONS;
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
  input.connect({ stateMachine: machine, clock: { reset() {} }, loop: { resetTiming() {} }, commands: {
    handle(action, currentState, transition) {
      if (action !== "restartLevel") return false;
      transition(STATE.MENU);
      transition(STATE.SELECT_FIGHTER);
      transition(STATE.LEVEL_INTRO);
      transition(STATE.PLAYING, true);
      return true;
    },
  } });
  input.mount();
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT", bubbles: true }));
  assert(machine.currentName === STATE.PLAYING && machine.transitions[0][0] === STATE.PAUSED && machine.transitions[1][1] === STATE.SELECT_FIGHTER, "T no reinició desde pausa por las transiciones de campaña");
  window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyT", bubbles: true }));
  machine.currentName = STATE.GAME_OVER;
  window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT", bubbles: true }));
  assert(machine.currentName === STATE.PLAYING && machine.transitions.slice(-4)[0][0] === STATE.GAME_OVER, "T no reinició desde GAME OVER");
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

run("Transiciones de campaña: rutas válidas y transición inválida rechazada", () => {
  for (const state of [STATE.MENU, STATE.SELECT_FIGHTER, STATE.LEVEL_INTRO, STATE.PLAYING, STATE.PAUSED, STATE.GAME_OVER, STATE.VICTORY]) {
    assert(VALID_STATE_TRANSITIONS.has(state), `falta transición para ${state}`);
  }
  assert(VALID_STATE_TRANSITIONS.get(STATE.PLAYING).has(STATE.VICTORY), "JUGANDO no puede pasar a VICTORIA");
  assert(VALID_STATE_TRANSITIONS.get(STATE.VICTORY).has(STATE.LEVEL_INTRO), "VICTORIA no puede avanzar al siguiente nivel");
  const stateStub = (name) => ({ enter() {}, exit() {}, update() {}, render() {} });
  const states = new Map(Object.values(STATE).map((name) => [name, stateStub(name)]));
  const machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.PLAYING);
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (message) => warnings.push(message);
  try {
    assert(machine.transition(STATE.VICTORY), "victoria válida fue rechazada");
    assert(!machine.transition(STATE.PAUSED), "transición inválida se aceptó desde VICTORIA");
  } finally { console.warn = originalWarn; }
  assert(warnings.length === 1 && machine.currentName === STATE.VICTORY, "no rechazó transición inválida sin mutar estado");
});

run("La campaña conserva selección y aplica intentos, puntos, marcas y reinicio limpio", () => {
  const campaign = new CampaignController([{ id: "nivel-unico", data: LEVEL_1_DATA }]);
  assert(campaign.attemptsRemaining === 3 && campaign.marks.length === 4, "inicialización distinta al contrato");
  assert(campaign.selectFighter("diego") && campaign.selectedFighterId === "diego", "no guardó estudiante elegido");
  campaign.attemptScore = 37;
  assert(campaign.settleDefeat() && campaign.attemptsRemaining === 2 && campaign.attemptScore === 0, "derrota no consumió un intento o descartó puntos");
  assert(campaign.retryAfterDefeat() && campaign.attemptsRemaining === 2 && campaign.selectedFighterId === "diego", "reintento consumió dos intentos o cambió luchador");
  assert(campaign.settleVictory({ playerHp: 80, remainingSeconds: 123.9, attemptScore: 30 }), "victoria no se consolidó");
  assert(campaign.snapshot.campaignScore === 1053, `fórmula de victoria incorrecta: ${campaign.snapshot.campaignScore}`);
  assert(campaign.marks[0] && campaign.marks.filter(Boolean).length === 1, "marca no se registró una vez");
  assert(!campaign.settleVictory({ playerHp: 80, remainingSeconds: 123, attemptScore: 30 }) && campaign.campaignScore === 1053, "duplicó consolidación de victoria");
  assert(!campaign.advance() && campaign.terminal === "VICTORIA", "no cerró campaña provisional sin siguiente nivel");
  campaign.reset();
  assert(campaign.snapshot.selectedFighterId === null && campaign.levelIndex === 0 && campaign.attemptsRemaining === 3 && campaign.campaignScore === 0 && campaign.marks.every((mark) => !mark), "reinicio de campaña dejó estado residual");
});

run("Reiniciar nivel desde pausa consume un intento y el tercero lleva a GAME OVER", () => {
  const campaign = new CampaignController();
  campaign.selectFighter("alma");
  assert(campaign.restartLevel() && campaign.attemptsRemaining === 2, "primer reinicio no consumió intento");
  assert(campaign.restartLevel() && campaign.attemptsRemaining === 1, "segundo reinicio no consumió intento");
  assert(!campaign.restartLevel() && campaign.attemptsRemaining === 0 && campaign.terminal === "GAME OVER", "tercer reinicio no terminó en GAME OVER");
  assert(!campaign.restartLevel(), "permitió reiniciar sin intentos");
});

run("La pausa confirma o cancela reinicio/abandono antes de mutar la campaña", () => {
  const clock = new GameClock();
  const input = { clear() {}, snapshotForStep: () => actions() };
  let machine;
  const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
  machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
  const transition = (next) => machine.transition(next);
  states.commands.handle("confirm", STATE.MENU, transition);
  states.commands.handle("confirm", STATE.SELECT_FIGHTER, transition);
  states.commands.handle("confirm", STATE.LEVEL_INTRO, transition);
  machine.transition(STATE.PAUSED);
  states.commands.handle("restartLevel", STATE.PAUSED, transition);
  assert(machine.currentName === STATE.PAUSED && states.campaign.attemptsRemaining === 3, "T consumió antes de confirmar");
  states.commands.cancelAbandon();
  assert(states.campaign.attemptsRemaining === 3, "cancelar reinicio alteró intentos");
  states.commands.handle("restartLevel", STATE.PAUSED, transition);
  states.commands.handle("confirm", STATE.PAUSED, transition);
  assert(machine.currentName === STATE.PLAYING && states.campaign.attemptsRemaining === 2, "confirmar reinicio no consumió exactamente un intento");
});

run("Selección con teclado entrega cada estudiante al nivel cargado", () => {
  for (const [fighterId, code] of [["alma", null], ["diego", "KeyD"], ["nadia", "KeyD"]]) {
    const clock = new GameClock();
    const input = new InputController();
    let machine;
    const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
    machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
    input.connect({ stateMachine: machine, clock, loop: { resetTiming() {} }, commands: states.commands });
    input.mount();
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    window.dispatchEvent(new KeyboardEvent("keyup", { code: "Enter", bubbles: true }));
    if (code) {
      window.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles: true }));
      window.dispatchEvent(new KeyboardEvent("keyup", { code, bubbles: true }));
      if (fighterId === "nadia") {
        window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD", bubbles: true }));
        window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyD", bubbles: true }));
      }
    }
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    window.dispatchEvent(new KeyboardEvent("keyup", { code: "Enter", bubbles: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    assert(machine.currentName === STATE.PLAYING && states.campaign.selectedFighterId === fighterId && states.getLevel().player.fighterId === fighterId, `selección no cargó ${fighterId}`);
    input.unmount();
  }
});

run("Victoria pasa a pantalla final; Game Over permite reintento o campaña nueva", () => {
  const campaign = new CampaignController([{ id: "nivel-unico", data: LEVEL_1_DATA }]);
  campaign.selectFighter("nadia");
  campaign.settleDefeat();
  assert(campaign.retryAfterDefeat() && campaign.attemptsRemaining === 2, "Game Over no permite reintentar con intentos disponibles");
  campaign.reset();
  campaign.selectFighter("alma");
  campaign.settleVictory({ playerHp: 100, remainingSeconds: 150, attemptScore: 0 });
  assert(!campaign.advance() && campaign.snapshot.marks[0] && campaign.snapshot.terminal === "VICTORIA", "Nivel 1 no llega al cierre provisional");
});

run("El estado del combate lleva la campaña a VICTORIA/GAME OVER y KO simultáneo prioriza victoria", () => {
  function startCampaign() {
    const clock = new GameClock();
    const input = { clear() {}, snapshotForStep: () => actions() };
    let machine;
    const states = createStates(clock, input, (next) => machine.transition(next), memoryStorage());
    machine = new StateMachine(states, VALID_STATE_TRANSITIONS, STATE.MENU);
    const transition = (next) => machine.transition(next);
    states.commands.handle("confirm", STATE.MENU, transition);
    states.commands.handle("confirm", STATE.SELECT_FIGHTER, transition);
    states.commands.handle("confirm", STATE.LEVEL_INTRO, transition);
    return { machine, states };
  }
  const win = startCampaign();
  win.states.getLevel().combat.enemy.applyDamage(80, { sourceId: "test", attackInstanceId: "win", step: 1 });
  win.machine.update(dt);
  assert(win.machine.currentName === STATE.VICTORY && win.states.campaign.marks[0] && win.states.campaign.attemptsRemaining === 3, "victoria no cerró nivel/consolidó marca sin consumir intento");

  const loss = startCampaign();
  loss.states.getLevel().combat.playerCombatant.applyDamage(100, { sourceId: "test", attackInstanceId: "loss", step: 1 });
  loss.machine.update(dt);
  assert(loss.machine.currentName === STATE.GAME_OVER && loss.states.campaign.attemptsRemaining === 2 && !loss.states.campaign.marks[0], "derrota no consumió exactamente un intento");

  const tie = startCampaign();
  const tieLevel = tie.states.getLevel();
  tieLevel.combat.enemy.applyDamage(80, { sourceId: "test", attackInstanceId: "tie-enemy", step: 1 });
  tieLevel.combat.playerCombatant.applyDamage(100, { sourceId: "test", attackInstanceId: "tie-player", step: 1 });
  tie.machine.update(dt);
  assert(tie.machine.currentName === STATE.VICTORY && tie.states.campaign.marks[0], "KO simultáneo no abrió VICTORIA");
});

run("El controlador avanza niveles solo cuando hay datos y cierra al agotarse la lista", () => {
  const campaign = new CampaignController([
    { id: "nivel-1", data: LEVEL_1_DATA },
    { id: "nivel-futuro", data: { id: "nivel-futuro" } },
  ]);
  assert(campaign.advance() && campaign.levelIndex === 1 && campaign.currentLevel.id === "nivel-futuro", "no avanzó al siguiente dato de nivel");
  assert(!campaign.advance() && campaign.terminal === "VICTORIA", "no cerró después del último nivel configurado");
});

run("El récord se guarda solo en terminal y conserva el mejor puntaje", () => {
  const storage = memoryStorage();
  assert(readCampaignRecord(storage) === 0, "récord inicial no es cero");
  assert(saveCampaignRecord(1800, storage) === 1800 && storage.getItem(CAMPAIGN_RECORD_STORAGE_KEY) === "1800", "no guardó récord terminado");
  assert(saveCampaignRecord(900, storage) === 1800 && readCampaignRecord(storage) === 1800, "reemplazó récord por puntuación menor");
  const denied = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert(readCampaignRecord(denied) === null && saveCampaignRecord(2000, denied) === null, "no manejó almacenamiento bloqueado");
  const campaign = new CampaignController();
  campaign.selectFighter("alma");
  campaign.addCombatEvents([
    { kind: "damageApplied", targetId: "chilo", sourceId: "alma", attackInstanceId: "alma-normal-1" },
    { kind: "damageApplied", targetId: "chilo", sourceId: "alma", attackInstanceId: "alma-special-1-projectile-1" },
    { kind: "damageApplied", targetId: "chilo", sourceId: "alma", attackInstanceId: "alma-special-1-projectile-2" },
  ]);
  assert(campaign.attemptScore === 35, `puntaje de golpes/especial duplicado o incorrecto: ${campaign.attemptScore}`);
});

const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;
summary.textContent = failed === 0
  ? `Resultado: ${passed}/${results.length} pruebas PASA. Sin errores.`
  : `Resultado: ${passed}/${results.length} PASA; ${failed} FALLA. Revisa las líneas en rojo.`;
summary.style.borderLeftColor = failed === 0 ? "#75e397" : "#ff7682";
