/** Define las pantallas y las transiciones entre menú, campaña, combate y finales. */

import { STATE } from "../core/constants.js";
import { COMBAT_OUTCOME } from "../combat/combat-config.js";
import { CampaignController } from "../campaign/campaign-controller.js";
import { readCampaignRecord, saveCampaignRecord, readVisorUnlocked } from "../campaign/campaign-storage.js";
import { SELECTABLE_FIGHTERS } from "../campaign/campaign-data.js";
import { loadLevel, updateLevel } from "../levels/level-loader.js";
import { renderCampaignEnding } from "../campaign/campaign-ending.js";
import { ArchiveController } from "../campaign/archive-controller.js";
import { AudioSystem } from "../audio/audio-system.js";
import { renderPixelArtArena } from "../rendering/arena-renderer.js";
import { renderStudentSprite, renderBossSprite } from "../rendering/character-renderer.js";
import { drawArchiveScreen, drawCampaignInterlude, drawCombatRibbon, drawFighterSelect, drawHowToPlay, drawInfoScreen, drawMainMenu } from "../ui/menu-ui.js";

const MENU_OPTION = Object.freeze({ CAMPAIGN: 0, GUIDE: 1, ARCHIVE: 2, SOUND: 3 });
const MENU_OPTION_COUNT = Object.keys(MENU_OPTION).length;
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
  drawInfoScreen(ctx, title, lines);
}

/**
 * Crea las pantallas y conserva el estado compartido de una campaña.
 * Cada pantalla expone enter, update, render y exit a la máquina de estados.
 */
export function createStates(clock, input, transitionState, storage = globalThis.localStorage) {
  const campaign = new CampaignController();
  const archive = new ArchiveController(storage);
  const audio = new AudioSystem();
  let campaignRecord = readCampaignRecord(storage);
  let level = null;
  let selectedIndex = 0;
  let menuIndex = 0;
  let debugEnabled = false;
  let confirmAbandon = false;
  let confirmRestart = false;
  let physicsStarted = false;

  const idle = () => {};
  const state = (render, update = idle, enter = idle, exit = idle) => ({ enter, exit, update, render });
  const transition = (next, resetClock = false) => {
    transitionState(next, resetClock);
  };

  const selectedFighterName = () => campaign.fighters.find((fighter) => fighter.id === campaign.selectedFighterId)?.name.split(" ")[0] ?? campaign.selectedFighterId;

  // Un intento nuevo construye entidades frescas y reinicia reloj, entrada y avisos.
  const loadCurrentLevel = () => {
    const visorUnlocked = archive.unlocked || readVisorUnlocked(storage);
    level = loadLevel(campaign.currentLevel.data, campaign.selectedFighterId, { visorUnlocked });
    campaign.beginAttempt();
    debugEnabled = false;
    confirmAbandon = false;
    confirmRestart = false;
    physicsStarted = false;
    clock.reset();
  };

  const newCampaign = (nextState = STATE.SELECT_FIGHTER) => {
    campaign.reset();
    selectedIndex = 0;
    menuIndex = 0;
    confirmAbandon = false;
    transition(nextState);
  };

  const activateMenuOption = (index, inputTransition = transition) => {
    menuIndex = index;
    if (index === MENU_OPTION.CAMPAIGN) {
      campaign.reset();
      selectedIndex = 0;
      inputTransition(STATE.SELECT_FIGHTER);
    } else if (index === MENU_OPTION.GUIDE) {
      inputTransition(STATE.HOW_TO_PLAY);
    } else if (index === MENU_OPTION.ARCHIVE) {
      inputTransition(STATE.ARCHIVE);
    } else if (index === MENU_OPTION.SOUND) {
      audio.toggleEnabled();
    }
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

  // El controlador de campaña descuenta el intento antes de abrir la pantalla de derrota.
  const onDefeat = () => {
    audio.playFightLost();
    if (campaign.settleDefeat()) {
      if (campaign.attemptsRemaining === 0) {
        campaignRecord = saveCampaignRecord(campaign.campaignScore, storage);
      }
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
    // 1. PANTALLA MENÚ
    [STATE.MENU, state((ctx) => {
      drawMainMenu(ctx, { soundEnabled: audio.enabled, record: campaignRecord, selectedIndex: menuIndex });
    })],

    // 2. CÓMO JUGAR
    [STATE.HOW_TO_PLAY, state((ctx) => {
      drawHowToPlay(ctx);
    })],

    // 3. ARCHIVO Y TERMINAL DE MANTENIMIENTO
    [STATE.ARCHIVE, state((ctx) => {
      drawArchiveScreen(ctx, archive);
    })],
    // 4. SELECCIÓN DE ESTUDIANTE
    [STATE.SELECT_FIGHTER, state((ctx) => {
      drawFighterSelect(ctx, SELECTABLE_FIGHTERS, selectedIndex);
    })],

    // 5. INTRODUCCIÓN NARRATIVA / REINTENTO (STORY)
    [STATE.LEVEL_INTRO, state((ctx) => {
      const levelData = campaign.currentLevel.data;
      const selectedLine = levelData.studentLines?.intro?.[campaign.selectedFighterId];
      const isRetry = campaign.attemptScore === 0 && campaign.attemptsRemaining < 3 && !campaign.marks[campaign.levelIndex];
      const narrativeLines = isRetry
        ? [`Te quedan ${campaign.attemptsRemaining} intentos. El rival recuperará su fuerza completa.`, ...(selectedLine ? [`${selectedFighterName()}: «${selectedLine}»`] : [])]
        : [
            ...(levelData.introLines ?? []),
            ...(selectedLine ? [`${selectedFighterName()}: «${selectedLine}»`] : []),
            ...(levelData.tutorialSteps?.length ? ["Completa la práctica: Chilo atacará cuando termines."] : []),
          ];
      drawCampaignInterlude(ctx, {
        variant: "intro",
        retry: isRetry,
        levelData,
        levelNumber: campaign.levelIndex + 1,
        fighterId: campaign.selectedFighterId,
        fighterName: selectedFighterName(),
        marks: campaign.marks.filter(Boolean).length,
        attempts: campaign.attemptsRemaining,
        score: campaign.campaignScore,
        narrativeLines,
      });
    })],

    // 6. JUGANDO (COMBATE)
    [STATE.PLAYING, state((ctx) => {
      // Orden de capas: arena, avisos, personajes, proyectiles e interfaz.
      renderPixelArtArena(ctx, level.data);
      level.combat.renderTelegraphs(ctx);
      renderStudentSprite(ctx, level.player, debugEnabled, level.combat.playerCombatant, level.combat);
      renderBossSprite(ctx, level.enemy);
      level.combat.renderProjectiles(ctx);
      level.combat.renderHud(ctx);
      level.combat.renderSpecialStatus(ctx);
      level.tutorial.render(ctx);
      if (debugEnabled) level.combat.renderDebug(ctx);

      const remaining = Math.max(0, level.data.timeLimitSec - level.elapsedSeconds);
      drawCombatRibbon(ctx, {
        levelName: level.data.name,
        time: formatTime(remaining),
        marks: campaign.marks.filter(Boolean).length,
        attempts: campaign.attemptsRemaining,
        score: campaign.campaignScore + campaign.attemptScore,
        tutorial: level.tutorial.completed ? null : {
          current: level.tutorial.stepIndex + 1,
          total: level.data.tutorialSteps.length,
        },
      });
    }, (dt) => {
      // Cada paso fijo consume la entrada una vez y transmite los eventos a puntos y sonido.
      const actions = input.snapshotForStep();
      if (actions.debugToggle.pressed) debugEnabled = !debugEnabled;
      if (actions.restartLevel.pressed) { requestRestartConfirmation(); return; }
      const wasGrounded = level.player.grounded;
      updateLevel(level, actions, dt);
      if (physicsStarted) {
        if (wasGrounded && !level.player.grounded) audio.playPlayerJump();
        else if (!wasGrounded && level.player.grounded) audio.playPlayerLand();
      }
      physicsStarted = true;
      campaign.addCombatEvents(level.lastCombatEvents);
      audio.consumeCombatEvents(level.lastCombatEvents, level.combat.playerCombatant.id);
      clock.update(dt);

      // El resultado se registra antes de cambiar de pantalla para que el marcador sea correcto.
      if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_VICTORY) {
        audio.playFightWon();
        campaign.settleVictory({
          playerHp: level.combat.playerCombatant.hp,
          remainingSeconds: level.data.timeLimitSec - level.elapsedSeconds,
        });
        const isCampaignFinished = campaign.levelIndex + 1 >= campaign.levels.length;
        if (isCampaignFinished) {
          campaignRecord = saveCampaignRecord(campaign.campaignScore, storage);
        }
        transition(STATE.VICTORY);
      } else if (level.combat.outcome === COMBAT_OUTCOME.PLAYER_DEFEAT) {
        onDefeat();
      }
    })],

    // 7. PAUSA
    [STATE.PAUSED, state((ctx) => {
      if (confirmRestart) {
        drawScreen(ctx, "REINICIAR NIVEL", [
          campaign.attemptsRemaining === 1
            ? "Último intento: al reiniciar irás a GAME OVER."
            : "¿Reiniciar este nivel? Se consume un intento.",
          "",
          "Enter: Confirmar reinicio",
          "P o Escape: Cancelar y volver a la pausa",
        ]);
      } else if (confirmAbandon) {
        drawScreen(ctx, "ABANDONAR CAMPAÑA", [
          "¿Abandonar campaña? Se descartan los puntos no consolidados.",
          "El récord previo y el Visor descubierto permanecen.",
          "",
          "Enter: Confirmar abandono y salir al menú",
          "P o Escape: Cancelar y volver a la pausa",
        ]);
      } else {
        drawScreen(ctx, "PAUSA", [
          "Combate, reloj y temporizadores congelados.",
          "",
          "P o Escape: Reanudar combate",
          "T: Reiniciar nivel (consume un intento)",
          "M: Salir al menú principal",
        ]);
      }
    })],

    // 8. RESULTADO DE NIVEL (LEVEL_CLEAR) — alias visual de VICTORY para niveles 1-3
    // No se transiciona a este estado directamente; se mantiene como referencia de constante.
    [STATE.LEVEL_CLEAR, state((ctx) => {
      // Este estado existe para los tests de transición pero se alcanza solo cuando
      // la máquina externa lo fuerza; la pantalla muestra el mismo estilo que VICTORY intermedia.
      const levelData = level?.data ?? campaign.currentLevel.data;
      const studentLine = levelData.studentLines?.victory?.[campaign.selectedFighterId];
      drawCampaignInterlude(ctx, {
        variant: "victory",
        levelData,
        levelNumber: campaign.levelIndex + 1,
        fighterId: campaign.selectedFighterId,
        fighterName: selectedFighterName(),
        marks: campaign.marks.filter(Boolean).length,
        attempts: campaign.attemptsRemaining,
        score: campaign.campaignScore,
        nextLevelName: campaign.levels[campaign.levelIndex + 1]?.data?.name ?? null,
        narrativeLines: [
          ...(levelData.victoryLines ?? []),
          ...(studentLine ? [`${selectedFighterName()}: «${studentLine}»`] : []),
        ],
      });
    })],

    // 9. GAME OVER (cubre tanto derrota final como intento perdido con reintento disponible)
    [STATE.GAME_OVER, state((ctx) => {
      const hasRetries = campaign.attemptsRemaining > 0;
      if (hasRetries) {
        drawScreen(ctx, "INTENTO TERMINADO", [
          `Intentos restantes: ${campaign.attemptsRemaining} · Nivel: ${campaign.currentLevel?.data?.name ?? "—"}`,
          `Estudiante: ${campaign.selectedFighterId ?? "—"} · Puntos: ${campaign.campaignScore}`,
          "",
          "T: Reintentar este duelo",
          "Enter: Nueva campaña en selección",
          "M: Volver al menú principal",
        ]);
      } else {
        drawScreen(ctx, "GAME OVER", [
          `Intentos agotados (0 restantes) · Nivel alcanzado: ${campaign.levelIndex + 1}`,
          `Estudiante: ${campaign.selectedFighterId ?? "—"}`,
          `Puntuación final: ${campaign.campaignScore}`,
          `Récord local: ${campaignRecord ?? "—"}`,
          "",
          "Enter: Nueva campaña en selección",
          "M: Volver al menú principal",
        ]);
      }
    })],

    // 10. VICTORIA — cubre tanto victoria intermedia (niveles 1-3) como victoria final (nivel 4)
    [STATE.VICTORY, state((ctx) => {
      const isFinalVictory = campaign.terminal === "VICTORIA";
      if (isFinalVictory) {
        // Cierre narrativo completo
        const studentLine = level?.data.studentLines?.victory?.[campaign.selectedFighterId];
        renderCampaignEnding(ctx, {
          score: campaign.campaignScore,
          record: campaignRecord,
          fighterId: campaign.selectedFighterId,
          studentLine: `${selectedFighterName()}: «${studentLine ?? "La campaña queda abierta para todos."}»`,
        });
      } else {
        // Victoria intermedia — muestra narrativa del nivel y avance
        const levelData = level?.data ?? campaign.currentLevel.data;
        const studentLine = levelData.studentLines?.victory?.[campaign.selectedFighterId];
        const narrative = [
          ...(levelData.victoryLines ?? []),
          ...(studentLine ? [`${selectedFighterName()}: «${studentLine}»`] : []),
        ];
        drawCampaignInterlude(ctx, {
          variant: "victory",
          levelData,
          levelNumber: campaign.levelIndex + 1,
          fighterId: campaign.selectedFighterId,
          fighterName: selectedFighterName(),
          marks: campaign.marks.filter(Boolean).length,
          attempts: campaign.attemptsRemaining,
          score: campaign.campaignScore,
          nextLevelName: campaign.levels[campaign.levelIndex + 1]?.data?.name ?? null,
          narrativeLines: narrative,
        });
      }
    })],
  ]);

  // Los hooks de entrada cubren transiciones del teclado y de la campaña.
  for (const [name, screen] of states) {
    const enter = screen.enter;
    screen.enter = (...args) => {
      audio.setScene(name === STATE.PLAYING && campaign.levelIndex === 3 ? "boss" : name);
      audio.playScreenChanged();
      enter(...args);
    };
  }

  // La entrada delega aquí las órdenes que dependen de la pantalla actual.
  states.commands = Object.freeze({
    handle(action, currentState, inputTransition, rawEvent) {
      if (currentState !== STATE.PLAYING) {
        if (action === "selectPrevious" || action === "selectNext") audio.playMenuMove();
        else if (action === "confirm" || action === "restartLevel" ||
          (action === "menuCommand" && ["KeyH", "KeyC", "KeyJ", "KeyB"].includes(rawEvent?.code))) {
          audio.playMenuConfirm();
        }
      }
      if (currentState === STATE.MENU) {
        if (action === "selectPrevious") {
          menuIndex = (menuIndex + MENU_OPTION_COUNT - 1) % MENU_OPTION_COUNT;
          return true;
        }
        if (action === "selectNext") {
          menuIndex = (menuIndex + 1) % MENU_OPTION_COUNT;
          return true;
        }
        if (action === "confirm") {
          activateMenuOption(menuIndex, inputTransition);
          return true;
        }
        if (rawEvent?.code === "KeyH" || rawEvent?.code === "KeyC") {
          activateMenuOption(MENU_OPTION.GUIDE, inputTransition);
          return true;
        }
        if (rawEvent?.code === "KeyJ") {
          activateMenuOption(MENU_OPTION.CAMPAIGN, inputTransition);
          return true;
        }
        if (rawEvent?.code === "KeyB") {
          activateMenuOption(MENU_OPTION.ARCHIVE, inputTransition);
          return true;
        }
        if (rawEvent?.code === "KeyS") {
          activateMenuOption(MENU_OPTION.SOUND, inputTransition);
          return true;
        }
      }

      if (currentState === STATE.HOW_TO_PLAY) {
        if (action === "confirm" || rawEvent?.code === "KeyA") {
          inputTransition(STATE.ARCHIVE);
          return true;
        }
        if (action === "menuTest" || rawEvent?.code === "Escape") {
          inputTransition(STATE.MENU);
          return true;
        }
      }

      if (currentState === STATE.ARCHIVE) {
        if (archive.terminalOpen) {
          if (rawEvent?.code === "Escape") {
            archive.closeTerminal();
            return true;
          }
          if (rawEvent?.code === "Enter") {
            const res = archive.submitWord();
            if (res.success && res.newlyUnlocked) audio.playVisorRevealed();
            return true;
          }
          if (rawEvent?.code === "Backspace") {
            archive.backspace();
            return true;
          }
          if (rawEvent?.key && rawEvent.key.length === 1 && !rawEvent.ctrlKey && !rawEvent.metaKey) {
            archive.appendChar(rawEvent.key);
            return true;
          }
          return true;
        } else {
          if (action === "selectPrevious" || rawEvent?.code === "ArrowLeft") {
            archive.selectPreviousSheet();
            return true;
          }
          if (action === "selectNext" || rawEvent?.code === "ArrowRight") {
            archive.selectNextSheet();
            return true;
          }
          if (action === "confirm" || rawEvent?.code === "KeyT" || rawEvent?.code === "Enter") {
            archive.openTerminal();
            return true;
          }
          if (action === "menuTest" || rawEvent?.code === "Escape" || rawEvent?.code === "KeyM") {
            inputTransition(STATE.MENU);
            return true;
          }
        }
      }

      if (currentState === STATE.SELECT_FIGHTER) {
        if (action === "selectPrevious") selectedIndex = (selectedIndex + SELECTABLE_FIGHTERS.length - 1) % SELECTABLE_FIGHTERS.length;
        else if (action === "selectNext") selectedIndex = (selectedIndex + 1) % SELECTABLE_FIGHTERS.length;
        else if (action === "confirm") selectStudent(inputTransition);
        else if (action === "levelTwoHarness") {
          campaign.selectFighter(SELECTABLE_FIGHTERS[selectedIndex].id);
          if (campaign.startAtLevelForHarness(1)) inputTransition(STATE.LEVEL_INTRO);
        } else if (action === "levelThreeHarness") {
          campaign.selectFighter(SELECTABLE_FIGHTERS[selectedIndex].id);
          if (campaign.startAtLevelForHarness(2)) inputTransition(STATE.LEVEL_INTRO);
        } else if (action === "levelFourHarness") {
          campaign.selectFighter(SELECTABLE_FIGHTERS[selectedIndex].id);
          if (campaign.startAtLevelForHarness(3)) inputTransition(STATE.LEVEL_INTRO);
        } else if (action === "menuTest" || rawEvent?.code === "Escape") inputTransition(STATE.MENU);
        return true;
      }

      if (currentState === STATE.LEVEL_INTRO) {
        if (action === "confirm" || action === "restartLevel") startSelected(inputTransition);
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

      if (currentState === STATE.LEVEL_CLEAR) {
        // Estado mantenido por compatibilidad; el flujo principal usa STATE.VICTORY
        if (action === "confirm") {
          if (campaign.advance()) {
            input.clear();
            inputTransition(STATE.LEVEL_INTRO, true);
          } else {
            inputTransition(STATE.VICTORY);
          }
        } else if (action === "menuTest") {
          inputTransition(STATE.MENU);
        }
        return true;
      }

      if (currentState === STATE.GAME_OVER) {
        if (action === "restartLevel" && campaign.retryAfterDefeat()) {
          input.clear();
          inputTransition(STATE.LEVEL_INTRO, true);
        } else if (action === "confirm") {
          newCampaign(STATE.SELECT_FIGHTER);
        } else if (action === "menuTest") {
          campaign.abandon();
          inputTransition(STATE.MENU);
        }
        return true;
      }

      if (currentState === STATE.VICTORY) {
        const isFinalVictory = campaign.terminal === "VICTORIA";
        if (action === "confirm") {
          if (!isFinalVictory && campaign.advance()) {
            // Victoria intermedia: avanzar al siguiente nivel
            input.clear();
            inputTransition(STATE.LEVEL_INTRO, true);
          } else {
            // Victoria final: reiniciar campaña desde selección
            newCampaign(STATE.SELECT_FIGHTER);
          }
        } else if (action === "menuTest") {
          inputTransition(STATE.MENU);
        }
        return true;
      }

      if (currentState === STATE.PLAYING && action === "gameOverTest") {
        onDefeat();
        return true;
      }

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
  states.archive = archive;
  states.audio = audio;
  states.getLevel = () => level;
  states.getCampaignRecord = () => campaignRecord;
  states.resetLevel = () => { loadCurrentLevel(); };
  return states;
}
