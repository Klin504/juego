import { LOGICAL_HEIGHT, LOGICAL_WIDTH, STATE } from "./constants.js";
import { COMBAT_OUTCOME } from "./combat-config.js";
import { CampaignController } from "./campaign-controller.js";
import { readCampaignRecord, saveCampaignRecord, readVisorUnlocked } from "./campaign-storage.js";
import { SELECTABLE_FIGHTERS } from "./campaign-data.js";
import { loadLevel, updateLevel } from "./level-loader.js";
import { renderCampaignEnding } from "./campaign-ending.js";
import { ArchiveController } from "./archive-controller.js";
import { AudioSystem } from "./audio-system.js";
import { renderPixelArtArena } from "./arena-renderer.js";
import { renderStudentSprite, renderBossSprite } from "./character-renderer.js";

const COLORS = Object.freeze({
  background: "#101622",
  panel: "#1d2939",
  border: "#47d7c8",
  text: "#f2f4f8",
  muted: "#b6c2d2",
  accent: "#ffca6a",
  selected: "#354b63",
  cardBg: "#16202e",
  speaker: "#83eaff",
  danger: "#ff6b6b",
  success: "#51cf66",
});

const PANEL = Object.freeze({ x: 70, y: 50, width: 820, height: 440 });
const BORDER_WIDTH = 4;
const SELECT_CARD_WIDTH = 220;
const SELECT_CARD_HEIGHT = 160;
const SELECT_CARD_GAP = 18;
const SELECT_CARD_Y = 240;
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
  ctx.font = "bold 32px 'Courier New', monospace";
  ctx.fillText(title, LOGICAL_WIDTH / 2, PANEL.y + 44);
  ctx.fillStyle = COLORS.text;
  ctx.font = "16px 'Courier New', monospace";
  lines.forEach((line, index) => ctx.fillText(line, LOGICAL_WIDTH / 2, PANEL.y + 104 + index * 32, PANEL.width - 48));
}

export function createStates(clock, input, transitionState, storage = globalThis.localStorage) {
  const campaign = new CampaignController();
  const archive = new ArchiveController(storage);
  const audio = new AudioSystem();
  let campaignRecord = readCampaignRecord(storage);
  let level = null;
  let selectedIndex = 0;
  let debugEnabled = false;
  let confirmAbandon = false;
  let confirmRestart = false;

  const idle = () => {};
  const state = (render, update = idle, enter = idle, exit = idle) => ({ enter, exit, update, render });
  const transition = (next, resetClock = false) => {
    audio.playScreenChanged();
    transitionState(next, resetClock);
  };

  const selectedFighterName = () => campaign.fighters.find((fighter) => fighter.id === campaign.selectedFighterId)?.name.split(" ")[0] ?? campaign.selectedFighterId;

  const loadCurrentLevel = () => {
    const visorUnlocked = archive.unlocked || readVisorUnlocked(storage);
    level = loadLevel(campaign.currentLevel.data, campaign.selectedFighterId, { visorUnlocked });
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
      drawScreen(ctx, "CHILOS FIGHTERS", [
        "Juego de lucha 2D · Campaña de cuatro desafíos",
        `Sonido: ${audio.enabled ? "ACTIVADO [S]" : "SILENCIADO [S]"} · Récord previo: ${campaignRecord ?? 0}`,
        "",
        "Enter: Iniciar campaña",
        "H o C: Cómo jugar y Archivo del recorrido",
        "G: Arnés de prueba de derrota",
      ]);
    })],

    // 2. CÓMO JUGAR
    [STATE.HOW_TO_PLAY, state((ctx) => {
      drawScreen(ctx, "CÓMO JUGAR", [
        "A / D o Flechas: Moverte · W o Espacio: Saltar · S: Cubrirse (mitiga ataques frontales)",
        "R: Golpe normal · Shift: Habilidad especial · E: Visor GUÍA (si está descubierto)",
        "P o Escape: Pausar el juego",
        "",
        "Enter o A: Archivo del recorrido (notas y pistas)",
        "Escape o M: Volver al menú principal",
      ]);
    })],

    // 3. ARCHIVO Y TERMINAL DE MANTENIMIENTO
    [STATE.ARCHIVE, state((ctx) => {
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.fillStyle = COLORS.panel;
      ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = BORDER_WIDTH;
      ctx.strokeRect(PANEL.x + BORDER_WIDTH / 2, PANEL.y + BORDER_WIDTH / 2, PANEL.width - BORDER_WIDTH, PANEL.height - BORDER_WIDTH);

      if (!archive.terminalOpen) {
        // Vista de fichas
        ctx.textAlign = "center";
        ctx.fillStyle = COLORS.accent;
        ctx.font = "bold 26px 'Courier New', monospace";
        ctx.fillText("ARCHIVO DEL RECORRIDO", LOGICAL_WIDTH / 2, PANEL.y + 36);

        ctx.fillStyle = COLORS.muted;
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillText("«NULL tenía un oficio antes de los desafíos. Lee sus cuatro notas siguiendo la ruta del campus».", LOGICAL_WIDTH / 2, PANEL.y + 68);

        // Fichas 1 a 4
        const sheets = archive.sheets;
        const cardW = 175;
        const cardH = 200;
        const gap = 16;
        const startX = PANEL.x + 36;
        const startY = PANEL.y + 96;

        sheets.forEach((sheet, idx) => {
          const x = startX + idx * (cardW + gap);
          const isSelected = idx === archive.sheetIndex;
          ctx.fillStyle = isSelected ? COLORS.selected : COLORS.cardBg;
          ctx.fillRect(x, startY, cardW, cardH);
          ctx.strokeStyle = isSelected ? COLORS.accent : COLORS.border;
          ctx.lineWidth = isSelected ? 3 : 1;
          ctx.strokeRect(x, startY, cardW, cardH);

          ctx.textAlign = "left";
          ctx.fillStyle = COLORS.speaker;
          ctx.font = "bold 13px 'Courier New', monospace";
          ctx.fillText(sheet.place, x + 10, startY + 22);

          ctx.fillStyle = COLORS.accent;
          ctx.font = "bold 15px 'Courier New', monospace";
          ctx.fillText(`Folio: ${sheet.folio}`, x + 10, startY + 44);

          ctx.fillStyle = COLORS.text;
          ctx.font = "11px 'Courier New', monospace";
          // Texto envuelto
          const words = sheet.text.split(" ");
          let line = "";
          let lineY = startY + 70;
          for (const w of words) {
            const testLine = line + w + " ";
            if (ctx.measureText(testLine).width > cardW - 20) {
              ctx.fillText(line, x + 10, lineY);
              line = w + " ";
              lineY += 16;
            } else {
              line = testLine;
            }
          }
          if (line) ctx.fillText(line, x + 10, lineY);
        });

        // Controles al pie
        ctx.textAlign = "center";
        ctx.fillStyle = COLORS.text;
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillText("← / → o A / D: Cambiar ficha · Enter o T: Abrir terminal de mantenimiento", LOGICAL_WIDTH / 2, PANEL.y + PANEL.height - 48);
        ctx.fillText("Escape o M: Volver a Cómo jugar", LOGICAL_WIDTH / 2, PANEL.y + PANEL.height - 24);
      } else {
        // Modal / Overlay Terminal de Mantenimiento
        ctx.fillStyle = "rgba(10, 16, 26, 0.96)";
        ctx.fillRect(PANEL.x + 40, PANEL.y + 40, PANEL.width - 80, PANEL.height - 80);
        ctx.strokeStyle = COLORS.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(PANEL.x + 40, PANEL.y + 40, PANEL.width - 80, PANEL.height - 80);

        ctx.textAlign = "center";
        ctx.fillStyle = COLORS.accent;
        ctx.font = "bold 24px 'Courier New', monospace";
        ctx.fillText("TERMINAL DE MANTENIMIENTO DEL ARCHIVO", LOGICAL_WIDTH / 2, PANEL.y + 80);

        ctx.fillStyle = COLORS.muted;
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillText("«Palabra de mantenimiento: consulta ayudas del recorrido; no modifica el progreso»", LOGICAL_WIDTH / 2, PANEL.y + 115);

        // Caja de entrada
        const inputY = PANEL.y + 160;
        ctx.fillStyle = "#101622";
        ctx.fillRect(LOGICAL_WIDTH / 2 - 180, inputY, 360, 44);
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(LOGICAL_WIDTH / 2 - 180, inputY, 360, 44);

        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 20px 'Courier New', monospace";
        const cursor = Math.floor(Date.now() / 500) % 2 === 0 ? "_" : "";
        ctx.fillText(`${archive.inputText}${cursor}`, LOGICAL_WIDTH / 2, inputY + 22);

        // Mensaje de respuesta
        if (archive.message) {
          ctx.fillStyle = archive.unlocked ? COLORS.speaker : COLORS.accent;
          ctx.font = "14px 'Courier New', monospace";
          ctx.fillText(archive.message, LOGICAL_WIDTH / 2, inputY + 80, PANEL.width - 120);
        }

        // Ayuda
        ctx.fillStyle = COLORS.text;
        ctx.font = "13px 'Courier New', monospace";
        ctx.fillText("Escribe con el teclado · Enter: Consultar · Escape: Cerrar terminal", LOGICAL_WIDTH / 2, PANEL.y + PANEL.height - 65);
      }
    })],

    // 4. SELECCIÓN DE ESTUDIANTE
    [STATE.SELECT_FIGHTER, state((ctx) => {
      drawScreen(ctx, "ELIGE A TU ESTUDIANTE", [
        "A/D o ←/→: Seleccionar · Enter: Comenzar campaña · M: Menú",
        "2 / 3 / 4: Atajos de arnés directo de nivel",
      ]);
      const cardWidth = SELECT_CARD_WIDTH;
      const gap = SELECT_CARD_GAP;
      const left = (LOGICAL_WIDTH - (cardWidth * SELECTABLE_FIGHTERS.length + gap * 2)) / 2;
      SELECTABLE_FIGHTERS.forEach((fighter, index) => {
        const x = left + index * (cardWidth + gap);
        const y = SELECT_CARD_Y;
        ctx.fillStyle = index === selectedIndex ? COLORS.selected : COLORS.background;
        ctx.fillRect(x, y, cardWidth, SELECT_CARD_HEIGHT);
        ctx.strokeStyle = index === selectedIndex ? COLORS.accent : COLORS.border;
        ctx.lineWidth = index === selectedIndex ? 3 : 1;
        ctx.strokeRect(x, y, cardWidth, SELECT_CARD_HEIGHT);
        ctx.fillStyle = COLORS.text;
        ctx.font = "bold 20px 'Courier New', monospace";
        ctx.fillText(fighter.name, x + cardWidth / 2, y + 30);
        ctx.font = "15px 'Courier New', monospace";
        ctx.fillText(fighter.role, x + cardWidth / 2, y + 60);
        ctx.fillText(`Vida ${fighter.maxHp} · ${fighter.speed} px/s`, x + cardWidth / 2, y + 90);
        ctx.font = "12px 'Courier New', monospace";
        ctx.fillText(fighter.special, x + cardWidth / 2, y + 125, cardWidth - 16);
      });
    })],

    // 5. INTRODUCCIÓN NARRATIVA / REINTENTO (STORY)
    [STATE.LEVEL_INTRO, state((ctx) => {
      const levelData = campaign.currentLevel.data;
      const selectedLine = levelData.studentLines?.intro?.[campaign.selectedFighterId];
      const isRetry = campaign.attemptScore === 0 && campaign.attemptsRemaining < 3 && !campaign.marks[campaign.levelIndex];

      if (isRetry) {
        // Variante reintento
        drawScreen(ctx, `REINTENTAR · ${levelData.name}`, [
          `Intentos restantes: ${campaign.attemptsRemaining}. Repite este duelo.`,
          "Vidas del estudiante y del jefe restauradas al inicio del encuentro.",
          "",
          "Enter o T: Reintentar duelo ahora",
          "M: Volver a selección de estudiante",
        ]);
      } else {
        // Diálogos de historia antes del duelo
        const introLines = levelData.introLines ?? [levelData.objective];
        drawScreen(ctx, levelData.name, [
          ...introLines,
          ...(selectedLine ? [`${selectedFighterName()}: «${selectedLine}»`] : []),
          "",
          "Enter: Continuar al duelo · M: Volver a selección",
        ]);
      }
    })],

    // 6. JUGANDO (COMBATE)
    [STATE.PLAYING, state((ctx) => {
      renderPixelArtArena(ctx, level.data);
      level.combat.renderTelegraphs(ctx);
      renderStudentSprite(ctx, level.player, debugEnabled, level.combat.playerCombatant);
      renderBossSprite(ctx, level.enemy);
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
      ctx.fillText(
        `${level.data.name} · ${formatTime(remaining)} · Marcas: ${campaign.marks.filter(Boolean).length}/4 · Intentos: ${campaign.attemptsRemaining} · P/Esc: Pausa · F2: Cajas`,
        24,
        48
      );
      ctx.fillText(`Puntos: ${campaign.campaignScore} + ${campaign.attemptScore}`, 24, 26);
    }, (dt) => {
      const actions = input.snapshotForStep();
      if (actions.debugToggle.pressed) debugEnabled = !debugEnabled;
      if (actions.restartLevel.pressed) { requestRestartConfirmation(); return; }
      updateLevel(level, actions, dt);
      campaign.addCombatEvents(level.lastCombatEvents);
      clock.update(dt);

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
      drawScreen(ctx, `VICTORIA · ${levelData.name}`, [
        `Marca obtenida (${campaign.marks.filter(Boolean).length}/4)`,
        ...(levelData.victoryLines ?? []),
        ...(studentLine ? [`${selectedFighterName()}: «${studentLine}»`] : []),
        "",
        "Enter: Siguiente parada · M: Menú",
      ]);
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
        drawScreen(ctx, `VICTORIA · ${levelData.name}`, [
          `Marca obtenida (${campaign.marks.filter(Boolean).length}/4) · Puntuación consolidada: ${campaign.campaignScore}`,
          "",
          ...narrative,
          "",
          `Estudiante: ${campaign.selectedFighterId} · Intentos restantes: ${campaign.attemptsRemaining}`,
          "Enter: Siguiente parada · M: Menú",
        ]);
      }
    })],
  ]);

  states.commands = Object.freeze({
    handle(action, currentState, inputTransition, rawEvent) {
      if (currentState === STATE.MENU) {
        if (action === "confirm") {
          campaign.reset();
          selectedIndex = 0;
          inputTransition(STATE.SELECT_FIGHTER);
          return true;
        }
        if (rawEvent?.code === "KeyH" || rawEvent?.code === "KeyC") {
          inputTransition(STATE.HOW_TO_PLAY);
          return true;
        }
        if (rawEvent?.code === "KeyS") {
          audio.toggleEnabled();
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
          if (action === "confirm" || rawEvent?.code === "KeyT") {
            archive.openTerminal();
            return true;
          }
          if (action === "menuTest" || rawEvent?.code === "Escape") {
            inputTransition(STATE.HOW_TO_PLAY);
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
        } else if (action === "menuTest") inputTransition(STATE.MENU);
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
