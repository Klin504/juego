export const LABORATORY_MECHANICS = Object.freeze({
  safeCorridor: Object.freeze({ left: 396, right: 564 }),
  sensorStrips: Object.freeze([
    Object.freeze({ id: "left", left: 260, right: 380, label: "SENSOR IZQUIERDO" }),
    Object.freeze({ id: "right", left: 580, right: 700, label: "SENSOR DERECHO" }),
  ]),
  floorY: 430,
  warningClearancePx: 30,
});

export function playerClearsGroundHazard(player, floorY, clearancePx = LABORATORY_MECHANICS.warningClearancePx) {
  return player.bodyBox.y + player.bodyBox.height <= floorY - clearancePx;
}

export function renderSensorWarning(ctx, activeSensorId) {
  const { safeCorridor, sensorStrips, floorY } = LABORATORY_MECHANICS;
  ctx.save();
  ctx.font = "12px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (const sensor of sensorStrips) {
    ctx.fillStyle = sensor.id === activeSensorId ? "rgba(255, 96, 91, 0.28)" : "rgba(104, 221, 169, 0.12)";
    ctx.strokeStyle = sensor.id === activeSensorId ? "#ff706c" : "#70dca5";
    ctx.lineWidth = 3;
    ctx.setLineDash(sensor.id === activeSensorId ? [8, 5] : []);
    ctx.fillRect(sensor.left, floorY - 30, sensor.right - sensor.left, 30);
    ctx.strokeRect(sensor.left, floorY - 30, sensor.right - sensor.left, 30);
    ctx.fillStyle = sensor.id === activeSensorId ? "#ffaaa5" : "#a9f0c7";
    ctx.fillText(sensor.id === activeSensorId ? sensor.label : "SEGURO", (sensor.left + sensor.right) / 2, floorY - 34);
  }
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(92, 224, 191, 0.18)";
  ctx.strokeStyle = "#5ce0bf";
  ctx.fillRect(safeCorridor.left, floorY - 34, safeCorridor.right - safeCorridor.left, 34);
  ctx.strokeRect(safeCorridor.left, floorY - 34, safeCorridor.right - safeCorridor.left, 34);
  ctx.fillStyle = "#9affdc";
  ctx.fillText("CORREDOR SEGURO", (safeCorridor.left + safeCorridor.right) / 2, floorY - 38);
  ctx.restore();
}
