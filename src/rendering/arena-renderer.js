/**
 * arena-renderer.js
 * Renderizador de fondos pixel art 480x270 nativos escalados a 960x540.
 * Revisión visual: cuatro escenarios de 480×270 con escalado entero sin suavizado.
 */

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../core/constants.js";

const ARENA_ASSETS = Object.freeze({
  estacionamiento: "estacionamiento-v2.png",
  cancha: "cancha-v2.png",
  laboratorio: "laboratorio-v2.png",
  biblioteca: "biblioteca-v2.png",
  "nivel-1": "estacionamiento-v2.png",
  "nivel-2": "cancha-v2.png",
  "nivel-3": "laboratorio-v2.png",
  "nivel-4": "biblioteca-v2.png",
});

const arenaImages = new Map();

/** Carga una sola vez la imagen de la arena y la conserva para futuros fotogramas. */
function getArenaImage(arenaId) {
  if (typeof Image === "undefined") return null;
  const fileName = ARENA_ASSETS[arenaId];
  if (!fileName) return null;
  if (!arenaImages.has(fileName)) {
    const img = new Image();
    img.src = `../../assets/arenas/${fileName}`;
    arenaImages.set(fileName, img);
  }
  return arenaImages.get(fileName);
}

/**
 * Dibuja la imagen pixel art a la resolución lógica sin suavizado.
 * Si todavía no cargó, usa los rectángulos de respaldo definidos en el nivel.
 */
export function renderPixelArtArena(ctx, levelData) {
  const arenaId = levelData.arena.id ?? levelData.id;
  const img = getArenaImage(arenaId);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // --- 1. LIMPIEZA OBLIGATORIA DEL CANVAS PARA EVITAR MANCHAS ---
  ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // --- 2. FONDO BASE TEMPORAL MIENTRAS CARGA LA IMAGEN ---
  ctx.fillStyle = levelData.arena.backgroundColor ?? "#101622";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // --- 3. DIBUJAR LA IMAGEN DE LA ARENA SI YA CARGÓ ---
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  } else {
    // Renderizado procedural de respaldo pixel art si la imagen aún carga
    renderProceduralPixelArtFallback(ctx, arenaId, levelData.arena);
  }

  // Los sólidos continúan en física. Pintar el rectángulo del suelo aquí
  // cubriría el primer plano del fondo; basta marcar sus dos límites.
  const groundY = levelData.arena.groundY ?? 430;
  ctx.fillStyle = "rgba(7, 16, 28, 0.25)";
  ctx.fillRect(0, groundY - 2, LOGICAL_WIDTH, 4);
  ctx.fillStyle = "rgba(255, 221, 147, 0.72)";
  ctx.fillRect(80, groundY - 4, 4, 8);
  ctx.fillRect(876, groundY - 4, 4, 8);

  ctx.restore();
}

function renderProceduralPixelArtFallback(ctx, arenaId, arena) {
  ctx.fillStyle = arena.backgroundColor ?? "#101622";
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  if (arena.background) {
    for (const rect of arena.background) {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  }
}
