/** Implementa carreras y lanzamiento de balón de Vera. */

import { EnemyCombatant } from "./enemy-combatant.js";
import { LOGICAL_WIDTH } from "../core/constants.js";

export class Vera extends EnemyCombatant {
  /** Prepara la ruta del balón o la franja peligrosa de la carrera. */
  onAttackStarted(attack, target) {
    const court = this.data.court;
    if (attack.data.kind === "projectile") {
      const projectile = attack.data.patternId === "VERA_AIR_PASS"
        ? this.data.airProjectile
        : this.data.projectile;
      const x = this.position.x + this.facing * (this.bodySize.width / 2 + projectile.width / 2);
      attack.projectileSpecification = Object.freeze({
        x,
        y: attack.data.patternId === "VERA_AIR_PASS"
          ? target.hurtBox.y + target.hurtBox.height / 2
          : projectile.centerY,
        direction: this.facing,
        routeLeftX: projectile.routeLeftX,
        routeRightX: projectile.routeRightX,
        endX: this.facing < 0 ? -projectile.width : LOGICAL_WIDTH + projectile.width,
      });
    } else if (attack.data.patternId === "VERA_RUN") {
      const edgePadding = this.bodySize.width / 2;
      attack.startPositionX = this.position.x;
      attack.destinationX = attack.facing < 0
        ? court.runStartX + edgePadding
        : court.runEndX - edgePadding;
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
    if (this.attack.data.patternId === "VERA_RUN") {
      if (!Number.isFinite(this.attack.startPositionX)) return this.attack.sweepBox;
      const reach = 32;
      return {
        x: this.position.x - this.bodySize.width / 2 - (this.attack.facing < 0 ? reach : 0),
        y: this.data.court.lineTop,
        width: this.bodySize.width + reach,
        height: this.data.court.groundY - this.data.court.lineTop,
      };
    }
    return super.activeAttackBox();
  }

  onAttackAdvanced(attack) {
    if (attack.data.patternId !== "VERA_RUN" || !Number.isFinite(attack.startPositionX)) return;
    if (attack.phase === "warning") return;
    const warningSec = attack.data.startupSec + (attack.extraWarningSec ?? 0);
    const progress = Math.max(0, Math.min(1, (attack.elapsedSec - warningSec) / attack.data.activeSec));
    this.position.x = attack.startPositionX
      + (attack.destinationX - attack.startPositionX) * progress;
  }

  onAttackFinished(attack) {
    if (attack.data.patternId === "VERA_RUN" && Number.isFinite(attack.destinationX)) this.position.x = attack.destinationX;
  }

  createProjectileSpecification(attack) {
    if (attack.data.kind !== "projectile" || !attack.projectileSpecification) return null;
    const config = attack.data.patternId === "VERA_AIR_PASS" ? this.data.airProjectile : this.data.projectile;
    const id = attack.id;
    const route = attack.projectileSpecification;
    return {
      id: `${id}-${attack.data.patternId === "VERA_AIR_PASS" ? "air-pass" : "ball"}`,
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
      lifetimeSec: config.lifetimeSec ?? null,
      courtReturn: attack.data.category === "lowProjectile" ? {
        leftX: route.routeLeftX,
        rightX: route.routeRightX,
        outboundDirection: route.direction,
      } : null,
    };
  }
}
