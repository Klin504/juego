/** Implementa movimientos y proyectiles propios de CÁTODO-3. */

import { EnemyCombatant } from "./enemy-combatant.js";
import { LABORATORY_MECHANICS } from "./laboratory-mechanics.js";

const PULSE_RECOIL_PX = 12;
const SENSOR_LIFT_PX = 7;

export class Catodo3 extends EnemyCombatant {
  /** Coloca el origen del pulso o del sensor que anuncia el siguiente ataque. */
  onAttackStarted(attack) {
    attack.startPosition = { x: this.position.x, y: this.position.y };
    if (attack.data.kind === "projectile" && attack.data.category === "lowProjectile") {
      const projectile = this.data.projectile;
      const direction = this.facing;
      const x = projectile.originX
        ?? this.position.x + direction * (this.bodySize.width / 2 + projectile.radius);
      const endX = direction < 0 ? -projectile.radius : 960 + projectile.radius;
      attack.projectileSpecification = Object.freeze({
        x,
        y: projectile.centerY,
        direction,
        endX,
      });
      return;
    }
    if (attack.data.category !== "floorSensor") return;
    const sensor = LABORATORY_MECHANICS.sensorStrips.find((entry) => entry.id === attack.data.sensorId);
    if (!sensor) return;
    attack.sensorBox = Object.freeze({
      x: sensor.left,
      y: LABORATORY_MECHANICS.floorY - 30,
      width: sensor.right - sensor.left,
      height: 30,
    });
  }

  onAttackAdvanced(attack) {
    const origin = attack.startPosition;
    if (!origin) return;
    const warningSec = attack.data.startupSec + (attack.extraWarningSec ?? 0);
    if (attack.data.kind === "projectile" && attack.data.category === "lowProjectile") {
      const activeElapsed = Math.max(0, attack.elapsedSec - warningSec);
      const strength = attack.phase === "warning"
        ? 0.25 * Math.min(1, attack.elapsedSec / warningSec)
        : Math.max(0, 1 - activeElapsed / 0.35);
      this.position.x = origin.x - attack.facing * PULSE_RECOIL_PX * strength;
      return;
    }
    if (attack.data.category !== "floorSensor") return;
    const warningProgress = Math.min(1, attack.elapsedSec / warningSec);
    const recoveryProgress = Math.max(0, (attack.elapsedSec - warningSec - attack.data.activeSec) / attack.data.recoverySec);
    const lift = attack.phase === "warning" ? warningProgress
      : attack.phase === "active" ? 1
        : Math.max(0, 1 - recoveryProgress);
    this.position.y = origin.y - SENSOR_LIFT_PX * lift;
  }

  onAttackFinished(attack) {
    if (!attack.startPosition) return;
    this.position.x = attack.startPosition.x;
    this.position.y = attack.startPosition.y;
  }

  onAttackCancelled(attack) {
    if (!attack.startPosition) return;
    this.position.x = attack.startPosition.x;
    this.position.y = attack.startPosition.y;
  }

  activeAttackBox() {
    if (this.hp <= 0 || !this.attack || this.attack.phase !== "active") return null;
    if (this.attack.data.category === "floorSensor") return this.attack.sensorBox;
    return super.activeAttackBox();
  }

  createProjectileSpecification(attack) {
    if (attack.data.kind !== "projectile" || attack.data.category !== "lowProjectile"
      || !attack.projectileSpecification) return null;
    const config = this.data.projectile;
    const route = attack.projectileSpecification;
    const id = attack.id;
    const speedPxPerSec = attack.data.speedPxPerSec ?? config.speedPxPerSec;
    return {
      id: `${id}-pulse`,
      attackInstanceId: id,
      patternId: attack.data.patternId,
      owner: "enemy",
      x: route.x,
      y: route.y,
      velocityX: route.direction * speedPxPerSec,
      velocityY: 0,
      width: config.width,
      height: config.height,
      radius: config.radius,
      damage: attack.data.damage,
      category: attack.data.category,
      ignoreWalls: config.ignoreWalls,
      lifetimeSec: config.lifetimeSec,
    };
  }

  isPlayerSafeFromAttack(player, attack) {
    if (attack.data.category !== "floorSensor") return false;
    return player.position.x >= LABORATORY_MECHANICS.safeCorridor.left
      && player.position.x <= LABORATORY_MECHANICS.safeCorridor.right;
  }
}
