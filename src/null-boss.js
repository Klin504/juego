import { EnemyCombatant } from "./enemy-combatant.js";
import { LIBRARY_MECHANICS, chooseReachableSafeZone, playerInsideSafeZone } from "./library-mechanics.js";

const PHASE_NOTICE_SECONDS = 1.25; // PROVISIONAL: duración del anuncio gráfico.

export class NullBoss extends EnemyCombatant {
  #phaseNoticeRemainingSec = 0;
  #sensorIndex = 0;
  #tiePreference = 0;

  get phaseNoticeRemainingSec() { return this.#phaseNoticeRemainingSec; }

  update(dt, target) {
    this.#phaseNoticeRemainingSec = Math.max(0, this.#phaseNoticeRemainingSec - dt);
    return super.update(dt, target);
  }

  canStartAttack(target) {
    if (this.peekNextAttack()?.category !== "fullFloorSweep") return true;
    return Boolean(chooseReachableSafeZone(target.position.x, this.bodyBox, this.#tiePreference));
  }

  onAttackStarted(attack, target) {
    if (attack.data.patternId === "NULL_ECHO_VERA") {
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
    this.#phaseNoticeRemainingSec = PHASE_NOTICE_SECONDS;
  }

  render(ctx) {
    super.render(ctx);
    if (this.phaseIndex > 0) {
      ctx.save();
      ctx.strokeStyle = this.#phaseNoticeRemainingSec > 0 ? "#fff17a" : "#83eaff";
      ctx.lineWidth = this.#phaseNoticeRemainingSec > 0 ? 5 : 2;
      const box = this.bodyBox;
      ctx.strokeRect(box.x - 4, box.y - 4, box.width + 8, box.height + 8);
      ctx.restore();
    }
    if (this.#phaseNoticeRemainingSec <= 0) return;
    ctx.save();
    ctx.fillStyle = "rgba(18, 18, 38, 0.94)";
    ctx.fillRect(300, 176, 360, 52);
    ctx.strokeStyle = "#fff17a";
    ctx.lineWidth = 3;
    ctx.strokeRect(300, 176, 360, 52);
    ctx.fillStyle = "#fff7c0";
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("NULL · FASE 2", 480, 202);
    ctx.restore();
  }
}
