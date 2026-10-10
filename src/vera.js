import { EnemyCombatant } from "./enemy-combatant.js";

export class Vera extends EnemyCombatant {
  onAttackStarted(attack) {
    const court = this.data.court;
    if (attack.data.patternId === "VERA_BALL") {
      const projectile = this.data.projectile;
      const x = this.position.x + this.facing * (this.bodySize.width / 2 + projectile.width / 2);
      attack.projectileSpecification = Object.freeze({
        x,
        y: projectile.centerY,
        direction: this.facing,
        routeLeftX: projectile.routeLeftX,
        routeRightX: projectile.routeRightX,
      });
    } else if (attack.data.patternId === "VERA_RUN") {
      attack.sweepBox = Object.freeze({
        x: court.runStartX,
        y: court.lineTop,
        width: court.runEndX - court.runStartX,
        height: court.groundY - court.lineTop,
      });
    }
  }

  activeAttackBox() {
    if (this.hp <= 0 || !this.attack || this.attack.phase !== "active") return null;
    if (this.attack.data.patternId === "VERA_RUN") return this.attack.sweepBox;
    return super.activeAttackBox();
  }

  createProjectileSpecification(attack) {
    if (attack.data.patternId !== "VERA_BALL" || !attack.projectileSpecification) return null;
    const config = this.data.projectile;
    const id = attack.id;
    const route = attack.projectileSpecification;
    return {
      id: `${id}-ball`,
      attackInstanceId: id,
      patternId: attack.data.patternId,
      owner: "enemy",
      x: route.x,
      y: route.y,
      velocityX: route.direction * config.speedPxPerSec,
      velocityY: 0,
      width: config.width,
      height: config.height,
      radius: config.radius,
      damage: attack.data.damage,
      category: attack.data.category,
      lifetimeSec: null,
      courtReturn: {
        leftX: route.routeLeftX,
        rightX: route.routeRightX,
        outboundDirection: route.direction,
      },
    };
  }
}
