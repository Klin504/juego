import { segmentRectHitTime } from "./attack-geometry.js";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./constants.js";

export class Projectile {
  constructor({ id, patternId, attackInstanceId, owner, x, y, velocityX, velocityY, width, height, damage, lifetimeSec, radius = null, courtReturn = null, category = null, ignoreWalls = false }) {
    this.id = id;
    this.patternId = patternId;
    this.attackInstanceId = attackInstanceId;
    this.owner = owner;
    this.position = { x, y };
    this.velocity = { x: velocityX, y: velocityY };
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.courtReturn = courtReturn;
    this.category = category;
    this.ignoreWalls = ignoreWalls;
    this.damage = damage;
    this.lifetimeRemainingSec = lifetimeSec;
    this.contactedTargets = new Set();
    this.active = true;
  }

  get box() {
    return { x: this.position.x - this.width / 2, y: this.position.y - this.height / 2, width: this.width, height: this.height };
  }

  update(dt, solids, target, targetHurtbox, cleanupMargin) {
    if (!this.courtReturn) this.lifetimeRemainingSec -= dt;
    if (!this.courtReturn && this.lifetimeRemainingSec <= 0) {
      this.active = false;
      return null;
    }

    const fromX = this.position.x;
    const fromY = this.position.y;
    const toX = fromX + this.velocity.x * dt;
    const toY = fromY + this.velocity.y * dt;
    if (this.courtReturn) {
      const route = this.courtReturn;
      if (this.velocity.x * route.outboundDirection > 0) {
        const boundary = route.outboundDirection < 0 ? route.leftX : route.rightX;
        const crossed = route.outboundDirection < 0 ? toX <= boundary : toX >= boundary;
        if (crossed) {
          this.position.x = boundary;
          this.velocity.x = -this.velocity.x;
          return null;
        }
      } else {
        const exitBoundary = route.outboundDirection < 0 ? route.rightX : route.leftX;
        const exited = route.outboundDirection < 0 ? toX >= exitBoundary : toX <= exitBoundary;
        if (exited) {
          this.position.x = exitBoundary;
          this.active = false;
          return null;
        }
      }
      return this.#advanceOnCourt(fromX, fromY, toX, toY, target, targetHurtbox);
    }
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    let wallHitTime = null;
    for (const solid of (this.ignoreWalls ? [] : solids)) {
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
    const targetHitTime = target.hp > 0 && !this.contactedTargets.has(target.id)
      ? segmentRectHitTime(fromX, fromY, toX, toY, expandedTarget)
      : null;
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

  #advanceOnCourt(fromX, fromY, toX, toY, target, targetHurtbox) {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const expandedTarget = {
      x: targetHurtbox.x - halfWidth,
      y: targetHurtbox.y - halfHeight,
      width: targetHurtbox.width + this.width,
      height: targetHurtbox.height + this.height,
    };
    const targetHitTime = target.hp > 0 && !this.contactedTargets.has(target.id)
      ? segmentRectHitTime(fromX, fromY, toX, toY, expandedTarget)
      : null;
    this.position.x = toX;
    this.position.y = toY;
    if (targetHitTime === null) return null;
    this.contactedTargets.add(target.id);
    this.position.x = fromX + (toX - fromX) * targetHitTime;
    this.position.y = fromY + (toY - fromY) * targetHitTime;
    return { target, projectile: this };
  }
}
