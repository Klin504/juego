import { LOGICAL_HEIGHT, LOGICAL_WIDTH, STATE } from "./constants.js";
import { TEST_FIGHTER_ID } from "./physics-config.js";
import { FighterEntity } from "./fighter-entity.js";
import { PhysicsWorld } from "./physics.js";
import { TestRoom, TEST_ROOM_START } from "./test-room.js";
import { CombatSystem } from "./combat-system.js";
import { COMBAT_OUTCOME } from "./combat-config.js";
import { TRAINING_DUMMY_DATA } from "./combat-data.js";

const COLORS = Object.freeze({ background: "#101622", panel: "#1d2939", border: "#47d7c8", text: "#f2f4f8", muted: "#b6c2d2", accent: "#ffca6a" });
const PANEL = Object.freeze({ x: 104, y: 92, width: 752, height: 356 });
const PANEL_BORDER_WIDTH = 4;
const SECONDS_PER_MINUTE = 60;
const CENTISECONDS_PER_SECOND = 100;

function formatTime(seconds) {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / SECONDS_PER_MINUTE).toString().padStart(2, "0");
  const remainder = (wholeSeconds % SECONDS_PER_MINUTE).toString().padStart(2, "0");
  const centiseconds = Math.floor((seconds - wholeSeconds) * CENTISECONDS_PER_SECOND).toString().padStart(2, "0");
  return `${minutes}:${remainder}.${centiseconds}`;
}

function drawScreen(ctx, title, lines, elapsedSeconds = 0) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = PANEL_BORDER_WIDTH;
  ctx.strokeRect(PANEL.x + PANEL_BORDER_WIDTH / 2, PANEL.y + PANEL_BORDER_WIDTH / 2, PANEL.width - PANEL_BORDER_WIDTH, PANEL.height - PANEL_BORDER_WIDTH);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 34px 'Courier New', monospace";
  ctx.fillText(title, LOGICAL_WIDTH / 2, 154);
  ctx.fillStyle = COLORS.text;
  ctx.font = "20px 'Courier New', monospace";
  lines.forEach((line, index) => ctx.fillText(line, LOGICAL_WIDTH / 2, 222 + index * 38));
  if ([STATE.PLAYING, STATE.PAUSED, STATE.GAME_OVER].includes(title)) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText(`Tiempo de juego: ${formatTime(elapsedSeconds)}`, LOGICAL_WIDTH / 2, 400);
  }
}

export function createStates(clock, input, transitionToGameOver) {
  const idle = () => {};
  const state = (render, update = idle, enter = idle, exit = idle) => ({ enter, exit, update, render });
  const room = new TestRoom();
  let player = new FighterEntity({ fighterId: TEST_FIGHTER_ID, ...TEST_ROOM_START });
  let combat = new CombatSystem({ player, enemyData: TRAINING_DUMMY_DATA, solids: room.solids });
  const physics = new PhysicsWorld();
  const physicsSolids = [...room.solids, combat.enemy.bodyBox];
  let debugEnabled = false;

  return new Map([
    [STATE.MENU, state((ctx) => drawScreen(ctx, STATE.MENU, ["Sistema de combate compartido · Fase 2.3", "Enter: iniciar · estudiante: Alma", "A/D o flechas mover · W/↑/Espacio saltar · S cubrir", "R atacar · Shift especial · P/Escape pausar · F2 cajas"]), idle, () => {
      player = new FighterEntity({ fighterId: TEST_FIGHTER_ID, ...TEST_ROOM_START });
      combat = new CombatSystem({ player, enemyData: TRAINING_DUMMY_DATA, solids: room.solids });
      debugEnabled = false;
    })],
    [STATE.PLAYING, state((ctx) => {
      room.render(ctx, false);
      combat.renderTelegraphs(ctx);
      player.render(ctx, debugEnabled, combat.playerCombatant);
      combat.enemy.render(ctx);
      combat.renderProjectiles(ctx);
      combat.renderHud(ctx);
      combat.renderSpecialStatus(ctx);
      if (debugEnabled) combat.renderDebug(ctx);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = COLORS.text;
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText(`Tiempo ${formatTime(clock.elapsedSeconds)} · P/Escape pausa · F2 depuración`, 24, 48);
    }, (dt) => {
      const actions = input.snapshotForStep();
      if (actions.debugToggle.pressed) debugEnabled = !debugEnabled;
      physicsSolids[physicsSolids.length - 1] = combat.enemy.bodyBox;
      physics.update(player, actions, dt, physicsSolids);
      combat.update(dt, actions);
      clock.update(dt);
      if (combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT) {
        input.clear();
        transitionToGameOver();
      }
    })],
    [STATE.PAUSED, state((ctx) => drawScreen(ctx, STATE.PAUSED, ["El reloj está detenido.", "P o Escape: reanudar · M: volver al menú"], clock.elapsedSeconds))],
    [STATE.GAME_OVER, state((ctx) => drawScreen(ctx, STATE.GAME_OVER, ["Demostración terminada.", "Enter: volver al menú"], clock.elapsedSeconds))],
  ]);
}
