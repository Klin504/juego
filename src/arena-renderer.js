/**
 * arena-renderer.js
 * Renderizador de fondos pixel art 480x270 nativos escalados a 960x540.
 * Fase 3.3 según contratos 1.3, 1.7 y PLAN_DESARROLLO.md.
 */

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./constants.js";

const arenaImages = new Map();

function getArenaImage(arenaId) {
  if (typeof Image === "undefined") return null;
  if (!arenaImages.has(arenaId)) {
    const img = new Image();

    // Mapeo por si la arena se llama estacionamiento o nivel-1
    let fileName = arenaId;
    if (arenaId === "estacionamiento") fileName = "nivel-1";
    if (arenaId === "cancha") fileName = "nivel-2";
    if (arenaId === "biblioteca") fileName = "nivel-3";
    if (arenaId === "laboratorio") fileName = "nivel-4";

    img.src = `./assets/arenas/${fileName}.png`;
    arenaImages.set(arenaId, img);
  }
  return arenaImages.get(arenaId);
}

/**
 * Renderiza el fondo pixel art de la arena actual a 960x540 sin suavizado.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} levelData
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

  // Renderizado de sólidos y límites (suelo y paredes)
  const solids = levelData.arena.solids ?? [];
  for (const solid of solids) {
    if (solid.kind === "floor") {
      ctx.fillStyle = arenaFloorColor(arenaId);
      ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      ctx.strokeStyle = "#47d7c8";
      ctx.lineWidth = 2;
      ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
    } else {
      ctx.fillStyle = "rgba(16, 22, 34, 0.7)";
      ctx.fillRect(solid.x, solid.y, solid.width, solid.height);
      ctx.strokeStyle = "#34485b";
      ctx.lineWidth = 1;
      ctx.strokeRect(solid.x, solid.y, solid.width, solid.height);
    }
  }

  ctx.restore();
}

function arenaFloorColor(arenaId) {
  switch (arenaId) {
    case "cancha":
      return "#1e324b";
    case "laboratorio":
      return "#232a34";
    case "biblioteca":
      return "#34261c";
    case "estacionamiento":
    default:
      return "#303844";
  }
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
