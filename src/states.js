import { LOGICAL_HEIGHT, LOGICAL_WIDTH, STATE } from "./constants.js";
import { TEST_FIGHTER_ID } from "./physics-config.js";
import { COMBAT_OUTCOME } from "./combat-config.js";
import { LEVEL_1_DATA } from "./level-1-data.js";
import { loadLevel, renderLevelBackground, updateLevel } from "./level-loader.js";

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
  let level = loadLevel(LEVEL_1_DATA, TEST_FIGHTER_ID);
  let debugEnabled = false;
  const resetLevel = () => {
    level = loadLevel(LEVEL_1_DATA, TEST_FIGHTER_ID);
    clock.reset();
    debugEnabled = false;
  };

  return new Map([
    [STATE.MENU, state((ctx) => drawScreen(ctx, STATE.MENU, ["Nivel 1 · La primera marca", "Practica los controles con Chilo y obtén la marca inicial", "Chilo: «Si una victoria abre el paso, luchemos con cuidado»", "Enter: iniciar · estudiante: Alma", "A/D mover · W saltar · R ataque · S cubrir", "Shift especial · P/Escape pausa · T reiniciar · F2 cajas"]), idle, resetLevel)],
    [STATE.PLAYING, state((ctx) => {
      renderLevelBackground(ctx, level.data);
      level.combat.renderTelegraphs(ctx);
      level.player.render(ctx, debugEnabled, level.combat.playerCombatant);
      level.enemy.render(ctx);
      level.combat.renderProjectiles(ctx);
      level.combat.renderHud(ctx);
      level.combat.renderSpecialStatus(ctx);
      level.tutorial.render(ctx);
      if (debugEnabled) level.combat.renderDebug(ctx);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = COLORS.text;
      ctx.font = "14px 'Courier New', monospace";
      const remaining = Math.max(0, level.data.timeLimitSec - level.elapsedSeconds);
      ctx.fillText(`${level.data.name} · ${formatTime(remaining)} · P/Escape pausa · T reiniciar · F2 depuración`, 24, 48);
      if (level.status === "completado") {
        ctx.fillStyle = "rgba(10, 17, 27, 0.9)";
        ctx.fillRect(PANEL.x, 190, PANEL.width, 150);
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = PANEL_BORDER_WIDTH;
        ctx.strokeRect(PANEL.x + 2, 192, PANEL.width - 4, 146);
        ctx.textAlign = "center";
        ctx.fillStyle = COLORS.accent;
        ctx.font = "bold 28px 'Courier New', monospace";
        ctx.fillText("NIVEL COMPLETADO", LOGICAL_WIDTH / 2, 235);
        ctx.fillStyle = COLORS.text;
        ctx.font = "18px 'Courier New', monospace";
        ctx.fillText("Chilo derrotado · T: repetir el nivel", LOGICAL_WIDTH / 2, 285);
      }
    }, (dt) => {
      const actions = input.snapshotForStep();
      if (actions.debugToggle.pressed) debugEnabled = !debugEnabled;
      if (actions.restartLevel.pressed) {
        resetLevel();
        input.clear();
        return;
      }
      if (level.status === "completado") return;
      updateLevel(level, actions, dt);
      clock.update(dt);
      if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY) {
        level.status = "completado";
      } else if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT) {
        input.clear();
        transitionToGameOver();
      }
    })],
    [STATE.PAUSED, state((ctx) => drawScreen(ctx, STATE.PAUSED, ["El nivel y el tutorial están detenidos.", "P/Escape: reanudar · T: reiniciar · M: menú"], clock.elapsedSeconds))],
    [STATE.GAME_OVER, state((ctx) => drawScreen(ctx, STATE.GAME_OVER, ["Intento terminado.", "T: repetir el nivel · Enter: menú"], clock.elapsedSeconds))],
  ]);
}
