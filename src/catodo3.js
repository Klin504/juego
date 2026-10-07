import { EnemyCombatant } from "./enemy-combatant.js";
import { LABORATORY_MECHANICS } from "./laboratory-mechanics.js";

export class Catodo3 extends EnemyCombatant {
  onAttackStarted(attack) {
    if (attack.data.patternId === "CATODO_PULSE") {
      attack.projectileSpecification = Object.freeze({
        x: this.data.projectile.originX,
        y: this.data.projectile.centerY,
        direction: this.data.projectile.direction,
        endX: this.data.projectile.direction < 0 ? -this.data.projectile.radius : 960 + this.data.projectile.radius,
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

  activeAttackBox() {
    if (this.hp <= 0 || !this.attack || this.attack.phase !== "active") return null;
    if (this.attack.data.category === "floorSensor") return this.attack.sensorBox;
    return super.activeAttackBox();
  }

  createProjectileSpecification(attack) {
    if (attack.data.patternId !== "CATODO_PULSE") return null;
    const config = this.data.projectile;
    const route = attack.projectileSpecification;
    const id = attack.id;
    return {
      id: `${id}-pulse`,
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
