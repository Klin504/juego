const PLAYER_HALF_WIDTH_PX = 18;

export const LIBRARY_MECHANICS = Object.freeze({
  floorY: 430,
  runBand: Object.freeze({ left: 98, right: 862, top: 400, bottom: 430 }),
  sensorStrips: Object.freeze([
    Object.freeze({ id: "left", left: 260, right: 380, label: "ECO CÁTODO IZQUIERDO" }),
    Object.freeze({ id: "right", left: 580, right: 700, label: "ECO CÁTODO DERECHO" }),
  ]),
  safeCorridor: Object.freeze({ left: 396, right: 564 }),
  finalSafeZones: Object.freeze([
    Object.freeze({ id: "left", left: 120, right: 360, centerLeft: 138, centerRight: 342, label: "ZONA SEGURA IZQUIERDA" }),
    Object.freeze({ id: "right", left: 600, right: 840, centerLeft: 618, centerRight: 822, label: "ZONA SEGURA DERECHA" }),
  ]),
});

function nearestCenter(x, zone) {
  return Math.max(zone.centerLeft, Math.min(zone.centerRight, x));
}

function routeCrossesBoss(fromX, toX, bossBox, halfWidth) {
  const movesLeft = toX < fromX;
  const crossesFromRight = fromX - halfWidth >= bossBox.x + bossBox.width && toX + halfWidth <= bossBox.x;
  const crossesFromLeft = fromX + halfWidth <= bossBox.x && toX - halfWidth >= bossBox.x + bossBox.width;
  return movesLeft ? crossesFromRight : crossesFromLeft;
}

export function chooseReachableSafeZone(playerX, bossBox, tiePreference = 0) {
  const candidates = LIBRARY_MECHANICS.finalSafeZones.map((zone) => {
    const destinationX = nearestCenter(playerX, zone);
    return {
      zone,
      destinationX,
      distancePx: Math.abs(destinationX - playerX),
      blocked: routeCrossesBoss(playerX, destinationX, bossBox, PLAYER_HALF_WIDTH_PX),
    };
  }).filter((candidate) => !candidate.blocked);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.distancePx - b.distancePx);
  const tied = candidates.filter((candidate) => Math.abs(candidate.distancePx - candidates[0].distancePx) < 1e-9);
  return tied.length === 1 ? tied[0] : tied[tiePreference % tied.length];
}

export function playerInsideSafeZone(player, zone) {
  const body = player.bodyBox;
  return body.x >= zone.left && body.x + body.width <= zone.right;
}

export function renderFinalSweepWarning(ctx, safeZone, warningSeconds) {
  const { runBand } = LIBRARY_MECHANICS;
  ctx.save();
  ctx.fillStyle = "rgba(255, 74, 111, 0.3)";
  ctx.fillRect(runBand.left, runBand.top, runBand.right - runBand.left, runBand.bottom - runBand.top);
  ctx.strokeStyle = "#ff7188";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(runBand.left, runBand.top, runBand.right - runBand.left, runBand.bottom - runBand.top);
  ctx.setLineDash([]);
  if (safeZone) {
    ctx.fillStyle = "rgba(86, 235, 172, 0.34)";
    ctx.fillRect(safeZone.left, runBand.top, safeZone.right - safeZone.left, runBand.bottom - runBand.top);
    ctx.strokeStyle = "#63f0b7";
    ctx.lineWidth = 4;
    ctx.strokeRect(safeZone.left, runBand.top, safeZone.right - safeZone.left, runBand.bottom - runBand.top);
    ctx.fillStyle = "#c5ffe8";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("◆ SEGURA ◆", (safeZone.left + safeZone.right) / 2, runBand.top - 3);
  }
  ctx.fillStyle = "#fff2f4";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`BARRIDO FINAL · ENTRA COMPLETO · ${warningSeconds.toFixed(1)} s`, 480, 392);
  ctx.restore();
}
