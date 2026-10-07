import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./constants.js";

const PANEL = Object.freeze({ x: 70, y: 36, width: 820, height: 468 });
const ENDING_COPY = Object.freeze([
  "NULL: «Rutina de validación detenida. Instrucción editable».",
  "NULL: «Copia de recuperación editable».",
  "Nadia: «Ayuda a encontrar caminos sin decidir quién merece avanzar».",
  "Alma: «Nueva regla: ayudar a cada estudiante a encontrar su camino…»",
  "«…con libertad para participar».",
  "Diego: «Los accesos están abiertos y las áreas son seguras».",
  "NULL: «Interpreté mal la orden. Volveré a guiar sin imponer pruebas».",
]);

export function renderCampaignEnding(ctx, { score, record, studentLine }) {
  ctx.fillStyle = "#111725";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.fillStyle = "#202c3c";
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height);
  ctx.strokeStyle = "#77e4ca";
  ctx.lineWidth = 4;
  ctx.strokeRect(PANEL.x + 2, PANEL.y + 2, PANEL.width - 4, PANEL.height - 4);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffd37a";
  ctx.font = "bold 30px 'Courier New', monospace";
  ctx.fillText("EL RECORRIDO QUEDA ABIERTO", LOGICAL_WIDTH / 2, 78);
  ctx.fillStyle = "#c7fff0";
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.fillText(`CUARTA MARCA · PUNTUACIÓN ${score} · RÉCORD LOCAL ${record ?? "NO DISPONIBLE"}`, LOGICAL_WIDTH / 2, 121, PANEL.width - 44);
  ctx.fillStyle = "#f2f4f8";
  ctx.font = "14px 'Courier New', monospace";
  [...ENDING_COPY, studentLine].forEach((line, index) => ctx.fillText(line, LOGICAL_WIDTH / 2, 157 + index * 31, PANEL.width - 44));
  ctx.fillStyle = "#ffd37a";
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.fillText("Enter: jugar de nuevo · M: menú", LOGICAL_WIDTH / 2, 445);
}
