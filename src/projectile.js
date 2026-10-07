import { segmentRectHitTime } from "./attack-geometry.js";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./constants.js";

export class Projectile {
  constructor({ id, patternId, attackInstanceId, owner, x, y, velocityX, velocityY, width, height, damage, lifetimeSec }) {
    this.id = id;
    this.patternId = patternId;
    this.attackInstanceId = attackInstanceId;
    this.owner = owner;
    this.position = { x, y };
    this.velocity = { x: velocityX, y: velocityY };
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.lifetimeRemainingSec = lifetimeSec;
    this.contactedTargets = new Set();
    this.active = true;
  }

  get box() {
    return { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2, width: this.width, height: this.height };
  }

  update(dt, solids, target, targetHurtbox, cleanupMargin) {
    this.lifetimeRemainingSec -= dt;
    if (this.lifetimeRemainingSec <= 0) {
      this.active = false;
      return null;
    }

    const fromX = this.position.x;
    const fromY = this.position.y;
    const toX = fromX + this.velocity.x * dt;
    const toY = fromY + this.velocity.y * dt;
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    let wallHitTime = null;
    for (const solid of solids) {
      const expanded = {
        x: solid.x - halfWidth,
        y: solid.y - halfHeight,
        width: solid.width + this.width,
        height: solid.height + this.height,
      };
      const hitTime = segmentRectHitTime(fromX, fromY, toX, toY, expanded);
      if (hitTime !== null && (wallHitTime === null || hitTime < wallHitTime)) wallHitTime = hitTime;
    }

    const expandedTarget = {
      x: targetHurtbox.x - halfWidth,
      y: targetHurtbox.y - halfHeight,
      width: targetHurtbox.width + this.width,
      height: targetHurtbox.height + this.height,
    };
    const targetHitTime = target.hp > 0 ? segmentRectHitTime(fromX, fromY, toX, toY, expandedTarget) : null;
    if (targetHitTime !== null && (wallHitTime === null || targetHitTime < wallHitTime)) {
      this.position.x = fromX + (toX - fromX) * targetHitTime;
      this.position.y = fromY + (toY - fromY) * targetHitTime;
      this.contactedTargets.add(target.id);
      this.active = false;
      return { target, projectile: this };
    }
    if (wallHitTime !== null) {
      this.position.x = fromX + (toX - fromX) * wallHitTime;
      this.position.y = fromY + (toY - fromY) * wallHitTime;
      this.active = false;
      return null;
    }

    this.position.x = toX;
    this.position.y = toY;
    if (
      toX < -cleanupMargin || toX > LOGICAL_WIDTH + cleanupMargin ||
      toY < -cleanupMargin || toY > LOGICAL_HEIGHT + cleanupMargin
    ) this.active = false;
    return null;
  }
}
