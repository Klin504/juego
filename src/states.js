import { LOGICAL_HEIGHT, LOGICAL_WIDTH, STATE } from "./constants.js";
import { COMBAT_OUTCOME } from "./combat-config.js";
import { CampaignController } from "./campaign-controller.js";
import { readCampaignRecord, saveCampaignRecord } from "./campaign-storage.js";
import { SELECTABLE_FIGHTERS } from "./campaign-data.js";
import { loadLevel, renderLevelBackground, updateLevel } from "./level-loader.js";
import { renderCampaignEnding } from "./campaign-ending.js";

const COLORS = Object.freeze({ background: "#101622", panel: "#1d2939", border: "#47d7c8", text: "#f2f4f8", muted: "#b6c2d2", accent: "#ffca6a", selected: "#354b63" });
const PANEL = Object.freeze({ x: 104, y: 76, width: 752, height: 388 });
const BORDER_WIDTH = 4;
const SELECT_CARD_WIDTH = 218;
const SELECT_CARD_HEIGHT = 152;
const SELECT_CARD_GAP = 18;
const SELECT_CARD_Y = 248;
const SELECT_CARD_TITLE_Y_OFFSET = 30;
const SELECT_CARD_ROLE_Y_OFFSET = 58;
const SELECT_CARD_STATS_Y_OFFSET = 82;
const SELECT_CARD_SPECIAL_Y_OFFSET = 112;
const SECONDS_PER_MINUTE = 60;
const CENTISECONDS_PER_SECOND = 100;

function formatTime(seconds) {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / SECONDS_PER_MINUTE).toString().padStart(2, "0");
  const remainder = (wholeSeconds % SECONDS_PER_MINUTE).toString().padStart(2, "0");
  const centiseconds = Math.floor((seconds - wholeSeconds) * CENTISECONDS_PER_SECOND).toString().padStart(2, "0");
  return `${minutes}:${remainder}.${centiseconds}`;
}

function drawScreen(ctx, title, lines) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(PANEL.x + BORDER_WIDTH / 2, PANEL.y + BORDER_WIDTH / 2, PANEL.width - BORDER_WIDTH, PANEL.height - BORDER_WIDTH);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 34px 'Courier New', monospace";
  ctx.fillText(title, LOGICAL_WIDTH / 2, 132);
  ctx.fillStyle = COLORS.text;
  ctx.font = "18px 'Courier New', monospace";
  lines.forEach((line, index) => ctx.fillText(line, LOGICAL_WIDTH / 2, 198 + index * 34, PANEL.width - 48));
}

export function createStates(clock, input, transitionState, storage = globalThis.localStorage) {
  const campaign = new CampaignController();
  let campaignRecord = readCampaignRecord(storage);
  let level = null;
  let selectedIndex = 0;
  let debugEnabled = false;
  let confirmAbandon = false;
  let confirmRestart = false;
  const idle = () => {};
  const state = (render, update = idle, enter = idle, exit = idle) => ({ enter, exit, update, render });
  const transition = (next, resetClock = false) => transitionState(next, resetClock);
  const selectedFighterName = () => campaign.fighters.find((fighter) => fighter.id === campaign.selectedFighterId)?.name.split(" ")[0] ?? campaign.selectedFighterId;
  const loadCurrentLevel = () => {
    level = loadLevel(campaign.currentLevel.data, campaign.selectedFighterId);
    campaign.beginAttempt();
    debugEnabled = false;
    confirmAbandon = false;
    confirmRestart = false;
    clock.reset();
  };
  const newCampaign = (nextState = STATE.SELECT_FIGHTER) => {
    campaign.reset();
    selectedIndex = 0;
    confirmAbandon = false;
    transition(nextState);
  };
  const selectStudent = (inputTransition = transition) => {
    const fighter = SELECTABLE_FIGHTERS[selectedIndex];
    campaign.selectFighter(fighter.id);
    inputTransition(STATE.LEVEL_INTRO);
  };
  const startSelected = (inputTransition = transition) => {
    loadCurrentLevel();
    input.clear();
    inputTransition(STATE.PLAYING, true);
  };
  const onDefeat = () => {
    if (campaign.settleDefeat()) {
      if (campaign.attemptsRemaining === 0) campaignRecord = saveCampaignRecord(campaign.campaignScore, storage);
      input.clear();
      transition(STATE.GAME_OVER);
    }
  };
  const requestRestartConfirmation = () => {
    confirmRestart = true;
    confirmAbandon = false;
    input.clear();
    transition(STATE.PAUSED);
  };
  const restartConsumedAttempt = (inputTransition = transition) => {
    if (!campaign.restartLevel()) {
      inputTransition(STATE.GAME_OVER);
      return;
    }
    loadCurrentLevel();
    input.clear();
    inputTransition(STATE.PLAYING, true);
  };

  const states = new Map([
    [STATE.MENU, state((ctx) => drawScreen(ctx, "CHILOS FIGHTERS", ["Cuatro duelos · Tres intentos", "Enter: nueva campaña · G: arnés de derrota", "En selección: A/D o flechas · Enter: confirmar"]))],
    [STATE.SELECT_FIGHTER, state((ctx) => {
      drawScreen(ctx, "ELIGE A TU ESTUDIANTE", ["A/D o ←/→: seleccionar · Enter: comenzar · M: menú", "2 / 3 / 4: ARNES · iniciar nivel directo"]);
      const cardWidth = SELECT_CARD_WIDTH;
      const gap = SELECT_CARD_GAP;
      const left = (LOGICAL_WIDTH - (cardWidth * SELECTABLE_FIGHTERS.length + gap * 2)) / 2;
      SELECTABLE_FIGHTERS.forEach((fighter, index) => {
        const x = left + index * (cardWidth + gap);
        const y = SELECT_CARD_Y;
        ctx.fillStyle = index === selectedIndex ? COLORS.selected : COLORS.background;
        ctx.fillRect(x, y, cardWidth, SELECT_CARD_HEIGHT);
        ctx.strokeStyle = index === selectedIndex ? COLORS.accent : COLORS.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, SELECT_CARD_HEIGHT);
        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 20px 'Courier New', monospace";
        ctx.fillText(fighter.name, x + cardWidth / 2, y + SELECT_CARD_TITLE_Y_OFFSET);
        ctx.font = "15px 'Courier New', monospace";
        ctx.fillText(fighter.role, x + cardWidth / 2, y + SELECT_CARD_ROLE_Y_OFFSET);
        ctx.fillText(`Vida ${fighter.maxHp} · ${fighter.speed} px/s`, x + cardWidth / 2, y + SELECT_CARD_STATS_Y_OFFSET);
        ctx.font = "12px 'Courier New', monospace";
        ctx.fillText(fighter.special, x + cardWidth / 2, y + SELECT_CARD_SPECIAL_Y_OFFSET, cardWidth - 16);
      });
    })],
    [STATE.LEVEL_INTRO, state((ctx) => {
      const levelData = campaign.currentLevel.data;
      const selectedLine = levelData.studentLines?.intro?.[campaign.selectedFighterId];
      drawScreen(ctx, levelData.name, [...(levelData.introLines ?? [levelData.objective]), ...(selectedLine ? [`${selectedFighterName()}: «${selectedLine}»`] : []), "Enter: continuar · M: volver a selección"]);
    })],
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
      ctx.fillText(`${level.data.name} · ${formatTime(remaining)} · Marcas ${campaign.marks.filter(Boolean).length} · Intentos ${campaign.attemptsRemaining} · P/Escape pausa · T reiniciar · F2`, 24, 48);
      ctx.fillText(`Puntos: ${campaign.campaignScore} + ${campaign.attemptScore}`, 24, 26);
    }, (dt) => {
      const actions = input.snapshotForStep();
      if (actions.debugToggle.pressed) debugEnabled = !debugEnabled;
      if (actions.restartLevel.pressed) { requestRestartConfirmation(); return; }
      updateLevel(level, actions, dt);
      campaign.addCombatEvents(level.lastCombatEvents);
      clock.update(dt);
      if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY) {
        campaign.settleVictory({ playerHp: level.combat.playerCombatant.hp, remainingSeconds: level.data.timeLimitSec - level.elapsedSeconds });
        if (campaign.levelIndex + 1 >= campaign.levels.length) campaignRecord = saveCampaignRecord(campaign.campaignScore, storage);
        transition(STATE.VICTORY);
      } else if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT) onDefeat();
    })],
    [STATE.PAUSED, state((ctx) => drawScreen(ctx, "PAUSA", confirmRestart
      ? [campaign.attemptsRemaining === 1 ? "Último intento: al reiniciar irás a GAME OVER." : "¿Reiniciar este nivel? Se consume un intento.", "Enter: confirmar · P/Escape: cancelar"]
      : confirmAbandon
        ? ["¿Abandonar campaña? Se pierden los puntos no consolidados.", "Enter: confirmar · P/Escape: cancelar"]
        : ["Combate, reloj y tutorial congelados.", "P/Escape: reanudar · T: reiniciar nivel · M: menú"]))],
    [STATE.GAME_OVER, state((ctx) => drawScreen(ctx, campaign.attemptsRemaining > 0 ? "INTENTO TERMINADO" : "GAME OVER", [
      `Estudiante: ${campaign.selectedFighterId ?? "—"} · Nivel ${campaign.levelIndex + 1} · Intentos: ${campaign.attemptsRemaining}`,
      campaign.attemptsRemaining > 0 ? "T: reintentar nivel · Enter: reiniciar campaña" : "Enter: nueva campaña · M: menú",
      `Puntuación consolidada: ${campaign.campaignScore} · intento perdido descartado`,
    ]))],
    [STATE.VICTORY, state((ctx) => {
      const nextLevelExists = campaign.levelIndex + 1 < campaign.levels.length;
      const studentLine = level?.data.studentLines?.victory?.[campaign.selectedFighterId];
      if (!nextLevelExists) {
        renderCampaignEnding(ctx, {
          score: campaign.campaignScore,
          record: campaignRecord,
          studentLine: `${selectedFighterName()}: «${studentLine ?? "La campaña queda abierta para todos."}»`,
        });
        return;
      }
      const narrative = [...(level?.data.victoryLines ?? []), ...(studentLine ? [`${selectedFighterName()}: «${studentLine}»`] : [])];
      drawScreen(ctx, "VICTORIA", [
        `Marca obtenida · Puntuación: ${campaign.campaignScore}`,
        ...narrative,
        `Estudiante: ${campaign.selectedFighterId} · Intentos restantes: ${campaign.attemptsRemaining}`,
        `Récord local: ${campaignRecord ?? "no disponible"}`,
        "Enter: siguiente nivel · M: menú",
      ]);
    })],
  ]);

  states.commands = Object.freeze({
    handle(action, currentState, inputTransition) {
      if (currentState === STATE.MENU && action === "confirm") { campaign.reset(); selectedIndex = 0; inputTransition(STATE.SELECT_FIGHTER); return true; }
      if (currentState === STATE.SELECT_FIGHTER) {
        if (action === "selectPrevious") selectedIndex = (selectedIndex + SELECTABLE_FIGHTERS.length - 1) % SELECTABLE_FIGHTERS.length;
        else if (action === "selectNext") selectedIndex = (selectedIndex + 1) % SELECTABLE_FIGHTERS.length;
        else if (action === "confirm") selectStudent(inputTransition);
        else if (action === "levelTwoHarness") {
          campaign.selectFighter(SELECTABLE_FIGHTERS[selectedIndex].id);
          if (campaign.startAtLevelForHarness(1)) inputTransition(STATE.LEVEL_INTRO);
        }
        else if (action === "levelThreeHarness") {
          campaign.selectFighter(SELECTABLE_FIGHTERS[selectedIndex].id);
          if (campaign.startAtLevelForHarness(2)) inputTransition(STATE.LEVEL_INTRO);
        }
        else if (action === "levelFourHarness") {
          campaign.selectFighter(SELECTABLE_FIGHTERS[selectedIndex].id);
          if (campaign.startAtLevelForHarness(3)) inputTransition(STATE.LEVEL_INTRO);
        }
        else if (action === "menuTest") inputTransition(STATE.MENU);
        return true;
      }
      if (currentState === STATE.LEVEL_INTRO) {
        if (action === "confirm") startSelected(inputTransition);
        else if (action === "menuTest") inputTransition(STATE.SELECT_FIGHTER);
        return true;
      }
      if (currentState === STATE.PAUSED) {
        if (action === "restartLevel") { confirmRestart = !confirmRestart; confirmAbandon = false; }
        else if (action === "menuTest") { confirmAbandon = !confirmAbandon; confirmRestart = false; }
        else if (action === "confirm" && confirmRestart) { confirmRestart = false; restartConsumedAttempt(inputTransition); }
        else if (action === "confirm" && confirmAbandon) { campaign.abandon(); confirmAbandon = false; input.clear(); inputTransition(STATE.MENU); }
        return true;
      }
      if (currentState === STATE.GAME_OVER) {
        if (action === "restartLevel" && campaign.retryAfterDefeat()) { input.clear(); inputTransition(STATE.LEVEL_INTRO, true); }
        else if (action === "confirm") newCampaign(STATE.SELECT_FIGHTER);
        else if (action === "menuTest") { campaign.abandon(); inputTransition(STATE.MENU); }
        return true;
      }
      if (currentState === STATE.VICTORY) {
        if (action === "confirm") {
          if (campaign.advance()) { input.clear(); inputTransition(STATE.LEVEL_INTRO, true); }
          else newCampaign(STATE.SELECT_FIGHTER);
        } else if (action === "menuTest") inputTransition(STATE.MENU);
        return true;
      }
      if (currentState === STATE.PLAYING && action === "gameOverTest") { onDefeat(); return true; }
      return false;
    },
    cancelAbandon() {
      if (!confirmAbandon && !confirmRestart) return false;
      confirmAbandon = false;
      confirmRestart = false;
      return true;
    },
  });
  states.campaign = campaign;
  states.getLevel = () => level;
  states.getCampaignRecord = () => campaignRecord;
  states.resetLevel = () => { loadCurrentLevel(); };
  return states;
}
