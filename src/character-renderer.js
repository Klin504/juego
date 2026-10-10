/**
 * character-renderer.js
 * Renderizador de sprites y animaciones pixel art para los 7 personajes.
 * Fase 3.4 según contratos 1.6, 1.7 y PLAN_DESARROLLO.md.
 */

const spriteImages = new Map();

function getSpriteImage(characterId) {
  if (typeof Image === "undefined") return null;
  if (!spriteImages.has(characterId)) {
    const img = new Image();
    img.src = `./assets/sprites/${characterId}.png`;
    spriteImages.set(characterId, img);
  }
  return spriteImages.get(characterId);
}

/**
 * Renderiza a un estudiante con su sprite pixel art o representación visual temática.
 */
export function renderStudentSprite(ctx, player, debugEnabled, combatant) {
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
    // Determinación de frame según estado de movimiento/salto
    let frameIndex = 0; // idle
    if (Math.abs(player.velocity.x) > 10) frameIndex = 1; // walk
    if (!player.grounded) frameIndex = 2; // jump
    if (combatant?.hp <= 0) frameIndex = 7; // defeat

    const frameWidth = 32;
    const frameHeight = 64;
    const sx = frameIndex * frameWidth;

    // Dibujo con orientación (flip horizontal si facing < 0)
    if (player.facing < 0) {
      ctx.translate(player.position.x, player.position.y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, 0, frameWidth, frameHeight, -body.width / 2, -body.height, body.width, body.height);
    } else {
      ctx.translate(player.position.x, player.position.y);
      ctx.drawImage(img, sx, 0, frameWidth, frameHeight, -body.width / 2, -body.height, body.width, body.height);
    }
  } else {
    // Dibujo procedural temático pixel art de alta fidelidad
    renderProceduralStudent(ctx, player, fighterId, isInvulnerable);
  }

  ctx.restore();
}

/**
 * Renderiza a un jefe con su sprite pixel art o silueta temática reconocible.
 */
export function renderBossSprite(ctx, enemy) {
  const body = enemy.bodyBox;
  const bossId = enemy.id;
  const img = getSpriteImage(bossId);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (img && img.complete && img.naturalWidth > 0) {
    let frameIndex = 0; // idle
    if (enemy.attack?.phase === "warning") frameIndex = 1;
    else if (enemy.attack?.phase === "active") frameIndex = 4;
    else if (enemy.hp <= 0) frameIndex = 7;
    else if (enemy.phaseIndex > 0) frameIndex = 5;

    const frameWidth = 32;
    const frameHeight = 64;
    const sx = frameIndex * frameWidth;

    ctx.translate(enemy.position.x, enemy.position.y);
    if (enemy.facing < 0) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, sx, 0, frameWidth, frameHeight, -body.width / 2, -body.height, body.width, body.height);
  } else {
    // Respaldo visual con las señas y rasgos del canon
    renderProceduralBoss(ctx, enemy, bossId);
  }

  ctx.restore();
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
