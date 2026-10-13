/** Implementa los ecos y el barrido final de NULL. */

import { EnemyCombatant } from "./enemy-combatant.js";
import { LIBRARY_MECHANICS, chooseReachableSafeZone, playerInsideSafeZone } from "./library-mechanics.js";

const ECHO_WINDUP_PX = 10;
const ECHO_LUNGE_PX = 38;

export class NullBoss extends EnemyCombatant {
  #sensorIndex = 0;
  #tiePreference = 0;

  /** Evita barridos sin una zona segura alcanzable para el jugador. */
  canStartAttack(target) {
    if (this.peekNextAttack()?.category !== "fullFloorSweep") return true;
    if (chooseReachableSafeZone(target.position.x, this.bodyBox, this.#tiePreference)) return true;
    this.replanNextAttack(target, ["NULL_FINAL_SWEEP"]);
    return false;
  }

  /** Prepara la geometría de cada eco y el refugio del barrido final. */
  onAttackStarted(attack, target) {
    if (attack.data.patternId === "NULL_ECHO_CHILO") {
      const bodyClearance = (target.bodyBox.width + this.bodySize.width) / 2 + 4;
      const distance = Math.abs(target.position.x - this.position.x) - bodyClearance;
      attack.startPositionX = this.position.x;
      attack.lungeDistancePx = Math.min(ECHO_LUNGE_PX, Math.max(0, distance));
    } else if (attack.data.patternId === "NULL_ECHO_VERA") {
      const band = LIBRARY_MECHANICS.runBand;
      attack.sweepBox = Object.freeze({ x: band.left, y: band.top, width: band.right - band.left, height: band.bottom - band.top });
    } else if (attack.data.patternId === "NULL_ECHO_CATODO") {
      const sensor = LIBRARY_MECHANICS.sensorStrips[this.#sensorIndex % LIBRARY_MECHANICS.sensorStrips.length];
      this.#sensorIndex += 1;
      attack.sensorId = sensor.id;
      attack.sensorBox = Object.freeze({ x: sensor.left, y: LIBRARY_MECHANICS.floorY - 30, width: sensor.right - sensor.left, height: 30 });
    } else if (attack.data.patternId === "NULL_FINAL_SWEEP") {
      const choice = chooseReachableSafeZone(target.position.x, this.bodyBox, this.#tiePreference);
      if (choice) {
        this.#tiePreference += 1;
        attack.safeZone = choice.zone;
        attack.safeDestinationX = choice.destinationX;
      }
    }
  }

  onAttackAdvanced(attack) {
    if (attack.data.patternId !== "NULL_ECHO_CHILO" || !Number.isFinite(attack.startPositionX)) return;
    const warningSec = attack.data.startupSec + (attack.extraWarningSec ?? 0);
    if (attack.phase === "warning") {
      this.position.x = attack.startPositionX
        - attack.facing * ECHO_WINDUP_PX * Math.min(1, attack.elapsedSec / warningSec);
    } else if (attack.phase === "active") {
      const progress = Math.min(1, (attack.elapsedSec - warningSec) / attack.data.activeSec);
      this.position.x = attack.startPositionX
        + attack.facing * attack.lungeDistancePx * progress;
    } else {
      const progress = Math.min(1, (attack.elapsedSec - warningSec - attack.data.activeSec) / attack.data.recoverySec);
      this.position.x = attack.startPositionX
        + attack.facing * attack.lungeDistancePx * (1 - progress);
    }
  }

  onAttackFinished(attack) {
    if (attack.data.patternId === "NULL_ECHO_CHILO" && Number.isFinite(attack.startPositionX)) this.position.x = attack.startPositionX;
  }

  onAttackCancelled(attack) {
    if (attack.data.patternId === "NULL_ECHO_CHILO" && Number.isFinite(attack.startPositionX)) {
      this.position.x = attack.startPositionX;
    }
  }

  activeAttackBox() {
    if (this.hp <= 0 || !this.attack || this.attack.phase !== "active") return null;
    if (["NULL_ECHO_VERA", "NULL_ECHO_CATODO"].includes(this.attack.data.patternId)) {
      return this.attack.sweepBox ?? this.attack.sensorBox;
    }
    if (this.attack.data.category === "fullFloorSweep") {
      const { runBand } = LIBRARY_MECHANICS;
      return { x: runBand.left, y: 300, width: runBand.right - runBand.left, height: runBand.bottom - 300 };
    }
    return super.activeAttackBox();
  }

  isPlayerSafeFromAttack(player, attack) {
    if (attack.data.category === "floorSensor") {
      const sensor = LIBRARY_MECHANICS.sensorStrips.find((item) => item.id === attack.sensorId);
      return player.position.x >= LIBRARY_MECHANICS.safeCorridor.left
        && player.position.x <= LIBRARY_MECHANICS.safeCorridor.right
        || Boolean(sensor && (player.bodyBox.x + player.bodyBox.width <= sensor.left || player.bodyBox.x >= sensor.right));
    }
    if (attack.data.category === "fullFloorSweep") return Boolean(attack.safeZone && playerInsideSafeZone(player, attack.safeZone));
    return false;
  }

  onPhaseChanged() {
    this.#sensorIndex = 0;
  }

  render(ctx) {
    super.render(ctx);
    if (this.phaseIndex > 0) {
      ctx.save();
      ctx.strokeStyle = "#83eaff";
      ctx.lineWidth = 2;
      const box = this.bodyBox;
      ctx.strokeRect(box.x - 4, box.y - 4, box.width + 8, box.height + 8);
      ctx.restore();
    }
  }
}
