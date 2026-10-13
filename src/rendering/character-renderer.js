/**
 * character-renderer.js
 * Renderizador de sprites y animaciones pixel art para los 7 personajes.
 * Ocho poses ilustradas por personaje en hojas v4 de 2170×725 píxeles.
 */

import { drawFighterFrame } from "./fighting-atlas.js";

const spriteImages = new Map();
const SPECIAL_EFFECT_COLORS = Object.freeze({
  alma: "#ffb873",
  diego: "#a7f2b5",
  nadia: "#e6a0ff",
});

function getSpriteImage(characterId) {
  if (typeof Image === "undefined") return null;
  if (!spriteImages.has(characterId)) {
    const img = new Image();
    img.src = new URL(`../../assets/sprites/fighting-v4/${characterId}.png`, import.meta.url).href;
    spriteImages.set(characterId, img);
  }
  return spriteImages.get(characterId);
}

/** Elige pose, orientación y efectos antes de dibujar la hoja del estudiante. */
export function renderStudentSprite(ctx, player, debugEnabled, combatant, combat = null) {
  const body = player.bodyBox;
  const fighterId = player.fighterId;
  const img = getSpriteImage(fighterId);
  const isInvulnerable = combatant?.invulnerable;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (isInvulnerable) {
    ctx.globalAlpha = 0.55;
  }

  if (img && img.complete && img.naturalWidth > 0) {
    // La pose de mayor prioridad sustituye caminar: salto, defensa, ataque y daño.
    let frameIndex = Math.abs(player.velocity.x) > 10
      ? Math.floor(performance.now() / 140) % 2 : 0;
    if (!player.grounded) frameIndex = 2;
    if (player.guarding) frameIndex = 6;
    if (combatant?.invulnerable) frameIndex = 5;
    if (combat?.specialVisualActive) frameIndex = 4;
    if (combat?.playerAttack) frameIndex = 3;
    if (combatant?.hp <= 0) frameIndex = 5;

    const visualWidth = 128;
    const visualHeight = 160;
    drawFighterFrame(ctx, img, fighterId, frameIndex,
      player.position.x, player.position.y, visualWidth, visualHeight, player.facing < 0);
    if (combat?.playerAttack?.phase === "active" || combat?.specialVisualActive) {
      ctx.translate(Math.round(player.position.x), Math.round(player.position.y));
      if (player.facing < 0) ctx.scale(-1, 1);
      renderPixelStrike(ctx, frameIndex === 4 ? SPECIAL_EFFECT_COLORS[fighterId] : "#ffe39b");
    }
  } else {
    // Dibujo procedural temático pixel art de alta fidelidad
    renderProceduralStudent(ctx, player, fighterId, isInvulnerable);
  }

  ctx.restore();
}

/** Dibuja la pose del jefe y sus avisos visuales de ataque o fase. */
export function renderBossSprite(ctx, enemy) {
  const body = enemy.bodyBox;
  const bossId = enemy.id;
  const img = getSpriteImage(bossId);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (enemy.dodging) renderBossDodgePixels(ctx, enemy);

  if (img && img.complete && img.naturalWidth > 0) {
    // Las fases de ataque y la derrota tienen prioridad sobre la animación en reposo.
    let frameIndex = Math.floor(performance.now() / 260) % 2;
    const jumpPattern = ["CHILO_JUMP", "CHILO_DIVE"].includes(enemy.attack?.data.patternId);
    if (enemy.hp <= 0) frameIndex = 7;
    else if (enemy.attack?.phase === "warning") frameIndex = 6;
    else if (enemy.attack?.phase === "active" && jumpPattern) frameIndex = 2;
    else if (enemy.attack?.phase === "active") frameIndex = 4;
    else if (enemy.dodging) frameIndex = 2;
    else if (Math.abs(enemy.velocity?.x ?? 0) > 20) frameIndex = 1;
    else if (enemy.phaseIndex > 0) frameIndex = 0;

    const visualWidth = 128;
    const visualHeight = 160;
    // Los jefes se ilustraron mirando a la izquierda; se invierten al mirar a la derecha.
    drawFighterFrame(ctx, img, bossId, frameIndex,
      enemy.position.x, enemy.position.y, visualWidth, visualHeight, enemy.facing > 0);
    ctx.translate(Math.round(enemy.position.x), Math.round(enemy.position.y));
    if (enemy.facing > 0) ctx.scale(-1, 1);
    if (enemy.attack?.phase === "active") renderPixelStrike(ctx, "#ffb85a");
    if (enemy.attack?.phase === "warning") renderWarningPixels(ctx, visualHeight);
  } else {
    // Respaldo visual con las señas y rasgos del canon
    renderProceduralBoss(ctx, enemy, bossId);
  }
  ctx.restore();
  if (enemy.phaseNoticeRemainingSec > 0) renderPhaseAnnouncement(ctx, enemy);
}

function renderPhaseAnnouncement(ctx, enemy) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 16, 30, 0.94)";
  ctx.fillRect(338, 134, 284, 44);
  ctx.fillStyle = "#ffd37b";
  ctx.fillRect(338, 134, 5, 44);
  ctx.strokeStyle = "#fff0bd";
  ctx.lineWidth = 2;
  ctx.strokeRect(339, 135, 282, 42);
  ctx.fillStyle = "#fff1c5";
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${enemy.data.name} · FASE ${enemy.phaseIndex + 1}`, 480, 157);
  ctx.restore();
}

function renderBossDodgePixels(ctx, enemy) {
  const trailDirection = -Math.sign(enemy.velocity?.x ?? 0) || -enemy.facing;
  ctx.save();
  ctx.fillStyle = "#b5f8ff";
  for (let index = 0; index < 3; index += 1) {
    const offset = 34 + index * 11;
    const y = enemy.position.y - 22 - (index % 2) * 8;
    ctx.fillRect(Math.round(enemy.position.x + trailDirection * offset), Math.round(y), 7, 4);
  }
  ctx.restore();
}

function renderPixelStrike(ctx, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let step = 0; step < 4; step += 1) {
    ctx.fillRect(31 + step * 10, -69 - step * 5, 15 - step * 2, 4);
  }
  ctx.restore();
}

function renderWarningPixels(ctx, visualHeight) {
  ctx.fillStyle = "#ffe59a";
  ctx.fillRect(-2, -visualHeight - 13, 4, 9);
  ctx.fillRect(-2, -visualHeight - 1, 4, 4);
}

function renderProceduralStudent(ctx, player, fighterId, isInvulnerable) {
  const body = player.bodyBox;
  const palette = studentPalette(fighterId);

  // Silueta corporal estilizada
  ctx.fillStyle = palette.main;
  ctx.fillRect(body.x, body.y, body.width, body.height);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(body.x + 1, body.y + 1, body.width - 2, body.height - 2);

  // Cabeza / Cabello
  ctx.fillStyle = palette.hair;
  ctx.fillRect(body.x + 4, body.y + 4, body.width - 8, 18);

  // Bufanda / Detalle característico
  ctx.fillStyle = palette.detail;
  ctx.fillRect(body.x + 2, body.y + 22, body.width - 4, 6);

  // Ojo mirando hacia la dirección
  ctx.fillStyle = "#ffffff";
  const eyeX = player.facing > 0 ? body.x + body.width - 8 : body.x + 4;
  ctx.fillRect(eyeX, body.y + 10, 4, 4);

  // Nombre
  ctx.fillStyle = "#f2f4f8";
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(fighterId.toUpperCase(), player.position.x, body.y - 6);
}

function studentPalette(fighterId) {
  switch (fighterId) {
    case "alma":
      return { main: "#c85a2b", accent: "#ff8c42", hair: "#2d1f1b", detail: "#ffd166" };
    case "diego":
      return { main: "#2d7f46", accent: "#52b788", hair: "#1b2a22", detail: "#74c69d" };
    case "nadia":
      return { main: "#7b2cbf", accent: "#c77dff", hair: "#240046", detail: "#e0aaff" };
    default:
      return { main: "#47d7c8", accent: "#83eaff", hair: "#1d2939", detail: "#ffffff" };
  }
}

function renderProceduralBoss(ctx, enemy, bossId) {
  const body = enemy.bodyBox;

  if (bossId === "chilo") {
    // Chilo: cabeza de ave blanca, pico amarillo, ropa azul
    ctx.fillStyle = "#2b5bb3";
    ctx.fillRect(body.x, body.y + 20, body.width, body.height - 20);
    // Cabeza blanca
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(body.x + 4, body.y, body.width - 8, 22);
    // Pico amarillo
    ctx.fillStyle = "#ffc107";
    const beakX = enemy.facing > 0 ? body.x + body.width - 4 : body.x - 8;
    ctx.fillRect(beakX, body.y + 8, 12, 8);
  } else if (bossId === "vera") {
    // Vera: uniforme deportivo turquesa y azul marino
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(body.x, body.y, body.width, body.height);
    ctx.fillStyle = "#2ec4b6";
    ctx.fillRect(body.x + 3, body.y + 15, body.width - 6, 20);
  } else if (bossId === "catodo3") {
    // CÁTODO-3: autómata blanco/azul con visor cian
    ctx.fillStyle = "#e9ecef";
    ctx.fillRect(body.x, body.y, body.width, body.height);
    ctx.fillStyle = "#00b4d8";
    ctx.fillRect(body.x + 4, body.y + 8, body.width - 8, 10);
  } else if (bossId === "null") {
    // NULL: entidad geométrica cristalina violeta y cian
    ctx.fillStyle = enemy.phaseIndex > 0 ? "#7209b7" : "#3a0ca3";
    ctx.fillRect(body.x, body.y, body.width, body.height);
    ctx.strokeStyle = enemy.phaseIndex > 0 ? "#4cc9f0" : "#7209b7";
    ctx.lineWidth = enemy.phaseIndex > 0 ? 3 : 2;
    ctx.strokeRect(body.x - 2, body.y - 2, body.width + 4, body.height + 4);
    // Núcleo radiante
    ctx.fillStyle = enemy.phaseIndex > 0 ? "#4cc9f0" : "#f72585";
    ctx.fillRect(body.x + body.width / 2 - 6, body.y + body.height / 2 - 6, 12, 12);
  }

  // Nombre de jefe
  ctx.fillStyle = "#f2f4f8";
  ctx.font = "bold 12px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText((enemy.data.name ?? bossId).toUpperCase(), enemy.position.x, body.y - 8);
}
