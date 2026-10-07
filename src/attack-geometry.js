export function rectanglesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function orientedAttackBox(owner, attack) {
  const body = owner.bodyBox;
  const x = owner.facing > 0
    ? body.x + body.width + attack.offsetX
    : body.x - attack.offsetX - attack.width;
  return { x, y: owner.position.y + attack.offsetY, width: attack.width, height: attack.height };
}

export function segmentRectHitTime(fromX, fromY, toX, toY, rect) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  let minTime = 0;
  let maxTime = 1;
  for (const [origin, delta, min, max] of [
    [fromX, dx, rect.x, rect.x + rect.width],
    [fromY, dy, rect.y, rect.y + rect.height],
  ]) {
    if (delta === 0) {
      if (origin < min || origin > max) return null;
      continue;
    }
    const first = (min - origin) / delta;
    const second = (max - origin) / delta;
    minTime = Math.max(minTime, Math.min(first, second));
    maxTime = Math.min(maxTime, Math.max(first, second));
    if (minTime > maxTime) return null;
  }
  return minTime;
}
