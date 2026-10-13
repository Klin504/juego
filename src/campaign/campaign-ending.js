/** Construye el cierre narrativo y los datos de la pantalla final. */

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../core/constants.js";
import { drawFighterFrame } from "../rendering/fighting-atlas.js";

const PANEL = Object.freeze({ x: 70, y: 36, width: 820, height: 468 });
const SPRITE_CACHE = new Map();
// Texto común del cierre; la frase del estudiante se recibe desde campaña.
const ENDING_COPY = Object.freeze([
  "NULL detiene la validación y abre la copia de recuperación.",
  "Nadia y Alma cambian la regla: orientar sin decidir por nadie.",
  "Diego confirma que las rutas están abiertas y son seguras.",
  "NULL reconoce el error y vuelve a guiar sin imponer pruebas.",
]);

function loadSprite(characterId) {
  if (typeof Image === "undefined") return null;
  if (!SPRITE_CACHE.has(characterId)) {
    const image = new Image();
    image.src = new URL(`../../assets/sprites/fighting-v4/${characterId}.png`, import.meta.url).href;
    SPRITE_CACHE.set(characterId, image);
  }
  return SPRITE_CACHE.get(characterId);
}

function drawSprite(ctx, characterId, x, baseline, width, height, frame = 0) {
  drawFighterFrame(ctx, loadSprite(characterId), characterId, frame, x, baseline, width, height);
}

function drawWrappedLine(ctx, text, centerX, y, maxWidth, lineHeight, color) {
  const words = String(text).split(/\s+/);
  let line = "";
  let lineIndex = 0;
  ctx.fillStyle = color;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      ctx.fillText(line, centerX, y + lineIndex * lineHeight, maxWidth);
      lineIndex += 1;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) ctx.fillText(line, centerX, y + lineIndex * lineHeight, maxWidth);
  return lineIndex + 1;
}

/** Dibuja fondo, elenco y marcador al superar el último jefe. */
export function renderCampaignEnding(ctx, { score, record, studentLine, fighterId }) {
  ctx.fillStyle = "#111725";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  if (typeof Image !== "undefined") {
    const scene = getLibraryScene();
    if (scene?.complete && scene.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(scene, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }
  }
  ctx.fillStyle = "rgba(8, 13, 25, 0.78)";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.fillStyle = "#182639";
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
  ctx.fillStyle = "#0d1727";
  ctx.fillRect(PANEL.x + 12, PANEL.y + 12, PANEL.width - 24, PANEL.height - 24);
  ctx.strokeStyle = "#77e4ca";
  ctx.lineWidth = 4;
  ctx.strokeRect(PANEL.x + 2, PANEL.y + 2, PANEL.width - 4, PANEL.height - 4);
  ctx.fillStyle = "#77e4ca";
  ctx.fillRect(PANEL.x + 20, 104, PANEL.width - 40, 3);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffd37a";
  ctx.font = "bold 26px 'Courier New', monospace";
  ctx.fillText("CAMPAÑA COMPLETADA", LOGICAL_WIDTH / 2, 68);
  ctx.fillStyle = "#c7fff0";
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.fillText(`4 MARCAS · PUNTUACIÓN ${score} · RÉCORD LOCAL ${record ?? "NO DISPONIBLE"}`, LOGICAL_WIDTH / 2, 88, PANEL.width - 54);
  ctx.fillStyle = "#f2f4f8";
  ctx.font = "12px 'Courier New', monospace";
  let copyY = 126;
  for (const line of [...ENDING_COPY, studentLine]) {
    const linesUsed = drawWrappedLine(ctx, line, LOGICAL_WIDTH / 2, copyY, PANEL.width - 130, 15, "#dce6f2");
    copyY += Math.max(21, linesUsed * 16);
  }

  ctx.fillStyle = "#0a1120";
  ctx.fillRect(112, 303, 736, 132);
  ctx.strokeStyle = "#355470";
  ctx.lineWidth = 2;
  ctx.strokeRect(113, 304, 734, 130);
  ctx.fillStyle = "#72e4df";
  ctx.font = "bold 10px 'Courier New', monospace";
  ctx.fillText("LOS CUATRO DESAFÍOS QUEDAN ATRÁS", LOGICAL_WIDTH / 2, 317);
  drawSprite(ctx, fighterId ?? "alma", 194, 424, 82, 102, 0);
  drawSprite(ctx, "chilo", 390, 424, 74, 92, 7);
  drawSprite(ctx, "vera", 510, 424, 74, 92, 7);
  drawSprite(ctx, "catodo3", 630, 424, 74, 92, 7);
  drawSprite(ctx, "null", 750, 424, 74, 92, 7);
  ctx.fillStyle = "#f4ecdb";
  ctx.font = "bold 9px 'Courier New', monospace";
  [[194, "TU LUCHADOR"], [390, "CHILO"], [510, "VERA"], [630, "CÁTODO-3"], [750, "NULL"]]
    .forEach(([x, label]) => ctx.fillText(label, x, 428));
  ctx.fillStyle = "#ffd37a";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.fillText("ENTER · JUGAR DE NUEVO     M · MENÚ", LOGICAL_WIDTH / 2, 477);
}

let libraryScene = null;

function getLibraryScene() {
  if (typeof Image === "undefined") return null;
  if (!libraryScene) {
    libraryScene = new Image();
    libraryScene.src = new URL("../../assets/arenas/biblioteca-v2.png", import.meta.url).href;
  }
  return libraryScene;
}
